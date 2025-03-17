-- First, rename the strain column to strains and make it an array
ALTER TABLE grows 
    DROP COLUMN IF EXISTS strain,
    ADD COLUMN strains text[] DEFAULT ARRAY[]::text[];

-- Add a check constraint to ensure strains array is not empty
ALTER TABLE grows 
    ADD CONSTRAINT grows_strains_not_empty 
    CHECK (array_length(strains, 1) > 0);

-- Add an index for faster array operations
CREATE INDEX grows_strains_gin_idx ON grows USING gin(strains);

-- Create a function to validate plant strain
CREATE OR REPLACE FUNCTION validate_plant_strain()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.strain IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM grows 
            WHERE id = NEW.grow_id 
            AND NEW.strain = ANY(strains)
        ) THEN
            RAISE EXCEPTION 'Plant strain must be one of the strains in the associated grow';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to validate plant strain before insert or update
DROP TRIGGER IF EXISTS validate_plant_strain_trigger ON plants;
CREATE TRIGGER validate_plant_strain_trigger
    BEFORE INSERT OR UPDATE ON plants
    FOR EACH ROW
    EXECUTE FUNCTION validate_plant_strain(); 