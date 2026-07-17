-- ============================================================================
-- Bazar — начальные данные
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Городские округа и районы Республики Ингушетия (9 шт., по данным ОКТМО).
-- Для уже существующей базы, где применялась старая версия этого файла,
-- см. supabase/migrations/0008_update_geo_data.sql — там та же актуализация
-- сделана через upsert, без потери существующих ссылок на города.
-- ----------------------------------------------------------------------------
insert into public.regions (name) values
  ('Городской округ город Назрань'),
  ('Городской округ город Сунжа'),
  ('Городской округ город Карабулак'),
  ('Городской округ город Малгобек'),
  ('Городской округ город Магас'),
  ('Назрановский район'),
  ('Малгобекский район'),
  ('Сунженский район'),
  ('Джейрахский район');

-- ----------------------------------------------------------------------------
-- Населённые пункты (источник: geoadm.com со ссылкой на ОКТМО/перепись).
-- Координаты сёл Джейрахского района и части малых сёл — приблизительные
-- (по центру населённого пункта); для MVP этого достаточно, точная привязка
-- понадобится только для модуля карты — перепроверить перед этим.
-- ----------------------------------------------------------------------------
insert into public.cities (region_id, name, type, lat, lng) values
  ((select id from public.regions where name = 'Городской округ город Назрань'), 'Назрань', 'город', 43.2199, 44.7686),
  ((select id from public.regions where name = 'Городской округ город Сунжа'), 'Сунжа', 'город', 43.2965, 44.9469),
  ((select id from public.regions where name = 'Городской округ город Карабулак'), 'Карабулак', 'город', 43.3122, 44.9092),
  ((select id from public.regions where name = 'Городской округ город Малгобек'), 'Малгобек', 'город', 43.5147, 44.5561),
  ((select id from public.regions where name = 'Городской округ город Магас'), 'Магас', 'город', 43.1590, 44.8072),
  ((select id from public.regions where name = 'Сунженский район'), 'Нестеровская', 'станица', 43.3167, 44.8333),
  ((select id from public.regions where name = 'Сунженский район'), 'Троицкая', 'станица', 43.2333, 45.0333),
  ((select id from public.regions where name = 'Назрановский район'), 'Кантышево', 'село', 43.2853, 44.8722),
  ((select id from public.regions where name = 'Назрановский район'), 'Экажево', 'село', 43.2242, 44.8386),
  ((select id from public.regions where name = 'Назрановский район'), 'Плиево', 'село', 43.2504, 44.8281),
  ((select id from public.regions where name = 'Назрановский район'), 'Сурхахи', 'село', 43.2506, 44.9053),
  ((select id from public.regions where name = 'Назрановский район'), 'Барсуки', 'село', 43.2306, 44.7139),
  ((select id from public.regions where name = 'Малгобекский район'), 'Сагопши', 'село', 43.4833, 44.6333),
  ((select id from public.regions where name = 'Назрановский район'), 'Яндаре', 'село', 43.2039, 44.7911),
  ((select id from public.regions where name = 'Малгобекский район'), 'Верхние Ачалуки', 'село', 43.4222, 44.6394),
  ((select id from public.regions where name = 'Сунженский район'), 'Галашки', 'село', 43.1667, 45.0333),
  ((select id from public.regions where name = 'Назрановский район'), 'Долаково', 'село', 43.2739, 44.8067),
  ((select id from public.regions where name = 'Малгобекский район'), 'Инарки', 'село', 43.4667, 44.5667),
  ((select id from public.regions where name = 'Назрановский район'), 'Али-Юрт', 'село', 43.2500, 44.7167),
  ((select id from public.regions where name = 'Малгобекский район'), 'Пседах', 'село', 43.5850, 44.4181),
  ((select id from public.regions where name = 'Малгобекский район'), 'Нижние Ачалуки', 'село', 43.4444, 44.6167),
  ((select id from public.regions where name = 'Малгобекский район'), 'Зязиков-Юрт', 'село', 43.5333, 44.6667),
  ((select id from public.regions where name = 'Сунженский район'), 'Алхасты', 'село', 43.1972, 45.0500),
  ((select id from public.regions where name = 'Малгобекский район'), 'Новый Редант', 'село', 43.5333, 44.5000),
  ((select id from public.regions where name = 'Малгобекский район'), 'Средние Ачалуки', 'село', 43.4333, 44.6250),
  ((select id from public.regions where name = 'Сунженский район'), 'Мужичи', 'село', 43.2167, 45.1000),
  ((select id from public.regions where name = 'Малгобекский район'), 'Вознесенская', 'станица', 43.5978, 44.5850),
  ((select id from public.regions where name = 'Назрановский район'), 'Гази-Юрт', 'село', 43.2611, 44.7444),
  ((select id from public.regions where name = 'Джейрахский район'), 'Джейрах', 'село', 42.7278, 44.8236),
  ((select id from public.regions where name = 'Сунженский район'), 'Аршты', 'село', 43.1000, 45.1667),
  ((select id from public.regions where name = 'Малгобекский район'), 'Аки-Юрт', 'село', 43.3667, 44.7333),
  ((select id from public.regions where name = 'Сунженский район'), 'Алкун', 'село', 43.0167, 45.0167),
  ((select id from public.regions where name = 'Сунженский район'), 'Чемульга', 'село', 43.0333, 45.0667),
  ((select id from public.regions where name = 'Малгобекский район'), 'Южное', 'село', 43.4667, 44.5000),
  ((select id from public.regions where name = 'Малгобекский район'), 'Вежарий', 'село', 43.5000, 44.5333),
  ((select id from public.regions where name = 'Сунженский район'), 'Берд-Юрт', 'село', 43.2833, 44.9667),
  ((select id from public.regions where name = 'Джейрахский район'), 'Ольгети', 'село', 42.7500, 44.7500),
  ((select id from public.regions where name = 'Джейрахский район'), 'Гули', 'село', 42.7167, 44.8000),
  ((select id from public.regions where name = 'Джейрахский район'), 'Ляжги', 'село', 42.7333, 44.8500),
  ((select id from public.regions where name = 'Сунженский район'), 'Даттых', 'село', 43.0500, 45.2000),
  ((select id from public.regions where name = 'Назрановский район'), 'Гейрбек-Юрт', 'село', 43.2444, 44.7583),
  ((select id from public.regions where name = 'Джейрахский район'), 'Армхи', 'село', 42.7167, 44.7833),
  ((select id from public.regions where name = 'Джейрахский район'), 'Бейни', 'село', 42.6833, 44.8167),
  ((select id from public.regions where name = 'Джейрахский район'), 'Таргим', 'село', 42.7000, 44.8667),
  ((select id from public.regions where name = 'Джейрахский район'), 'Лейми', 'село', 42.6944, 44.8722),
  ((select id from public.regions where name = 'Джейрахский район'), 'Эгикхал', 'село', 42.7333, 44.8833),
  ((select id from public.regions where name = 'Джейрахский район'), 'Пялинг', 'село', 42.7500, 44.9000),
  ((select id from public.regions where name = 'Джейрахский район'), 'Шоани', 'село', 42.7167, 44.9167);

