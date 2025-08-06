-- Create affiliate profiles table
CREATE TABLE public.affiliate_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  state_location TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  bank_account_name TEXT NOT NULL,
  bank_account_number TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  commission_rate NUMERIC DEFAULT 5000,
  is_active BOOLEAN DEFAULT true,
  total_earnings NUMERIC DEFAULT 0,
  pending_earnings NUMERIC DEFAULT 0,
  paid_earnings NUMERIC DEFAULT 0,
  total_referrals INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create referral tracking table
CREATE TABLE public.referral_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID NOT NULL REFERENCES public.affiliate_profiles(id),
  visitor_ip TEXT,
  user_agent TEXT,
  referral_code TEXT NOT NULL,
  visited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  converted BOOLEAN DEFAULT false,
  signup_id UUID,
  commission_earned NUMERIC DEFAULT 0,
  commission_status TEXT DEFAULT 'pending'
);

-- Create affiliate withdrawals table
CREATE TABLE public.affiliate_withdrawals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID NOT NULL REFERENCES public.affiliate_profiles(id),
  amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending',
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.affiliate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_withdrawals ENABLE ROW LEVEL SECURITY;

-- Create policies for affiliate_profiles
CREATE POLICY "Affiliates can view their own profile" 
ON public.affiliate_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Affiliates can update their own profile" 
ON public.affiliate_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Anyone can create affiliate profile" 
ON public.affiliate_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all affiliate profiles" 
ON public.affiliate_profiles 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Create policies for referral_tracking
CREATE POLICY "Public can insert referral tracking" 
ON public.referral_tracking 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Affiliates can view their own referrals" 
ON public.referral_tracking 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.affiliate_profiles 
  WHERE id = affiliate_id AND user_id = auth.uid()
));

CREATE POLICY "Admins can view all referral tracking" 
ON public.referral_tracking 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Create policies for affiliate_withdrawals
CREATE POLICY "Affiliates can view their own withdrawals" 
ON public.affiliate_withdrawals 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.affiliate_profiles 
  WHERE id = affiliate_id AND user_id = auth.uid()
));

CREATE POLICY "Affiliates can create withdrawal requests" 
ON public.affiliate_withdrawals 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.affiliate_profiles 
  WHERE id = affiliate_id AND user_id = auth.uid()
));

CREATE POLICY "Admins can manage all withdrawals" 
ON public.affiliate_withdrawals 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_affiliate_profiles_updated_at
BEFORE UPDATE ON public.affiliate_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_affiliate_withdrawals_updated_at
BEFORE UPDATE ON public.affiliate_withdrawals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_affiliate_profiles_username ON public.affiliate_profiles(username);
CREATE INDEX idx_affiliate_profiles_email ON public.affiliate_profiles(email);
CREATE INDEX idx_referral_tracking_affiliate_id ON public.referral_tracking(affiliate_id);
CREATE INDEX idx_referral_tracking_referral_code ON public.referral_tracking(referral_code);
CREATE INDEX idx_affiliate_withdrawals_affiliate_id ON public.affiliate_withdrawals(affiliate_id);