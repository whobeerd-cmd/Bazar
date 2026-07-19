-- ============================================================================
-- Bazar — Миграция 0016: фото не всегда обязательны
-- ============================================================================
-- Раньше фото требовались перед публикацией любого объявления. Это ломает
-- реальные сценарии: "Сниму квартиру" / "Куплю" — человек ищет, а не
-- предлагает, фотографировать нечего; вакансия/резюме и большинство услуг —
-- тоже не про фото товара.

alter table public.categories add column if not exists requires_photo boolean not null default true;

update public.categories set requires_photo = false
where slug in (
  'rabota', 'vakansii', 'ischu-rabotu',
  'uslugi', 'remont-i-stroitelstvo', 'gruzoperevozki', 'prazdniki-i-meropriyatiya',
  'krasota-i-zdorove', 'obuchenie-i-repetitorstvo', 'yuridicheskie-i-finansovye',
  'remont-bytovoy-tehniki', 'avtouslugi', 'prochie-uslugi', 'it-uslugi',
  'delovoe-partnerstvo'
);
