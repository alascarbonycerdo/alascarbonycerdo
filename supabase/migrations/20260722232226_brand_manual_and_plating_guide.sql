create table public.brand_manual_sections (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  contenido text not null default '',
  orden integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.brand_manual_sections enable row level security;

create policy "manual_select_staff" on public.brand_manual_sections
for select to authenticated using ( public.current_role_is(array['vendedor','administrador']) );

create policy "manual_write_admin" on public.brand_manual_sections
for all to authenticated
using ( public.current_role_is(array['administrador']) )
with check ( public.current_role_is(array['administrador']) );

create table public.guia_emplatado (
  id text primary key,
  nombre text not null,
  pasos text not null default '',
  foto_url text,
  orden integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.guia_emplatado enable row level security;

create policy "emplatado_select_staff" on public.guia_emplatado
for select to authenticated using ( public.current_role_is(array['vendedor','administrador']) );

create policy "emplatado_write_admin" on public.guia_emplatado
for all to authenticated
using ( public.current_role_is(array['administrador']) )
with check ( public.current_role_is(array['administrador']) );

insert into public.guia_emplatado (id, nombre, orden) values
  ('wings-3', '3 Alas', 1),
  ('wings-6', '6 Alas', 2),
  ('wings-12', '12 Alas', 3),
  ('chorizo', 'Chorizo', 4),
  ('chicharron', 'Chicharrón', 5),
  ('ceviche', 'Ceviche de Chicharrón', 6),
  ('costilla', 'Costilla', 7);

-- Bucket de fotos de emplatado: lectura pública, solo administrador sube/reemplaza.
insert into storage.buckets (id, name, public) values ('emplatado', 'emplatado', true);

create policy "emplatado_photos_public_read" on storage.objects
for select using ( bucket_id = 'emplatado' );

create policy "emplatado_photos_admin_write" on storage.objects
for all to authenticated
using ( bucket_id = 'emplatado' and public.current_role_is(array['administrador']) )
with check ( bucket_id = 'emplatado' and public.current_role_is(array['administrador']) );
