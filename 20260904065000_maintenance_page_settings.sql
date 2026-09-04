-- Add maintenance ETA and status updates settings
-- These extend the existing maintenance_mode and maintenance_message settings

INSERT INTO public.system_settings (setting_key, setting_value)
VALUES
  ('maintenance_eta', ''),
  ('maintenance_status_updates', '')
ON CONFLICT (setting_key) DO NOTHING;
