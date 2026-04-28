create table if not exists app_state (
  key text primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);

alter table app_state disable row level security;
