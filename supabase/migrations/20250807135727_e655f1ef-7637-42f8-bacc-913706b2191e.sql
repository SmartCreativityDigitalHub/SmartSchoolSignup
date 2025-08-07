-- Allow unauthenticated affiliate signup by making user_id nullable
ALTER TABLE public.affiliate_profiles
ALTER COLUMN user_id DROP NOT NULL;

-- Add default UUID generation for user_id
ALTER TABLE public.affiliate_profiles
ALTER COLUMN user_id SET DEFAULT gen_random_uuid();

-- Update RLS policies to allow unauthenticated signup
DROP POLICY IF EXISTS "Authenticated users can create their own affiliate profile" ON affiliate_profiles;

-- Allow public insert for affiliate profiles
CREATE POLICY "Allow public affiliate signup" 
ON affiliate_profiles 
FOR INSERT 
WITH CHECK (true);

-- Update select policy to work with both authenticated and unauthenticated users
DROP POLICY IF EXISTS "Affiliates can view their own profile" ON affiliate_profiles;
CREATE POLICY "Affiliates can view their own profile" 
ON affiliate_profiles 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  (auth.uid() IS NULL AND user_id IS NOT NULL)
);

-- Create demo affiliate account
INSERT INTO public.affiliate_profiles (
  username,
  full_name,
  email,
  phone_number,
  country,
  state_location,
  bank_name,
  bank_account_name,
  bank_account_number,
  total_earnings,
  pending_earnings,
  paid_earnings,
  total_referrals,
  commission_rate,
  is_active
) VALUES (
  'demo_affiliate',
  'Demo Affiliate User',
  'demo@affiliate.com',
  '+234-800-123-4567',
  'Nigeria',
  'Lagos',
  'First Bank of Nigeria',
  'Demo Affiliate User',
  '1234567890',
  50000.00,
  25000.00,
  25000.00,
  10,
  5000.00,
  true
);

-- Also create corresponding auth user for demo account
-- This will be handled in the application code