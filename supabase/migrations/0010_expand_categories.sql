-- ============================================================================
-- Bazar — Миграция 0010: расширение категорий подразделами
-- По образцу berkat.ru — у каждого крупного раздела теперь есть подкатегории
-- вместо одного плоского уровня. "Животные" стал подразделом нового
-- "Сельское хозяйство" (как на конкурентном сайте), а не отдельным разделом.
-- ============================================================================

-- Новый раздел "Сельское хозяйство" + перенос "Животные" в его подразделы
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
  ((select id from public.categories where slug = 'selskoe-hozyaystvo'), 'Сельхозоборудование', 'selhozoborudovanie', 60)
on conflict (slug) do nothing;

-- ----------------------------------------------------------------------------
-- Недвижимость
-- ----------------------------------------------------------------------------
insert into public.categories (parent_id, name, slug, sort_order) values
  ((select id from public.categories where slug = 'nedvizhimost'), 'Квартиры', 'kvartiry', 10),
  ((select id from public.categories where slug = 'nedvizhimost'), 'Дома', 'doma', 20),
  ((select id from public.categories where slug = 'nedvizhimost'), 'Земельные участки', 'zemelnye-uchastki', 30),
  ((select id from public.categories where slug = 'nedvizhimost'), 'Коммерческая недвижимость', 'kommercheskaya-nedvizhimost', 40)
on conflict (slug) do nothing;

-- ----------------------------------------------------------------------------
-- Автомобили
-- ----------------------------------------------------------------------------
insert into public.categories (parent_id, name, slug, sort_order) values
  ((select id from public.categories where slug = 'avtomobili'), 'Легковые автомобили', 'legkovye-avtomobili', 10),
  ((select id from public.categories where slug = 'avtomobili'), 'Грузовики и спецтехника', 'gruzoviki-i-spetstehnika', 20),
  ((select id from public.categories where slug = 'avtomobili'), 'Мототранспорт', 'mototransport', 30),
  ((select id from public.categories where slug = 'avtomobili'), 'Запчасти и аксессуары', 'avtozapchasti', 40),
  ((select id from public.categories where slug = 'avtomobili'), 'Шины и диски', 'shiny-i-diski', 50),
  ((select id from public.categories where slug = 'avtomobili'), 'Автоуслуги', 'avtouslugi', 60)
on conflict (slug) do nothing;

-- ----------------------------------------------------------------------------
-- Работа
-- ----------------------------------------------------------------------------
insert into public.categories (parent_id, name, slug, sort_order) values
  ((select id from public.categories where slug = 'rabota'), 'Вакансии', 'vakansii', 10),
  ((select id from public.categories where slug = 'rabota'), 'Ищу работу', 'ischu-rabotu', 20)
on conflict (slug) do nothing;

-- ----------------------------------------------------------------------------
-- Услуги
-- ----------------------------------------------------------------------------
insert into public.categories (parent_id, name, slug, sort_order) values
  ((select id from public.categories where slug = 'uslugi'), 'Ремонт и строительство', 'remont-i-stroitelstvo', 10),
  ((select id from public.categories where slug = 'uslugi'), 'Красота и здоровье', 'krasota-i-zdorove', 20),
  ((select id from public.categories where slug = 'uslugi'), 'Обучение и репетиторство', 'obuchenie-i-repetitorstvo', 30),
  ((select id from public.categories where slug = 'uslugi'), 'Праздники и мероприятия', 'prazdniki-i-meropriyatiya', 40),
  ((select id from public.categories where slug = 'uslugi'), 'Юридические и финансовые', 'yuridicheskie-i-finansovye', 50),
  ((select id from public.categories where slug = 'uslugi'), 'Грузоперевозки', 'gruzoperevozki', 60),
  ((select id from public.categories where slug = 'uslugi'), 'Прочие услуги', 'prochie-uslugi', 70)
on conflict (slug) do nothing;

-- ----------------------------------------------------------------------------
-- Телефоны
-- ----------------------------------------------------------------------------
insert into public.categories (parent_id, name, slug, sort_order) values
  ((select id from public.categories where slug = 'telefony'), 'Смартфоны', 'smartfony', 10),
  ((select id from public.categories where slug = 'telefony'), 'Аксессуары для телефонов', 'aksessuary-dlya-telefonov', 20),
  ((select id from public.categories where slug = 'telefony'), 'Ремонт и запчасти', 'remont-telefonov', 30),
  ((select id from public.categories where slug = 'telefony'), 'SIM-карты', 'sim-karty', 40)
