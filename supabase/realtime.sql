
-- Enable REPLICA IDENTITY FULL for tables we want to use with real-time updates
ALTER TABLE vehicles REPLICA IDENTITY FULL;
ALTER TABLE job_cards REPLICA IDENTITY FULL;
ALTER TABLE invoices REPLICA IDENTITY FULL;

-- Add tables to the real-time publication
BEGIN;
  -- Drop the publication if it exists
  DROP PUBLICATION IF EXISTS supabase_realtime;
  
  -- Create a new publication for all tables
  CREATE PUBLICATION supabase_realtime FOR TABLE 
    vehicles, 
    job_cards, 
    invoices, 
    customers;
COMMIT;
