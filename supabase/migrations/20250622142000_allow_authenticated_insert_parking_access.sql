-- Allow all authenticated users to insert into parking_access
CREATE POLICY "Allow authenticated insert" ON parking_access
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated'); 