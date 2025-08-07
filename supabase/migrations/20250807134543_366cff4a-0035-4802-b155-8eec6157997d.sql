-- Fix RLS policies for affiliate_profiles to allow proper access

-- Drop existing conflicting policies
DROP POLICY IF EXISTS "Public can create affiliate profile" ON affiliate_profiles;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON affiliate_profiles;

-- Create proper RLS policy for affiliate profile creation
CREATE POLICY "Authenticated users can create their own affiliate profile" 
ON affiliate_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Update the select policy to use maybeSingle approach
DROP POLICY IF EXISTS "Affiliates can view their own profile" ON affiliate_profiles;
CREATE POLICY "Affiliates can view their own profile" 
ON affiliate_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Ensure proper permissions for referral tracking
DROP POLICY IF EXISTS "Affiliates can view their own referrals" ON referral_tracking;
CREATE POLICY "Affiliates can view their own referrals" 
ON referral_tracking 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM affiliate_profiles 
  WHERE affiliate_profiles.id = referral_tracking.affiliate_id 
  AND affiliate_profiles.user_id = auth.uid()
));