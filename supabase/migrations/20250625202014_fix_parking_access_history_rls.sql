-- Drop existing policies
DROP POLICY IF EXISTS "Admin read access to history" ON parking_access_history;

-- Create proper policies for parking_access_history
CREATE POLICY "Admin read access to history" ON parking_access_history
	FOR SELECT USING (
		EXISTS (
			SELECT 1 FROM admin_users 
			WHERE admin_users.id = auth.uid()
		)
	);

-- Allow insert for the function (bypass RLS)
CREATE POLICY "Allow insert for function" ON parking_access_history
	FOR INSERT WITH CHECK (true);

-- Update the function to use SECURITY DEFINER
CREATE OR REPLACE FUNCTION delete_parking_access_to_history(
	p_access_id UUID,
	p_reason TEXT DEFAULT 'deleted',
	p_deleted_by UUID DEFAULT NULL
)
RETURNS void AS $$
DECLARE
	access_record parking_access%ROWTYPE;
BEGIN
	-- Get the parking access record
	SELECT * INTO access_record 
	FROM parking_access 
	WHERE id = p_access_id;
	
	-- Only move to history if the record exists and is not pending
	IF access_record.id IS NOT NULL AND access_record.status != 'pending' THEN
		-- Insert into history (bypass RLS for this operation)
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
			access_record.status,
			access_record.parking_lot_id,
			p_deleted_by,
			p_reason
		);
		
		-- Delete from parking_access
		DELETE FROM parking_access WHERE id = p_access_id;
	ELSE
		-- If pending or doesn't exist, just delete without moving to history
		DELETE FROM parking_access WHERE id = p_access_id;
	END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
