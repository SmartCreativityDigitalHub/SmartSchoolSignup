-- Add country field to affiliate_profiles table
ALTER TABLE public.affiliate_profiles 
ADD COLUMN country text NOT NULL DEFAULT 'Nigeria';

-- Create index for better performance
CREATE INDEX idx_affiliate_profiles_country ON public.affiliate_profiles(country);