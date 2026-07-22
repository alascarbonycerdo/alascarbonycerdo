-- Perfiles de staff con rol
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'vendedor' check (role in ('cliente','vendedor','administrador')),
  nombre text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Compara el rol del usuario que llama (auth.uid()) contra una lista permitida.
-- SECURITY DEFINER para evitar recursión de RLS al consultarse desde las políticas,
-- pero solo puede leer la fila del propio caller (auth.uid()), nunca la de otros.
create or replace function public.current_role_is(required text[])
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = any(required)
  );
$$;

revoke all on function public.current_role_is(text[]) from public;
grant execute on function public.current_role_is(text[]) to authenticated;

create policy "profiles_select_own_or_admin" on public.profiles
for select to authenticated
using ( id = auth.uid() or public.current_role_is(array['administrador']) );

create policy "profiles_update_admin_only" on public.profiles
for update to authenticated
using ( public.current_role_is(array['administrador']) )
with check ( public.current_role_is(array['administrador']) );

-- Crea el perfil automáticamente cuando se crea una cuenta (rol por defecto: vendedor,
-- el administrador promueve manualmente; nadie se autoasigna un rol).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nombre)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
