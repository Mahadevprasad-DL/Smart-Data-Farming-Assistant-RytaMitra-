-- ========================================
-- 🐄 COW MANAGEMENT DATABASE SCHEMA & QUERIES
-- ========================================

-- NOTE: These are PostgreSQL queries for Supabase (not MySQL)
-- Adjust syntax if using MySQL

-- ========================================
-- 1. MAIN COW TABLE (Latest Snapshot)
-- ========================================
CREATE TABLE IF NOT EXISTS farmer_cows (
    id SERIAL PRIMARY KEY,
    farmer_id INTEGER NOT NULL,
    number_of_cows INTEGER NOT NULL DEFAULT 1,
    daily_milk_production DECIMAL(10, 2) NOT NULL DEFAULT 0,
    milk_price_per_liter DECIMAL(10, 2) DEFAULT 60,
    monthly_revenue DECIMAL(12, 2) GENERATED ALWAYS AS (
        ROUND(daily_milk_production * 30 * milk_price_per_liter, 2)
    ) STORED,
    average_per_cow DECIMAL(10, 2) GENERATED ALWAYS AS (
        CASE 
            WHEN number_of_cows > 0 THEN ROUND(daily_milk_production / number_of_cows, 2)
            ELSE 0 
        END
    ) STORED,
    created_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 2. DAILY PRODUCTION HISTORY TABLE
-- ========================================
-- IMPORTANT: Removed UNIQUE constraint to allow multiple entries per day
CREATE TABLE IF NOT EXISTS cow_daily_production (
    id SERIAL PRIMARY KEY,
    farmer_id INTEGER NOT NULL,
    record_date DATE NOT NULL,
    number_of_cows INTEGER NOT NULL,
    milk_produced_liters DECIMAL(10, 2) NOT NULL,
    milk_price_per_liter DECIMAL(10, 2) DEFAULT 60,
    revenue_for_day DECIMAL(12, 2) GENERATED ALWAYS AS (
        ROUND(milk_produced_liters * milk_price_per_liter, 2)
    ) STORED,
    notes TEXT,
    created_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 3. SAMPLE INSERT QUERIES
-- ========================================

-- Insert latest cow snapshot
INSERT INTO farmer_cows (farmer_id, number_of_cows, daily_milk_production, milk_price_per_liter)
VALUES (1, 4, 8, 18)
ON CONFLICT (farmer_id) DO UPDATE SET
    number_of_cows = 4,
    daily_milk_production = 8,
    milk_price_per_liter = 18,
    updated_timestamp = CURRENT_TIMESTAMP;

-- Insert daily production record
INSERT INTO cow_daily_production (farmer_id, record_date, number_of_cows, milk_produced_liters, milk_price_per_liter)
VALUES (1, '2026-01-20', 4, 8, 18)
ON CONFLICT (farmer_id, record_date) DO UPDATE SET
    number_of_cows = 4,
    milk_produced_liters = 8,
    milk_price_per_liter = 18;

-- ========================================
-- 4. SELECT QUERIES
-- ========================================

-- Get latest cow data
SELECT 
    id,
    farmer_id,
    number_of_cows,
    daily_milk_production,
    milk_price_per_liter,
    monthly_revenue,
    average_per_cow,
    updated_timestamp
FROM farmer_cows
WHERE farmer_id = 1
ORDER BY updated_timestamp DESC
LIMIT 1;

-- Get all daily production records
SELECT 
    record_date,
    number_of_cows,
    milk_produced_liters,
    milk_price_per_liter,
    revenue_for_day
FROM cow_daily_production
WHERE farmer_id = 1
ORDER BY record_date DESC;

-- Get all daily records for table display
SELECT 
    id,
    record_date,
    number_of_cows,
    milk_produced_liters,
    milk_price_per_liter,
    revenue_for_day,
    (revenue_for_day * 30) as monthly_revenue
FROM cow_daily_production
WHERE farmer_id = 1
ORDER BY record_date DESC;

-- Get this week's production
SELECT 
    TO_CHAR(record_date, 'Dy') as day_name,
    record_date,
    number_of_cows,
    milk_produced_liters,
    milk_price_per_liter,
    revenue_for_day
FROM cow_daily_production
WHERE farmer_id = 1 
    AND record_date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY record_date;

-- Get monthly summary
SELECT 
    TO_CHAR(record_date, 'YYYY-MM') as month,
    COUNT(*) as days_recorded,
    SUM(milk_produced_liters) as total_milk,
    SUM(revenue_for_day) as total_revenue,
    ROUND(AVG(milk_produced_liters), 2) as avg_daily_production,
    ROUND(SUM(revenue_for_day), 2) as total_daily_revenue
FROM cow_daily_production
WHERE farmer_id = 1
GROUP BY TO_CHAR(record_date, 'YYYY-MM')
ORDER BY month DESC;

-- ========================================
-- 5. STATISTICS & AGGREGATION QUERIES
-- ========================================

-- Get complete cow statistics
SELECT 
    fc.number_of_cows,
    fc.daily_milk_production,
    fc.milk_price_per_liter,
    fc.monthly_revenue,
    fc.average_per_cow,
    COUNT(cdp.id) as total_records,
    SUM(cdp.milk_produced_liters) as total_production,
    ROUND(AVG(cdp.milk_produced_liters), 2) as avg_production,
    SUM(cdp.revenue_for_day) as total_earnings
FROM farmer_cows fc
LEFT JOIN cow_daily_production cdp ON fc.farmer_id = cdp.farmer_id
WHERE fc.farmer_id = 1
GROUP BY fc.id, fc.number_of_cows, fc.daily_milk_production, fc.milk_price_per_liter, fc.monthly_revenue, fc.average_per_cow;

-- Get revenue analysis
SELECT 
    TO_CHAR(record_date, 'YYYY-MM-DD') as date,
    number_of_cows,
    milk_produced_liters,
    milk_price_per_liter,
    revenue_for_day,
    (revenue_for_day * 30) as monthly_projection
FROM cow_daily_production
WHERE farmer_id = 1
ORDER BY record_date DESC;

-- ========================================
-- 6. UPDATE QUERIES
-- ========================================

-- Update latest cow data
UPDATE farmer_cows
SET 
    number_of_cows = 4,
    daily_milk_production = 8,
    milk_price_per_liter = 18,
    updated_timestamp = CURRENT_TIMESTAMP
WHERE farmer_id = 1;

-- Update specific daily record
UPDATE cow_daily_production
SET 
    milk_produced_liters = 8,
    milk_price_per_liter = 18,
    notes = 'Good production day'
WHERE farmer_id = 1 AND record_date = '2026-01-20';

-- ========================================
-- 7. DELETE QUERIES
-- ========================================

-- Delete all cow data for farmer
DELETE FROM cow_daily_production WHERE farmer_id = 1;
DELETE FROM farmer_cows WHERE farmer_id = 1;

-- Delete specific daily record
DELETE FROM cow_daily_production 
WHERE farmer_id = 1 AND record_date = '2026-01-20';

-- ========================================
-- 8. EXAMPLE DATA (for testing)
-- ========================================

INSERT INTO farmer_cows (farmer_id, number_of_cows, daily_milk_production, milk_price_per_liter) 
VALUES (1, 4, 8, 18);

INSERT INTO cow_daily_production (farmer_id, record_date, number_of_cows, milk_produced_liters, milk_price_per_liter) 
VALUES 
(1, '2026-01-20', 4, 8, 18),
(1, '2026-01-19', 4, 7.5, 18),
(1, '2026-01-18', 4, 8.2, 18),
(1, '2026-01-17', 4, 7.8, 18),
(1, '2026-01-16', 4, 8.1, 18),
(1, '2026-01-15', 4, 8, 18),
(1, '2026-01-14', 4, 7.9, 18);

-- ========================================
-- FORMULA EXPLANATIONS
-- ========================================

-- Monthly Revenue = Daily Production (L) × 30 days × Price per Liter (₹)
-- Example: 8 L × 30 × ₹18 = ₹4,320

-- Daily Revenue = Milk Produced (L) × Price per Liter (₹)
-- Example: 8 L × ₹18 = ₹144

-- Average per Cow = Total Daily Production ÷ Number of Cows
-- Example: 8 L ÷ 4 cows = 2 L per cow

-- ========================================
-- TABLE RELATIONSHIPS
-- ========================================
-- farmer_cows (main data) --1:N-- cow_daily_production (daily records)
--
-- farmer_cows stores the LATEST/CURRENT snapshot
-- cow_daily_production stores HISTORICAL daily records
