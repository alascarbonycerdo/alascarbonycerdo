-- La migración anterior no tuvo efecto: el trigger prevent_unauthorized_role_change
-- revierte tarifa_hora cuando auth.uid() es null (como pasa en una migración cruda,
-- sin sesión autenticada), tratándola como una edición "no autorizada". Se
-- deshabilita el trigger solo para este backfill puntual.
alter table public.profiles disable trigger before_profiles_role_guard;
update public.profiles set tarifa_hora = 6000 where tarifa_hora = 0;
alter table public.profiles enable trigger before_profiles_role_guard;
