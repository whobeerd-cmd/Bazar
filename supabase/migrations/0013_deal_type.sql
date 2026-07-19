-- ============================================================================
-- Bazar — Миграция 0013: тип сделки для недвижимости (Продам/Сдам/Куплю/Сниму)
-- ============================================================================
-- Раньше у недвижимости не было способа указать, что именно предлагает автор:
-- продажу, аренду, или наоборот — что он ищет (снять/купить). "Работа" уже
-- решает это через разделение на "Вакансии"/"Ищу работу"; недвижимости такого
-- разделения не хватало вообще.

alter table public.categories add column if not exists show_deal_type boolean not null default false;

update public.categories set show_deal_type = true
where slug in ('nedvizhimost', 'kvartiry', 'doma', 'zemelnye-uchastki', 'kommercheskaya-nedvizhimost', 'garazhi-i-parkovki');

alter table public.listings add column if not exists deal_type text
  check (deal_type in ('sale', 'rent_out', 'buy', 'rent_seek'));

create index if not exists listings_deal_type_idx on public.listings (deal_type);
