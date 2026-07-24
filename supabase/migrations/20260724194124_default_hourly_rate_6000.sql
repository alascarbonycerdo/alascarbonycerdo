-- Nuevo default de tarifa_hora: $6.000 pesos/hora en vez de 0, tanto para usuarios
-- nuevos (vía handle_new_user) como para los que ya existían sin una tarifa asignada.
alter table public.profiles alter column tarifa_hora set default 6000;

update public.profiles set tarifa_hora = 6000 where tarifa_hora = 0;
