-- Create user roles enum
CREATE TYPE public.user_role AS ENUM ('admin', 'affiliate', 'school');

-- Create profiles table for additional user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  role user_role NOT NULL DEFAULT 'school',
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create admin configurations table
CREATE TABLE public.admin_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key TEXT NOT NULL UNIQUE,
  config_value TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create pricing plans table
CREATE TABLE public.pricing_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  features JSONB,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create affiliates table
CREATE TABLE public.affiliates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  affiliate_code TEXT NOT NULL UNIQUE,
  commission_rate NUMERIC DEFAULT 10.0,
  bank_name TEXT,
  account_number TEXT,
  account_name TEXT,
  status TEXT DEFAULT 'pending', -- pending, approved, suspended
  total_earnings NUMERIC DEFAULT 0,
  withdrawn_amount NUMERIC DEFAULT 0,
  pending_amount NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create referral tracking table
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  school_signup_id UUID REFERENCES public.school_signups(id) ON DELETE SET NULL,
  referral_code TEXT NOT NULL,
  visitor_ip TEXT,
  user_agent TEXT,
  status TEXT DEFAULT 'pending', -- pending, converted, cancelled
  commission_amount NUMERIC DEFAULT 0,
  commission_paid BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create commission payments table
CREATE TABLE public.commission_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  payment_method TEXT,
  payment_reference TEXT,
  status TEXT DEFAULT 'pending', -- pending, paid, failed
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create withdrawal requests table
CREATE TABLE public.withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected, paid
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS user_role
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.profiles WHERE user_id = user_uuid;
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for admin_configs
CREATE POLICY "Only admins can access configs" ON public.admin_configs
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for pricing_plans
CREATE POLICY "Everyone can view active plans" ON public.pricing_plans
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage plans" ON public.pricing_plans
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for affiliates
CREATE POLICY "Affiliates can view own data" ON public.affiliates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Affiliates can update own data" ON public.affiliates
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Affiliates can insert own data" ON public.affiliates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage affiliates" ON public.affiliates
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for referrals
CREATE POLICY "Affiliates can view own referrals" ON public.referrals
  FOR SELECT USING (
    affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid())
  );

CREATE POLICY "System can insert referrals" ON public.referrals
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage referrals" ON public.referrals
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for commission_payments
CREATE POLICY "Affiliates can view own payments" ON public.commission_payments
  FOR SELECT USING (
    affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can manage payments" ON public.commission_payments
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for withdrawal_requests
CREATE POLICY "Affiliates can view own requests" ON public.withdrawal_requests
  FOR SELECT USING (
    affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid())
  );

CREATE POLICY "Affiliates can create requests" ON public.withdrawal_requests
  FOR INSERT WITH CHECK (
    affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can manage requests" ON public.withdrawal_requests
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- Create triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_admin_configs_updated_at
  BEFORE UPDATE ON public.admin_configs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pricing_plans_updated_at
  BEFORE UPDATE ON public.pricing_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_affiliates_updated_at
  BEFORE UPDATE ON public.affiliates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_referrals_updated_at
  BEFORE UPDATE ON public.referrals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_commission_payments_updated_at
  BEFORE UPDATE ON public.commission_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_withdrawal_requests_updated_at
  BEFORE UPDATE ON public.withdrawal_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default admin config values
INSERT INTO public.admin_configs (config_key, config_value, description) VALUES
  ('paystack_public_key', '', 'Paystack public API key'),
  ('paystack_secret_key', '', 'Paystack secret API key'),
  ('affiliate_commission_rate', '10', 'Default affiliate commission rate (%)'),
  ('minimum_withdrawal', '5000', 'Minimum withdrawal amount'),
  ('cookie_duration_days', '90', 'Referral cookie duration in days');

-- Insert default pricing plans
INSERT INTO public.pricing_plans (name, description, price, features, sort_order) VALUES
  ('Basic', 'Perfect for small schools', 150000, '["Student Management", "Basic Reports", "Email Support"]', 1),
  ('Standard', 'Great for growing schools', 300000, '["Student Management", "Advanced Reports", "Phone Support", "Parent Portal"]', 2),
  ('Premium', 'Complete solution for large schools', 500000, '["All Features", "Priority Support", "Custom Training", "Mobile App"]', 3);

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, role, full_name)
  VALUES (
    NEW.id,
    'school'::user_role,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();