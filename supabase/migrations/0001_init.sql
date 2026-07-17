-- ============================================================================
-- ING MARKET — Миграция 0001: фундамент
-- Роли, профили, география (регионы/населённые пункты Ингушетии),
-- категории (с динамическими атрибутами) и настройки сайта (CMS).
-- ============================================================================

create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

-- ----------------------------------------------------------------------------
-- Универсальный триггер обновления updated_at
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ----------------------------------------------------------------------------
-- РОЛИ
-- ----------------------------------------------------------------------------
create table public.roles (
  id serial primary key,
  code text unique not null check (code in ('user', 'verified_seller', 'moderator', 'admin', 'superadmin')),
  name text not null,
  permissions jsonb not null default '{}'::jsonb
);

insert into public.roles (code, name) values
  ('user', 'Пользователь'),
  ('verified_seller', 'Проверенный продавец'),
  ('moderator', 'Модератор'),
  ('admin', 'Администратор'),
  ('superadmin', 'Суперадминистратор');

-- ----------------------------------------------------------------------------
-- ПРОФИЛИ (1:1 к auth.users)
-- ----------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  phone text unique,
  phone_verified boolean not null default false,
  email_verified boolean not null default false,
  city_id integer,
  rating numeric(3, 2) not null default 0,
  is_verified_seller boolean not null default false,
  is_blocked boolean not null default false,
  block_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_seen_at timestamptz
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create table public.user_roles (
  user_id uuid not null references public.profiles(id) on delete cascade,
  role_id integer not null references public.roles(id) on delete cascade,
  primary key (user_id, role_id)
);

-- Автоматическое создание профиля и базовой роли при регистрации пользователя
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email_verified)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email_confirmed_at is not null
  );

  insert into public.user_roles (user_id, role_id)
  select new.id, id from public.roles where code = 'user';

  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- ГЕОГРАФИЯ
-- ----------------------------------------------------------------------------
create table public.regions (
  id serial primary key,
  name text not null
);

create table public.cities (
  id serial primary key,
  region_id integer references public.regions(id) on delete set null,
  name text not null,
  type text not null default 'город' check (type in ('город', 'село', 'посёлок')),
  lat numeric(9, 6),
  lng numeric(9, 6)
);

alter table public.profiles
  add constraint profiles_city_id_fkey foreign key (city_id) references public.cities(id) on delete set null;

create index cities_region_id_idx on public.cities (region_id);

-- ----------------------------------------------------------------------------
-- КАТЕГОРИИ (дерево + динамические атрибуты — редактируются из админки)
-- ----------------------------------------------------------------------------
create table public.categories (
  id serial primary key,
  parent_id integer references public.categories(id) on delete cascade,
  name text not null,
  slug text not null unique,
  icon text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger categories_set_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

create index categories_parent_id_idx on public.categories (parent_id);

create table public.category_attributes (
  id serial primary key,
  category_id integer not null references public.categories(id) on delete cascade,
  name text not null,
  type text not null check (type in ('select', 'number', 'text', 'bool')),
  options jsonb not null default '[]'::jsonb,
  is_filterable boolean not null default true,
  is_required boolean not null default false,
  sort_order integer not null default 0
);

create index category_attributes_category_id_idx on public.category_attributes (category_id);

-- ----------------------------------------------------------------------------
-- НАСТРОЙКИ САЙТА (название, лого, тексты — управляются из админ-панели)
-- ----------------------------------------------------------------------------
create table public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create trigger site_settings_set_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

insert into public.site_settings (key, value) values
  ('site_name', '{"text": "ING MARKET"}'),
  ('site_description', '{"text": "Площадка объявлений Республики Ингушетия"}'),
  ('logo_url', '{"url": null}'),
  ('contact_phone', '{"text": ""}'),
  ('contact_email', '{"text": ""}');

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Вспомогательная функция: проверка, что текущий пользователь имеет одну из ролей
create or replace function public.has_role(required_codes text[])
returns boolean as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = auth.uid()
      and r.code = any(required_codes)
  );
$$ language sql security definer stable;

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.roles enable row level security;
alter table public.regions enable row level security;
alter table public.cities enable row level security;
alter table public.categories enable row level security;
alter table public.category_attributes enable row level security;
alter table public.site_settings enable row level security;

-- profiles: публично видны нечувствительные поля всем, редактирует — только владелец или admin
create policy "profiles_select_all" on public.profiles
  for select using (true);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id or public.has_role(array['admin', 'superadmin']));

create policy "profiles_update_admin" on public.profiles
  for update using (public.has_role(array['admin', 'superadmin']));

-- user_roles: видит только сам пользователь и админы; изменяют — только админы
create policy "user_roles_select_own_or_admin" on public.user_roles
  for select using (auth.uid() = user_id or public.has_role(array['admin', 'superadmin']));

create policy "user_roles_admin_manage" on public.user_roles
  for all using (public.has_role(array['admin', 'superadmin']))
  with check (public.has_role(array['admin', 'superadmin']));

-- справочники: чтение всем, запись — только admin/superadmin
create policy "roles_select_all" on public.roles for select using (true);

create policy "regions_select_all" on public.regions for select using (true);
create policy "regions_admin_write" on public.regions for all
  using (public.has_role(array['admin', 'superadmin']))
  with check (public.has_role(array['admin', 'superadmin']));

create policy "cities_select_all" on public.cities for select using (true);
create policy "cities_admin_write" on public.cities for all
  using (public.has_role(array['admin', 'superadmin']))
  with check (public.has_role(array['admin', 'superadmin']));

create policy "categories_select_active_or_admin" on public.categories
  for select using (is_active or public.has_role(array['admin', 'superadmin', 'moderator']));
create policy "categories_admin_write" on public.categories for all
  using (public.has_role(array['admin', 'superadmin']))
  with check (public.has_role(array['admin', 'superadmin']));

create policy "category_attributes_select_all" on public.category_attributes for select using (true);
create policy "category_attributes_admin_write" on public.category_attributes for all
  using (public.has_role(array['admin', 'superadmin']))
  with check (public.has_role(array['admin', 'superadmin']));

-- site_settings: читают все (нужно для SSR без авторизации), пишут только admin/superadmin
create policy "site_settings_select_all" on public.site_settings for select using (true);
create policy "site_settings_admin_write" on public.site_settings for all
  using (public.has_role(array['admin', 'superadmin']))
  with check (public.has_role(array['admin', 'superadmin']));
