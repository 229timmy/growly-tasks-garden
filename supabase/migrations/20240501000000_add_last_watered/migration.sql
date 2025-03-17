-- Add last_watered column to plants table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'plants'
        AND column_name = 'last_watered'
    ) THEN
        ALTER TABLE plants ADD COLUMN last_watered timestamptz;
    END IF;
END $$;

-- Update the update_plant_last_watered function to handle null plant_id
CREATE OR REPLACE FUNCTION update_plant_last_watered()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.activity_type = 'watering' AND NEW.plant_id IS NOT NULL THEN
        UPDATE plants
        SET last_watered = NEW.performed_at
        WHERE id = NEW.plant_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Make sure the trigger exists
DROP TRIGGER IF EXISTS update_plant_last_watered_trigger ON plant_care_activities;
CREATE TRIGGER update_plant_last_watered_trigger
    AFTER INSERT OR UPDATE ON plant_care_activities
    FOR EACH ROW
    EXECUTE FUNCTION update_plant_last_watered(); 