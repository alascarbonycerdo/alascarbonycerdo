-- Confirmar un turno calcula las horas trabajadas y las suma a horas_trabajadas.
-- Cruces de medianoche (salida < entrada) se resuelven sumando 24h a la diferencia.
create or replace function public.handle_turno_confirmado()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_horas numeric;
  v_tarifa numeric;
begin
  if new.estado = 'confirmado' and old.estado is distinct from 'confirmado' then
    if new.hora_entrada_real is null or new.hora_salida_real is null then
      raise exception 'Debes registrar la hora de entrada y salida reales antes de confirmar';
    end if;

    v_horas := extract(epoch from (new.hora_salida_real - new.hora_entrada_real)) / 3600.0;
    if v_horas < 0 then
      v_horas := v_horas + 24;
    end if;

    select tarifa_hora into v_tarifa from public.profiles where id = new.empleado_id;

    insert into public.horas_trabajadas (turno_id, empleado_id, punto_venta_id, dia, horas, tarifa_hora, total_pagar)
    values (new.id, new.empleado_id, new.punto_venta_id, new.dia, v_horas, v_tarifa, v_horas * v_tarifa);

    new.confirmado_por := auth.uid();
    new.confirmado_at := now();
  end if;

  return new;
end;
$$;

-- Un turno ya confirmado queda inmutable (no se edita ni se borra), para proteger
-- la integridad de la nómina. No bloquea la transición programado→confirmado porque
-- en ese momento old.estado todavía es 'programado'.
create or replace function public.protect_confirmed_turno()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.estado = 'confirmado' then
    raise exception 'No se puede modificar un turno ya confirmado';
  end if;
  return coalesce(new, old);
end;
$$;

create trigger before_turno_confirm
before update on public.turnos
for each row execute function public.handle_turno_confirmado();

create trigger before_turno_update_protect
before update on public.turnos
for each row execute function public.protect_confirmed_turno();

create trigger before_turno_delete_protect
before delete on public.turnos
for each row execute function public.protect_confirmed_turno();

revoke all on function public.handle_turno_confirmado() from public, anon, authenticated;
revoke all on function public.protect_confirmed_turno() from public, anon, authenticated;
