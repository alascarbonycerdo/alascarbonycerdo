alter table public.profiles add column tarifa_hora numeric not null default 0;

-- La función ya protege role/activo/punto_venta_id de auto-edición (RLS de
-- profiles_update_own no restringe por columna); se amplía para cubrir también
-- tarifa_hora, si no un vendedor podría inflar su propio sueldo por hora.
create or replace function public.prevent_unauthorized_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.current_role_is(array['administrador']) then
    if new.role is distinct from old.role then
      new.role := old.role;
    end if;
    if new.activo is distinct from old.activo then
      new.activo := old.activo;
    end if;
    if new.punto_venta_id is distinct from old.punto_venta_id then
      new.punto_venta_id := old.punto_venta_id;
    end if;
    if new.tarifa_hora is distinct from old.tarifa_hora then
      new.tarifa_hora := old.tarifa_hora;
    end if;
  end if;
  return new;
end;
$$;
