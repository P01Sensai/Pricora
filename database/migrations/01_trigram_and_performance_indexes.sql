-- Pricora Migration 01: Trigram Fuzzy Search & High-Throughput Performance Indexes
-- Purpose: Accelerate full-text & fuzzy title matching from O(N) sequential scan to sub-10ms GIN index scans.

-----------------------------------------
-- 1. Enable PostgreSQL Trigram Extension
-----------------------------------------
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-----------------------------------------
-- 2. GIN Trigram Indexes for Instant Substring & Fuzzy Search
-----------------------------------------
-- Accelerates `WHERE title ILIKE '%query%'` and similarity matching
CREATE INDEX IF NOT EXISTS idx_products_title_trgm 
ON products USING gin (title gin_trgm_ops);

-- Accelerates brand name lookups
CREATE INDEX IF NOT EXISTS idx_brands_name_trgm 
ON brands USING gin (name gin_trgm_ops);

-----------------------------------------
-- 3. Composite High-Throughput Query Indexes
-----------------------------------------
-- Speeds up filtering active products by price order (e.g. Lowest Price sort)
CREATE INDEX IF NOT EXISTS idx_products_status_lowest_price 
ON products(status, lowest_price);

-- Speeds up category listing pages with active status filter
CREATE INDEX IF NOT EXISTS idx_products_category_status 
ON products(category_id, status);

-- Speeds up store listing price comparison queries
CREATE INDEX IF NOT EXISTS idx_store_listings_product_price 
ON store_listings(product_id, current_price) 
WHERE in_stock = true;

-- Speeds up price history range queries for Recharts graphs
CREATE INDEX IF NOT EXISTS idx_price_history_compact_range 
ON price_history(listing_id, recorded_at DESC);

-- Speeds up price alert evaluation jobs when price drops occur
CREATE INDEX IF NOT EXISTS idx_alerts_evaluation 
ON alert_subscribers(product_id, target_price) 
WHERE is_active = true;

-- Speeds up user alert lookups by email
CREATE INDEX IF NOT EXISTS idx_alerts_email_lookup 
ON alert_subscribers(email);
