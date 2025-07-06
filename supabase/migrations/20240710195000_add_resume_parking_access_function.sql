-- Function to resume a suspended parking access
CREATE OR REPLACE FUNCTION resume_parking_access(
  p_access_id UUID
)
RETURNS void AS $$
DECLARE
  access_record parking_access%ROWTYPE;
  new_status TEXT;
BEGIN
  SELECT * INTO access_record FROM parking_access WHERE id = p_access_id;

  IF access_record.id IS NULL THEN
    RAISE EXCEPTION 'Parking access not found';
  END IF;

  IF access_record.status != 'suspended' THEN
    RAISE EXCEPTION 'Only suspended accesses can be resumed';
  END IF;

  -- Compute new status
  IF NOW() < access_record.valid_from THEN
    new_status := 'pending';
  ELSIF NOW() > access_record.valid_to THEN
    new_status := 'expired';
  ELSE
    new_status := 'active';
  END IF;

  UPDATE parking_access
  SET status = new_status
  WHERE id = p_access_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 