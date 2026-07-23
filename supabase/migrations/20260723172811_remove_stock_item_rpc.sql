-- Permite al administrador descontar unidades de un insumo manualmente (mermas,
-- pérdidas, correcciones de conteo), separado de las ventas y los reabastecimientos.
alter table public.movimientos_inventario
  drop constraint movimientos_inventario_tipo_check;

alter table public.movimientos_inventario
  add constraint movimientos_inventario_tipo_check
  check (tipo = any (array['restock', 'sale', 'merma']));

create or replace function public.remove_stock_item(
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

  if v_role is null or v_role <> 'administrador' then
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
  set stock_actual = greatest(0, stock_actual - p_cantidad),
      updated_at = now()
  where item_id = p_item_id and punto_venta_id = v_punto_venta_id;

  insert into public.movimientos_inventario (dish_id, tipo, cantidad, nota, creado_por, punto_venta_id)
  values (p_item_id, 'merma', p_cantidad, p_nota, auth.uid(), v_punto_venta_id);
end;
$function$;

revoke all on function public.remove_stock_item(text, numeric, text) from public, anon;
grant execute on function public.remove_stock_item(text, numeric, text) to authenticated;
