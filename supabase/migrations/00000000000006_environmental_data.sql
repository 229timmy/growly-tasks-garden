-- Create environmental_data table
CREATE TABLE environmental_data (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    grow_id uuid REFERENCES grows ON DELETE CASCADE NOT NULL,
    temperature decimal(4,1) NOT NULL,
    humidity decimal(4,1) NOT NULL,
    timestamp timestamptz DEFAULT now() NOT NULL,
    user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX environmental_data_grow_id_idx ON environmental_data(grow_id);
CREATE INDEX environmental_data_timestamp_idx ON environmental_data(timestamp);
CREATE INDEX environmental_data_user_id_idx ON environmental_data(user_id);

-- Enable RLS
ALTER TABLE environmental_data ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own environmental data"
    ON environmental_data FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own environmental data"
    ON environmental_data FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create function to clean up old data (keep last 30 days)
CREATE OR REPLACE FUNCTION cleanup_environmental_data()
RETURNS void AS $$
BEGIN
    DELETE FROM environmental_data
    WHERE timestamp < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to run cleanup every day
-- Note: This requires pg_cron extension to be enabled
-- SELECT cron.schedule('cleanup-environmental-data', '0 0 * * *', 'SELECT cleanup_environmental_data();'); 