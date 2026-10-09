import { Worker, Queue } from 'bullmq';
import IORedis from 'ioredis';
import { AmazonConnector } from './connectors/amazon';
import { FlipkartConnector } from './connectors/flipkart';
import { CromaConnector } from './connectors/croma';
import { MatchingEngine } from './matching';
import * as dotenv from 'dotenv';

dotenv.config({ path: '../.env.local' });

// Setup Redis Connection
const connection = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
  maxRetriesPerRequest: null,
});

// Create Connectors
const connectors = [
  new AmazonConnector(),
  new FlipkartConnector(),
  new CromaConnector()
];

const matchingEngine = new MatchingEngine();

// The Job Payload
interface FetchJobData {
  storeId: string;
  query: string;
}

// Queue for fetching prices
export const priceFetchQueue = new Queue<FetchJobData>('price-fetch-queue', { connection });

// Initialize the Worker
const worker = new Worker<FetchJobData>('price-fetch-queue', async (job) => {
  console.log(`[Worker] Processing job ${job.id}: Fetching for store ${job.data.storeId} with query "${job.data.query}"`);
  
  const connector = connectors.find(c => c.storeId === job.data.storeId);
  if (!connector) {
    throw new Error(`Connector for store ${job.data.storeId} not found`);
  }

  try {
    // 1. Fetch from store
    const products = await connector.search(job.data.query);
    console.log(`[Worker] Found ${products.length} products from ${connector.name}`);

    // 2. Normalize and Match
    for (const product of products) {
      const match = await matchingEngine.findMatch(product);
      
      if (match.matchMethod === 'manual') {
        console.log(`[Worker] Low confidence match for "${product.title}". Sending to review queue.`);
        // In reality, insert into match_review_queue table
      } else {
        console.log(`[Worker] High confidence match! Method: ${match.matchMethod}, Confidence: ${match.confidence}`);
        // In reality, update price_history and store_listings tables
      }
    }

    return { success: true, count: products.length };
  } catch (error) {
    console.error(`[Worker] Error processing job ${job.id}:`, error);
    throw error;
  }
}, { connection });

worker.on('completed', (job) => {
  console.log(`[Worker] Job ${job.id} completed successfully!`);
});

worker.on('failed', (job, err) => {
  console.log(`[Worker] Job ${job?.id} failed with error: ${err.message}`);
});

console.log('[Worker] BullMQ Worker started and waiting for jobs...');

// Helper to add a mock job for testing
async function addMockJob() {
  await priceFetchQueue.add('mock-fetch-1', { storeId: 'amazon', query: 'JBL Flip 6' });
  await priceFetchQueue.add('mock-fetch-2', { storeId: 'flipkart', query: 'Sony WH-1000XM5' });
  await priceFetchQueue.add('mock-fetch-3', { storeId: 'croma', query: 'Bose QuietComfort' });
}

// addMockJob();
