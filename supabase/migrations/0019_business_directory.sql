-- ============================================================================
-- Bazar — Миграция 0019: Бизнес-справочник
-- Отдельный от объявлений раздел: бизнесы регистрируются сами, публикуются
-- сразу (как и объявления), пользователи оставляют рейтинг и отзывы.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- КАТЕГОРИИ БИЗНЕСОВ — плоский список, без вложенности
-- ----------------------------------------------------------------------------
create table public.business_categories (
  id serial primary key,
  name text not null,
  slug text not null unique,
  sort_order integer not null default 0,
  is_active boolean not null default true
);

insert into public.business_categories (name, slug, sort_order) values
  ('Кафе и рестораны', 'kafe-i-restorany', 10),
  ('Продуктовые магазины', 'produktovye-magaziny', 20),
  ('Стройматериалы и ремонт', 'stroymaterialy-i-remont-biznes', 30),
  ('Одежда и обувь', 'odezhda-i-obuv-biznes', 40),
  ('Красота и здоровье', 'krasota-i-zdorove-biznes', 50),
  ('Медицина и аптеки', 'medicina-i-apteki', 60),
  ('Автосервисы и автомойки', 'avtoservisy', 70),
  ('Мебель и интерьер', 'mebel-i-interer-biznes', 80),
  ('Электроника и техника', 'elektronika-biznes', 90),
  ('Образование и кружки', 'obrazovanie-i-kruzhki', 100),
  ('Госуслуги и финансы', 'gosuslugi-i-finansy', 110),
  ('Гостиницы и туризм', 'gostinicy-i-turizm', 120),
  ('Развлечения и досуг', 'razvlecheniya-i-dosug', 130),
  ('Спорт и фитнес', 'sport-i-fitnes-biznes', 140),
  ('Свадьбы и мероприятия', 'svadby-i-meropriyatiya', 150),
  ('Другое', 'drugoe-biznes', 160)
on conflict (slug) do nothing;

-- ----------------------------------------------------------------------------
-- БИЗНЕСЫ
-- ----------------------------------------------------------------------------
create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  category_id integer not null references public.business_categories(id),
  name text not null,
  slug text not null unique,
  description text not null default '',
  city_id integer references public.cities(id),
  address_text text,
  lat numeric(9, 6),
  lng numeric(9, 6),
  phone text,
  whatsapp text,
  instagram text,
  website text,
  cover_image_url text,
  logo_url text,
  hours jsonb not null default '{}'::jsonb,
  status text not null default 'active' check (status in ('active', 'hidden', 'archived')),
  is_verified boolean not null default false,
  is_featured boolean not null default false,
  rating_avg numeric(3, 2) not null default 0,
  rating_count integer not null default 0,
  views_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index businesses_owner_id_idx on public.businesses (owner_id);
create index businesses_category_id_idx on public.businesses (category_id);
create index businesses_city_id_idx on public.businesses (city_id);
create index businesses_status_idx on public.businesses (status);

create trigger businesses_set_updated_at
  before update on public.businesses
  for each row execute function public.set_updated_at();

-- ЧПУ-адрес — тот же принцип, что и у объявлений (transliterate_ru уже есть).
create or replace function public.generate_business_slug()
returns trigger as $$
declare
  base_slug text;
begin
  if new.slug is not null and new.slug <> '' then
    return new;
  end if;

  base_slug := public.transliterate_ru(coalesce(new.name, 'biznes'));
  base_slug := regexp_replace(base_slug, '[^a-z0-9]+', '-', 'g');
  base_slug := trim(both '-' from base_slug);
  if base_slug = '' then
    base_slug := 'biznes';
  end if;

  new.slug := left(base_slug, 60) || '-' || substr(new.id::text, 1, 8);
  return new;
end;
$$ language plpgsql;

create trigger businesses_generate_slug
  before insert on public.businesses
  for each row execute function public.generate_business_slug();

