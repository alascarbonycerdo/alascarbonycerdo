-- El admin ahora puede editar y borrar un turno después de confirmado (para
-- corregir errores). Al borrar el turno se borra también su registro de horas
-- trabajadas (cascade). Al editar horas reales / empleado / punto / día de un
-- turno YA confirmado, se recalcula horas_trabajadas para que el pago siga
-- siendo exacto. Ya no se permite revertir un turno confirmado a "programado".

drop trigger before_turno_update_protect on public.turnos;
drop trigger before_turno_delete_protect on public.turnos;
drop function public.protect_confirmed_turno();

alter table public.horas_trabajadas drop constraint horas_trabajadas_turno_id_fkey;
alter table public.horas_trabajadas
  add constraint horas_trabajadas_turno_id_fkey
  foreign key (turno_id) references public.turnos(id) on delete cascade;

create or replace function public.handle_turno_confirmado_edit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_horas numeric;
begin
  if old.estado = 'confirmado' and new.estado <> 'confirmado' then
    raise exception 'No puedes revertir un turno ya confirmado a programado';
  end if;

  if old.estado = 'confirmado' and new.estado = 'confirmado' and (
    new.hora_entrada_real is distinct from old.hora_entrada_real
    or new.hora_salida_real is distinct from old.hora_salida_real
    or new.empleado_id is distinct from old.empleado_id
    or new.punto_venta_id is distinct from old.punto_venta_id
    or new.dia is distinct from old.dia
  ) then
    if new.hora_entrada_real is null or new.hora_salida_real is null then
      raise exception 'Debes registrar la hora de entrada y salida reales';
    end if;

    v_horas := extract(epoch from (new.hora_salida_real - new.hora_entrada_real)) / 3600.0;
    if v_horas < 0 then
      v_horas := v_horas + 24;
    end if;

    update public.horas_trabajadas
    set empleado_id = new.empleado_id,
        punto_venta_id = new.punto_venta_id,
        dia = new.dia,
        horas = v_horas,
        total_pagar = v_horas * tarifa_hora
    where turno_id = new.id;
  end if;

  return new;
end;
$$;

create trigger before_turno_confirmado_edit
before update on public.turnos
for each row execute function public.handle_turno_confirmado_edit();

revoke all on function public.handle_turno_confirmado_edit() from public, anon, authenticated;
