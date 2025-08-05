-- Update Paystack public key to live key
INSERT INTO admin_configs (config_key, config_value, description) 
VALUES ('paystack_public_key', 'pk_live_e69e6d58d0349cb9b3d468ed030c2e71e36b682f', 'Paystack live public key')
ON CONFLICT (config_key) 
DO UPDATE SET 
  config_value = EXCLUDED.config_value,
  updated_at = now();