-- Insert the API keys provided by the user
INSERT INTO admin_configs (config_key, config_value, description) VALUES
('paystack_public_key', 'pk_test_16091195a4956e31baa2421aa2dc42f1b51d7067', 'Paystack Public Key for frontend integration'),
('paystack_secret_key', 'sk_test_2dd9ae06728eaf04e39cd5975dfcfc6c4de28a97', 'Paystack Secret Key for backend integration'),
('smtp_host', 'business62.web-hosting.com', 'SMTP server host'),
('smtp_port', '465', 'SMTP server port'),
('smtp_user', 'signup@smartschool.sch.ng', 'SMTP username'),
('smtp_password', '&ul7J76NjhLn', 'SMTP password'),
('smtp_from_email', 'signup@smartschool.sch.ng', 'From email address for SMTP')
ON CONFLICT (config_key) DO UPDATE SET 
config_value = EXCLUDED.config_value,
description = EXCLUDED.description,
updated_at = now();