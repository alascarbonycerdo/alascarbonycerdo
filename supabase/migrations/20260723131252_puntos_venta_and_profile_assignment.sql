create table public.puntos_venta (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  direccion text,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.puntos_venta enable row level security;

create policy pv_select_staff on public.puntos_venta
  for select to authenticated
  using (current_role_is(array['vendedor','administrador']));

create policy pv_write_admin on public.puntos_venta
  for all to authenticated
  using (current_role_is(array['administrador']))
  with check (current_role_is(array['administrador']));

grant select, insert, update, delete on public.puntos_venta to anon, authenticated, service_role;

alter table public.profiles add column punto_venta_id uuid references public.puntos_venta(id) on delete set null;

insert into public.puntos_venta (nombre) values ('Principal');

update public.profiles
set punto_venta_id = (select id from public.puntos_venta where nombre = 'Principal');
