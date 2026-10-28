-- Pricora Migration 02: Enable Row-Level Security (RLS) & Secure Sensitive Data
-- Resolves Supabase Security Advisor critical alerts:
-- 1. rls_disabled_in_public (Row-Level Security disabled on public tables)
-- 2. sensitive_columns_exposed (Sensitive columns in admin_users & alert_subscribers exposed)

-----------------------------------------------------------
-- 1. Enable RLS on all 12 public tables
-----------------------------------------------------------
ALTER TABLE IF EXISTS categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS store_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS deal_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS click_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS alert_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS match_review_queue ENABLE ROW LEVEL SECURITY;

-----------------------------------------------------------
-- 2. Drop any pre-existing policies to allow safe re-execution
-----------------------------------------------------------
DROP POLICY IF EXISTS "Public read categories" ON categories;
DROP POLICY IF EXISTS "Public read brands" ON brands;
DROP POLICY IF EXISTS "Public read products" ON products;
DROP POLICY IF EXISTS "Public read stores" ON stores;
DROP POLICY IF EXISTS "Public read store_listings" ON store_listings;
DROP POLICY IF EXISTS "Public read price_history" ON price_history;
DROP POLICY IF EXISTS "Public read deal_scores" ON deal_scores;
DROP POLICY IF EXISTS "Public insert click_events" ON click_events;
DROP POLICY IF EXISTS "Public insert alert_subscribers" ON alert_subscribers;

-----------------------------------------------------------
-- 3. Public Storefront Read Policies (Catalog & Price Comparison)
-----------------------------------------------------------
-- Anyone can view categories
CREATE POLICY "Public read categories"
ON categories FOR SELECT
TO anon, authenticated
USING (true);

-- Anyone can view brands
CREATE POLICY "Public read brands"
ON brands FOR SELECT
TO anon, authenticated
USING (true);

-- Anyone can view active products
CREATE POLICY "Public read products"
ON products FOR SELECT
TO anon, authenticated
USING (status = 'active');

-- Anyone can view active stores
CREATE POLICY "Public read stores"
ON stores FOR SELECT
TO anon, authenticated
USING (is_active = true);

-- Anyone can view store listings
CREATE POLICY "Public read store_listings"
ON store_listings FOR SELECT
TO anon, authenticated
USING (true);

-- Anyone can view price history for charts
CREATE POLICY "Public read price_history"
ON price_history FOR SELECT
TO anon, authenticated
USING (true);

-- Anyone can view deal scores
CREATE POLICY "Public read deal_scores"
ON deal_scores FOR SELECT
TO anon, authenticated
USING (true);

-----------------------------------------------------------
-- 4. Outbound Affiliate & Analytics Logging
-----------------------------------------------------------
-- Public users can log click events, but cannot read or dump analytics
CREATE POLICY "Public insert click_events"
ON click_events FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-----------------------------------------------------------
-- 5. Public Price Drop Subscriptions
-----------------------------------------------------------
-- Public users can subscribe to alerts, but cannot dump other users' emails or tokens
CREATE POLICY "Public insert alert_subscribers"
ON alert_subscribers FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-----------------------------------------------------------
-- 6. Sensitive & Admin-Only Tables
-----------------------------------------------------------
-- admin_users, audit_log, and match_review_queue have RLS ENABLED
-- with NO public policies granted.
-- Only database superusers and the Supabase `service_role` (used by server APIs)
-- can read or modify these tables. Public anon access is 100% blocked.

