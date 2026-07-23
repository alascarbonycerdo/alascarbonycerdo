-- Unifica los 3 platos de alas (3/6/12) en un solo insumo compartido "alas",
-- ya que las 3 presentaciones se sirven del mismo stock crudo de alitas.
-- El consumo por venta de cada plato (3, 6 o 12 unidades) queda modelado en
-- la nueva tabla dish_inventory_map en vez de vivir en inventario_items.

create table public.dish_inventory_map (
  dish_id text primary key,
  inventario_item_id text not null references public.inventario_items (id),
  consumo_por_venta numeric not null default 1
);

alter table public.dish_inventory_map enable row level security;

create policy dish_map_select_staff on public.dish_inventory_map
  for select to authenticated
  using (current_role_is(array['vendedor', 'administrador']));

create policy dish_map_write_admin on public.dish_inventory_map
  for all to authenticated
  using (current_role_is(array['administrador']))
  with check (current_role_is(array['administrador']));

grant select, insert, update, delete on public.dish_inventory_map to anon, authenticated, service_role;

-- Crea el insumo compartido "alas" con el stock sumado de las 3 filas viejas.
insert into public.inventario_items (id, nombre, detalle, stock_actual, unidades_por_paquete)
select
  'alas',
  'Alas',
  null,
  coalesce(sum(stock_actual), 0),
  6
from public.inventario_items
where id in ('wings-3', 'wings-6', 'wings-12');

-- Mapea cada plato al insumo que realmente consume, con su tasa de consumo.
insert into public.dish_inventory_map (dish_id, inventario_item_id, consumo_por_venta)
values
  ('wings-3', 'alas', 3),
  ('wings-6', 'alas', 6),
  ('wings-12', 'alas', 12),
  ('chorizo', 'chorizo', 1),
  ('chicharron', 'chicharron', 1),
  ('ceviche', 'ceviche', 1),
  ('costilla', 'costilla', 1);

-- Reapunta el historial de movimientos de las filas viejas al insumo unificado
-- antes de borrarlas, para no perder el rastro de auditoría ni violar la FK.
update public.movimientos_inventario
set dish_id = 'alas'
where dish_id in ('wings-3', 'wings-6', 'wings-12');

delete from public.inventario_items where id in ('wings-3', 'wings-6', 'wings-12');

alter table public.inventario_items drop column consumo_por_venta;
