-- Drop the existing function first
DROP FUNCTION IF EXISTS public.get_parking_info_by_uuid(uuid);

-- Create the function with the current schema
CREATE OR REPLACE FUNCTION public.get_parking_info_by_uuid(p_uuid uuid)
RETURNS TABLE (
    guest_name text,
    valid_from timestamptz,
    valid_to timestamptz,
    status text,
    gate_name text,
    gate_description text,
    parking_lot_name text,
    parking_lot_apartment text,
    parking_lot_address text
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        pa.guest_name,
        pa.valid_from,
        pa.valid_to,
        pa.status,
        g.name,
        g.description,
        pl.name,
        pl.apartment,
        pl.address
    FROM parking_access pa
    JOIN parking_lots pl ON pa.parking_lot_id = pl.id
    JOIN gates g ON pl.gate_id = g.id
    WHERE pa.uuid = p_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_parking_info_by_uuid(uuid) TO anon, authenticated; 