-- ----------------------------------------------------------------------------
-- ФОТО БИЗНЕСА (галерея)
-- ----------------------------------------------------------------------------
create table public.business_images (
  id bigserial primary key,
  business_id uuid not null references public.businesses(id) on delete cascade,
  url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index business_images_business_id_idx on public.business_images (business_id);

-- Денормализация обложки — тот же паттерн, что sync_listing_cover_image.
create or replace function public.sync_business_cover_image()
returns trigger as $$
declare
  target_business_id uuid := coalesce(new.business_id, old.business_id);
begin
  update public.businesses
  set cover_image_url = (
    select url from public.business_images
    where business_id = target_business_id
    order by sort_order
    limit 1
  )
  where id = target_business_id;
  return null;
end;
$$ language plpgsql security definer set search_path = public;

create trigger business_images_sync_cover
  after insert or update or delete on public.business_images
  for each row execute function public.sync_business_cover_image();

-- ----------------------------------------------------------------------------
-- ОТЗЫВЫ И РЕЙТИНГ
-- ----------------------------------------------------------------------------
create table public.business_reviews (
  id bigserial primary key,
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  body text,
  owner_reply text,
  owner_replied_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, user_id)
);

create index business_reviews_business_id_idx on public.business_reviews (business_id);

create trigger business_reviews_set_updated_at
  before update on public.business_reviews
  for each row execute function public.set_updated_at();

create or replace function public.sync_business_rating()
returns trigger as $$
declare
  target_business_id uuid := coalesce(new.business_id, old.business_id);
begin
  update public.businesses
  set
    rating_avg = coalesce((select round(avg(rating), 2) from public.business_reviews where business_id = target_business_id), 0),
    rating_count = (select count(*) from public.business_reviews where business_id = target_business_id)
  where id = target_business_id;
  return null;
end;
$$ language plpgsql security definer set search_path = public;

create trigger business_reviews_sync_rating
  after insert or update or delete on public.business_reviews
  for each row execute function public.sync_business_rating();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
alter table public.business_categories enable row level security;
alter table public.businesses enable row level security;
alter table public.business_images enable row level security;
alter table public.business_reviews enable row level security;

create policy "business_categories_select_all" on public.business_categories
  for select using (true);

create policy "business_categories_staff_manage" on public.business_categories
  for all using (public.has_role(array['admin', 'superadmin']))
  with check (public.has_role(array['admin', 'superadmin']));

-- businesses: публично видны активные; владелец и модерация видят/правят все свои/на проверке
create policy "businesses_select_public_or_owner_or_staff" on public.businesses
  for select using (
    status = 'active'
    or auth.uid() = owner_id
    or public.has_role(array['admin', 'superadmin', 'moderator'])
  );

create policy "businesses_insert_own" on public.businesses
  for insert with check (auth.uid() = owner_id);

create policy "businesses_update_own_or_staff" on public.businesses
  for update using (
    auth.uid() = owner_id
    or public.has_role(array['admin', 'superadmin', 'moderator'])
  );

create policy "businesses_delete_own_or_staff" on public.businesses
  for delete using (
    auth.uid() = owner_id
    or public.has_role(array['admin', 'superadmin'])
  );

-- business_images: видимость/запись зависят от родительского бизнеса
create policy "business_images_select" on public.business_images
  for select using (
    exists (
      select 1 from public.businesses b
      where b.id = business_images.business_id
        and (b.status = 'active' or b.owner_id = auth.uid() or public.has_role(array['admin', 'superadmin', 'moderator']))
    )
  );

create policy "business_images_owner_write" on public.business_images
  for all using (
    exists (
      select 1 from public.businesses b
      where b.id = business_images.business_id
        and (b.owner_id = auth.uid() or public.has_role(array['admin', 'superadmin', 'moderator']))
    )
  )
  with check (
    exists (
      select 1 from public.businesses b
      where b.id = business_images.business_id
        and (b.owner_id = auth.uid() or public.has_role(array['admin', 'superadmin', 'moderator']))
    )
  );

-- business_reviews: отзывы видны всем; писать может любой авторизованный (кроме
-- владельца бизнеса — проверяется в server action), редактировать — только
-- свой отзыв автором или сам бизнес (для owner_reply — разграничение по
-- колонкам делает server action, не RLS).
create policy "business_reviews_select_all" on public.business_reviews
  for select using (true);

create policy "business_reviews_insert_own" on public.business_reviews
  for insert with check (auth.uid() = user_id);

create policy "business_reviews_update_own_or_business_owner" on public.business_reviews
  for update using (
    auth.uid() = user_id
    or exists (select 1 from public.businesses b where b.id = business_reviews.business_id and b.owner_id = auth.uid())
    or public.has_role(array['admin', 'superadmin', 'moderator'])
  );

create policy "business_reviews_delete_own_or_staff" on public.business_reviews
  for delete using (
    auth.uid() = user_id
    or public.has_role(array['admin', 'superadmin', 'moderator'])
  );
