-- ============================================================
-- Focus App — Opt-in anonymous telemetry
-- Stores funnel events with NO personally-identifiable data.
-- 
-- What is stored:
--   event_name    — enumerated action name (signup_completed, etc.)
--   anonymous_id  — client-generated 8-char hash; cannot be reversed to user
--   session_id    — random per-tab UUID; no persistence
--   app_version   — semver string (e.g. "0.1.2")
--   created_at    — timestamp
--
-- What is NOT stored:
--   user_id       — never
--   email         — never
--   ip_address    — never
--   user_agent    — never (beyond browser family)
--   task content  — never
-- ============================================================

create table if not exists public.telemetry_events (
  id           uuid        default gen_random_uuid() primary key,
  event_name   text        not null check (event_name in (
                             'signup_completed',
                             'first_task_created',
                             'task_completed',
                             'onboarding_completed',
                             'telemetry_opted_in',
                             'telemetry_opted_out'
                           )),
  anonymous_id text        not null,  -- 8-char hex derived client-side; no PII
  session_id   text        not null,  -- random per-tab UUID; no persistence
  app_version  text        not null default '0.1.2',
  browser_fam  text        not null default 'unknown', -- 'chrome'|'safari'|'firefox'|'other'
  created_at   timestamptz default now()
);

-- Telemetry is insert-only for service role; no reads needed from client
alter table public.telemetry_events enable row level security;

-- No RLS policy for SELECT (analytics query via service role or Supabase dashboard only)
-- No INSERT policy for authenticated users (route uses service role key)

-- TTL cleanup: remove events older than 90 days
create or replace function public.cleanup_old_telemetry()
returns void
language sql
security definer
as $$
  delete from public.telemetry_events
  where created_at < now() - interval '90 days';
$$;

-- Index for dashboard queries
create index if not exists idx_telemetry_event_name on public.telemetry_events (event_name, created_at desc);
create index if not exists idx_telemetry_anon_id    on public.telemetry_events (anonymous_id);
create index if not exists idx_telemetry_created_at on public.telemetry_events (created_at desc);
