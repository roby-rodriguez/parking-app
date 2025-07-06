-- Update the function to handle suspended status (revoked no longer exists)
CREATE OR REPLACE FUNCTION get_parking_access_status(
    p_valid_from TIMESTAMPTZ,
    p_valid_to TIMESTAMPTZ,
    p_status TEXT
)
RETURNS TEXT AS $$
BEGIN
    -- If manually suspended, keep that status
    IF p_status = 'suspended' THEN
        RETURN 'suspended';
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

-- Recreate the view with the updated function
CREATE OR REPLACE VIEW parking_access_with_computed_status AS
SELECT 
    pa.*,
    get_parking_access_status(pa.valid_from, pa.valid_to, pa.status) as computed_status
FROM parking_access pa;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_parking_access_status(TIMESTAMPTZ, TIMESTAMPTZ, TEXT) TO authenticated;
GRANT SELECT ON parking_access_with_computed_status TO authenticated; 