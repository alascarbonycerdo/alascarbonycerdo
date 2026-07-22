-- El upsert necesita poder consultar (SELECT) si el objeto ya existe, además de
-- insert/update. La quité por completo en el hardening anterior por error; la
-- repongo pero acotada a la propia carpeta del usuario (no pública/listable).
create policy "avatars_own_select" on storage.objects
for select to authenticated
using ( bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text );

-- Mismo caso para emplatado: solo el administrador sube fotos, así que solo él
-- necesita poder verificar existencia antes de upsert.
create policy "emplatado_admin_select" on storage.objects
for select to authenticated
using ( bucket_id = 'emplatado' and public.current_role_is(array['administrador']) );
