-- Ensure the new superadmin is in the platform_roles table
INSERT INTO platform_roles (user_id, role)
SELECT id, 'superadmin'
FROM auth.users
WHERE email = 'zeliglim@icloud.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'superadmin';
