-- Create table for school signups
CREATE TABLE public.school_signups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_name TEXT NOT NULL,
  admin_name TEXT NOT NULL,
  email TEXT NOT NULL,
  mobile_no TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  address TEXT,
  referral_code TEXT,
  employee_name TEXT NOT NULL,
  employee_gender TEXT,
  employee_religion TEXT,
  employee_blood_group TEXT,
  employee_dob DATE,
  employee_mobile TEXT NOT NULL,
  employee_email TEXT NOT NULL,
  employee_address TEXT NOT NULL,
  student_count INTEGER NOT NULL,
  selected_plan TEXT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_type TEXT NOT NULL,
  payment_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for payment evidence (for offline payments)
CREATE TABLE public.payment_evidence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  signup_id UUID REFERENCES public.school_signups(id),
  school_name TEXT NOT NULL,
  school_phone TEXT NOT NULL,
  email TEXT NOT NULL,
  payment_date DATE NOT NULL,
  payment_ref TEXT NOT NULL,
  amount_paid DECIMAL(10,2) NOT NULL,
  evidence_file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.school_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_evidence ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no authentication required)
CREATE POLICY "Allow public insert on school_signups" 
ON public.school_signups 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public select on school_signups" 
ON public.school_signups 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert on payment_evidence" 
ON public.payment_evidence 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public select on payment_evidence" 
ON public.payment_evidence 
FOR SELECT 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_school_signups_updated_at
  BEFORE UPDATE ON public.school_signups
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();