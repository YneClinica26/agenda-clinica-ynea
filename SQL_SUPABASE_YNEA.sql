-- SQL_SUPABASE_YNEA.sql
-- Ejecuta este archivo en Supabase > SQL Editor > New query > Run.

create table if not exists public.ynea_agenda_state (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.ynea_agenda_state enable row level security;

-- Para esta app privada con anon key. La seguridad real debe estar en que el proyecto/URL no sea público.
-- Si más adelante quieres usuarios con login, se cambian estas policies por auth.uid().
drop policy if exists "ynea_read_state" on public.ynea_agenda_state;
drop policy if exists "ynea_insert_state" on public.ynea_agenda_state;
drop policy if exists "ynea_update_state" on public.ynea_agenda_state;

create policy "ynea_read_state"
on public.ynea_agenda_state
for select
using (true);

create policy "ynea_insert_state"
on public.ynea_agenda_state
for insert
with check (true);

create policy "ynea_update_state"
on public.ynea_agenda_state
for update
using (true)
with check (true);

insert into public.ynea_agenda_state (id, data)
values ('default', '{}'::jsonb)
on conflict (id) do nothing;
