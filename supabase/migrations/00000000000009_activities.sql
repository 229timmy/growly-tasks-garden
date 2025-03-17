-- Create activity_type enum
DO $$ BEGIN
    CREATE TYPE activity_type AS ENUM (
        'plant_measurement',
        'plant_photo',
        'task_completed',
        'task_created',
        'grow_updated',
        'plant_updated'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create activities table
CREATE TABLE activities (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    type activity_type NOT NULL,
    title text NOT NULL,
    description text,
    user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    related_grow_id uuid REFERENCES grows ON DELETE CASCADE,
    related_plant_id uuid REFERENCES plants ON DELETE CASCADE,
    related_task_id uuid REFERENCES tasks ON DELETE CASCADE,
    timestamp timestamptz DEFAULT now() NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX activities_user_id_idx ON activities(user_id);
CREATE INDEX activities_timestamp_idx ON activities(timestamp);
CREATE INDEX activities_type_idx ON activities(type);

-- Enable RLS
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own activities"
    ON activities FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activities"
    ON activities FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create function to clean up old activities (keep last 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_activities()
RETURNS void AS $$
BEGIN
    DELETE FROM activities
    WHERE timestamp < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to run cleanup every day
-- Note: This requires pg_cron extension to be enabled
-- SELECT cron.schedule('cleanup-old-activities', '0 0 * * *', 'SELECT cleanup_old_activities();'); 