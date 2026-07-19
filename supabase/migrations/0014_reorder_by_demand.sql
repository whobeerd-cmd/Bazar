-- ============================================================================
-- Bazar — Миграция 0014: порядок разделов по реальному спросу
-- ============================================================================
-- Сверено со структурой berkat.ru (число объявлений в каждом их разделе —
-- реальный сигнал спроса в этом регионе), но это не копирование: часть
-- названий и группировки у нас своя, добавлены только те подразделы,
-- которых нам реально не хватало.

-- ----------------------------------------------------------------------------
-- Разделы верхнего уровня
-- ----------------------------------------------------------------------------
update public.categories set sort_order = 10 where slug = 'avtomobili';
update public.categories set sort_order = 20 where slug = 'telefony';
update public.categories set sort_order = 30 where slug = 'nedvizhimost';
update public.categories set sort_order = 40 where slug = 'rabota';
update public.categories set sort_order = 50 where slug = 'uslugi';
update public.categories set sort_order = 60 where slug = 'selskoe-hozyaystvo';
update public.categories set sort_order = 70 where slug = 'bytovaya-tehnika';
update public.categories set sort_order = 80 where slug = 'mebel';
update public.categories set sort_order = 90 where slug = 'stroymaterialy';
update public.categories set sort_order = 100 where slug = 'odezhda';
update public.categories set sort_order = 110 where slug = 'obuv';
update public.categories set sort_order = 120 where slug = 'dlya-detey';
update public.categories set sort_order = 130 where slug = 'kompyutery';
update public.categories set sort_order = 140 where slug = 'elektronika';
update public.categories set sort_order = 150 where slug = 'dom-i-sad';
update public.categories set sort_order = 160 where slug = 'sport';
update public.categories set sort_order = 170 where slug = 'hobbi';
update public.categories set sort_order = 180 where slug = 'biznes';
update public.categories set sort_order = 190 where slug = 'otdam-darom';

-- Недвижимость
update public.categories set sort_order = 10 where slug = 'kvartiry';
update public.categories set sort_order = 20 where slug = 'zemelnye-uchastki';
update public.categories set sort_order = 30 where slug = 'doma';
update public.categories set sort_order = 40 where slug = 'kommercheskaya-nedvizhimost';
update public.categories set sort_order = 50 where slug = 'garazhi-i-parkovki';

-- Автомобили
update public.categories set sort_order = 10 where slug = 'legkovye-avtomobili';
update public.categories set sort_order = 20 where slug = 'avtozapchasti';
update public.categories set sort_order = 30 where slug = 'avtouslugi';
update public.categories set sort_order = 40 where slug = 'shiny-i-diski';
update public.categories set sort_order = 50 where slug = 'gruzoviki-i-spetstehnika';
update public.categories set sort_order = 60 where slug = 'mototransport';

-- Работа — ищущих работу заметно больше, чем вакансий
update public.categories set sort_order = 10 where slug = 'ischu-rabotu';
update public.categories set sort_order = 20 where slug = 'vakansii';

-- Услуги
update public.categories set sort_order = 10 where slug = 'remont-i-stroitelstvo';
update public.categories set sort_order = 20 where slug = 'gruzoperevozki';
update public.categories set sort_order = 30 where slug = 'prazdniki-i-meropriyatiya';
update public.categories set sort_order = 40 where slug = 'krasota-i-zdorove';
update public.categories set sort_order = 50 where slug = 'obuchenie-i-repetitorstvo';
update public.categories set sort_order = 60 where slug = 'yuridicheskie-i-finansovye';
update public.categories set sort_order = 65 where slug = 'remont-bytovoy-tehniki';
update public.categories set sort_order = 70 where slug = 'prochie-uslugi';

-- Телефоны
update public.categories set sort_order = 10 where slug = 'smartfony';
update public.categories set sort_order = 20 where slug = 'remont-telefonov';
update public.categories set sort_order = 30 where slug = 'sim-karty';
update public.categories set sort_order = 40 where slug = 'aksessuary-dlya-telefonov';

