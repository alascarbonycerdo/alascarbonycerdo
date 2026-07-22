-- Los buckets ya son públicos (acceso directo por URL sin necesitar política RLS);
-- estas políticas de SELECT solo servían para listar el contenido completo del
-- bucket, lo cual no hace falta y expone más de lo debido.
drop policy "avatars_public_read" on storage.objects;
drop policy "emplatado_photos_public_read" on storage.objects;

revoke all on function public.prevent_unauthorized_role_change() from public, anon, authenticated;
