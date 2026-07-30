-- El histórico de ventas ya vive dentro de pedidos (verificado fila por fila:
-- mismo total, cantidad, plato, fecha, responsable y punto de venta), así que
-- la tabla ventas y sus triggers de stock se retiran. Desde ahora un pedido
-- es la única forma de registrar una venta.
drop table public.ventas;

drop function if exists public.handle_venta_insert();
drop function if exists public.handle_venta_delete();
