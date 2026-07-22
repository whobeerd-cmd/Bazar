-- Расширяем список разделов бизнес-справочника: было 16 широких категорий,
-- становится ~56 конкретных — чтобы клиент сразу понимал, где искать, а
-- бизнес — в какой раздел вставать. Без алкоголя, секс-шопов и т.п.
--
-- group_label — просто текстовая метка для группировки в UI (заголовки
-- секций на /business и <optgroup> в форме добавления бизнеса), без
-- отдельной таблицы и self-reference — разделов много, но иерархия им не
-- нужна, сама метка не участвует в фильтрации/маршрутизации.

alter table public.business_categories add column if not exists group_label text;

-- Существующие категории, на которые уже могли сослаться бизнесы, — не
-- удаляем, а уточняем название/группу/порядок на месте.
update public.business_categories set group_label = 'Еда и напитки', sort_order = 10 where slug = 'kafe-i-restorany';
update public.business_categories set group_label = 'Еда и напитки', sort_order = 50 where slug = 'produktovye-magaziny';
update public.business_categories set name = 'Автосервисы', group_label = 'Авто', sort_order = 310 where slug = 'avtoservisy';
update public.business_categories set group_label = 'Стройка и ремонт', sort_order = 460 where slug = 'mebel-i-interer-biznes';
update public.business_categories set group_label = 'Другое', sort_order = 9999 where slug = 'drugoe-biznes';

-- Остальные старые категории были слишком широкими (объединяли несколько
-- разных видов бизнеса в одну) — ни один бизнес на них не ссылается кроме
-- перечисленных выше, поэтому спокойно заменяем более конкретными.
delete from public.business_categories where slug in (
  'stroymaterialy-i-remont-biznes',
  'odezhda-i-obuv-biznes',
  'krasota-i-zdorove-biznes',
  'medicina-i-apteki',
  'elektronika-biznes',
  'obrazovanie-i-kruzhki',
  'gosuslugi-i-finansy',
  'gostinicy-i-turizm',
  'razvlecheniya-i-dosug',
  'sport-i-fitnes-biznes',
  'svadby-i-meropriyatiya'
);

insert into public.business_categories (name, slug, sort_order, group_label) values
  -- Еда и напитки
  ('Кофейни и кондитерские', 'kofeyni-i-konditerskie', 20, 'Еда и напитки'),
  ('Пекарни', 'pekarni', 30, 'Еда и напитки'),
  ('Доставка еды', 'dostavka-edy', 40, 'Еда и напитки'),
  ('Мясные и рыбные лавки', 'myasnye-i-rybnye-lavki', 60, 'Еда и напитки'),

  -- Одежда и украшения
  ('Одежда', 'odezhda', 110, 'Одежда и украшения'),
  ('Обувь', 'obuv-biznes', 120, 'Одежда и украшения'),
  ('Ткани и ателье', 'tkani-i-atelie', 130, 'Одежда и украшения'),
  ('Ювелирные магазины', 'yuvelirnye-magaziny', 140, 'Одежда и украшения'),

  -- Красота и здоровье
  ('Парикмахерские и барбершопы', 'parikmaherskie-i-barbershopy', 210, 'Красота и здоровье'),
  ('Салоны красоты и SPA', 'salony-krasoty-i-spa', 220, 'Красота и здоровье'),
  ('Ногтевые студии', 'nogtevye-studii', 230, 'Красота и здоровье'),
  ('Стоматологии', 'stomatologii', 240, 'Красота и здоровье'),
  ('Медицинские клиники', 'medicinskie-kliniki', 250, 'Красота и здоровье'),
  ('Аптеки', 'apteki', 260, 'Красота и здоровье'),
  ('Оптики', 'optiki', 270, 'Красота и здоровье'),

  -- Авто
  ('Автомойки', 'avtomoyki', 320, 'Авто'),
  ('Шиномонтаж', 'shinomontazh', 330, 'Авто'),
  ('Автозапчасти', 'avtozapchasti', 340, 'Авто'),
  ('Автосалоны', 'avtosalony', 350, 'Авто'),

  -- Стройка и ремонт
  ('Стройматериалы', 'stroymaterialy', 410, 'Стройка и ремонт'),
  ('Ремонт и отделка', 'remont-i-otdelka', 420, 'Стройка и ремонт'),
  ('Сантехника и электрика', 'santehnika-i-elektrika', 430, 'Стройка и ремонт'),
  ('Окна и двери', 'okna-i-dveri', 440, 'Стройка и ремонт'),
  ('Мебель на заказ', 'mebel-na-zakaz', 450, 'Стройка и ремонт'),

  -- Техника и электроника
  ('Электроника и телефоны', 'elektronika-i-telefony', 510, 'Техника и электроника'),
  ('Бытовая техника', 'bytovaya-tehnika-biznes', 520, 'Техника и электроника'),
  ('Ремонт техники', 'remont-tehniki', 530, 'Техника и электроника'),
  ('Компьютеры и оргтехника', 'kompyutery-i-orgtehnika', 540, 'Техника и электроника'),

  -- Дом и быт
  ('Цветы', 'cvety', 610, 'Дом и быт'),
  ('Химчистки и прачечные', 'himchistki-i-prachechnye', 620, 'Дом и быт'),
  ('Ветеринарные клиники и зоомагазины', 'veterinarnye-kliniki-i-zoomagaziny', 630, 'Дом и быт'),

  -- Образование и дети
  ('Детские сады и няни', 'detskie-sady-i-nyani', 710, 'Образование и дети'),
  ('Кружки и секции для детей', 'kruzhki-i-sekcii-dlya-detey', 720, 'Образование и дети'),
  ('Курсы и репетиторы', 'kursy-i-repetitory', 730, 'Образование и дети'),
  ('Автошколы', 'avtoshkoly', 740, 'Образование и дети'),

  -- Финансы и услуги
  ('Банки и МФО', 'banki-i-mfo', 810, 'Финансы и услуги'),
  ('Страхование', 'strahovanie', 820, 'Финансы и услуги'),
  ('Юридические услуги', 'yuridicheskie-uslugi', 830, 'Финансы и услуги'),
  ('Бухгалтерские услуги', 'buhgalterskie-uslugi', 840, 'Финансы и услуги'),
  ('Госуслуги и МФЦ', 'gosuslugi-i-mfc', 850, 'Финансы и услуги'),
  ('Типографии и печать', 'tipografii-i-pechat', 860, 'Финансы и услуги'),

  -- Туризм и гостиницы
  ('Гостиницы и гостевые дома', 'gostinicy-i-gostevye-doma', 910, 'Туризм и гостиницы'),
  ('Турагентства', 'turagentstva', 920, 'Туризм и гостиницы'),

  -- Развлечения и спорт
  ('Развлекательные центры', 'razvlekatelnye-centry', 1010, 'Развлечения и спорт'),
  ('Детские развлечения', 'detskie-razvlecheniya', 1020, 'Развлечения и спорт'),
  ('Спортзалы и фитнес', 'sportzaly-i-fitnes', 1030, 'Развлечения и спорт'),
  ('Бассейны', 'basseyny', 1040, 'Развлечения и спорт'),

  -- Мероприятия
  ('Свадебные салоны', 'svadebnye-salony', 1110, 'Мероприятия'),
  ('Банкетные залы', 'banketnye-zaly', 1120, 'Мероприятия'),
  ('Фото и видеосъёмка', 'foto-i-videosyomka', 1130, 'Мероприятия'),
  ('Организация праздников', 'organizaciya-prazdnikov', 1140, 'Мероприятия')
on conflict (slug) do nothing;
