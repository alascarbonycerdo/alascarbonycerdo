create table public.facturas_compra (
  id uuid primary key default gen_random_uuid(),
  fecha date not null,
  descripcion text not null,
  valor numeric not null check (valor > 0),
  punto_venta_id uuid references public.puntos_venta(id),
  creado_por uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create index facturas_compra_fecha_idx on public.facturas_compra(fecha);
create index facturas_compra_punto_venta_id_idx on public.facturas_compra(punto_venta_id);

alter table public.facturas_compra enable row level security;

-- Exclusivo del administrador: ni el vendedor lee ni escribe estas facturas.
create policy facturas_compra_admin_all on public.facturas_compra
  for all to authenticated
  using (current_role_is(array['administrador']))
  with check (current_role_is(array['administrador']));

grant select, insert, update, delete on public.facturas_compra to anon, authenticated, service_role;
