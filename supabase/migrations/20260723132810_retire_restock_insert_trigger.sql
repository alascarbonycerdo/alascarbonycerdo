-- handle_restock_insert() todavía escribía en inventario_items.stock_actual (columna
-- eliminada en punto_scoped_inventory_and_sales) y además duplicaba el ajuste de stock
-- en las reversiones de venta: handle_venta_delete() ya suma el stock directamente y
-- también inserta un movimiento tipo 'restock' como registro de auditoría, lo que
-- disparaba este trigger por segunda vez. movimientos_inventario pasa a ser un log
-- puro; todo ajuste de stock ahora vive explícitamente en el código que lo origina
-- (handle_venta_insert/delete para ventas, restock() en el servidor para reabastecimiento).
drop trigger on_restock_insert on public.movimientos_inventario;
drop function public.handle_restock_insert();
