-- Add secret_key to drivers table
ALTER TABLE drivers ADD COLUMN secret_key text DEFAULT gen_random_uuid();

-- Make it unique to be safe
ALTER TABLE drivers ADD CONSTRAINT drivers_secret_key_key UNIQUE (secret_key);

-- Policy update: The specific driver should be able to "view" themselves via secret_key?
-- Actually, the driver page will use a direct query or a function. 
-- Since we are client-side in the driver app, we might need public access or a specific function.
-- But wait, `app/driver/page.tsx` is valid to query if RLS allows.
-- HOWEVER, unauthenticated users (the driver) cannot query `drivers` table by default if RLS is on and only allows `auth.uid() = boss_id`.
-- WE NEED TO OPEN UP ACCESS for the driver page.
-- OPTION 1: Server Action (runs as server, bypasses RLS if configured or uses Service Key - but we are using standard client).
-- OPTION 2: A Postgres Function `get_driver_by_secret(key)` with `SECURITY DEFINER`.
-- OPTION 3: Public read access to `drivers` (bad idea).

-- Let's go with OPTION 2: RPC Function for the magic link.

CREATE OR REPLACE FUNCTION get_driver_by_key(lookup_key text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  driver_record record;
BEGIN
  SELECT id, name, boss_id INTO driver_record FROM drivers WHERE secret_key = lookup_key;
  
  IF FOUND THEN
    RETURN row_to_json(driver_record);
  ELSE
    RETURN null;
  END IF;
END;
$$;

-- We also need to allow the driver to INSERT/UPDATE shifts.
-- Again, they are unauth. RLS blocks them.
-- We need functions for `start_shift` and `stop_shift` using the secret key.

CREATE OR REPLACE FUNCTION start_shift_magic(driver_key text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  d_id uuid;
  d_boss uuid;
  new_shift json;
BEGIN
  SELECT id, boss_id INTO d_id, d_boss FROM drivers WHERE secret_key = driver_key;
  
  IF d_id IS NULL THEN
    RAISE EXCEPTION 'Invalid Key';
  END IF;

  -- Check if already started
  PERFORM 1 FROM shifts WHERE driver_id = d_id AND end_time IS NULL;
  IF FOUND THEN
    RAISE EXCEPTION 'Shift already open';
  END IF;

  INSERT INTO shifts (driver_id, user_id, start_time)
  VALUES (d_id, d_boss, now())
  RETURNING row_to_json(shifts) INTO new_shift;
  
  RETURN new_shift;
END;
$$;

CREATE OR REPLACE FUNCTION stop_shift_magic(driver_key text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  d_id uuid;
  updated_shift json;
BEGIN
  SELECT id INTO d_id FROM drivers WHERE secret_key = driver_key;
  
  IF d_id IS NULL THEN
    RAISE EXCEPTION 'Invalid Key';
  END IF;

  UPDATE shifts
  SET end_time = now()
  WHERE driver_id = d_id AND end_time IS NULL
  RETURNING row_to_json(shifts) INTO updated_shift;
  
  RETURN updated_shift;
END;
$$;

-- And a way to check status
CREATE OR REPLACE FUNCTION get_active_shift_magic(driver_key text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  d_id uuid;
  shift_record json;
BEGIN
  SELECT id INTO d_id FROM drivers WHERE secret_key = driver_key;
  
  IF d_id IS NULL THEN
    RETURN null;
  END IF;

  SELECT row_to_json(s) INTO shift_record FROM shifts s WHERE driver_id = d_id AND end_time IS NULL LIMIT 1;
  
  RETURN shift_record;
END;
$$;
