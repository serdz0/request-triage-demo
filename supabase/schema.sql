-- Request Triage: database setup.
-- Run this whole file once in Supabase: SQL Editor > New query > paste > Run.
-- Safe to re-run: it drops and recreates the two tables (sample data only).

drop function if exists record_decision(uuid, text, text);
drop function if exists take_ai_call(int);
drop table if exists ai_usage;
drop table if exists decisions;
drop table if exists requests;

-- A request someone submitted. "status" is "new" until a decision is recorded.
create table requests (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 120),
  description text not null check (char_length(description) <= 600),
  requester text not null check (char_length(requester) between 1 and 60),
  team text not null check (char_length(team) <= 60),
  status text not null default 'new' check (status in ('new', 'build', 'defer', 'kill')),
  created_at timestamptz not null default now()
);

-- One row per decision. Linked to its request, so the log keeps the history
-- even if a request is decided again later.
create table decisions (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references requests (id) on delete cascade,
  decision text not null check (decision in ('build', 'defer', 'kill')),
  reason text not null check (char_length(reason) between 1 and 300),
  decided_at timestamptz not null default now()
);

create index decisions_request_id_idx on decisions (request_id);

-- Lock both tables: only the server (with the secret key) can read or write.
-- No policies on purpose, so the public "anon" key can do nothing.
alter table requests enable row level security;
alter table decisions enable row level security;

-- Record a decision and update the request's status in one step, so the two
-- tables can never disagree.
create function record_decision(p_request_id uuid, p_decision text, p_reason text)
returns decisions
language plpgsql
security invoker
set search_path = public
as $$
declare
  entry decisions;
begin
  update requests set status = p_decision where id = p_request_id;
  if not found then
    return null;
  end if;
  insert into decisions (request_id, decision, reason)
  values (p_request_id, p_decision, p_reason)
  returning * into entry;
  return entry;
end;
$$;

revoke all on function record_decision(uuid, text, text) from public, anon, authenticated;

-- Let the server (secret key = "service_role") use the two tables and the function.
-- Newer Supabase projects no longer grant this automatically.
grant usage on schema public to service_role;
grant all on table requests, decisions to service_role;
grant execute on function record_decision(uuid, text, text) to service_role;

-- AI suggestion daily cap.
create table ai_usage (
  day date primary key,
  calls int not null default 0
);

alter table ai_usage enable row level security;

-- Counts one AI call for today and says whether it is still within the limit.
-- One atomic statement, so two people clicking at once cannot slip past the cap.
create function take_ai_call(p_limit int)
returns boolean
language plpgsql
set search_path = public
as $$
declare
  c int;
begin
  insert into ai_usage (day, calls) values (current_date, 1)
  on conflict (day) do update set calls = ai_usage.calls + 1
    where ai_usage.calls < p_limit
  returning calls into c;
  return c is not null;
end;
$$;

revoke all on function take_ai_call(int) from public, anon, authenticated;
grant all on table ai_usage to service_role;
grant execute on function take_ai_call(int) to service_role;

-- Sample data (fake names only).
insert into requests (id, title, description, requester, team, status, created_at) values
  ('00000000-0000-4000-8000-000000000001', 'Export the weekly usage report to PDF', 'Team leads want to attach the weekly usage report to their Monday meeting notes without copying numbers by hand.', 'Alex Novak', 'Operations', 'build', '2026-11-02T09:00:00Z'),
  ('00000000-0000-4000-8000-000000000002', 'Custom colour theme per customer', 'One customer asked for their brand colours across the whole platform. Nobody else has asked so far.', 'Sam Weber', 'Sales', 'kill', '2026-11-03T10:30:00Z'),
  ('00000000-0000-4000-8000-000000000003', 'Bulk-edit asset tags', 'Editors spend hours fixing tags one by one after each campaign. They want to select many items and change tags at once.', 'Mia Dubois', 'Content', 'new', '2026-11-09T14:15:00Z'),
  ('00000000-0000-4000-8000-000000000004', 'Slack alert when a sync fails', 'The nightly sync fails now and then and nobody notices until the next morning. Support wants a message in their channel.', 'Jan Horak', 'Support', 'new', '2026-11-10T08:45:00Z'),
  ('00000000-0000-4000-8000-000000000005', 'Dark mode for the dashboard', 'Several colleagues work late and find the dashboard too bright. No data on how many would use it.', 'Lena Fischer', 'Marketing', 'defer', '2026-11-04T16:00:00Z'),
  ('00000000-0000-4000-8000-000000000006', 'Single sign-on for partner accounts', 'External partners keep forgetting their passwords. IT says a login through their own company account would cut support tickets.', 'Omar Haddad', 'IT', 'new', '2026-11-11T11:20:00Z');

insert into decisions (request_id, decision, reason, decided_at) values
  ('00000000-0000-4000-8000-000000000001', 'build', 'Clear pain for many team leads and a small, well-understood change.', '2026-11-05T09:00:00Z'),
  ('00000000-0000-4000-8000-000000000002', 'kill', 'One customer only, and it would add upkeep for every future change.', '2026-11-06T09:00:00Z'),
  ('00000000-0000-4000-8000-000000000005', 'defer', 'Nice to have; revisit when we know how many people would use it.', '2026-11-06T09:30:00Z');
