-- ============================================================================
-- ING MARKET — Миграция 0005: Объявления
-- Таблицы listings/listing_images/listing_videos/listing_attributes,
-- жалобы на объявления, хранилище для фото (bucket listing-media).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Транслитерация кириллицы — для человекочитаемых ЧПУ-адресов объявлений
-- ----------------------------------------------------------------------------
create or replace function public.transliterate_ru(input text)
returns text as $$
declare
  cyr text[] := array['а','б','в','г','д','е','ё','ж','з','и','й','к','л','м','н','о','п','р','с','т','у','ф','х','ц','ч','ш','щ','ъ','ы','ь','э','ю','я'];
  lat text[] := array['a','b','v','g','d','e','e','zh','z','i','y','k','l','m','n','o','p','r','s','t','u','f','h','ts','ch','sh','sch','','y','','e','yu','ya'];
  result text := lower(coalesce(input, ''));
  i int;
begin
  for i in 1..array_length(cyr, 1) loop
    result := replace(result, cyr[i], lat[i]);
  end loop;
  return result;
end;
$$ language plpgsql immutable;

-- ----------------------------------------------------------------------------
-- ОБЪЯВЛЕНИЯ
-- ----------------------------------------------------------------------------
create table public.listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  category_id integer not null references public.categories(id),
  city_id integer references public.cities(id),
  title text not null,
  slug text not null unique,
  description text not null default '',
  price numeric(12, 2),
  price_type text not null default 'fixed' check (price_type in ('fixed', 'negotiable', 'free')),
  condition text not null default 'used' check (condition in ('new', 'used')),
  address_text text,
  lat numeric(9, 6),
  lng numeric(9, 6),
  status text not null default 'draft' check (status in ('draft', 'pending', 'active', 'rejected', 'archived', 'sold')),
  rejection_reason text,
  is_vip boolean not null default false,
  vip_until timestamptz,
  published_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger listings_set_updated_at
  before update on public.listings
  for each row execute function public.set_updated_at();

create index listings_user_id_idx on public.listings (user_id);
create index listings_category_id_idx on public.listings (category_id);
create index listings_city_id_idx on public.listings (city_id);
create index listings_status_idx on public.listings (status);

-- Автогенерация ЧПУ-адреса из заголовка + короткий суффикс id (гарантирует уникальность)
create or replace function public.generate_listing_slug()
returns trigger as $$
declare
  base_slug text;
begin
  if new.slug is not null and new.slug <> '' then
    return new;
  end if;

  base_slug := public.transliterate_ru(coalesce(new.title, 'obyavlenie'));
  base_slug := regexp_replace(base_slug, '[^a-z0-9]+', '-', 'g');
  base_slug := trim(both '-' from base_slug);
  if base_slug = '' then
    base_slug := 'obyavlenie';
  end if;

  new.slug := left(base_slug, 60) || '-' || substr(new.id::text, 1, 8);
  return new;
end;
$$ language plpgsql;

create trigger listings_generate_slug
  before insert on public.listings
  for each row execute function public.generate_listing_slug();

-- Защита статусной машины: обычный пользователь не может сам себе выставить
-- "active"/"rejected" (только модератор/админ) и не может передать объявление
-- другому пользователю или отредактировать причину отклонения.
create or replace function public.enforce_listing_status()
returns trigger as $$
declare
  is_staff boolean := public.has_role(array['admin', 'superadmin', 'moderator']);
begin
  if tg_op = 'INSERT' then
    if not is_staff and new.status not in ('draft', 'pending') then
      new.status := 'draft';
    end if;
    if new.status = 'active' and new.published_at is null then
      new.published_at := now();
    end if;
    return new;
  end if;

  if not is_staff then
    if new.user_id is distinct from old.user_id then
      raise exception 'Нельзя изменить владельца объявления';
    end if;
    if new.status is distinct from old.status and new.status in ('active', 'rejected') then
      raise exception 'Этот статус может выставить только модератор';
    end if;
    new.rejection_reason := old.rejection_reason;
  end if;

  if new.status = 'active' and old.status is distinct from 'active' and new.published_at is null then
    new.published_at := now();
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger listings_enforce_status
  before insert or update on public.listings
  for each row execute function public.enforce_listing_status();

