import { Worker, Queue } from 'bullmq';
import IORedis from 'ioredis';
import { AmazonConnector } from './connectors/amazon';
import { FlipkartConnector } from './connectors/flipkart';
import { CromaConnector } from './connectors/croma';
import { MatchingEngine } from './matching';
import { applyDomainJitter } from './proxy';
import { registerTieredPollingJobs } from './scheduler';
import * as dotenv from 'dotenv';

dotenv.config({ path: '../.env.local' });

// Setup Redis Connection
const connection = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
  maxRetriesPerRequest: null,
  lazyConnect: true,
});

connection.on('error', (err) => {
  // Silent fallback in local dev if Redis is not running
  if (process.env.NODE_ENV !== 'production') {
    // console.warn('[Worker Redis] Offline:', err.message);
  }
});

// Create Connectors
const connectors = [
  new AmazonConnector(),
  new FlipkartConnector(),
  new CromaConnector()
];

const matchingEngine = new MatchingEngine();

// The Job Payload
export interface FetchJobData {
  storeId: string;
  query: string;
  tier?: string;
}

// Queue for fetching prices
export const priceFetchQueue = new Queue<FetchJobData>('price-fetch-queue', { connection });

// Initialize the Worker
const worker = new Worker<FetchJobData>('price-fetch-queue', async (job) => {
  const tierLabel = job.data.tier ? `[${job.data.tier.toUpperCase()}] ` : '';
  console.log(`[Worker] ${tierLabel}Processing job ${job.id}: Fetching for store ${job.data.storeId} with query "${job.data.query}"`);
  
  const connector = connectors.find(c => c.storeId === job.data.storeId);
  if (!connector) {
    throw new Error(`Connector for store ${job.data.storeId} not found`);
  }

  try {
    // Apply natural domain jitter to prevent retail rate limits
    await applyDomainJitter(1000, 2500);

    // 1. Fetch from store
    const products = await connector.search(job.data.query);
    console.log(`[Worker] Found ${products.length} products from ${connector.name}`);

    // 2. Normalize and Match
    for (const product of products) {
      const match = await matchingEngine.findMatch(product);
      
      if (match.matchMethod === 'manual') {
        console.log(`[Worker] Low confidence match for "${product.title}". Review queue candidate.`);
      } else {
        console.log(`[Worker] Match found! Method: ${match.matchMethod}, Confidence: ${match.confidence}`);
      }
    }

    return { success: true, count: products.length };
  } catch (error) {
    console.error(`[Worker] Error processing job ${job.id}:`, error);
    throw error;
  }
}, { 
  connection,
  concurrency: 3, // Safe concurrency limit per worker
});

worker.on('completed', (job) => {
  console.log(`[Worker] Job ${job.id} completed successfully.`);
});

worker.on('failed', (job, err) => {
  console.log(`[Worker] Job ${job?.id} failed: ${err.message}`);
});

console.log('[Worker] BullMQ Worker started with concurrency 3.');

// Register tiered polling jobs once connected
connection.connect().then(() => {
  registerTieredPollingJobs(priceFetchQueue).catch(() => {});
}).catch(() => {
  // Offline redis fallback
});
