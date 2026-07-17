-- ============================================================================
-- Bazar — Миграция 0008: актуализация справочника районов/городов
-- Модуль 0 применял неполный список (не хватало городского округа Карабулак
-- и ещё ~35 сёл), а "Сунжа" и "Орджоникидзевская" по ошибке попали как два
-- разных населённых пункта (это старое/новое название одного и того же
-- города). Эта миграция не трогает уже применённую 0001_init.sql — только
-- дополняет и правит данные поверх неё.
-- ============================================================================

-- Уникальность имён — нужна, чтобы дальнейшие upsert'ы по name были
-- идемпотентны, и заодно защита от повторения бага "два имени — один город".
alter table public.regions add constraint regions_name_key unique (name);
alter table public.cities add constraint cities_name_key unique (name);

-- В исходном списке типов не было "станица" (Нестеровская, Троицкая,
-- Вознесенская, Мужичи — казачьи станицы Сунженского/Малгобекского районов).
alter table public.cities drop constraint cities_type_check;
alter table public.cities add constraint cities_type_check
  check (type in ('город', 'село', 'посёлок', 'станица'));

-- ----------------------------------------------------------------------------
-- Городские округа переименованы (официальное наименование — "Городской
-- округ город N", а не просто "Городской округ N"). Меняем имя на месте,
-- чтобы не трогать id и ссылки из cities.region_id.
-- ----------------------------------------------------------------------------
update public.regions set name = 'Городской округ город Назрань' where name = 'Городской округ Назрань';
update public.regions set name = 'Городской округ город Магас' where name = 'Городской округ Магас';
update public.regions set name = 'Городской округ город Малгобек' where name = 'Городской округ Малгобек';

insert into public.regions (name) values
  ('Городской округ город Сунжа'),
  ('Городской округ город Карабулак'),
  ('Назрановский район'),
  ('Малгобекский район'),
  ('Сунженский район'),
  ('Джейрахский район')
on conflict (name) do nothing;

-- ----------------------------------------------------------------------------
-- Станица Орджоникидзевская была в 2015 году переименована и преобразована
-- в город Сунжа — в старом seed'е это по ошибке две разные записи. Переносим
-- все ссылки на старую запись на "Сунжа" и удаляем дубликат.
-- ----------------------------------------------------------------------------
do $$
declare
  old_city_id integer;
  new_city_id integer;
begin
  select id into old_city_id from public.cities where name = 'Орджоникидзевская';
  select id into new_city_id from public.cities where name = 'Сунжа';

  if old_city_id is not null and new_city_id is not null then
    update public.profiles set city_id = new_city_id where city_id = old_city_id;
    update public.listings set city_id = new_city_id where city_id = old_city_id;
    delete from public.cities where id = old_city_id;
  end if;
end $$;

-- Переименование до апсерта ниже, чтобы он попал на существующую запись по name
update public.cities set name = 'Вознесенская', type = 'станица' where name = 'Вознесеновская';

-- ----------------------------------------------------------------------------
-- Актуальный список населённых пунктов (по данным ОКТМО/переписи, источник —
-- geoadm.com). Координаты сёл Джейрахского района и части малых сёл —
-- приблизительные (по центру населённого пункта), для MVP этого достаточно;
-- перепроверить перед тем, как полагаться на них для точной привязки.
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
  ((select id from public.regions where name = 'Джейрахский район'), 'Шоани', 'село', 42.7167, 44.9167)
on conflict (name) do update set
  region_id = excluded.region_id,
  type = excluded.type,
  lat = excluded.lat,
  lng = excluded.lng;
