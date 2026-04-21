-- Recreate the view so it picks up the new is_tenant column
-- (PostgreSQL expands * at view creation time, not at query time)
DROP VIEW IF EXISTS parking_access_with_computed_status;

CREATE VIEW parking_access_with_computed_status
WITH (security_invoker = on) AS
SELECT
    pa.*,
    get_parking_access_status(pa.valid_from, pa.valid_to, pa.status) as computed_status
FROM parking_access pa;

GRANT SELECT ON parking_access_with_computed_status TO authenticated;
REVOKE SELECT ON parking_access_with_computed_status FROM anon;
