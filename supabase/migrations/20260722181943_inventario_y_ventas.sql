create table public.inventario_items (
  id text primary key,
  nombre text not null,
  detalle text,
  consumo_por_venta numeric not null default 0,
  stock_actual numeric not null default 0,
  updated_at timestamptz not null default now()
);

create table public.movimientos_inventario (
  id uuid primary key default gen_random_uuid(),
  dish_id text not null references public.inventario_items(id),
  tipo text not null check (tipo in ('restock','sale')),
  cantidad numeric not null,
  nota text,
  creado_por uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.ventas (
  id uuid primary key default gen_random_uuid(),
  dish_id text not null,
  dish_nombre text not null,
  cantidad integer not null check (cantidad > 0),
  precio_unitario_miles numeric not null,
  total_miles numeric not null,
  vendedor_id uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create index movimientos_inventario_dish_id_idx on public.movimientos_inventario(dish_id);
create index movimientos_inventario_created_at_idx on public.movimientos_inventario(created_at);
create index ventas_created_at_idx on public.ventas(created_at);

alter table public.inventario_items enable row level security;
alter table public.movimientos_inventario enable row level security;
alter table public.ventas enable row level security;

-- Lectura: cualquier staff autenticado (vendedor o administrador)
create policy "inv_items_select_staff" on public.inventario_items
for select to authenticated using ( public.current_role_is(array['vendedor','administrador']) );

create policy "movimientos_select_staff" on public.movimientos_inventario
for select to authenticated using ( public.current_role_is(array['vendedor','administrador']) );

create policy "ventas_select_staff" on public.ventas
for select to authenticated using ( public.current_role_is(array['vendedor','administrador']) );

-- Solo administrador puede reconfigurar el inventario (consumo por venta, etc.)
create policy "inv_items_update_admin" on public.inventario_items
for update to authenticated
using ( public.current_role_is(array['administrador']) )
with check ( public.current_role_is(array['administrador']) );

-- Vendedor y administrador pueden vender y registrar movimientos (restock)
create policy "ventas_insert_staff" on public.ventas
for insert to authenticated with check ( public.current_role_is(array['vendedor','administrador']) );

create policy "movimientos_insert_staff" on public.movimientos_inventario
for insert to authenticated with check ( public.current_role_is(array['vendedor','administrador']) );

-- Al insertar una venta: descuenta stock y registra el movimiento tipo 'sale' atómicamente
create or replace function public.handle_venta_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  consumo numeric;
begin
  select consumo_por_venta into consumo from public.inventario_items where id = new.dish_id;

  if consumo is not null then
    update public.inventario_items
    set stock_actual = greatest(0, stock_actual - consumo * new.cantidad),
        updated_at = now()
    where id = new.dish_id;

    insert into public.movimientos_inventario (dish_id, tipo, cantidad, creado_por)
    values (new.dish_id, 'sale', consumo * new.cantidad, new.vendedor_id);
  end if;

  return new;
end;
$$;

create trigger on_venta_insert
after insert on public.ventas
for each row execute function public.handle_venta_insert();

-- Al insertar un movimiento tipo 'restock': suma al stock
create or replace function public.handle_restock_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.tipo = 'restock' then
    update public.inventario_items
    set stock_actual = stock_actual + new.cantidad,
        updated_at = now()
    where id = new.dish_id;
  end if;
  return new;
end;
$$;

create trigger on_restock_insert
after insert on public.movimientos_inventario
for each row execute function public.handle_restock_insert();

-- Siembra los 7 platos actuales del menú con su consumo por venta actual
insert into public.inventario_items (id, nombre, detalle, consumo_por_venta, stock_actual) values
  ('wings-3', '3 Alas', null, 300, 0),
  ('wings-6', '6 Alas', null, 600, 0),
  ('wings-12', '12 Alas', null, 1200, 0),
  ('chorizo', 'Chorizo', 'Artesanal', 150, 0),
  ('chicharron', 'Chicharrón', '300 gramos', 300, 0),
  ('ceviche', 'Ceviche de Chicharrón', '450 gramos', 300, 0),
  ('costilla', 'Costilla', '500 gramos', 500, 0);
