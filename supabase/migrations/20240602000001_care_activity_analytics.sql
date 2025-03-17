-- Add analytics fields to plant_care_activities table
ALTER TABLE plant_care_activities
ADD COLUMN IF NOT EXISTS days_since_last_watering INTEGER,
ADD COLUMN IF NOT EXISTS days_since_last_feeding INTEGER,
ADD COLUMN IF NOT EXISTS moisture_level INTEGER,
ADD COLUMN IF NOT EXISTS nutrient_level INTEGER,
ADD COLUMN IF NOT EXISTS health_score INTEGER,
ADD COLUMN IF NOT EXISTS growth_rate DECIMAL;

-- Create function to calculate days since last activity
CREATE OR REPLACE FUNCTION calculate_days_since_last_activity()
RETURNS TRIGGER AS $$
DECLARE
    last_watering_date TIMESTAMP;
    last_feeding_date TIMESTAMP;
BEGIN
    -- Get last watering date for this plant
    SELECT performed_at INTO last_watering_date
    FROM plant_care_activities
    WHERE plant_id = NEW.plant_id
    AND activity_type = 'watering'
    AND performed_at < NEW.performed_at
    ORDER BY performed_at DESC
    LIMIT 1;

    -- Get last feeding date for this plant
    SELECT performed_at INTO last_feeding_date
    FROM plant_care_activities
    WHERE plant_id = NEW.plant_id
    AND activity_type = 'feeding'
    AND performed_at < NEW.performed_at
    ORDER BY performed_at DESC
    LIMIT 1;

    -- Calculate days since last activities
    IF NEW.activity_type = 'watering' AND last_watering_date IS NOT NULL THEN
        NEW.days_since_last_watering = EXTRACT(DAY FROM (NEW.performed_at - last_watering_date));
    END IF;

    IF NEW.activity_type = 'feeding' AND last_feeding_date IS NOT NULL THEN
        NEW.days_since_last_feeding = EXTRACT(DAY FROM (NEW.performed_at - last_feeding_date));
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for calculating days since last activity
DROP TRIGGER IF EXISTS calculate_days_since_last_activity_trigger ON plant_care_activities;
CREATE TRIGGER calculate_days_since_last_activity_trigger
    BEFORE INSERT ON plant_care_activities
    FOR EACH ROW
    EXECUTE FUNCTION calculate_days_since_last_activity();

-- Create function to update growth rate and health score
CREATE OR REPLACE FUNCTION update_plant_stats()
RETURNS TRIGGER AS $$
DECLARE
    last_measurement RECORD;
    days_diff INTEGER;
BEGIN
    -- Get the last measurement for this plant
    SELECT * INTO last_measurement
    FROM plant_measurements
    WHERE plant_id = NEW.plant_id
    AND measured_at < NEW.performed_at
    ORDER BY measured_at DESC
    LIMIT 1;

    IF last_measurement IS NOT NULL THEN
        -- Calculate days between measurements
        days_diff = EXTRACT(DAY FROM (NEW.performed_at - last_measurement.measured_at));
        
        -- Update growth rate if days_diff > 0
        IF days_diff > 0 THEN
            NEW.growth_rate = (last_measurement.height - last_measurement.previous_height) / days_diff;
        END IF;

        -- Copy health score from last measurement
        NEW.health_score = last_measurement.health_score;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating plant stats
DROP TRIGGER IF EXISTS update_plant_stats_trigger ON plant_care_activities;
CREATE TRIGGER update_plant_stats_trigger
    BEFORE INSERT ON plant_care_activities
    FOR EACH ROW
    EXECUTE FUNCTION update_plant_stats();

-- Create indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_plant_care_activities_activity_type ON plant_care_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_plant_care_activities_performed_at ON plant_care_activities(performed_at);
CREATE INDEX IF NOT EXISTS idx_plant_care_activities_plant_id_activity_type ON plant_care_activities(plant_id, activity_type);
CREATE INDEX IF NOT EXISTS idx_plant_care_activities_effectiveness ON plant_care_activities(growth_rate, health_score); 