-- ----------------------------------------------------------------------------
-- Категории верхнего уровня + подкатегории (по образцу berkat.ru — см.
-- supabase/migrations/0010_expand_categories.sql для той же логики на уже
-- существующей базе).
-- ----------------------------------------------------------------------------
insert into public.categories (name, slug, sort_order) values
  ('Недвижимость', 'nedvizhimost', 10),
  ('Автомобили', 'avtomobili', 20),
  ('Работа', 'rabota', 30),
  ('Услуги', 'uslugi', 40),
  ('Телефоны', 'telefony', 50),
  ('Компьютеры', 'kompyutery', 60),
  ('Электроника', 'elektronika', 70),
  ('Бытовая техника', 'bytovaya-tehnika', 80),
  ('Одежда', 'odezhda', 90),
  ('Обувь', 'obuv', 100),
  ('Для детей', 'dlya-detey', 110),
  ('Дом и сад', 'dom-i-sad', 120),
  ('Животные', 'zhivotnye', 130),
  ('Стройматериалы', 'stroymaterialy', 140),
  ('Мебель', 'mebel', 150),
  ('Хобби', 'hobbi', 160),
  ('Спорт', 'sport', 170),
  ('Бизнес', 'biznes', 180),
  ('Отдам даром', 'otdam-darom', 190);

-- "Сельское хозяйство" + перенос "Животные" в его подразделы
insert into public.categories (name, slug, sort_order) values
  ('Сельское хозяйство', 'selskoe-hozyaystvo', 130)
on conflict (slug) do nothing;

update public.categories set parent_id = (select id from public.categories where slug = 'selskoe-hozyaystvo')
where slug = 'zhivotnye';

