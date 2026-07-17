-- ============================================================================
-- ING MARKET — Миграция 0004: Admin CMS (ядро)
-- Баннеры, журнал действий администратора, хранилище для лого/баннеров.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Баннеры
-- ----------------------------------------------------------------------------
create table public.banners (
  id serial primary key,
  image_url text not null,
  link_url text,
  position text not null default 'home_top' check (position in ('home_top', 'home_middle', 'sidebar')),
  sort_order integer not null default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger banners_set_updated_at
  before update on public.banners
  for each row execute function public.set_updated_at();

alter table public.banners enable row level security;

-- Публично видны только активные и попадающие в текущий период показа,
-- администратор/модератор видит вообще все (для управления).
create policy "banners_public_select" on public.banners
  for select using (
    (
      is_active
      and (starts_at is null or now() >= starts_at)
      and (ends_at is null or now() <= ends_at)
    )
    or public.has_role(array['admin', 'superadmin', 'moderator'])
  );

create policy "banners_admin_write" on public.banners
  for all using (public.has_role(array['admin', 'superadmin']))
  with check (public.has_role(array['admin', 'superadmin']));

-- ----------------------------------------------------------------------------
-- Журнал действий администратора (неизменяемый — только запись и чтение)
-- ----------------------------------------------------------------------------
create table public.admin_audit_log (
  id bigserial primary key,
  admin_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity text not null,
  entity_id text,
  diff jsonb,
  created_at timestamptz not null default now()
);

create index admin_audit_log_created_at_idx on public.admin_audit_log (created_at desc);

alter table public.admin_audit_log enable row level security;

create policy "admin_audit_log_admin_select" on public.admin_audit_log
  for select using (public.has_role(array['admin', 'superadmin']));

create policy "admin_audit_log_admin_insert" on public.admin_audit_log
  for insert with check (public.has_role(array['admin', 'superadmin']));

-- ----------------------------------------------------------------------------
-- Хранилище для лого сайта и картинок баннеров
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site-assets', 'site-assets', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'])
on conflict (id) do nothing;

create policy "site_assets_public_read" on storage.objects
  for select using (bucket_id = 'site-assets');

create policy "site_assets_admin_write" on storage.objects
  for insert with check (bucket_id = 'site-assets' and public.has_role(array['admin', 'superadmin']));

create policy "site_assets_admin_update" on storage.objects
  for update using (bucket_id = 'site-assets' and public.has_role(array['admin', 'superadmin']));

create policy "site_assets_admin_delete" on storage.objects
  for delete using (bucket_id = 'site-assets' and public.has_role(array['admin', 'superadmin']));
