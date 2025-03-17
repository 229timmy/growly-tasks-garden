-- Drop the existing name constraint
ALTER TABLE plants DROP CONSTRAINT IF EXISTS name_length;

-- Make name column nullable
ALTER TABLE plants ALTER COLUMN name DROP NOT NULL;

-- Create a function to generate a default plant name
CREATE OR REPLACE FUNCTION generate_plant_name()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.name IS NULL THEN
        -- Generate a name using 'Plant' prefix and a timestamp
        NEW.name := 'Plant ' || extract(epoch from now())::bigint::text;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to auto-generate plant names
DROP TRIGGER IF EXISTS ensure_plant_name_trigger ON plants;
CREATE TRIGGER ensure_plant_name_trigger
    BEFORE INSERT ON plants
    FOR EACH ROW
    EXECUTE FUNCTION generate_plant_name(); 