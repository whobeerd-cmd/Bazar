-- ============================================================================
-- ING MARKET — Миграция 0024: раздел «Мастера»
-- Не отдельная таблица — тот же businesses с дискриминатором type, чтобы
-- переиспользовать фото/отзывы/RLS/модерацию без дублирования. Мастер —
-- физлицо без витрины: специализации, цена «от», опыт, выезд к клиенту
-- вместо часов работы магазина.
-- ============================================================================

alter table public.businesses
  add column type text not null default 'business' check (type in ('business', 'master'));

alter table public.businesses add column specializations text[] not null default '{}';
alter table public.businesses add column price_from numeric;
alter table public.businesses add column experience_years integer;
alter table public.businesses add column house_call boolean not null default false;

create index businesses_type_idx on public.businesses(type);