-- Компьютеры
update public.categories set sort_order = 10 where slug = 'nastolnye-pk';
update public.categories set sort_order = 20 where slug = 'igrovye-pristavki';
update public.categories set sort_order = 30 where slug = 'komplektuyuschie';
update public.categories set sort_order = 40 where slug = 'noutbuki';
update public.categories set sort_order = 50 where slug = 'orgtehnika';
update public.categories set sort_order = 60 where slug = 'planshety';

-- Электроника
update public.categories set sort_order = 10 where slug = 'videonablyudenie';
update public.categories set sort_order = 20 where slug = 'audio-i-video';
update public.categories set sort_order = 30 where slug = 'fototehnika';
update public.categories set sort_order = 40 where slug = 'umnye-chasy-i-gadzhety';
update public.categories set sort_order = 50 where slug = 'akkaunty-i-cifrovye-tovary';

-- Бытовая техника
update public.categories set sort_order = 10 where slug = 'televizory';
update public.categories set sort_order = 20 where slug = 'melkaya-tehnika';
update public.categories set sort_order = 30 where slug = 'kondicionery';
update public.categories set sort_order = 40 where slug = 'holodilniki';
update public.categories set sort_order = 50 where slug = 'stiralnye-mashiny';

-- Одежда / Обувь — женское активнее мужского на конкурентном сайте
update public.categories set sort_order = 10 where slug = 'zhenskaya-odezhda';
update public.categories set sort_order = 20 where slug = 'muzhskaya-odezhda';
update public.categories set sort_order = 30 where slug = 'odezhda-aksessuary';
update public.categories set sort_order = 10 where slug = 'zhenskaya-obuv';
update public.categories set sort_order = 20 where slug = 'muzhskaya-obuv';
update public.categories set sort_order = 30 where slug = 'detskaya-obuv';

-- Сельское хозяйство — животные явно на первом месте по спросу
update public.categories set sort_order = 10 where slug = 'zhivotnye';
update public.categories set sort_order = 20 where slug = 'ptitsy';
update public.categories set sort_order = 30 where slug = 'korma';
update public.categories set sort_order = 40 where slug = 'selhozoborudovanie';
update public.categories set sort_order = 50 where slug = 'rasteniya-selhoz';
update public.categories set sort_order = 60 where slug = 'pchely';

-- Стройматериалы
update public.categories set sort_order = 10 where slug = 'santehnika';
update public.categories set sort_order = 20 where slug = 'otdelochnye-materialy';
update public.categories set sort_order = 30 where slug = 'elektrika';
update public.categories set sort_order = 40 where slug = 'instrumenty';
update public.categories set sort_order = 50 where slug = 'dveri-i-okna';

-- Мебель
update public.categories set sort_order = 10 where slug = 'dlya-spalni';
update public.categories set sort_order = 20 where slug = 'dlya-kuhni';
update public.categories set sort_order = 30 where slug = 'dlya-gostinoy';
update public.categories set sort_order = 40 where slug = 'ofisnaya-mebel';
update public.categories set sort_order = 50 where slug = 'dlya-vannoy';
update public.categories set sort_order = 60 where slug = 'sborka-i-remont-mebeli';
update public.categories set sort_order = 70 where slug = 'drugaya-mebel';

-- Спорт
update public.categories set sort_order = 10 where slug = 'velosipedy';
update public.categories set sort_order = 20 where slug = 'ohota-i-rybalka';
update public.categories set sort_order = 30 where slug = 'trenazhery';
update public.categories set sort_order = 40 where slug = 'sportivnaya-odezhda';
update public.categories set sort_order = 50 where slug = 'turizm';

-- ----------------------------------------------------------------------------
-- Подразделы с реальным спросом, которых у нас не хватало — со своими
-- формулировками, не дословно как у конкурента
-- ----------------------------------------------------------------------------
insert into public.categories (parent_id, name, slug, sort_order) values
  ((select id from public.categories where slug = 'elektronika'), 'Спутниковое телевидение', 'sputnikovoe-tv', 25),
  ((select id from public.categories where slug = 'dom-i-sad'), 'Подарки и сувениры', 'podarki-i-suveniry', 15),
  ((select id from public.categories where slug = 'selskoe-hozyaystvo'), 'Продукты питания', 'produkty-pitaniya', 45)
on conflict (slug) do nothing;
