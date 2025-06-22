-- Create parking_access table
CREATE TABLE parking_access (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
	gate_number INTEGER NOT NULL CHECK (gate_number IN (1, 2, 3)),
	guest_name TEXT,
	valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
	valid_to TIMESTAMP WITH TIME ZONE NOT NULL,
	status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired')),
	created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
	created_by UUID REFERENCES auth.users(id)
);

-- Create audit_logs table
CREATE TABLE audit_logs (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	parking_access_id UUID REFERENCES parking_access(id),
	action TEXT NOT NULL,
	gate_number INTEGER,
	ip_address INET,
	user_agent TEXT,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin_users table (for admin authentication)
CREATE TABLE admin_users (
	id UUID PRIMARY KEY REFERENCES auth.users(id),
	role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
	created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_parking_access_uuid ON parking_access(uuid);
CREATE INDEX idx_parking_access_status ON parking_access(status);
CREATE INDEX idx_parking_access_valid_dates ON parking_access(valid_from, valid_to);
CREATE INDEX idx_audit_logs_parking_access_id ON audit_logs(parking_access_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
	NEW.updated_at = NOW();
	RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for parking_access table
CREATE TRIGGER update_parking_access_updated_at
	BEFORE UPDATE ON parking_access
	FOR EACH ROW
	EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE parking_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies for parking_access (public read for UUID validation, admin full access)
CREATE POLICY "Public read access for UUID validation" ON parking_access
	FOR SELECT USING (true);

CREATE POLICY "Admin full access" ON parking_access
	FOR ALL USING (
		EXISTS (
			SELECT 1 FROM admin_users 
			WHERE admin_users.id = auth.uid()
		)
	);

-- Create policies for audit_logs (admin read, insert for all)
CREATE POLICY "Admin read access" ON audit_logs
	FOR SELECT USING (
		EXISTS (
			SELECT 1 FROM admin_users 
			WHERE admin_users.id = auth.uid()
		)
	);

CREATE POLICY "Insert access for all" ON audit_logs
	FOR INSERT WITH CHECK (true);

-- Create policies for admin_users (admin read own, super_admin full access)
CREATE POLICY "Admin read own" ON admin_users
	FOR SELECT USING (id = auth.uid());

CREATE POLICY "Super admin full access" ON admin_users
	FOR ALL USING (
		EXISTS (
			SELECT 1 FROM admin_users 
			WHERE admin_users.id = auth.uid() AND role = 'super_admin'
		)
	);

-- ============================================================================
-- MANUAL STEP REQUIRED AFTER MIGRATION:
-- 1. Go to Supabase Dashboard → Authentication → Users
-- 2. Create a new user with your email and password
-- 3. Copy the user ID from the users list
-- 4. Run this SQL in the SQL Editor:
--    INSERT INTO admin_users (id, role) VALUES ('your-user-id-here', 'admin');
-- ============================================================================
