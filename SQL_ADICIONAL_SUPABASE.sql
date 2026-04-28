create table if not exists tipos_profesional (
  profesional_id uuid references profesionales(id) on delete cascade,
  tipo_cita_id uuid references tipos_cita(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (profesional_id, tipo_cita_id)
);
