-- Create parking access history table
CREATE TABLE parking_access_history (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	original_id UUID NOT NULL,
	uuid UUID NOT NULL,
	guest_name TEXT,
	valid_from TIMESTAMPTZ NOT NULL,
	valid_to TIMESTAMPTZ NOT NULL,
	status TEXT NOT NULL,
	parking_lot_id BIGINT NOT NULL,
	created_at TIMESTAMPTZ DEFAULT NOW(),
	deleted_at TIMESTAMPTZ DEFAULT NOW(),
	deleted_by UUID REFERENCES auth.users(id),
	reason TEXT DEFAULT 'deleted'
);

-- Create indexes for better performance
CREATE INDEX idx_parking_access_history_guest_name ON parking_access_history(guest_name);
CREATE INDEX idx_parking_access_history_deleted_at ON parking_access_history(deleted_at);
CREATE INDEX idx_parking_access_history_parking_lot_id ON parking_access_history(parking_lot_id);

-- Enable Row Level Security
ALTER TABLE parking_access_history ENABLE ROW LEVEL SECURITY;

-- Create policies for parking_access_history
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

-- Create a function to move parking access to history and delete it
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

-- Grant permissions
GRANT EXECUTE ON FUNCTION delete_parking_access_to_history(UUID, TEXT, UUID) TO authenticated;
GRANT SELECT ON parking_access_history TO authenticated;
