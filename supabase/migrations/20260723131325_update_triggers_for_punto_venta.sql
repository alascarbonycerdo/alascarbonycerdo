create or replace function public.handle_venta_insert()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_item_id text;
  v_consumo numeric;
begin
  select inventario_item_id, consumo_por_venta into v_item_id, v_consumo
  from public.dish_inventory_map where dish_id = new.dish_id;

  if v_item_id is not null then
    insert into public.inventario_stock (item_id, punto_venta_id, stock_actual)
    values (v_item_id, new.punto_venta_id, 0)
    on conflict (item_id, punto_venta_id) do nothing;

    update public.inventario_stock
    set stock_actual = greatest(0, stock_actual - v_consumo * new.cantidad),
        updated_at = now()
    where item_id = v_item_id and punto_venta_id = new.punto_venta_id;

    insert into public.movimientos_inventario (dish_id, tipo, cantidad, creado_por, punto_venta_id)
    values (v_item_id, 'sale', v_consumo * new.cantidad, new.vendedor_id, new.punto_venta_id);
  end if;

  return new;
end;
$function$;

create or replace function public.handle_venta_delete()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_item_id text;
  v_consumo numeric;
begin
  select inventario_item_id, consumo_por_venta into v_item_id, v_consumo
  from public.dish_inventory_map where dish_id = old.dish_id;

  if v_item_id is not null then
    insert into public.inventario_stock (item_id, punto_venta_id, stock_actual)
    values (v_item_id, old.punto_venta_id, 0)
    on conflict (item_id, punto_venta_id) do nothing;

    update public.inventario_stock
    set stock_actual = stock_actual + v_consumo * old.cantidad,
        updated_at = now()
    where item_id = v_item_id and punto_venta_id = old.punto_venta_id;

    insert into public.movimientos_inventario (dish_id, tipo, cantidad, nota, creado_por, punto_venta_id)
    values (v_item_id, 'restock', v_consumo * old.cantidad, 'Reversión por eliminación de venta', auth.uid(), old.punto_venta_id);
  end if;

  return old;
end;
$function$;

revoke all on function public.handle_venta_insert() from public, anon, authenticated;
revoke all on function public.handle_venta_delete() from public, anon, authenticated;
