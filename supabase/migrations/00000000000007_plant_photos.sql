-- Create plant_photos table to track photo metadata
CREATE TABLE plant_photos (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    plant_id uuid REFERENCES plants ON DELETE CASCADE NOT NULL,
    file_name text NOT NULL,
    content_type text NOT NULL,
    size integer NOT NULL,
    url text NOT NULL,
    user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX plant_photos_plant_id_idx ON plant_photos(plant_id);
CREATE INDEX plant_photos_user_id_idx ON plant_photos(user_id);

-- Enable RLS
ALTER TABLE plant_photos ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own plant photos"
    ON plant_photos FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own plant photos"
    ON plant_photos FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own plant photos"
    ON plant_photos FOR DELETE
    USING (auth.uid() = user_id);

-- Add last_photo_url column to plants table
ALTER TABLE plants ADD COLUMN last_photo_url text;

-- Add photo_count column to plants table
ALTER TABLE plants ADD COLUMN photo_count integer DEFAULT 0 NOT NULL; 