on conflict (slug) do nothing;

-- ----------------------------------------------------------------------------
-- Компьютеры
-- ----------------------------------------------------------------------------
insert into public.categories (parent_id, name, slug, sort_order) values
  ((select id from public.categories where slug = 'kompyutery'), 'Настольные ПК', 'nastolnye-pk', 10),
  ((select id from public.categories where slug = 'kompyutery'), 'Ноутбуки', 'noutbuki', 20),
  ((select id from public.categories where slug = 'kompyutery'), 'Комплектующие', 'komplektuyuschie', 30),
  ((select id from public.categories where slug = 'kompyutery'), 'Оргтехника', 'orgtehnika', 40),
  ((select id from public.categories where slug = 'kompyutery'), 'Игровые приставки', 'igrovye-pristavki', 50),
  ((select id from public.categories where slug = 'kompyutery'), 'Планшеты', 'planshety', 60)
on conflict (slug) do nothing;

-- ----------------------------------------------------------------------------
-- Электроника
-- ----------------------------------------------------------------------------
insert into public.categories (parent_id, name, slug, sort_order) values
  ((select id from public.categories where slug = 'elektronika'), 'Аудио и видео', 'audio-i-video', 10),
  ((select id from public.categories where slug = 'elektronika'), 'Фототехника', 'fototehnika', 20),
  ((select id from public.categories where slug = 'elektronika'), 'Видеонаблюдение', 'videonablyudenie', 30),
  ((select id from public.categories where slug = 'elektronika'), 'Аккаунты и цифровые товары', 'akkaunty-i-cifrovye-tovary', 40)
on conflict (slug) do nothing;

-- ----------------------------------------------------------------------------
-- Бытовая техника
-- ----------------------------------------------------------------------------
insert into public.categories (parent_id, name, slug, sort_order) values
  ((select id from public.categories where slug = 'bytovaya-tehnika'), 'Телевизоры', 'televizory', 10),
  ((select id from public.categories where slug = 'bytovaya-tehnika'), 'Холодильники', 'holodilniki', 20),
  ((select id from public.categories where slug = 'bytovaya-tehnika'), 'Стиральные машины', 'stiralnye-mashiny', 30),
  ((select id from public.categories where slug = 'bytovaya-tehnika'), 'Кондиционеры', 'kondicionery', 40),
  ((select id from public.categories where slug = 'bytovaya-tehnika'), 'Мелкая техника', 'melkaya-tehnika', 50)
on conflict (slug) do nothing;

-- ----------------------------------------------------------------------------
-- Одежда / Обувь
-- ----------------------------------------------------------------------------
insert into public.categories (parent_id, name, slug, sort_order) values
  ((select id from public.categories where slug = 'odezhda'), 'Мужская одежда', 'muzhskaya-odezhda', 10),
  ((select id from public.categories where slug = 'odezhda'), 'Женская одежда', 'zhenskaya-odezhda', 20),
  ((select id from public.categories where slug = 'obuv'), 'Мужская обувь', 'muzhskaya-obuv', 10),
  ((select id from public.categories where slug = 'obuv'), 'Женская обувь', 'zhenskaya-obuv', 20),
  ((select id from public.categories where slug = 'obuv'), 'Детская обувь', 'detskaya-obuv', 30)
on conflict (slug) do nothing;

-- ----------------------------------------------------------------------------
-- Для детей
-- ----------------------------------------------------------------------------
insert into public.categories (parent_id, name, slug, sort_order) values
  ((select id from public.categories where slug = 'dlya-detey'), 'Детская одежда и обувь', 'detskaya-odezhda-i-obuv', 10),
  ((select id from public.categories where slug = 'dlya-detey'), 'Игрушки', 'igrushki', 20),
  ((select id from public.categories where slug = 'dlya-detey'), 'Коляски и автокресла', 'kolyaski-i-avtokresla', 30),
  ((select id from public.categories where slug = 'dlya-detey'), 'Детская мебель', 'detskaya-mebel', 40)
