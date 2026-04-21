-- Add is_tenant flag to parking_access for distinguishing long-term tenants from short-term guests
ALTER TABLE parking_access ADD COLUMN is_tenant BOOLEAN NOT NULL DEFAULT false;

-- Add is_tenant flag to parking_access_history for consistency
ALTER TABLE parking_access_history ADD COLUMN is_tenant BOOLEAN NOT NULL DEFAULT false;

-- Update get_parking_info_by_uuid to return is_tenant
DROP FUNCTION IF EXISTS public.get_parking_info_by_uuid(uuid);

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
    parking_lot_address text,
    is_tenant boolean
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
        pl.address,
        pa.is_tenant
    FROM parking_access pa
    JOIN parking_lots pl ON pa.parking_lot_id = pl.id
    JOIN gates g ON pl.gate_id = g.id
    WHERE pa.uuid = p_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.get_parking_info_by_uuid(uuid) TO anon, authenticated;

-- Update delete_parking_access_to_history to carry is_tenant into history
CREATE OR REPLACE FUNCTION delete_parking_access_to_history(
  p_access_id UUID,
  p_reason TEXT DEFAULT 'deleted',
  p_deleted_by UUID DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  access_record parking_access%ROWTYPE;
  computed_status TEXT;
BEGIN
  SELECT * INTO access_record
  FROM parking_access
  WHERE id = p_access_id;

  computed_status := get_parking_access_status(
    access_record.valid_from,
    access_record.valid_to,
    access_record.status
  );

  IF access_record.id IS NOT NULL AND computed_status != 'pending' THEN
    INSERT INTO parking_access_history (
      original_id, uuid, guest_name, valid_from, valid_to,
      status, parking_lot_id, deleted_by, reason, is_tenant
    ) VALUES (
      access_record.id, access_record.uuid, access_record.guest_name,
      access_record.valid_from, access_record.valid_to,
      computed_status, access_record.parking_lot_id,
      p_deleted_by, p_reason, access_record.is_tenant
    );
    DELETE FROM parking_access WHERE id = p_access_id;
  ELSE
    DELETE FROM parking_access WHERE id = p_access_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
