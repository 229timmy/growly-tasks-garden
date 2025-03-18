-- Create contact_messages table
CREATE TABLE IF NOT EXISTS contact_messages (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    user_email text NOT NULL,
    subject text NOT NULL,
    message text NOT NULL,
    priority text NOT NULL,
    status text NOT NULL DEFAULT 'new',
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS contact_messages_user_id_idx ON contact_messages(user_id);
CREATE INDEX IF NOT EXISTS contact_messages_status_idx ON contact_messages(status);
CREATE INDEX IF NOT EXISTS contact_messages_priority_idx ON contact_messages(priority);
CREATE INDEX IF NOT EXISTS contact_messages_created_at_idx ON contact_messages(created_at);

-- Enable RLS
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can insert own contact messages"
    ON contact_messages FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own contact messages"
    ON contact_messages FOR SELECT
    USING (auth.uid() = user_id);

-- Create function to send email notification
CREATE OR REPLACE FUNCTION notify_admin_of_contact_message()
RETURNS TRIGGER AS $$
BEGIN
    -- This is a placeholder for the email notification
    -- You'll need to set up your email service (e.g., using pg_notify or a webhook)
    -- For now, we'll just return the NEW record
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for email notification
CREATE TRIGGER contact_message_notification_trigger
    AFTER INSERT ON contact_messages
    FOR EACH ROW
    EXECUTE FUNCTION notify_admin_of_contact_message(); 