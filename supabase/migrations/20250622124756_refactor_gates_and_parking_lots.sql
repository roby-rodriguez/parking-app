-- Step 1: Create the new tables for Gates and Parking Lots
CREATE TABLE gates (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name TEXT NOT NULL,
    description TEXT,
    phone_number TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE parking_lots (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    gate_id BIGINT NOT NULL REFERENCES gates(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    apartment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_parking_lot_name_per_gate UNIQUE (gate_id, name)
);

-- Step 2: Alter the existing tables to use the new structure
-- Remove the old gate_number column from parking_access
ALTER TABLE parking_access DROP COLUMN gate_number;
-- Add a new column to link to a specific parking lot
ALTER TABLE parking_access ADD COLUMN parking_lot_id BIGINT REFERENCES parking_lots(id);

-- Remove the old gate_number column from audit_logs
ALTER TABLE audit_logs DROP COLUMN gate_number;
-- Add a new column to link to the gate that was opened
ALTER TABLE audit_logs ADD COLUMN gate_id BIGINT REFERENCES gates(id);


-- Step 3: Seed the new tables with your provided data
-- Seed Gates
INSERT INTO gates (name, description, phone_number) VALUES
('Gate 1', 'Corp A subsol', '+40751752713'),
('Gate 2', 'Corp A demisol', '+40751777263'),
('Gate 3', 'Corp B demisol', '+40751769723');

-- Seed Parking Lots
INSERT INTO parking_lots (gate_id, name, apartment) VALUES
(1, '29', 'ap. 14 - corp A'),
(1, '30', 'ap. 19 - corp A'),
(2, '10', 'ap. 21 - corp A'),
(2, '16', 'ap. 28 - corp B'),
(3, '14', 'ap. 5 - corp B');

-- Step 4: Update RLS policies to reflect schema changes if necessary
-- The policies on parking_access and audit_logs are based on admin_users, so they don't need changes for this refactor.
-- The data access logic will change in the edge function and frontend instead.
