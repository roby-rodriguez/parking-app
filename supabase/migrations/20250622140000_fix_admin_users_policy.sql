-- Migration to fix infinite recursion in admin_users RLS policy
DROP POLICY IF EXISTS "Super admin full access" ON admin_users;

-- Optionally, you can add more granular policies here if needed.
-- For now, only the 'Admin read own' policy remains, which is safe. 