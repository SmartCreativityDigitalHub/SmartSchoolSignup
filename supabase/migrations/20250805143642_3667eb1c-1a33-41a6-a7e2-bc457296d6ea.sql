-- Create discount_codes table for managing discount codes
CREATE TABLE public.discount_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code_title TEXT NOT NULL,
  code_number TEXT NOT NULL UNIQUE,
  code_type TEXT NOT NULL CHECK (code_type IN ('percentage', 'flat')),
  percentage NUMERIC CHECK (percentage >= 0 AND percentage <= 100),
  flat_amount NUMERIC CHECK (flat_amount >= 0),
  expiration_date DATE NOT NULL,
  usage_count_per_email INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;

-- Create policies for discount codes (admins can manage, public can view active codes)
CREATE POLICY "Allow public select on active discount_codes" 
ON public.discount_codes 
FOR SELECT 
USING (is_active = true AND expiration_date >= CURRENT_DATE);

CREATE POLICY "Only admins can manage discount_codes" 
ON public.discount_codes 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Create discount_code_usage table to track usage
CREATE TABLE public.discount_code_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  discount_code_id UUID NOT NULL REFERENCES public.discount_codes(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(discount_code_id, email)
);

-- Enable Row Level Security
ALTER TABLE public.discount_code_usage ENABLE ROW LEVEL SECURITY;

-- Create policies for discount code usage
CREATE POLICY "Allow public insert on discount_code_usage" 
ON public.discount_code_usage 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Only admins can view discount_code_usage" 
ON public.discount_code_usage 
FOR SELECT 
USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Create renewals table for tracking subscription renewals
CREATE TABLE public.renewals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_count INTEGER NOT NULL,
  school_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  email TEXT NOT NULL,
  selected_plan TEXT NOT NULL,
  base_amount NUMERIC NOT NULL,
  discount_code_id UUID REFERENCES public.discount_codes(id),
  discount_amount NUMERIC DEFAULT 0,
  total_amount NUMERIC NOT NULL,
  payment_status TEXT DEFAULT 'pending',
  payment_reference TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.renewals ENABLE ROW LEVEL SECURITY;

-- Create policies for renewals
CREATE POLICY "Allow public insert on renewals" 
ON public.renewals 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public select on renewals" 
ON public.renewals 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can manage renewals" 
ON public.renewals 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Add triggers for automatic timestamp updates
CREATE TRIGGER update_discount_codes_updated_at
BEFORE UPDATE ON public.discount_codes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_renewals_updated_at
BEFORE UPDATE ON public.renewals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert test discount codes
INSERT INTO public.discount_codes (code_title, code_number, code_type, percentage, flat_amount, expiration_date, usage_count_per_email)
VALUES 
  ('SmartPercentage', 'TestPer', 'percentage', 20, NULL, '2025-08-31', 3),
  ('SmartFlat', 'TestFlat', 'flat', NULL, 20000, '2025-08-31', 3);