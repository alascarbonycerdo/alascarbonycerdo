-- Inventario pasa a ser por punto de venta: inventario_items queda como catálogo puro
-- (nombre, detalle, unidades por paquete) y el stock vive en inventario_stock, una fila
-- por (insumo, punto de venta).
create table public.inventario_stock (
  item_id text not null references public.inventario_items(id),
  punto_venta_id uuid not null references public.puntos_venta(id),
  stock_actual numeric not null default 0,
  updated_at timestamptz not null default now(),
  primary key (item_id, punto_venta_id)
);

alter table public.inventario_stock enable row level security;

create policy inv_stock_select_own_point on public.inventario_stock
  for select to authenticated
  using (
    current_role_is(array['administrador'])
    or punto_venta_id = (select punto_venta_id from public.profiles where id = auth.uid())
  );

create policy inv_stock_write_admin on public.inventario_stock
  for all to authenticated
  using (current_role_is(array['administrador']))
  with check (current_role_is(array['administrador']));

grant select, insert, update, delete on public.inventario_stock to anon, authenticated, service_role;

-- Migra el stock actual (todo hoy es un solo lugar implícito) al punto "Principal".
insert into public.inventario_stock (item_id, punto_venta_id, stock_actual)
select id, (select id from public.puntos_venta where nombre = 'Principal'), stock_actual
from public.inventario_items;

alter table public.inventario_items drop column stock_actual;
alter table public.inventario_items drop column updated_at;

-- Cada venta y cada movimiento de inventario queda ligado a un punto de venta.
alter table public.ventas add column punto_venta_id uuid references public.puntos_venta(id);
update public.ventas set punto_venta_id = (select id from public.puntos_venta where nombre = 'Principal');
alter table public.ventas alter column punto_venta_id set not null;

alter table public.movimientos_inventario add column punto_venta_id uuid references public.puntos_venta(id);
update public.movimientos_inventario set punto_venta_id = (select id from public.puntos_venta where nombre = 'Principal');
alter table public.movimientos_inventario alter column punto_venta_id set not null;

-- Las políticas anteriores dejaban ver/insertar en cualquier punto; ahora se restringen
-- al punto propio del usuario (o a cualquiera si es administrador).
drop policy ventas_select_staff on public.ventas;
drop policy ventas_insert_staff on public.ventas;
drop policy movimientos_select_staff on public.movimientos_inventario;
drop policy movimientos_insert_staff on public.movimientos_inventario;

create policy ventas_select_own_point on public.ventas
  for select to authenticated
  using (
    current_role_is(array['administrador'])
    or punto_venta_id = (select punto_venta_id from public.profiles where id = auth.uid())
  );

create policy ventas_insert_own_point on public.ventas
  for insert to authenticated
  with check (
    current_role_is(array['vendedor','administrador'])
    and punto_venta_id = (select punto_venta_id from public.profiles where id = auth.uid())
  );

create policy movimientos_select_own_point on public.movimientos_inventario
  for select to authenticated
  using (
    current_role_is(array['administrador'])
    or punto_venta_id = (select punto_venta_id from public.profiles where id = auth.uid())
  );

create policy movimientos_insert_own_point on public.movimientos_inventario
  for insert to authenticated
  with check (
    current_role_is(array['vendedor','administrador'])
    and punto_venta_id = (select punto_venta_id from public.profiles where id = auth.uid())
  );
