-- Function to check if parking access dates are valid and don't overlap
CREATE OR REPLACE FUNCTION validate_parking_access_dates(
  p_parking_lot_id BIGINT,
  p_valid_from TIMESTAMPTZ,
  p_valid_to TIMESTAMPTZ,
  p_exclude_id UUID DEFAULT NULL
)
RETURNS TABLE(
  is_valid BOOLEAN,
  error_message TEXT
) AS $$
DECLARE
  overlap_count INTEGER;
  current_date DATE := CURRENT_DATE;
  valid_from_date DATE := p_valid_from::DATE;
BEGIN
  -- Check if valid_from is today or in the future (allow same-day access)
  IF valid_from_date < current_date THEN
    RETURN QUERY SELECT FALSE, 'Start date must be today or in the future';
    RETURN;
  END IF;

  -- Check if valid_to is at least 1 day after valid_from
  IF p_valid_to < p_valid_from + INTERVAL '1 day' THEN
    RETURN QUERY SELECT FALSE, 'End date must be at least 1 day after start date';
    RETURN;
  END IF;

  -- Check for overlapping parking access for the same apartment
  SELECT COUNT(*) INTO overlap_count
  FROM parking_access
  WHERE parking_lot_id = p_parking_lot_id
    AND (
      -- Exclude the current record if updating
      (p_exclude_id IS NULL OR id != p_exclude_id)
    )
    AND (
      -- Check for overlaps: new period overlaps with existing period
      (p_valid_from < valid_to AND p_valid_to > valid_from)
    );

  IF overlap_count > 0 THEN
    RETURN QUERY SELECT FALSE, 'This apartment already has parking access during the selected period';
    RETURN;
  END IF;

  -- All validations passed
  RETURN QUERY SELECT TRUE, '';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION validate_parking_access_dates(BIGINT, TIMESTAMPTZ, TIMESTAMPTZ, UUID) TO authenticated; 