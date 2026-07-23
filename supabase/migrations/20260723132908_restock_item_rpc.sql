-- Reabastecer manualmente ya no depende de un trigger sobre movimientos_inventario
-- (esa vía causaba el doble-conteo con handle_venta_delete). Esta función hace, en una
-- sola transacción atómica: valida rol y punto de venta propio del que llama, ajusta
-- inventario_stock y deja el registro de auditoría en movimientos_inventario.
create or replace function public.restock_item(
  p_item_id text,
  p_cantidad numeric,
  p_nota text default null
)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_punto_venta_id uuid;
  v_role text;
begin
  select role, punto_venta_id into v_role, v_punto_venta_id
  from public.profiles where id = auth.uid();

  if v_role is null or v_role not in ('vendedor', 'administrador') then
    raise exception 'No autorizado';
  end if;

  if v_punto_venta_id is null then
    raise exception 'Tu usuario no tiene un punto de venta asignado';
  end if;

  if p_cantidad <= 0 then
    raise exception 'La cantidad debe ser mayor a 0';
  end if;

  insert into public.inventario_stock (item_id, punto_venta_id, stock_actual)
  values (p_item_id, v_punto_venta_id, 0)
  on conflict (item_id, punto_venta_id) do nothing;

  update public.inventario_stock
  set stock_actual = stock_actual + p_cantidad,
      updated_at = now()
  where item_id = p_item_id and punto_venta_id = v_punto_venta_id;

  insert into public.movimientos_inventario (dish_id, tipo, cantidad, nota, creado_por, punto_venta_id)
  values (p_item_id, 'restock', p_cantidad, p_nota, auth.uid(), v_punto_venta_id);
end;
$function$;

revoke all on function public.restock_item(text, numeric, text) from public, anon;
grant execute on function public.restock_item(text, numeric, text) to authenticated;
