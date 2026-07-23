-- Sin esto, borrar un usuario con ventas/movimientos registrados fallaría por
-- violación de llave foránea. Preservamos el historial de ventas/inventario y
-- solo desvinculamos la referencia a "quién lo hizo".
alter table public.movimientos_inventario drop constraint movimientos_inventario_creado_por_fkey;
alter table public.movimientos_inventario
  add constraint movimientos_inventario_creado_por_fkey
  foreign key (creado_por) references public.profiles(id) on delete set null;

alter table public.ventas drop constraint ventas_vendedor_id_fkey;
alter table public.ventas
  add constraint ventas_vendedor_id_fkey
  foreign key (vendedor_id) references public.profiles(id) on delete set null;
