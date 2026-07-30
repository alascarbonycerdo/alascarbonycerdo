-- Pedidos: una orden con varios platos distintos, referenciando un responsable
-- y un punto de venta, con un total calculado sobre todos sus ítems.
-- Igual que ventas, cada plato de un pedido descuenta stock del punto de venta
-- al crearse y lo devuelve al eliminarse — pero todo el pedido (cabecera + N
-- ítems + N ajustes de stock) debe ser atómico, así que a diferencia de
-- ventas (donde el insert directo dispara un trigger por fila), aquí las
-- escrituras pasan exclusivamente por dos RPCs security definer
-- (create_pedido / delete_pedido) que hacen todo en una sola transacción.

create table public.pedidos (
  id uuid primary key default gen_random_uuid(),
  responsable_id uuid references public.profiles(id) on delete set null,
  responsable_nombre text,
  punto_venta_id uuid not null references public.puntos_venta(id),
  total_miles numeric not null default 0,
  created_at timestamptz not null default now()
);

create table public.pedido_items (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references public.pedidos(id) on delete cascade,
  dish_id text not null,
  dish_nombre text not null,
  cantidad integer not null check (cantidad > 0),
  precio_unitario_miles numeric not null,
  subtotal_miles numeric not null
);

create index pedidos_created_at_idx on public.pedidos(created_at);
create index pedidos_punto_venta_id_idx on public.pedidos(punto_venta_id);
create index pedido_items_pedido_id_idx on public.pedido_items(pedido_id);

alter table public.pedidos enable row level security;
alter table public.pedido_items enable row level security;

create policy pedidos_select_own_point on public.pedidos
  for select to authenticated
  using (
    current_role_is(array['administrador'])
    or punto_venta_id = (select punto_venta_id from public.profiles where id = auth.uid())
  );

create policy pedido_items_select_own_point on public.pedido_items
  for select to authenticated
  using (
    current_role_is(array['administrador'])
    or exists (
      select 1 from public.pedidos p
      where p.id = pedido_items.pedido_id
        and p.punto_venta_id = (select punto_venta_id from public.profiles where id = auth.uid())
    )
  );

-- Sin políticas de insert/update/delete para authenticated: toda escritura
-- pasa por las funciones security definer de abajo (mismo patrón que
-- inventario_stock, cuyas escrituras solo ocurren vía restock_item/remove_stock_item).
grant select on public.pedidos, public.pedido_items to authenticated;

create or replace function public.create_pedido(p_items jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
  v_activo boolean;
  v_punto_venta_id uuid;
  v_nombre text;
  v_total numeric := 0;
  v_pedido_id uuid;
  v_item jsonb;
  v_cantidad integer;
  v_precio numeric;
  v_dish_id text;
  v_dish_nombre text;
  v_inv_item_id text;
  v_consumo numeric;
begin
  select role, activo, punto_venta_id, nombre
    into v_role, v_activo, v_punto_venta_id, v_nombre
    from public.profiles where id = auth.uid();

  if v_role is null or v_activo is not true or v_role not in ('vendedor', 'administrador') then
    raise exception 'No autorizado';
  end if;

  if v_punto_venta_id is null then
    raise exception 'Tu usuario no tiene un punto de venta asignado';
  end if;

  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'El pedido debe tener al menos un plato';
  end if;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_cantidad := (v_item->>'cantidad')::integer;
    v_precio := (v_item->>'precio_unitario_miles')::numeric;
    if v_cantidad is null or v_cantidad <= 0 then
      raise exception 'Cantidad inválida en el pedido';
    end if;
    if v_precio is null or v_precio <= 0 then
      raise exception 'Precio inválido en el pedido';
    end if;
    v_total := v_total + (v_cantidad * v_precio);
  end loop;

  insert into public.pedidos (responsable_id, responsable_nombre, punto_venta_id, total_miles)
  values (auth.uid(), v_nombre, v_punto_venta_id, v_total)
  returning id into v_pedido_id;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_dish_id := v_item->>'dish_id';
    v_dish_nombre := v_item->>'dish_nombre';
    v_cantidad := (v_item->>'cantidad')::integer;
    v_precio := (v_item->>'precio_unitario_miles')::numeric;

    insert into public.pedido_items (pedido_id, dish_id, dish_nombre, cantidad, precio_unitario_miles, subtotal_miles)
    values (v_pedido_id, v_dish_id, v_dish_nombre, v_cantidad, v_precio, v_cantidad * v_precio);

    select inventario_item_id, consumo_por_venta into v_inv_item_id, v_consumo
      from public.dish_inventory_map where dish_id = v_dish_id;

    if v_inv_item_id is not null then
      insert into public.inventario_stock (item_id, punto_venta_id, stock_actual)
      values (v_inv_item_id, v_punto_venta_id, 0)
      on conflict (item_id, punto_venta_id) do nothing;

      update public.inventario_stock
      set stock_actual = greatest(0, stock_actual - v_consumo * v_cantidad),
          updated_at = now()
      where item_id = v_inv_item_id and punto_venta_id = v_punto_venta_id;

      insert into public.movimientos_inventario (dish_id, tipo, cantidad, nota, creado_por, punto_venta_id)
      values (v_inv_item_id, 'sale', v_consumo * v_cantidad, 'Pedido ' || v_pedido_id, auth.uid(), v_punto_venta_id);
    end if;
  end loop;

  return v_pedido_id;
end;
$$;

revoke all on function public.create_pedido(jsonb) from public, anon;
grant execute on function public.create_pedido(jsonb) to authenticated;

create or replace function public.delete_pedido(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_punto_venta_id uuid;
  v_item record;
  v_inv_item_id text;
  v_consumo numeric;
begin
  if not current_role_is(array['administrador']) then
    raise exception 'No autorizado';
  end if;

  select punto_venta_id into v_punto_venta_id from public.pedidos where id = p_id;
  if v_punto_venta_id is null then
    raise exception 'Pedido no encontrado';
  end if;

  for v_item in select dish_id, cantidad from public.pedido_items where pedido_id = p_id loop
    select inventario_item_id, consumo_por_venta into v_inv_item_id, v_consumo
      from public.dish_inventory_map where dish_id = v_item.dish_id;

    if v_inv_item_id is not null then
      update public.inventario_stock
      set stock_actual = stock_actual + v_consumo * v_item.cantidad,
          updated_at = now()
      where item_id = v_inv_item_id and punto_venta_id = v_punto_venta_id;

      insert into public.movimientos_inventario (dish_id, tipo, cantidad, nota, creado_por, punto_venta_id)
      values (
        v_inv_item_id, 'restock', v_consumo * v_item.cantidad,
        'Reversión por eliminación de pedido ' || p_id, auth.uid(), v_punto_venta_id
      );
    end if;
  end loop;

  delete from public.pedidos where id = p_id;
end;
$$;

revoke all on function public.delete_pedido(uuid) from public, anon;
grant execute on function public.delete_pedido(uuid) to authenticated;
