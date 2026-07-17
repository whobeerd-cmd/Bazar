-- ============================================================================
-- ING MARKET — Миграция 0006: Поиск и фильтры
-- Полнотекстовый поиск по объявлениям (русская конфигурация), денормализация
-- обложки/наличия видео (чтобы карточки в списках не требовали лишних join'ов).
-- ============================================================================

alter table public.listings add column search_vector tsvector;
alter table public.listings add column cover_image_url text;
alter table public.listings add column has_video boolean not null default false;

-- ----------------------------------------------------------------------------
-- Полнотекстовый поиск: search_vector обновляется триггером при изменении
-- заголовка/описания; используем 'russian' конфигурацию для нормальной
-- работы со словоформами.
-- ----------------------------------------------------------------------------
create or replace function public.listings_update_search_vector()
returns trigger as $$
begin
  new.search_vector := to_tsvector('russian', coalesce(new.title, '') || ' ' || coalesce(new.description, ''));
  return new;
end;
$$ language plpgsql;

create trigger listings_search_vector_trigger
  before insert or update of title, description on public.listings
  for each row execute function public.listings_update_search_vector();

create index listings_search_vector_idx on public.listings using gin (search_vector);

-- pg_trgm-индекс на заголовок — на случай опечаток/частичного совпадения,
-- когда полнотекстовый поиск ничего не находит (используется в коде как fallback).
create index listings_title_trgm_idx on public.listings using gin (title gin_trgm_ops);

-- ----------------------------------------------------------------------------
-- Денормализация: обложка объявления (первое фото по sort_order) и признак
-- "есть видео" — чтобы карточки в каталоге не тянули отдельный запрос на
-- listing_images/listing_videos для каждого объявления.
-- ----------------------------------------------------------------------------
create or replace function public.sync_listing_cover_image()
returns trigger as $$
declare
  target_listing_id uuid := coalesce(new.listing_id, old.listing_id);
begin
  update public.listings
  set cover_image_url = (
    select url from public.listing_images
    where listing_id = target_listing_id
    order by sort_order
    limit 1
  )
  where id = target_listing_id;
  return null;
end;
$$ language plpgsql security definer set search_path = public;

create trigger listing_images_sync_cover
  after insert or update or delete on public.listing_images
  for each row execute function public.sync_listing_cover_image();

create or replace function public.sync_listing_has_video()
returns trigger as $$
declare
  target_listing_id uuid := coalesce(new.listing_id, old.listing_id);
begin
  update public.listings
  set has_video = exists (select 1 from public.listing_videos where listing_id = target_listing_id)
  where id = target_listing_id;
  return null;
end;
$$ language plpgsql security definer set search_path = public;

create trigger listing_videos_sync_has_video
  after insert or delete on public.listing_videos
  for each row execute function public.sync_listing_has_video();
