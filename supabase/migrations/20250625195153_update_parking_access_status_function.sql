-- Update the function name and add enhanced status management
-- Drop the old function first
DROP FUNCTION IF EXISTS update_expired_parking_access();

-- Create the new comprehensive function
CREATE OR REPLACE FUNCTION update_parking_access_status()
RETURNS void AS $$
BEGIN
    -- Update expired records (past valid_to date)
    UPDATE parking_access 
    SET status = 'expired', updated_at = NOW()
    WHERE status = 'active' 
    AND valid_to < NOW();
    
    -- Update pending records (before valid_from date)
    UPDATE parking_access 
    SET status = 'pending', updated_at = NOW()
    WHERE status = 'active' 
    AND valid_from > NOW();
    
    -- Update active records (within valid date range)
    UPDATE parking_access 
    SET status = 'active', updated_at = NOW()
    WHERE status IN ('pending', 'expired')
    AND valid_from <= NOW() 
    AND valid_to >= NOW();
END;
$$ LANGUAGE plpgsql;

-- Create an index for status transitions
CREATE INDEX IF NOT EXISTS idx_parking_access_status_transitions 
ON parking_access(status, valid_from, valid_to) 
WHERE status IN ('pending', 'expired');

-- Grant permissions for the new function
GRANT EXECUTE ON FUNCTION update_parking_access_status() TO authenticated;
