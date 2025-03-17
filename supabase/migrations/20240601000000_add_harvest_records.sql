-- Create harvest_records table
CREATE TABLE harvest_records (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  grow_id uuid REFERENCES grows ON DELETE CASCADE NOT NULL,
  harvest_date timestamptz NOT NULL,
  total_yield_grams decimal(10,2),
  yield_per_plant decimal(10,2),
  thc_percentage decimal(5,2),
  cbd_percentage decimal(5,2),
  grow_duration_days integer,
  cure_time_days integer,
  bud_density_rating smallint,
  aroma_intensity_rating smallint,
  aroma_profile text[],
  primary_color text,
  secondary_color text,
  trichome_coverage_rating smallint,
  overall_quality_rating smallint,
  flavor_notes text,
  effect_notes text,
  special_characteristics text,
  improvement_notes text,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX harvest_records_grow_id_idx ON harvest_records(grow_id);
CREATE INDEX harvest_records_user_id_idx ON harvest_records(user_id);
CREATE INDEX harvest_records_harvest_date_idx ON harvest_records(harvest_date);

-- Enable RLS
ALTER TABLE harvest_records ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own harvest records"
    ON harvest_records FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own harvest records"
    ON harvest_records FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own harvest records"
    ON harvest_records FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own harvest records"
    ON harvest_records FOR DELETE
    USING (auth.uid() = user_id);

-- Add a trigger to update the updated_at timestamp
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON harvest_records
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- Add a function to mark a grow as harvested when a harvest record is created
CREATE OR REPLACE FUNCTION mark_grow_as_harvested()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE grows
    SET 
        stage = 'harvesting',
        end_date = NEW.harvest_date
    WHERE id = NEW.grow_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically mark a grow as harvested
CREATE TRIGGER mark_grow_as_harvested_trigger
    AFTER INSERT ON harvest_records
    FOR EACH ROW
    EXECUTE FUNCTION mark_grow_as_harvested(); 