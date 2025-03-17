-- Check the current enum values for grow_stage
SELECT enum_range(NULL::grow_stage);

-- Check if the mark_grow_as_harvested function exists
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'mark_grow_as_harvested';

-- Fix the mark_grow_as_harvested function to use 'harvesting' instead of 'completed'
CREATE OR REPLACE FUNCTION mark_grow_as_harvested()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the grow stage to 'harvesting' which should be a valid enum value
    UPDATE grows
    SET 
        stage = 'harvesting',
        end_date = NEW.harvest_date
    WHERE id = NEW.grow_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql; 