-- ──────────────────────────────────────────────────────────────────────────────
-- Migration: Security hardening
-- 1. audit_log table  2. Enhanced RLS on tasks  3. Session audit trigger
-- ──────────────────────────────────────────────────────────────────────────────

-- ── 1. Audit log table ────────────────────────────────────────────────────────
create table if not exists public.audit_log (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users(id) on delete set null,
  action      text not null,
  resource    text,
  meta        jsonb,
  ip          text,
  user_agent  text,
  created_at  timestamptz default now() not null
);

-- Index for querying a user's audit history
create index if not exists audit_log_user_id_idx on public.audit_log(user_id, created_at desc);
-- Index for searching by action type
create index if not exists audit_log_action_idx  on public.audit_log(action, created_at desc);

-- Enable RLS
alter table public.audit_log enable row level security;

-- Users can read their own audit log
create policy if not exists "audit_log: users read own" on public.audit_log
  for select using (auth.uid() = user_id);

-- Only service role can insert/update/delete audit log rows
-- (no insert policy for authenticated users = must use service role key)

comment on table public.audit_log is
  'Append-only audit trail. Written via service role (bypasses RLS). Users can read own rows.';

-- ── 2. Enhanced RLS on tasks ──────────────────────────────────────────────────
-- Ensure all necessary policies exist (idempotent)

-- Drop and recreate to ensure correctness
drop policy if exists "tasks: users select own" on public.tasks;
drop policy if exists "tasks: users insert own" on public.tasks;
drop policy if exists "tasks: users update own" on public.tasks;
drop policy if exists "tasks: users delete own" on public.tasks;

create policy "tasks: users select own"
  on public.tasks for select
  using (auth.uid() = user_id);

create policy "tasks: users insert own"
  on public.tasks for insert
  with check (auth.uid() = user_id);

create policy "tasks: users update own"
  on public.tasks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "tasks: users delete own"
  on public.tasks for delete
  using (auth.uid() = user_id);

-- ── 3. Prevent user_id spoofing: enforce auth.uid() match on task insert ─────
-- This constraint is belt-and-suspenders alongside RLS
create or replace function public.enforce_user_id()
returns trigger language plpgsql security definer as $$
begin
  if new.user_id <> auth.uid() then
    raise exception 'user_id must match authenticated user';
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_user_id_on_insert on public.tasks;
create trigger enforce_user_id_on_insert
  before insert on public.tasks
  for each row execute function public.enforce_user_id();

-- ── 4. Auto-cleanup audit_log entries older than 90 days ─────────────────────
create or replace function public.cleanup_old_audit_logs()
returns void language plpgsql security definer as $$
begin
  delete from public.audit_log
  where created_at < now() - interval '90 days';
end;
$$;

comment on function public.cleanup_old_audit_logs is
  'Call via pg_cron or manually to remove audit entries older than 90 days.';

-- ── 5. Readonly view for user's own audit log ─────────────────────────────────
create or replace view public.my_audit_log as
  select id, action, resource, meta, ip, user_agent, created_at
  from public.audit_log
  where user_id = auth.uid()
  order by created_at desc;