insert into public.categories (parent_id, name, slug, sort_order) values
  ((select id from public.categories where slug = 'selskoe-hozyaystvo'), 'Птицы', 'ptitsy', 20),
  ((select id from public.categories where slug = 'selskoe-hozyaystvo'), 'Корма', 'korma', 30),
  ((select id from public.categories where slug = 'selskoe-hozyaystvo'), 'Растения', 'rasteniya-selhoz', 40),
  ((select id from public.categories where slug = 'selskoe-hozyaystvo'), 'Пчёлы', 'pchely', 50),
  ((select id from public.categories where slug = 'selskoe-hozyaystvo'), 'Сельхозоборудование', 'selhozoborudovanie', 60),

  ((select id from public.categories where slug = 'nedvizhimost'), 'Квартиры', 'kvartiry', 10),
  ((select id from public.categories where slug = 'nedvizhimost'), 'Дома', 'doma', 20),
  ((select id from public.categories where slug = 'nedvizhimost'), 'Земельные участки', 'zemelnye-uchastki', 30),
  ((select id from public.categories where slug = 'nedvizhimost'), 'Коммерческая недвижимость', 'kommercheskaya-nedvizhimost', 40),

  ((select id from public.categories where slug = 'avtomobili'), 'Легковые автомобили', 'legkovye-avtomobili', 10),
  ((select id from public.categories where slug = 'avtomobili'), 'Грузовики и спецтехника', 'gruzoviki-i-spetstehnika', 20),
  ((select id from public.categories where slug = 'avtomobili'), 'Мототранспорт', 'mototransport', 30),
  ((select id from public.categories where slug = 'avtomobili'), 'Запчасти и аксессуары', 'avtozapchasti', 40),
  ((select id from public.categories where slug = 'avtomobili'), 'Шины и диски', 'shiny-i-diski', 50),
  ((select id from public.categories where slug = 'avtomobili'), 'Автоуслуги', 'avtouslugi', 60),

  ((select id from public.categories where slug = 'rabota'), 'Вакансии', 'vakansii', 10),
  ((select id from public.categories where slug = 'rabota'), 'Ищу работу', 'ischu-rabotu', 20),

  ((select id from public.categories where slug = 'uslugi'), 'Ремонт и строительство', 'remont-i-stroitelstvo', 10),
  ((select id from public.categories where slug = 'uslugi'), 'Красота и здоровье', 'krasota-i-zdorove', 20),
  ((select id from public.categories where slug = 'uslugi'), 'Обучение и репетиторство', 'obuchenie-i-repetitorstvo', 30),
  ((select id from public.categories where slug = 'uslugi'), 'Праздники и мероприятия', 'prazdniki-i-meropriyatiya', 40),
  ((select id from public.categories where slug = 'uslugi'), 'Юридические и финансовые', 'yuridicheskie-i-finansovye', 50),
  ((select id from public.categories where slug = 'uslugi'), 'Грузоперевозки', 'gruzoperevozki', 60),
  ((select id from public.categories where slug = 'uslugi'), 'Прочие услуги', 'prochie-uslugi', 70),

  ((select id from public.categories where slug = 'telefony'), 'Смартфоны', 'smartfony', 10),
  ((select id from public.categories where slug = 'telefony'), 'Аксессуары для телефонов', 'aksessuary-dlya-telefonov', 20),
  ((select id from public.categories where slug = 'telefony'), 'Ремонт и запчасти', 'remont-telefonov', 30),
  ((select id from public.categories where slug = 'telefony'), 'SIM-карты', 'sim-karty', 40),

  ((select id from public.categories where slug = 'kompyutery'), 'Настольные ПК', 'nastolnye-pk', 10),
  ((select id from public.categories where slug = 'kompyutery'), 'Ноутбуки', 'noutbuki', 20),
  ((select id from public.categories where slug = 'kompyutery'), 'Комплектующие', 'komplektuyuschie', 30),
  ((select id from public.categories where slug = 'kompyutery'), 'Оргтехника', 'orgtehnika', 40),
  ((select id from public.categories where slug = 'kompyutery'), 'Игровые приставки', 'igrovye-pristavki', 50),
  ((select id from public.categories where slug = 'kompyutery'), 'Планшеты', 'planshety', 60),

  ((select id from public.categories where slug = 'elektronika'), 'Аудио и видео', 'audio-i-video', 10),
  ((select id from public.categories where slug = 'elektronika'), 'Фототехника', 'fototehnika', 20),
  ((select id from public.categories where slug = 'elektronika'), 'Видеонаблюдение', 'videonablyudenie', 30),
  ((select id from public.categories where slug = 'elektronika'), 'Аккаунты и цифровые товары', 'akkaunty-i-cifrovye-tovary', 40),

  ((select id from public.categories where slug = 'bytovaya-tehnika'), 'Телевизоры', 'televizory', 10),
  ((select id from public.categories where slug = 'bytovaya-tehnika'), 'Холодильники', 'holodilniki', 20),
  ((select id from public.categories where slug = 'bytovaya-tehnika'), 'Стиральные машины', 'stiralnye-mashiny', 30),
  ((select id from public.categories where slug = 'bytovaya-tehnika'), 'Кондиционеры', 'kondicionery', 40),
  ((select id from public.categories where slug = 'bytovaya-tehnika'), 'Мелкая техника', 'melkaya-tehnika', 50),

  ((select id from public.categories where slug = 'odezhda'), 'Мужская одежда', 'muzhskaya-odezhda', 10),
  ((select id from public.categories where slug = 'odezhda'), 'Женская одежда', 'zhenskaya-odezhda', 20),
  ((select id from public.categories where slug = 'obuv'), 'Мужская обувь', 'muzhskaya-obuv', 10),
  ((select id from public.categories where slug = 'obuv'), 'Женская обувь', 'zhenskaya-obuv', 20),
  ((select id from public.categories where slug = 'obuv'), 'Детская обувь', 'detskaya-obuv', 30),

  ((select id from public.categories where slug = 'dlya-detey'), 'Детская одежда и обувь', 'detskaya-odezhda-i-obuv', 10),
  ((select id from public.categories where slug = 'dlya-detey'), 'Игрушки', 'igrushki', 20),
  ((select id from public.categories where slug = 'dlya-detey'), 'Коляски и автокресла', 'kolyaski-i-avtokresla', 30),
  ((select id from public.categories where slug = 'dlya-detey'), 'Детская мебель', 'detskaya-mebel', 40),

  ((select id from public.categories where slug = 'dom-i-sad'), 'Растения и цветы', 'rasteniya-i-cvety', 10),
  ((select id from public.categories where slug = 'dom-i-sad'), 'Посуда и текстиль', 'posuda-i-tekstil', 20),
  ((select id from public.categories where slug = 'dom-i-sad'), 'Освещение и декор', 'osveschenie-i-dekor', 30),

  ((select id from public.categories where slug = 'stroymaterialy'), 'Электрика', 'elektrika', 10),
  ((select id from public.categories where slug = 'stroymaterialy'), 'Сантехника', 'santehnika', 20),
  ((select id from public.categories where slug = 'stroymaterialy'), 'Инструменты', 'instrumenty', 30),
  ((select id from public.categories where slug = 'stroymaterialy'), 'Отделочные материалы', 'otdelochnye-materialy', 40),

  ((select id from public.categories where slug = 'mebel'), 'Для гостиной', 'dlya-gostinoy', 10),
  ((select id from public.categories where slug = 'mebel'), 'Для кухни', 'dlya-kuhni', 20),
  ((select id from public.categories where slug = 'mebel'), 'Для спальни', 'dlya-spalni', 30),
  ((select id from public.categories where slug = 'mebel'), 'Офисная мебель', 'ofisnaya-mebel', 40),
  ((select id from public.categories where slug = 'mebel'), 'Сборка и ремонт мебели', 'sborka-i-remont-mebeli', 50),

  ((select id from public.categories where slug = 'hobbi'), 'Книги', 'knigi', 10),
  ((select id from public.categories where slug = 'hobbi'), 'Музыкальные инструменты', 'muzykalnye-instrumenty', 20),
  ((select id from public.categories where slug = 'hobbi'), 'Коллекционирование', 'kollekcionirovanie', 30),
  ((select id from public.categories where slug = 'hobbi'), 'Рукоделие', 'rukodelie', 40),

  ((select id from public.categories where slug = 'sport'), 'Велосипеды', 'velosipedy', 10),
  ((select id from public.categories where slug = 'sport'), 'Тренажёры', 'trenazhery', 20),
  ((select id from public.categories where slug = 'sport'), 'Спортивная одежда', 'sportivnaya-odezhda', 30),
  ((select id from public.categories where slug = 'sport'), 'Охота и рыбалка', 'ohota-i-rybalka', 40),
  ((select id from public.categories where slug = 'sport'), 'Туризм', 'turizm', 50),

  ((select id from public.categories where slug = 'biznes'), 'Оборудование для бизнеса', 'oborudovanie-dlya-biznesa', 10),
  ((select id from public.categories where slug = 'biznes'), 'Продажа бизнеса', 'prodazha-biznesa', 20),
  ((select id from public.categories where slug = 'biznes'), 'Деловое партнёрство', 'delovoe-partnerstvo', 30)
on conflict (slug) do nothing;
