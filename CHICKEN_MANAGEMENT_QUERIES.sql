-- ========================================
-- 🐔 POULTRY (CHICKEN) MANAGEMENT DATABASE SCHEMA & QUERIES
-- ========================================

-- NOTE: These are PostgreSQL queries for Supabase (not MySQL)
-- Adjust syntax if using MySQL

-- ========================================
-- 1. MAIN CHICKEN TABLE (Latest Snapshot)
-- ========================================
CREATE TABLE IF NOT EXISTS farmer_chickens (
    id SERIAL PRIMARY KEY,
    farmer_id INTEGER NOT NULL,
    number_of_birds INTEGER NOT NULL DEFAULT 0,
    daily_eggs DECIMAL(10, 2) NOT NULL DEFAULT 0,
    egg_price_per_unit DECIMAL(10, 2) DEFAULT 10,
    monthly_revenue DECIMAL(12, 2) GENERATED ALWAYS AS (
        ROUND(daily_eggs * 30 * egg_price_per_unit, 2)
    ) STORED,
    average_per_bird DECIMAL(10, 2) GENERATED ALWAYS AS (
        CASE 
            WHEN number_of_birds > 0 THEN ROUND(daily_eggs / number_of_birds, 2)
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
CREATE TABLE IF NOT EXISTS chicken_daily_production (
    id SERIAL PRIMARY KEY,
    farmer_id INTEGER NOT NULL,
    record_date DATE NOT NULL,
    number_of_birds INTEGER NOT NULL,
    eggs_produced INTEGER NOT NULL,
    egg_price_per_unit DECIMAL(10, 2) DEFAULT 10,
    revenue_for_day DECIMAL(12, 2) GENERATED ALWAYS AS (
        ROUND(eggs_produced * egg_price_per_unit, 2)
    ) STORED,
    notes TEXT,
    created_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 3. SAMPLE INSERT QUERIES
-- ========================================

-- Insert latest chicken snapshot
INSERT INTO farmer_chickens (farmer_id, number_of_birds, daily_eggs, egg_price_per_unit)
VALUES (1, 10, 50, 10)
ON CONFLICT (farmer_id) DO UPDATE SET
    number_of_birds = 10,
    daily_eggs = 50,
    egg_price_per_unit = 10,
    updated_timestamp = CURRENT_TIMESTAMP;

-- Insert daily production record
INSERT INTO chicken_daily_production (farmer_id, record_date, number_of_birds, eggs_produced, egg_price_per_unit)
VALUES (1, '2026-01-20', 10, 50, 10);

-- ========================================
-- 4. SELECT QUERIES
-- ========================================

-- Get latest chicken data
SELECT 
    id,
    farmer_id,
    number_of_birds,
    daily_eggs,
    egg_price_per_unit,
    monthly_revenue,
    average_per_bird,
    updated_timestamp
FROM farmer_chickens
WHERE farmer_id = 1
ORDER BY updated_timestamp DESC
LIMIT 1;

-- Get all daily production records
SELECT 
    id,
    record_date,
    number_of_birds,
    eggs_produced,
    egg_price_per_unit,
    revenue_for_day,
    (revenue_for_day * 30) as monthly_revenue
FROM chicken_daily_production
WHERE farmer_id = 1
ORDER BY record_date DESC;

-- Get this week's production
SELECT 
    TO_CHAR(record_date, 'Dy') as day_name,
    record_date,
    number_of_birds,
    eggs_produced,
    egg_price_per_unit,
    revenue_for_day
FROM chicken_daily_production
WHERE farmer_id = 1 
    AND record_date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY record_date;

-- Get monthly summary
SELECT 
    TO_CHAR(record_date, 'YYYY-MM') as month,
    COUNT(*) as days_recorded,
    SUM(eggs_produced) as total_eggs,
    SUM(revenue_for_day) as total_revenue,
    ROUND(AVG(eggs_produced), 2) as avg_daily_production,
    ROUND(SUM(revenue_for_day), 2) as total_daily_revenue
FROM chicken_daily_production
WHERE farmer_id = 1
GROUP BY TO_CHAR(record_date, 'YYYY-MM')
ORDER BY month DESC;

-- ========================================
-- 5. STATISTICS & AGGREGATION QUERIES
-- ========================================

-- Get complete chicken statistics
SELECT 
    fc.number_of_birds,
    fc.daily_eggs,
    fc.egg_price_per_unit,
    fc.monthly_revenue,
    fc.average_per_bird,
    COUNT(cdp.id) as total_records,
    SUM(cdp.eggs_produced) as total_eggs_produced,
    ROUND(AVG(cdp.eggs_produced), 2) as avg_daily_production,
    SUM(cdp.revenue_for_day) as total_earnings
FROM farmer_chickens fc
LEFT JOIN chicken_daily_production cdp ON fc.farmer_id = cdp.farmer_id
WHERE fc.farmer_id = 1
GROUP BY fc.id, fc.number_of_birds, fc.daily_eggs, fc.egg_price_per_unit, fc.monthly_revenue, fc.average_per_bird;

-- Get revenue analysis
SELECT 
    TO_CHAR(record_date, 'YYYY-MM-DD') as date,
    number_of_birds,
    eggs_produced,
    egg_price_per_unit,
    revenue_for_day,
    (revenue_for_day * 30) as monthly_projection
FROM chicken_daily_production
WHERE farmer_id = 1
ORDER BY record_date DESC;

-- ========================================
-- 6. UPDATE QUERIES
-- ========================================

-- Update latest chicken data
UPDATE farmer_chickens
SET 
    number_of_birds = 10,
    daily_eggs = 50,
    egg_price_per_unit = 10,
    updated_timestamp = CURRENT_TIMESTAMP
WHERE farmer_id = 1;

-- Update specific daily record
UPDATE chicken_daily_production
SET 
    eggs_produced = 50,
    egg_price_per_unit = 10,
    notes = 'Good production day'
WHERE farmer_id = 1 AND record_date = '2026-01-20';

-- ========================================
-- 7. DELETE QUERIES
-- ========================================

-- Delete all chicken data for farmer
DELETE FROM chicken_daily_production WHERE farmer_id = 1;
DELETE FROM farmer_chickens WHERE farmer_id = 1;

-- Delete specific daily record
DELETE FROM chicken_daily_production 
WHERE farmer_id = 1 AND record_date = '2026-01-20';

-- ========================================
-- 8. EXAMPLE DATA (for testing)
-- ========================================

INSERT INTO farmer_chickens (farmer_id, number_of_birds, daily_eggs, egg_price_per_unit) 
VALUES (1, 10, 50, 10);

INSERT INTO chicken_daily_production (farmer_id, record_date, number_of_birds, eggs_produced, egg_price_per_unit) 
VALUES 
(1, '2026-01-20', 10, 50, 10),
(1, '2026-01-19', 10, 48, 10),
(1, '2026-01-18', 10, 52, 10),
(1, '2026-01-17', 10, 49, 10),
(1, '2026-01-16', 10, 51, 10),
(1, '2026-01-15', 10, 50, 10),
(1, '2026-01-14', 10, 47, 10);

-- ========================================
-- FORMULA EXPLANATIONS
-- ========================================

-- Monthly Revenue = Daily Eggs × 30 days × Price per Unit (₹)
-- Example: 50 eggs × 30 × ₹10 = ₹15,000

-- Daily Revenue = Eggs Produced × Price per Unit (₹)
-- Example: 50 eggs × ₹10 = ₹500

-- Average per Bird = Total Daily Eggs ÷ Number of Birds
-- Example: 50 eggs ÷ 10 birds = 5 eggs per bird

-- ========================================
-- TABLE RELATIONSHIPS
-- ========================================
-- farmer_chickens (main data) --1:N-- chicken_daily_production (daily records)
--
-- farmer_chickens stores the LATEST/CURRENT snapshot
-- chicken_daily_production stores HISTORICAL daily records
