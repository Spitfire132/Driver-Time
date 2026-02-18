-- Add revenue column to shifts table
ALTER TABLE shifts ADD COLUMN revenue numeric DEFAULT 0;

-- Optional: Add audit log triggers if needed, usually just column addition is enough for now.
COMMENT ON COLUMN shifts.revenue IS 'Umsatz in Euro';
