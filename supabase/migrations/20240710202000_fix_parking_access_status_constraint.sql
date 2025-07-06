-- Drop the old constraint and add the new one with all valid statuses
ALTER TABLE parking_access DROP CONSTRAINT IF EXISTS parking_access_status_check;
ALTER TABLE parking_access ADD CONSTRAINT parking_access_status_check 
CHECK (status IN ('active', 'suspended', 'expired', 'pending'));

-- Also update the history table constraint
ALTER TABLE parking_access_history DROP CONSTRAINT IF EXISTS parking_access_history_status_check;
ALTER TABLE parking_access_history ADD CONSTRAINT parking_access_history_status_check 
CHECK (status IN ('active', 'suspended', 'expired', 'pending')); 