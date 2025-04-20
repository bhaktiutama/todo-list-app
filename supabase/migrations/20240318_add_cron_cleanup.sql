-- Enable pg_cron extension if not exists
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule cleanup_expired_todos() to run every 5 minutes
SELECT cron.schedule(
    'cleanup-expired-todos',    -- job name
    '*/5 * * * *',             -- every 5 minutes
    $$SELECT cleanup_expired_todos();$$ -- SQL command to execute
);

-- Create function to remove the cron job (for rollback)
CREATE OR REPLACE FUNCTION remove_cleanup_cron()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    PERFORM cron.unschedule('cleanup-expired-todos');
END;
$$;

-- Rollback SQL:
-- SELECT remove_cleanup_cron();
-- DROP FUNCTION remove_cleanup_cron(); 