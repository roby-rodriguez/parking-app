-- Fix the foreign key constraint on audit_logs to use CASCADE DELETE
-- This will allow parking_access records to be deleted even if they have audit logs

-- Drop the existing foreign key constraint
ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_parking_access_id_fkey;

-- Add the foreign key constraint with CASCADE DELETE
ALTER TABLE audit_logs 
ADD CONSTRAINT audit_logs_parking_access_id_fkey 
FOREIGN KEY (parking_access_id) 
REFERENCES parking_access(id) 
ON DELETE CASCADE; 