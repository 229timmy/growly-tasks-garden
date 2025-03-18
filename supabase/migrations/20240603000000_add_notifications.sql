-- Check if notifications table exists and create if it doesn't
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'notifications'
    ) THEN
        -- Create notifications table
        CREATE TABLE notifications (
            id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
            user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
            type text NOT NULL,
            title text NOT NULL,
            message text NOT NULL,
            link text,
            read boolean DEFAULT false,
            created_at timestamptz DEFAULT now() NOT NULL,
            expires_at timestamptz,
            metadata jsonb DEFAULT '{}'::jsonb,
            priority text DEFAULT 'normal'
        );

        -- Create indexes for better query performance
        CREATE INDEX notifications_user_id_idx ON notifications(user_id);
        CREATE INDEX notifications_created_at_idx ON notifications(created_at);
        CREATE INDEX notifications_read_idx ON notifications(read);
        CREATE INDEX notifications_type_idx ON notifications(type);

        -- Enable RLS
        ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Drop existing policies if they exist and recreate them
DO $$
BEGIN
    -- Drop existing policies
    DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
    DROP POLICY IF EXISTS "Users can insert own notifications" ON notifications;
    DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
    DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
    DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;
    
    -- Create RLS policies
    CREATE POLICY "Users can view own notifications"
        ON notifications FOR SELECT
        USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert own notifications"
        ON notifications FOR INSERT
        WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "System can insert notifications"
        ON notifications FOR INSERT
        WITH CHECK (auth.uid() IN (
            SELECT id FROM auth.users WHERE email LIKE '%@system'
        ));

    CREATE POLICY "Users can update own notifications"
        ON notifications FOR UPDATE
        USING (auth.uid() = user_id);

    CREATE POLICY "Users can delete own notifications"
        ON notifications FOR DELETE
        USING (auth.uid() = user_id);
END $$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT SELECT ON auth.users TO authenticated;

-- Create or replace function to clean up old notifications
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void AS $$
BEGIN
    -- Delete read notifications older than 30 days
    DELETE FROM notifications
    WHERE read = true
    AND created_at < NOW() - INTERVAL '30 days';
    
    -- Delete expired notifications
    DELETE FROM notifications
    WHERE expires_at IS NOT NULL
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create or replace function to run cleanup periodically
CREATE OR REPLACE FUNCTION schedule_notification_cleanup()
RETURNS void AS $$
BEGIN
    -- Try to create pg_cron extension if it doesn't exist
    CREATE EXTENSION IF NOT EXISTS pg_cron;
    
    -- Schedule the cleanup job if pg_cron is available
    PERFORM cron.schedule(
        'cleanup-old-notifications',
        '0 0 * * *', -- Run at midnight every day
        'SELECT cleanup_old_notifications();'
    );
EXCEPTION
    WHEN OTHERS THEN
        -- If pg_cron is not available, log a notice
        RAISE NOTICE 'Could not schedule automatic cleanup. Please run cleanup_old_notifications() manually.';
END;
$$ LANGUAGE plpgsql; 