-- Un usuario inactivo no puede operar la plataforma: se agrega profiles.activo y se
-- exige en el punto único que ya gatea casi todas las políticas RLS (current_role_is),
-- además de las dos funciones SECURITY DEFINER que hacen su propio chequeo de rol
-- por fuera de RLS (restock_item, remove_stock_item).
alter table public.profiles add column activo boolean not null default true;

create or replace function public.current_role_is(required text[])
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = any(required) and activo = true
  );
$$;

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
  v_activo boolean;
begin
  select role, punto_venta_id, activo into v_role, v_punto_venta_id, v_activo
  from public.profiles where id = auth.uid();

  if v_role is null or v_role not in ('vendedor', 'administrador') or v_activo is not true then
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
  v_activo boolean;
begin
  select role, punto_venta_id, activo into v_role, v_punto_venta_id, v_activo
  from public.profiles where id = auth.uid();

  if v_role is null or v_role <> 'administrador' or v_activo is not true then
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
