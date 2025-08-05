-- Create affiliates table
CREATE TABLE public.affiliates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;

-- Create policies for affiliates
CREATE POLICY "Allow public select on affiliates" 
ON public.affiliates 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can manage affiliates" 
ON public.affiliates 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Add referral_code column back to school_signups
ALTER TABLE public.school_signups 
ADD COLUMN referral_code TEXT;

-- Insert the affiliate record
INSERT INTO public.affiliates (name, email, phone, code) 
VALUES ('Samuel Chinonso', 'ezesamuelchinonso7@gmail.com', '09068691062', 'Smart');

-- Create trigger for affiliates updated_at
CREATE TRIGGER update_affiliates_updated_at
BEFORE UPDATE ON public.affiliates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();