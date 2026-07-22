alter table public.profiles add column avatar_url text;

-- Un usuario puede editar su propia fila (nombre, avatar), además del admin ya
-- permitido. El role no se puede tocar por esta vía: lo bloquea el trigger de abajo.
create policy "profiles_update_own" on public.profiles
for update to authenticated
using ( id = auth.uid() )
with check ( id = auth.uid() );

create or replace function public.prevent_unauthorized_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and not public.current_role_is(array['administrador']) then
    new.role := old.role;
  end if;
  return new;
end;
$$;

create trigger before_profiles_role_guard
before update on public.profiles
for each row execute function public.prevent_unauthorized_role_change();

-- Bucket de avatares: público para lectura (se muestran sin firmar), cada usuario
-- solo puede escribir dentro de una carpeta con su propio uid.
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);

create policy "avatars_public_read" on storage.objects
for select using ( bucket_id = 'avatars' );

create policy "avatars_own_insert" on storage.objects
for insert to authenticated
with check ( bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text );

create policy "avatars_own_update" on storage.objects
for update to authenticated
using ( bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text )
with check ( bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text );