on conflict (slug) do nothing;

-- ----------------------------------------------------------------------------
-- Дом и сад
-- ----------------------------------------------------------------------------
insert into public.categories (parent_id, name, slug, sort_order) values
  ((select id from public.categories where slug = 'dom-i-sad'), 'Растения и цветы', 'rasteniya-i-cvety', 10),
  ((select id from public.categories where slug = 'dom-i-sad'), 'Посуда и текстиль', 'posuda-i-tekstil', 20),
  ((select id from public.categories where slug = 'dom-i-sad'), 'Освещение и декор', 'osveschenie-i-dekor', 30)
on conflict (slug) do nothing;

-- ----------------------------------------------------------------------------
-- Стройматериалы
-- ----------------------------------------------------------------------------
insert into public.categories (parent_id, name, slug, sort_order) values
  ((select id from public.categories where slug = 'stroymaterialy'), 'Электрика', 'elektrika', 10),
  ((select id from public.categories where slug = 'stroymaterialy'), 'Сантехника', 'santehnika', 20),
  ((select id from public.categories where slug = 'stroymaterialy'), 'Инструменты', 'instrumenty', 30),
  ((select id from public.categories where slug = 'stroymaterialy'), 'Отделочные материалы', 'otdelochnye-materialy', 40)
on conflict (slug) do nothing;

-- ----------------------------------------------------------------------------
-- Мебель
-- ----------------------------------------------------------------------------
insert into public.categories (parent_id, name, slug, sort_order) values
  ((select id from public.categories where slug = 'mebel'), 'Для гостиной', 'dlya-gostinoy', 10),
  ((select id from public.categories where slug = 'mebel'), 'Для кухни', 'dlya-kuhni', 20),
  ((select id from public.categories where slug = 'mebel'), 'Для спальни', 'dlya-spalni', 30),
  ((select id from public.categories where slug = 'mebel'), 'Офисная мебель', 'ofisnaya-mebel', 40),
  ((select id from public.categories where slug = 'mebel'), 'Сборка и ремонт мебели', 'sborka-i-remont-mebeli', 50)
on conflict (slug) do nothing;

-- ----------------------------------------------------------------------------
-- Хобби
-- ----------------------------------------------------------------------------
insert into public.categories (parent_id, name, slug, sort_order) values
  ((select id from public.categories where slug = 'hobbi'), 'Книги', 'knigi', 10),
  ((select id from public.categories where slug = 'hobbi'), 'Музыкальные инструменты', 'muzykalnye-instrumenty', 20),
  ((select id from public.categories where slug = 'hobbi'), 'Коллекционирование', 'kollekcionirovanie', 30),
  ((select id from public.categories where slug = 'hobbi'), 'Рукоделие', 'rukodelie', 40)
on conflict (slug) do nothing;

-- ----------------------------------------------------------------------------
-- Спорт
-- ----------------------------------------------------------------------------
insert into public.categories (parent_id, name, slug, sort_order) values
  ((select id from public.categories where slug = 'sport'), 'Велосипеды', 'velosipedy', 10),
  ((select id from public.categories where slug = 'sport'), 'Тренажёры', 'trenazhery', 20),
  ((select id from public.categories where slug = 'sport'), 'Спортивная одежда', 'sportivnaya-odezhda', 30),
  ((select id from public.categories where slug = 'sport'), 'Охота и рыбалка', 'ohota-i-rybalka', 40),
  ((select id from public.categories where slug = 'sport'), 'Туризм', 'turizm', 50)
on conflict (slug) do nothing;

-- ----------------------------------------------------------------------------
-- Бизнес
-- ----------------------------------------------------------------------------
insert into public.categories (parent_id, name, slug, sort_order) values
  ((select id from public.categories where slug = 'biznes'), 'Оборудование для бизнеса', 'oborudovanie-dlya-biznesa', 10),
  ((select id from public.categories where slug = 'biznes'), 'Продажа бизнеса', 'prodazha-biznesa', 20),
  ((select id from public.categories where slug = 'biznes'), 'Деловое партнёрство', 'delovoe-partnerstvo', 30)
on conflict (slug) do nothing;
