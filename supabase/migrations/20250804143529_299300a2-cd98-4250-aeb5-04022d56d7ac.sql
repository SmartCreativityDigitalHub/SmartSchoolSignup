-- Create storage bucket for payment evidence files
INSERT INTO storage.buckets (id, name, public) VALUES ('payment-evidence', 'payment-evidence', true);

-- Create policies for payment evidence uploads
CREATE POLICY "Allow public uploads to payment evidence bucket" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'payment-evidence');

CREATE POLICY "Allow public access to payment evidence files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'payment-evidence');

CREATE POLICY "Allow public updates to payment evidence files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'payment-evidence');

CREATE POLICY "Allow public deletes from payment evidence files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'payment-evidence');