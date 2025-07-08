-- Fix security issue with parking_access_with_computed_status view
-- The view was returning all records before authentication, which is a major security breach

-- Drop the existing view
DROP VIEW IF EXISTS parking_access_with_computed_status;

-- Recreate the view with security_invoker = on to enforce RLS policies
CREATE VIEW parking_access_with_computed_status
WITH (security_invoker = on) AS
SELECT
    pa.*,
    get_parking_access_status(pa.valid_from, pa.valid_to, pa.status) as computed_status
FROM parking_access pa;

-- Grant permissions (only to authenticated users, not anon)
GRANT SELECT ON parking_access_with_computed_status TO authenticated;

-- Revoke any existing permissions from anon (if any)
REVOKE SELECT ON parking_access_with_computed_status FROM anon;
