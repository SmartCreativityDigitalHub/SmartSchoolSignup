-- Remove affiliate system tables and related data

-- Drop foreign key dependencies first
DROP TABLE IF EXISTS withdrawal_requests CASCADE;
DROP TABLE IF EXISTS commission_payments CASCADE;
DROP TABLE IF EXISTS referrals CASCADE;
DROP TABLE IF EXISTS affiliates CASCADE;

-- Remove affiliate-related columns from school_signups
ALTER TABLE school_signups DROP COLUMN IF EXISTS referral_code;