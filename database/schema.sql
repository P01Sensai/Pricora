-- Pricora Initial Schema (PostgreSQL)
-- Based on Document 5: Database Schema

-----------------------------------------
-- 1. STORES
-----------------------------------------
CREATE TABLE stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    base_url TEXT NOT NULL,
    source_type TEXT NOT NULL CHECK (source_type IN ('api', 'feed', 'scraper')),
    is_active BOOLEAN DEFAULT true,
    affiliate_config JSONB,
    last_success_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-----------------------------------------
-- 2. BRANDS
-----------------------------------------
CREATE TABLE brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-----------------------------------------
-- 3. CATEGORIES
-----------------------------------------
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    parent_id UUID REFERENCES categories(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-----------------------------------------
-- 4. PRODUCTS
-----------------------------------------
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    brand_id UUID REFERENCES brands(id),
    category_id UUID REFERENCES categories(id),
    model_number TEXT,
    gtin TEXT UNIQUE,
    image_url TEXT,
    images JSONB,
    specs JSONB,
    highlights JSONB,
    lowest_price INTEGER,
    lowest_price_store_id UUID REFERENCES stores(id),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'hidden', 'merged')),
    merged_into_id UUID REFERENCES products(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_brand_category ON products(brand_id, category_id);

-----------------------------------------
-- 5. STORE LISTINGS
-----------------------------------------
CREATE TABLE store_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id),
    store_id UUID REFERENCES stores(id) NOT NULL,
    store_product_id TEXT NOT NULL,
    url TEXT NOT NULL,
    store_title TEXT NOT NULL,
    current_price INTEGER,
    mrp INTEGER,
    delivery_charge INTEGER,
    in_stock BOOLEAN DEFAULT true,
    match_method TEXT CHECK (match_method IN ('gtin', 'model', 'fuzzy', 'manual')),
    match_confidence NUMERIC CHECK (match_confidence >= 0 AND match_confidence <= 1),
    last_checked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(store_id, store_product_id)
);

CREATE INDEX idx_store_listings_product_id ON store_listings(product_id);

-----------------------------------------
-- 6. PRICE HISTORY
-----------------------------------------
CREATE TABLE price_history (
    id BIGSERIAL PRIMARY KEY,
    listing_id UUID REFERENCES store_listings(id) NOT NULL,
    price INTEGER NOT NULL,
    in_stock BOOLEAN DEFAULT true,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_price_history_listing_date ON price_history(listing_id, recorded_at DESC);

-----------------------------------------
-- 7. DEAL SCORES
-----------------------------------------
CREATE TABLE deal_scores (
    product_id UUID PRIMARY KEY REFERENCES products(id),
    score INTEGER CHECK (score >= 0 AND score <= 100),
    verdict TEXT CHECK (verdict IN ('Great deal', 'Good deal', 'Fair', 'Wait')),
    breakdown JSONB,
    calculated_at TIMESTAMPTZ DEFAULT NOW()
);

-----------------------------------------
-- 8. ALERT SUBSCRIBERS
-----------------------------------------
CREATE TABLE alert_subscribers (
    alert_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    product_id UUID REFERENCES products(id) NOT NULL,
    target_price INTEGER,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'triggered', 'unsubscribed')),
    confirm_token_hash TEXT NOT NULL,
    manage_token_hash TEXT NOT NULL,
    consent_at TIMESTAMPTZ,
    triggered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_alerts_product_status ON alert_subscribers(product_id, status);

-----------------------------------------
-- 9. CLICK EVENTS
-----------------------------------------
CREATE TABLE click_events (
    id BIGSERIAL PRIMARY KEY,
    listing_id UUID REFERENCES store_listings(id) NOT NULL,
    session_id TEXT NOT NULL,
    referrer TEXT,
    device TEXT,
    clicked_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_clicks_listing_time ON click_events(listing_id, clicked_at);

-----------------------------------------
-- 10. ADMIN USERS & AUDIT LOG
-----------------------------------------
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT CHECK (role IN ('owner', 'editor', 'viewer')),
    two_factor_secret TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE audit_log (
    id BIGSERIAL PRIMARY KEY,
    admin_id UUID REFERENCES admin_users(id),
    action TEXT NOT NULL,
    before_state JSONB,
    after_state JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-----------------------------------------
-- 11. MATCH REVIEW QUEUE
-----------------------------------------
CREATE TABLE match_review_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES store_listings(id) NOT NULL,
    suggested_product_id UUID REFERENCES products(id),
    confidence NUMERIC,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'merged', 'new_product', 'rejected')),
    reviewed_by UUID REFERENCES admin_users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
