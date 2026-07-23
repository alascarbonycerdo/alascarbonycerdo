-- Nombre de quien hizo la venta, guardado como snapshot (igual que dish_nombre)
-- para que sobreviva aunque luego se edite o elimine el perfil del vendedor.
alter table public.ventas add column vendedor_nombre text;

-- Solo administrador puede eliminar ventas.
create policy "ventas_delete_admin" on public.ventas
for delete to authenticated
using ( public.current_role_is(array['administrador']) );

-- Al eliminar una venta, se revierte su efecto en el inventario: se devuelve el
-- stock descontado y se deja un movimiento de reversión para el historial
-- (no se borra el rastro, se compensa, igual que haría una nota crédito).
create or replace function public.handle_venta_delete()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  consumo numeric;
begin
  select consumo_por_venta into consumo from public.inventario_items where id = old.dish_id;

  if consumo is not null then
    update public.inventario_items
    set stock_actual = stock_actual + consumo * old.cantidad,
        updated_at = now()
    where id = old.dish_id;

    insert into public.movimientos_inventario (dish_id, tipo, cantidad, nota, creado_por)
    values (old.dish_id, 'restock', consumo * old.cantidad, 'Reversión por eliminación de venta', auth.uid());
  end if;

  return old;
end;
$$;

create trigger on_venta_delete
after delete on public.ventas
for each row execute function public.handle_venta_delete();
