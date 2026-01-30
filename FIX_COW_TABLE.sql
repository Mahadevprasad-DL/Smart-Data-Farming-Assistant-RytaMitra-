-- ========================================
-- 🔧 FIX COW_DAILY_PRODUCTION TABLE
-- ========================================
-- Run this in Supabase SQL Editor to allow multiple entries per day

-- Step 1: Drop the existing UNIQUE constraint
-- Find the constraint name first by running:
-- SELECT constraint_name FROM information_schema.table_constraints 
-- WHERE table_name = 'cow_daily_production' AND constraint_type = 'UNIQUE';

-- Then drop it (replace 'constraint_name' with actual name from above query)
-- ALTER TABLE cow_daily_production DROP CONSTRAINT constraint_name;

-- OR simply recreate the table (WARNING: This will delete all existing data)

-- Option 1: Drop and recreate (DELETES ALL DATA)
DROP TABLE IF EXISTS cow_daily_production CASCADE;

CREATE TABLE cow_daily_production (
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

-- Add some test data
INSERT INTO cow_daily_production (farmer_id, record_date, number_of_cows, milk_produced_liters, milk_price_per_liter) 
VALUES 
(1, CURRENT_DATE, 4, 8, 60),
(1, CURRENT_DATE - INTERVAL '1 day', 4, 7.5, 60),
(1, CURRENT_DATE - INTERVAL '2 days', 4, 8.2, 60);

-- ========================================
-- Option 2: Keep existing data and just remove constraint
-- ========================================
-- Use this if you want to preserve existing records

-- First, find the constraint name:
-- SELECT constraint_name 
-- FROM information_schema.table_constraints 
-- WHERE table_name = 'cow_daily_production' 
--   AND constraint_type = 'UNIQUE';

-- Example result might be: cow_daily_production_farmer_id_record_date_key

-- Then drop it:
-- ALTER TABLE cow_daily_production 
-- DROP CONSTRAINT cow_daily_production_farmer_id_record_date_key;

-- ========================================
-- Verify the change
-- ========================================
-- Check if constraint is removed:
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'cow_daily_production';

-- Test inserting multiple records for same day:
INSERT INTO cow_daily_production (farmer_id, record_date, number_of_cows, milk_produced_liters, milk_price_per_liter)
VALUES 
(1, CURRENT_DATE, 3, 6, 55),
(1, CURRENT_DATE, 2, 4, 55);

-- Verify records:
SELECT * FROM cow_daily_production 
WHERE farmer_id = 1 
ORDER BY created_timestamp DESC;
