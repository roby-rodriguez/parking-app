-- Function to automatically update expired parking access records
CREATE OR REPLACE FUNCTION update_expired_parking_access()
RETURNS void AS $$
BEGIN
    UPDATE parking_access 
    SET status = 'expired', updated_at = NOW()
    WHERE status = 'active' 
    AND valid_to < NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to get computed status (for real-time accuracy)
CREATE OR REPLACE FUNCTION get_parking_access_status(
    p_valid_from TIMESTAMPTZ,
    p_valid_to TIMESTAMPTZ,
    p_status TEXT
)
RETURNS TEXT AS $$
BEGIN
    -- If manually revoked, keep that status
    IF p_status = 'revoked' THEN
        RETURN 'revoked';
    END IF;
    
    -- Check if expired
    IF NOW() > p_valid_to THEN
        RETURN 'expired';
    END IF;
    
    -- Check if not yet valid
    IF NOW() < p_valid_from THEN
        RETURN 'pending';
    END IF;
    
    -- Must be active
    RETURN 'active';
END;
$$ LANGUAGE plpgsql;

-- Create a view that includes computed status
CREATE OR REPLACE VIEW parking_access_with_computed_status AS
SELECT 
    pa.*,
    get_parking_access_status(pa.valid_from, pa.valid_to, pa.status) as computed_status
FROM parking_access pa;

-- Create an index to improve performance of status updates
CREATE INDEX IF NOT EXISTS idx_parking_access_status_valid_to 
ON parking_access(status, valid_to) 
WHERE status = 'active';

-- Create an index for pending status updates
CREATE INDEX IF NOT EXISTS idx_parking_access_status_valid_from 
ON parking_access(status, valid_from) 
WHERE status = 'active';

-- Grant permissions
GRANT EXECUTE ON FUNCTION update_expired_parking_access() TO authenticated;
GRANT EXECUTE ON FUNCTION get_parking_access_status(TIMESTAMPTZ, TIMESTAMPTZ, TEXT) TO authenticated;
GRANT SELECT ON parking_access_with_computed_status TO authenticated; 