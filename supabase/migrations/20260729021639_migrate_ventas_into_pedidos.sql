-- Unifica ventas dentro de pedidos: cada venta es un pedido de un solo plato.
-- Esta migración solo AGREGA (copia el histórico y amplía create_pedido); el
-- retiro de la tabla ventas va en una migración aparte, para poder verificar
-- que el histórico quedó completo antes de borrar el origen.

-- create_pedido ahora acepta una fecha, para registrar pedidos de días pasados
-- (lo que antes hacía /api/admin/sales). Solo el administrador puede retrodatar.
drop function if exists public.create_pedido(jsonb);

create or replace function public.create_pedido(p_items jsonb, p_fecha date default null)
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
  v_created_at timestamptz;
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

  -- Retrodatar es una corrección de historial: solo administrador, nunca a futuro.
  if p_fecha is not null then
    if v_role <> 'administrador' then
      raise exception 'No autorizado';
    end if;
    if p_fecha > (now() at time zone 'America/Bogota')::date then
      raise exception 'No puedes registrar un pedido en una fecha futura';
    end if;
    v_created_at := (p_fecha::text || ' 12:00:00-05')::timestamptz;
  else
    v_created_at := now();
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

  insert into public.pedidos (responsable_id, responsable_nombre, punto_venta_id, total_miles, created_at)
  values (auth.uid(), v_nombre, v_punto_venta_id, v_total, v_created_at)
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

      insert into public.movimientos_inventario (dish_id, tipo, cantidad, nota, creado_por, punto_venta_id, created_at)
      values (v_inv_item_id, 'sale', v_consumo * v_cantidad, 'Pedido ' || v_pedido_id, auth.uid(), v_punto_venta_id, v_created_at);
    end if;
  end loop;

  return v_pedido_id;
end;
$$;

revoke all on function public.create_pedido(jsonb, date) from public, anon;
grant execute on function public.create_pedido(jsonb, date) to authenticated;

-- Copia el histórico: cada venta pasa a ser un pedido con un solo ítem,
-- conservando fecha, responsable, punto de venta y total. No se toca el stock:
-- esas ventas ya lo descontaron en su momento.
do $$
declare
  v record;
  v_pedido_id uuid;
begin
  for v in select * from public.ventas order by created_at loop
    insert into public.pedidos (responsable_id, responsable_nombre, punto_venta_id, total_miles, created_at)
    values (v.vendedor_id, v.vendedor_nombre, v.punto_venta_id, v.total_miles, v.created_at)
    returning id into v_pedido_id;

    insert into public.pedido_items (pedido_id, dish_id, dish_nombre, cantidad, precio_unitario_miles, subtotal_miles)
    values (v_pedido_id, v.dish_id, v.dish_nombre, v.cantidad, v.precio_unitario_miles, v.total_miles);
  end loop;
end $$;
