-- Разделы "Мастера" делили один список категорий с бизнес-справочником
-- (56 категорий вроде "Автосалоны", "Гостиницы", "Банки и МФО") — для
-- частных специалистов это мешанина, большинство из них — компании, а не
-- деятельность одного человека.
--
-- for_business/for_masters — независимые флаги на той же таблице (не
-- отдельная таблица), чтобы категория могла обслуживать один раздел, оба
-- или ни одного, без дублирования строк и с сохранением всех текущих
-- ссылок business_categories.id у уже созданных бизнесов.

alter table public.business_categories add column if not exists for_business boolean not null default true;
alter table public.business_categories add column if not exists for_masters boolean not null default false;

-- Из существующих категорий действительно подходят частному мастеру:
update public.business_categories set for_masters = true where slug in (
  'remont-i-otdelka',
  'santehnika-i-elektrika',
  'mebel-na-zakaz',
  'remont-tehniki',
  'parikmaherskie-i-barbershopy',
  'salony-krasoty-i-spa',
  'nogtevye-studii',
  'kursy-i-repetitory',
  'avtoshkoly',
  'foto-i-videosyomka',
  'organizaciya-prazdnikov',
  'yuridicheskie-uslugi',
  'buhgalterskie-uslugi',
  'avtoservisy',
  'avtomoyki',
  'shinomontazh',
  'drugoe-biznes'
);

-- Виды услуг, которых среди бизнес-категорий не было вовсе — типичная
-- деятельность частных специалистов.
insert into public.business_categories (name, slug, sort_order, group_label, for_business, for_masters) values
  ('Няни и сиделки', 'nyani-i-sidelki', 2010, 'Дом и быт', false, true),
  ('Клининг и уборка', 'klining-i-uborka', 2020, 'Дом и быт', false, true),
  ('Грузчики и переезды', 'gruzchiki-i-perezdy', 2030, 'Дом и быт', false, true),
  ('Услуги для животных', 'uslugi-dlya-zhivotnyh', 2040, 'Дом и быт', false, true),
  ('Массаж', 'massazh', 2050, 'Красота и здоровье', false, true),
  ('Компьютерная помощь', 'kompyuternaya-pomosch', 2060, 'Техника и электроника', false, true),
  ('Пошив и ремонт одежды', 'poshiv-i-remont-odezhdy', 2070, 'Одежда и украшения', false, true),
  ('Персональные тренеры', 'personalnye-trenery', 2080, 'Развлечения и спорт', false, true)
on conflict (slug) do nothing;
