-- Pricora Migration 03: Advisor Optimizations & Warning Remediation
-- Resolves:
-- 1. Performance Advisor: Duplicate index on public.price_history
-- 2. Security Advisor: Extension in public (moves pg_trgm to extensions schema)
-- 3. Security Advisor: RLS Policy Always True on alert_subscribers & click_events (drops unnecessary public write policies)

-----------------------------------------------------------
-- 1. Performance: Drop duplicate index on price_history
-----------------------------------------------------------
-- Retains idx_price_history_listing_date for price trend queries
DROP INDEX IF EXISTS idx_price_history_compact_range;

-----------------------------------------------------------
-- 2. Security: Isolate pg_trgm extension in extensions schema
-----------------------------------------------------------
CREATE SCHEMA IF NOT EXISTS extensions;
ALTER EXTENSION pg_trgm SET SCHEMA extensions;

-----------------------------------------------------------
-- 3. Security: Drop overly permissive public write policies
-- All alert subscriptions (/api/alerts/subscribe) and click tracking (/out/[id])
-- are executed server-side via elevated admin client.
-- Making these tables 100% private to server-side code eliminates the RLS Always True warnings.
-----------------------------------------------------------
DROP POLICY IF EXISTS "Public insert alert_subscribers" ON alert_subscribers;
DROP POLICY IF EXISTS "Public insert click_events" ON click_events;
