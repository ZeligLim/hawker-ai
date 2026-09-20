-- Add ai_enabled column to restaurants
ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS ai_enabled BOOLEAN NOT NULL DEFAULT true;

-- Ensure the superadmin is in the platform_roles table
INSERT INTO platform_roles (user_id, role)
SELECT id, 'superadmin'
FROM auth.users
WHERE email = 'zeliglim8@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'superadmin';
