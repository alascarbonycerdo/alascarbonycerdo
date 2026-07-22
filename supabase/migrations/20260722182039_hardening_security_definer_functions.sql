-- Estas funciones solo deben dispararse desde sus triggers, nunca ser invocables
-- directamente vía /rest/v1/rpc/... por anon o authenticated.
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.handle_restock_insert() from public, anon, authenticated;
revoke all on function public.handle_venta_insert() from public, anon, authenticated;

-- current_role_is sí necesita ser ejecutable por authenticated (las políticas RLS
-- la llaman en el contexto del usuario logueado), pero no por anon.
revoke all on function public.current_role_is(text[]) from public, anon;
grant execute on function public.current_role_is(text[]) to authenticated;
