-- 1. Drop the dependent view
DROP VIEW IF EXISTS parking_access_with_computed_status;

-- 2. Alter the column and update data
ALTER TABLE parking_access ALTER COLUMN status TYPE TEXT;
ALTER TABLE parking_access_history ALTER COLUMN status TYPE TEXT;

UPDATE parking_access SET status = 'suspended' WHERE status = 'revoked';
UPDATE parking_access_history SET status = 'suspended' WHERE status = 'revoked';

-- 3. (Re)add CHECK constraints if needed
-- ALTER TABLE parking_access DROP CONSTRAINT IF EXISTS parking_access_status_check;
-- ALTER TABLE parking_access ADD CONSTRAINT parking_access_status_check CHECK (status IN ('active', 'suspended', 'expired', 'pending'));
-- ALTER TABLE parking_access_history DROP CONSTRAINT IF EXISTS parking_access_history_status_check;
-- ALTER TABLE parking_access_history ADD CONSTRAINT parking_access_history_status_check CHECK (status IN ('active', 'suspended', 'expired', 'pending'));

-- 4. Recreate the view
CREATE OR REPLACE VIEW parking_access_with_computed_status AS
SELECT 
    pa.*,
    get_parking_access_status(pa.valid_from, pa.valid_to, pa.status) as computed_status
FROM parking_access pa; 