-- Daily cap for AI suggestions. Run once in Supabase: SQL Editor > New query > paste > Run.
-- Does not touch the requests or decisions tables.

drop function if exists take_ai_call(int);
drop table if exists ai_usage;

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
