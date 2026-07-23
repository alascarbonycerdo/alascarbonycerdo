-- Simplifica el inventario del día a día: se deja de manejar en gramos/kilos y
-- pasa a contarse en unidades enteras (piezas). "unidades_por_paquete" define
-- cuánto suma cada paquete que se agrega al reabastecer (ej: 1 bolsa = 6 alas).
alter table public.inventario_items add column unidades_por_paquete integer not null default 1;

-- Los valores anteriores eran gramos; no tienen sentido como unidades, se reinician.
update public.inventario_items set stock_actual = 0, consumo_por_venta = 3, unidades_por_paquete = 6 where id = 'wings-3';
update public.inventario_items set stock_actual = 0, consumo_por_venta = 6, unidades_por_paquete = 6 where id = 'wings-6';
update public.inventario_items set stock_actual = 0, consumo_por_venta = 12, unidades_por_paquete = 6 where id = 'wings-12';
update public.inventario_items set stock_actual = 0, consumo_por_venta = 1, unidades_por_paquete = 1 where id in ('chorizo','chicharron','ceviche','costilla');
