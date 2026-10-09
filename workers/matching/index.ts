import { NormalizedProduct } from '../connectors';

export interface MatchResult {
  confidence: number;
  matchMethod: 'gtin' | 'model' | 'fuzzy' | 'manual';
  suggestedProductId?: string; // UUID from the database if matched
}

export class MatchingEngine {
  /**
   * Matches a normalized store product against the existing products in the database.
   * Steps:
   * 1. Exact match on EAN/UPC (GTIN)
   * 2. Match on Brand + Model Number
   * 3. Fuzzy match on normalized title
   */
  async findMatch(product: NormalizedProduct): Promise<MatchResult> {
    console.log(`[MatchingEngine] Attempting to match: ${product.title}`);

    // Step 1: Exact Match on GTIN (EAN/UPC)
    if (product.gtin) {
      // In a real implementation, query the DB for this GTIN.
      // const dbProduct = await db.query('SELECT id FROM products WHERE gtin = ?', [product.gtin]);
      // if (dbProduct) return { confidence: 1.0, matchMethod: 'gtin', suggestedProductId: dbProduct.id };
    }

    // Step 2: Match on Brand + Model Number
    if (product.brand && product.modelNumber) {
      // In a real implementation, query the DB for this brand and model number.
      // const dbProduct = await db.query('SELECT id FROM products WHERE brand_id = ? AND model_number = ?', [brandId, product.modelNumber]);
      // if (dbProduct) return { confidence: 0.95, matchMethod: 'model', suggestedProductId: dbProduct.id };
    }

    // Step 3: Fuzzy Match on Normalized Title
    // Normalize the title by removing noise words, colors, pack sizes, etc.
    const normalizedTitle = this.normalizeTitle(product.title);
    
    // In a real implementation, perform a fuzzy search (e.g., using Typesense or pg_trgm in PostgreSQL)
    // const results = await typesense.collections('products').documents().search({ q: normalizedTitle, query_by: 'title' });
    // if (results.hits.length > 0 && results.hits[0].text_match >= 80) {
    //   return { confidence: results.hits[0].text_match / 100, matchMethod: 'fuzzy', suggestedProductId: results.hits[0].document.id };
    // }

    // No confident match found - it goes to the review queue
    return {
      confidence: 0,
      matchMethod: 'manual'
    };
  }

  private normalizeTitle(title: string): string {
    // Remove common noise words and colors for better fuzzy matching
    let clean = title.toLowerCase();
    const noiseWords = ['with', 'in', 'color', 'colour', 'pack', 'size'];
    noiseWords.forEach(word => {
      clean = clean.replace(new RegExp(`\\b${word}\\b`, 'g'), '');
    });
    // Remove extra spaces
    return clean.replace(/\s+/g, ' ').trim();
  }
}
