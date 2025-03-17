-- Create plant_measurements table
CREATE TABLE plant_measurements (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    plant_id uuid REFERENCES plants ON DELETE CASCADE NOT NULL,
    height decimal(5,1), -- in centimeters
    notes text,
    water_amount decimal(5,1), -- in milliliters
    nutrients_amount decimal(5,1), -- in milliliters
    nutrients_type text[],
    ph_level decimal(3,1),
    measured_at timestamptz DEFAULT now() NOT NULL,
    user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX plant_measurements_plant_id_idx ON plant_measurements(plant_id);
CREATE INDEX plant_measurements_measured_at_idx ON plant_measurements(measured_at);
CREATE INDEX plant_measurements_user_id_idx ON plant_measurements(user_id);

-- Enable RLS
ALTER TABLE plant_measurements ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own plant measurements"
    ON plant_measurements FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own plant measurements"
    ON plant_measurements FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plant measurements"
    ON plant_measurements FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own plant measurements"
    ON plant_measurements FOR DELETE
    USING (auth.uid() = user_id);

-- Create function to update plant's latest height
CREATE OR REPLACE FUNCTION update_plant_height()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.height IS NOT NULL THEN
        UPDATE plants
        SET height = NEW.height
        WHERE id = NEW.plant_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update plant height
CREATE TRIGGER update_plant_height_trigger
    AFTER INSERT OR UPDATE ON plant_measurements
    FOR EACH ROW
    EXECUTE FUNCTION update_plant_height(); 