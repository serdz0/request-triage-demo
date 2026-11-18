-- Let the server (secret key = "service_role") use the two tables and the function.
-- Newer Supabase projects no longer grant this automatically.
grant usage on schema public to service_role;
grant all on table requests, decisions to service_role;
grant execute on function record_decision(uuid, text, text) to service_role;
