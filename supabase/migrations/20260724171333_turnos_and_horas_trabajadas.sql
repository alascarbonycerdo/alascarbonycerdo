create table public.turnos (
  id uuid primary key default gen_random_uuid(),
  empleado_id uuid not null references public.profiles(id),
  punto_venta_id uuid not null references public.puntos_venta(id),
  dia date not null,
  hora_entrada_programada time not null,
  hora_salida_programada time not null,
  hora_entrada_real time,
  hora_salida_real time,
  estado text not null default 'programado' check (estado in ('programado', 'confirmado')),
  creado_por uuid references public.profiles(id),
  confirmado_por uuid references public.profiles(id),
  confirmado_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.horas_trabajadas (
  id uuid primary key default gen_random_uuid(),
  turno_id uuid not null references public.turnos(id) unique,
  empleado_id uuid not null references public.profiles(id),
  punto_venta_id uuid not null references public.puntos_venta(id),
  dia date not null,
  horas numeric not null,
  tarifa_hora numeric not null,
  total_pagar numeric not null,
  created_at timestamptz not null default now()
);

create index turnos_dia_idx on public.turnos(dia);
create index turnos_empleado_id_idx on public.turnos(empleado_id);
create index horas_trabajadas_empleado_id_idx on public.horas_trabajadas(empleado_id);
create index horas_trabajadas_dia_idx on public.horas_trabajadas(dia);

alter table public.turnos enable row level security;
alter table public.horas_trabajadas enable row level security;

create policy turnos_select_own_or_admin on public.turnos
  for select to authenticated
  using (current_role_is(array['administrador']) or empleado_id = auth.uid());

create policy turnos_write_admin on public.turnos
  for all to authenticated
  using (current_role_is(array['administrador']))
  with check (current_role_is(array['administrador']));

create policy horas_trabajadas_select_own_or_admin on public.horas_trabajadas
  for select to authenticated
  using (current_role_is(array['administrador']) or empleado_id = auth.uid());
-- Sin política de insert/update/delete para authenticated: horas_trabajadas solo la
-- escribe el trigger SECURITY DEFINER de la siguiente migración.

grant select, insert, update, delete on public.turnos to anon, authenticated, service_role;
grant select on public.horas_trabajadas to anon, authenticated, service_role;
