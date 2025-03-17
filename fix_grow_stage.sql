-- Fix the mark_grow_as_harvested function to use 'completed' instead of 'harvested'
CREATE OR REPLACE FUNCTION mark_grow_as_harvested()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE grows
    SET 
        stage = 'completed',
        end_date = NEW.harvest_date
    WHERE id = NEW.grow_id AND stage != 'completed';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql; 