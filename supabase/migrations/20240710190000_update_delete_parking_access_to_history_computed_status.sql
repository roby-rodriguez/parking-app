-- Update delete_parking_access_to_history to use computed status
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
  -- Get the parking access record
  SELECT * INTO access_record 
  FROM parking_access 
  WHERE id = p_access_id;

  -- Compute the real status
  computed_status := get_parking_access_status(
    access_record.valid_from,
    access_record.valid_to,
    access_record.status
  );

  -- Only move to history if the record exists and is not pending
  IF access_record.id IS NOT NULL AND computed_status != 'pending' THEN
    INSERT INTO parking_access_history (
      original_id,
      uuid,
      guest_name,
      valid_from,
      valid_to,
      status,
      parking_lot_id,
      deleted_by,
      reason
    ) VALUES (
      access_record.id,
      access_record.uuid,
      access_record.guest_name,
      access_record.valid_from,
      access_record.valid_to,
      computed_status,
      access_record.parking_lot_id,
      p_deleted_by,
      p_reason
    );
    DELETE FROM parking_access WHERE id = p_access_id;
  ELSE
    DELETE FROM parking_access WHERE id = p_access_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 