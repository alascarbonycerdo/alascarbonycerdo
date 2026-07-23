alter table public.profiles add column celular text;
alter table public.profiles add column documento text;
alter table public.profiles add column tipo_sangre text
  check (tipo_sangre in ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'));

-- profiles_update_own permite editar CUALQUIER columna de la propia fila (RLS no
-- restringe por columna). Hasta ahora solo el trigger de abajo protegía "role"; se
-- amplía para bloquear también la auto-reactivación (activo) y la auto-reasignación
-- de punto de venta, que deben quedar exclusivamente en manos de un administrador.
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
  end if;
  return new;
end;
$$;
