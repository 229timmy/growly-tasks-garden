-- Create enum for activity type
DO $$ BEGIN
    CREATE TYPE plant_care_activity_type AS ENUM (
        'watering',
        'feeding',
        'top_dressing',
        'other'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Create plant_care_activities table
CREATE TABLE plant_care_activities (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    plant_id uuid REFERENCES plants ON DELETE CASCADE,
    grow_id uuid REFERENCES grows ON DELETE CASCADE NOT NULL,
    activity_type plant_care_activity_type NOT NULL,
    amount decimal(10,2),
    unit text,
    product_name text,
    notes text,
    performed_at timestamptz DEFAULT now() NOT NULL,
    user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX plant_care_activities_plant_id_idx ON plant_care_activities(plant_id);
CREATE INDEX plant_care_activities_grow_id_idx ON plant_care_activities(grow_id);
CREATE INDEX plant_care_activities_activity_type_idx ON plant_care_activities(activity_type);
CREATE INDEX plant_care_activities_performed_at_idx ON plant_care_activities(performed_at);
CREATE INDEX plant_care_activities_user_id_idx ON plant_care_activities(user_id);

-- Enable RLS
ALTER TABLE plant_care_activities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own plant care activities"
    ON plant_care_activities FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own plant care activities"
    ON plant_care_activities FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plant care activities"
    ON plant_care_activities FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own plant care activities"
    ON plant_care_activities FOR DELETE
    USING (auth.uid() = user_id);

-- Create function to update plant's last_watered field
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

-- Create trigger to automatically update plant's last_watered
CREATE TRIGGER update_plant_last_watered_trigger
    AFTER INSERT OR UPDATE ON plant_care_activities
    FOR EACH ROW
    EXECUTE FUNCTION update_plant_last_watered(); 