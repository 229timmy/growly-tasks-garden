-- Remove status column from plants table
ALTER TABLE plants DROP COLUMN IF EXISTS status;

-- Drop the plant_status enum type if it's no longer needed elsewhere
DO $$ BEGIN
    DROP TYPE IF EXISTS plant_status;
EXCEPTION
    WHEN dependent_objects_still_exist THEN
        NULL;  -- Do nothing if there are dependencies
END $$; 