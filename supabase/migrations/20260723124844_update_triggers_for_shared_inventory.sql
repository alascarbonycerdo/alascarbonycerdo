-- Actualiza los triggers de venta/reversión para resolver el insumo y el
-- consumo por venta a través de dish_inventory_map, en vez de asumir que
-- inventario_items.id == ventas.dish_id (ya no es cierto para las alas).

create or replace function public.handle_venta_insert()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  item_id text;
  consumo numeric;
begin
  select inventario_item_id, consumo_por_venta into item_id, consumo
  from public.dish_inventory_map where dish_id = new.dish_id;

  if item_id is not null then
    update public.inventario_items
    set stock_actual = greatest(0, stock_actual - consumo * new.cantidad),
        updated_at = now()
    where id = item_id;

    insert into public.movimientos_inventario (dish_id, tipo, cantidad, creado_por)
    values (item_id, 'sale', consumo * new.cantidad, new.vendedor_id);
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
  item_id text;
  consumo numeric;
begin
  select inventario_item_id, consumo_por_venta into item_id, consumo
  from public.dish_inventory_map where dish_id = old.dish_id;

  if item_id is not null then
    update public.inventario_items
    set stock_actual = stock_actual + consumo * old.cantidad,
        updated_at = now()
    where id = item_id;

    insert into public.movimientos_inventario (dish_id, tipo, cantidad, nota, creado_por)
    values (item_id, 'restock', consumo * old.cantidad, 'Reversión por eliminación de venta', auth.uid());
  end if;

  return old;
end;
$function$;

revoke all on function public.handle_venta_insert() from public, anon, authenticated;
revoke all on function public.handle_venta_delete() from public, anon, authenticated;