-- ----------------------------------------------------------------------------
-- ФОТО И ВИДЕО ОБЪЯВЛЕНИЯ
-- ----------------------------------------------------------------------------
create table public.listing_images (
  id bigserial primary key,
  listing_id uuid not null references public.listings(id) on delete cascade,
  url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index listing_images_listing_id_idx on public.listing_images (listing_id);

-- Видео — ссылка на внешний хостинг (YouTube/VK Видео), без загрузки файлов в Storage.
create table public.listing_videos (
  id bigserial primary key,
  listing_id uuid not null references public.listings(id) on delete cascade,
  url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index listing_videos_listing_id_idx on public.listing_videos (listing_id);

-- ----------------------------------------------------------------------------
-- ЗНАЧЕНИЯ ДИНАМИЧЕСКИХ АТРИБУТОВ КАТЕГОРИИ ДЛЯ КОНКРЕТНОГО ОБЪЯВЛЕНИЯ
-- ----------------------------------------------------------------------------
create table public.listing_attributes (
  id bigserial primary key,
  listing_id uuid not null references public.listings(id) on delete cascade,
  attribute_id integer not null references public.category_attributes(id) on delete cascade,
  value jsonb not null,
  unique (listing_id, attribute_id)
);

create index listing_attributes_listing_id_idx on public.listing_attributes (listing_id);

-- ----------------------------------------------------------------------------
-- ЖАЛОБЫ НА ОБЪЯВЛЕНИЯ
-- ----------------------------------------------------------------------------
create table public.complaints (
  id bigserial primary key,
  listing_id uuid not null references public.listings(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  reason text not null check (reason in ('prohibited', 'scam', 'duplicate', 'wrong_category', 'other')),
  comment text,
  status text not null default 'new' check (status in ('new', 'reviewed', 'dismissed')),
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index complaints_listing_id_idx on public.complaints (listing_id);
create index complaints_status_idx on public.complaints (status);

-- ----------------------------------------------------------------------------
-- ХРАНИЛИЩЕ ДЛЯ ФОТО ОБЪЯВЛЕНИЙ
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('listing-media', 'listing-media', true, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- Файлы хранятся по пути "{user_id}/{listing_id}/{filename}"
create policy "listing_media_public_read" on storage.objects
  for select using (bucket_id = 'listing-media');

create policy "listing_media_owner_insert" on storage.objects
  for insert with check (
    bucket_id = 'listing-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "listing_media_owner_update" on storage.objects
  for update using (
    bucket_id = 'listing-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "listing_media_owner_delete" on storage.objects
  for delete using (
    bucket_id = 'listing-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
alter table public.listings enable row level security;
alter table public.listing_images enable row level security;
alter table public.listing_videos enable row level security;
alter table public.listing_attributes enable row level security;
alter table public.complaints enable row level security;

-- listings: публично видны активные; владелец и модерация видят вообще все свои/на проверке
create policy "listings_select_public_or_owner_or_staff" on public.listings
  for select using (
    status = 'active'
    or auth.uid() = user_id
    or public.has_role(array['admin', 'superadmin', 'moderator'])
  );

create policy "listings_insert_own" on public.listings
  for insert with check (auth.uid() = user_id);

create policy "listings_update_own_or_staff" on public.listings
  for update using (
    auth.uid() = user_id
    or public.has_role(array['admin', 'superadmin', 'moderator'])
  );

create policy "listings_delete_own_or_staff" on public.listings
  for delete using (
    auth.uid() = user_id
    or public.has_role(array['admin', 'superadmin'])
  );

-- listing_images / listing_videos / listing_attributes: видимость и запись зависят от родительского объявления
create policy "listing_images_select" on public.listing_images
  for select using (
    exists (
      select 1 from public.listings l
      where l.id = listing_images.listing_id
        and (l.status = 'active' or l.user_id = auth.uid() or public.has_role(array['admin', 'superadmin', 'moderator']))
    )
  );

create policy "listing_images_owner_write" on public.listing_images
  for all using (
    exists (
      select 1 from public.listings l
      where l.id = listing_images.listing_id
        and (l.user_id = auth.uid() or public.has_role(array['admin', 'superadmin', 'moderator']))
    )
  )
  with check (
    exists (
      select 1 from public.listings l
      where l.id = listing_images.listing_id
        and (l.user_id = auth.uid() or public.has_role(array['admin', 'superadmin', 'moderator']))
    )
  );

create policy "listing_videos_select" on public.listing_videos
  for select using (
    exists (
      select 1 from public.listings l
      where l.id = listing_videos.listing_id
        and (l.status = 'active' or l.user_id = auth.uid() or public.has_role(array['admin', 'superadmin', 'moderator']))
    )
  );

create policy "listing_videos_owner_write" on public.listing_videos
  for all using (
    exists (
      select 1 from public.listings l
      where l.id = listing_videos.listing_id
        and (l.user_id = auth.uid() or public.has_role(array['admin', 'superadmin', 'moderator']))
    )
  )
  with check (
    exists (
      select 1 from public.listings l
      where l.id = listing_videos.listing_id
        and (l.user_id = auth.uid() or public.has_role(array['admin', 'superadmin', 'moderator']))
    )
  );

create policy "listing_attributes_select" on public.listing_attributes
  for select using (
    exists (
      select 1 from public.listings l
      where l.id = listing_attributes.listing_id
        and (l.status = 'active' or l.user_id = auth.uid() or public.has_role(array['admin', 'superadmin', 'moderator']))
    )
  );

create policy "listing_attributes_owner_write" on public.listing_attributes
  for all using (
    exists (
      select 1 from public.listings l
      where l.id = listing_attributes.listing_id
        and (l.user_id = auth.uid() or public.has_role(array['admin', 'superadmin', 'moderator']))
    )
  )
  with check (
    exists (
      select 1 from public.listings l
      where l.id = listing_attributes.listing_id
        and (l.user_id = auth.uid() or public.has_role(array['admin', 'superadmin', 'moderator']))
    )
  );

-- complaints: подать жалобу может любой авторизованный пользователь на себя;
-- видят свои жалобы + модерация; обрабатывает статус — только модерация
create policy "complaints_insert_own" on public.complaints
  for insert with check (auth.uid() = user_id);

create policy "complaints_select_own_or_staff" on public.complaints
  for select using (auth.uid() = user_id or public.has_role(array['admin', 'superadmin', 'moderator']));

create policy "complaints_staff_update" on public.complaints
  for update using (public.has_role(array['admin', 'superadmin', 'moderator']))
  with check (public.has_role(array['admin', 'superadmin', 'moderator']));
