-- Add analytics-specific columns to plant_measurements
ALTER TABLE plant_measurements
ADD COLUMN IF NOT EXISTS health_score smallint CHECK (health_score >= 0 AND health_score <= 5),
ADD COLUMN IF NOT EXISTS leaf_count integer,
ADD COLUMN IF NOT EXISTS growth_rate decimal(5,2);

-- Add analytics-specific columns to environmental_data
ALTER TABLE environmental_data
ADD COLUMN IF NOT EXISTS light_intensity decimal(10,2),
ADD COLUMN IF NOT EXISTS co2_level decimal(10,2),
ADD COLUMN IF NOT EXISTS vpd decimal(5,2);

-- Add analytics-specific columns to harvest_records
ALTER TABLE harvest_records
ADD COLUMN IF NOT EXISTS efficiency_score decimal(5,2),
ADD COLUMN IF NOT EXISTS resource_usage jsonb,
ADD COLUMN IF NOT EXISTS environmental_factors jsonb;

-- Create indexes for analytics queries
CREATE INDEX IF NOT EXISTS plant_measurements_health_score_idx ON plant_measurements(health_score);
CREATE INDEX IF NOT EXISTS harvest_records_efficiency_score_idx ON harvest_records(efficiency_score);

-- Update the growth rate calculation function
CREATE OR REPLACE FUNCTION calculate_growth_rate()
RETURNS TRIGGER AS $$
DECLARE
    prev_measurement RECORD;
    days_diff decimal;
BEGIN
    -- Get the previous measurement for this plant
    SELECT * INTO prev_measurement
    FROM plant_measurements
    WHERE plant_id = NEW.plant_id
    AND measured_at < NEW.measured_at
    ORDER BY measured_at DESC
    LIMIT 1;

    -- Calculate growth rate if we have a previous measurement
    IF prev_measurement.id IS NOT NULL AND NEW.height IS NOT NULL AND prev_measurement.height IS NOT NULL THEN
        days_diff := EXTRACT(EPOCH FROM (NEW.measured_at - prev_measurement.measured_at)) / 86400;
        IF days_diff > 0 THEN
            NEW.growth_rate := (NEW.height - prev_measurement.height) / days_diff;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for growth rate calculation
DROP TRIGGER IF EXISTS calculate_growth_rate_trigger ON plant_measurements;
CREATE TRIGGER calculate_growth_rate_trigger
    BEFORE INSERT OR UPDATE ON plant_measurements
    FOR EACH ROW
    EXECUTE FUNCTION calculate_growth_rate(); 