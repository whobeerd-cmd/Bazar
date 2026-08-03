-- Предыдущая миграция (0025) просто переиспользовала часть бизнес-категорий
-- для мастеров ("Парикмахерские и барбершопы", "Салоны красоты и SPA") —
-- это формулировки заведений/компаний, а раздел "Мастера" — про конкретных
-- людей (сантехник, электрик, швея, повар на выезд и т.д.). Раз название
-- категории — общее поле строки, шарить строки между бизнесом и мастером
-- больше нельзя: имя должно звучать по-разному в двух разделах.
--
-- Поэтому: отключаем for_masters у всех переиспользованных бизнес-строк
-- (для /business ничего не меняется), удаляем временный набор из 0025
-- (мастеров с этими категориями ещё не создано — переносить нечего) и
-- заводим широкий отдельный набор category-строк только для мастеров —
-- по образцу того, кого чаще всего ищут на подобных сайтах услуг.

update public.business_categories set for_masters = false where slug in (
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

delete from public.business_categories where slug in (
  'nyani-i-sidelki',
  'klining-i-uborka',
  'gruzchiki-i-perezdy',
  'uslugi-dlya-zhivotnyh',
  'massazh',
  'kompyuternaya-pomosch',
  'poshiv-i-remont-odezhdy',
  'personalnye-trenery'
) and not exists (
  select 1 from public.businesses where businesses.category_id = business_categories.id
);

insert into public.business_categories (name, slug, sort_order, group_label, for_business, for_masters) values
  -- Ремонт и стройка
  ('Сантехники', 'm-santehniki', 3010, 'Ремонт и стройка', false, true),
  ('Электрики', 'm-elektriki', 3020, 'Ремонт и стройка', false, true),
  ('Мастера по ремонту и отделке', 'm-otdelochniki', 3030, 'Ремонт и стройка', false, true),
  ('Маляры', 'm-malyary', 3040, 'Ремонт и стройка', false, true),
  ('Плиточники', 'm-plitochniki', 3050, 'Ремонт и стройка', false, true),
  ('Сварщики', 'm-svarshiki', 3060, 'Ремонт и стройка', false, true),
  ('Кровельщики', 'm-krovelshiki', 3070, 'Ремонт и стройка', false, true),
  ('Мебельщики (сборка и ремонт)', 'm-mebelshiki', 3080, 'Ремонт и стройка', false, true),
  ('Установка окон, дверей и кондиционеров', 'm-okna-dveri-kondicionery', 3090, 'Ремонт и стройка', false, true),
  ('Разнорабочие (мастер на час)', 'm-raznorabochie', 3100, 'Ремонт и стройка', false, true),

  -- Техника
  ('Мастера по ремонту бытовой техники', 'm-remont-tehniki', 3210, 'Техника', false, true),
  ('Ремонт телефонов и планшетов', 'm-remont-telefonov', 3220, 'Техника', false, true),
  ('Компьютерная помощь', 'm-kompyuternaya-pomosch', 3230, 'Техника', false, true),
  ('Программисты и IT-услуги', 'm-programmisty', 3240, 'Техника', false, true),
  ('Установка и ремонт ТВ, антенн, видеонаблюдения', 'm-remont-tv-antenn', 3250, 'Техника', false, true),

  -- Красота и здоровье
  ('Парикмахеры', 'm-parikmahery', 3310, 'Красота и здоровье', false, true),
  ('Мастера маникюра и педикюра', 'm-manikyur', 3320, 'Красота и здоровье', false, true),
  ('Мастера бровей и ресниц', 'm-brovi-resnicy', 3330, 'Красота и здоровье', false, true),
  ('Косметологи', 'm-kosmetologi', 3340, 'Красота и здоровье', false, true),
  ('Визажисты', 'm-vizazhisty', 3350, 'Красота и здоровье', false, true),
  ('Массажисты', 'm-massazhisty', 3360, 'Красота и здоровье', false, true),
  ('Тату и пирсинг-мастера', 'm-tatu', 3370, 'Красота и здоровье', false, true),

  -- Авто
  ('Автомеханики', 'm-avtomehaniki', 3410, 'Авто', false, true),
  ('Автоэлектрики', 'm-avtoelektriki', 3420, 'Авто', false, true),
  ('Мойка авто на выезд', 'm-moyka-avto', 3430, 'Авто', false, true),
  ('Шиномонтажники', 'm-shinomontazhniki', 3440, 'Авто', false, true),
  ('Таксисты (дальние поездки)', 'm-taksisty', 3450, 'Авто', false, true),
  ('Эвакуаторы', 'm-evakuatory', 3460, 'Авто', false, true),

  -- Образование и психология
  ('Репетиторы', 'm-repetitory', 3510, 'Образование', false, true),
  ('Инструкторы по вождению', 'm-instruktory-vozhdeniya', 3520, 'Образование', false, true),
  ('Логопеды', 'm-logopedy', 3530, 'Образование', false, true),
  ('Психологи', 'm-psihologi', 3540, 'Образование', false, true),

  -- Мероприятия
  ('Фотографы и видеооператоры', 'm-foto-video', 3610, 'Мероприятия', false, true),
  ('Ведущие праздников', 'm-vedushie', 3620, 'Мероприятия', false, true),
  ('Диджеи и музыканты', 'm-dj-muzykanty', 3630, 'Мероприятия', false, true),
  ('Повара и кондитеры на заказ', 'm-povara', 3640, 'Мероприятия', false, true),
  ('Декораторы и флористы', 'm-dekor-i-cvety', 3650, 'Мероприятия', false, true),

  -- Дом и быт
  ('Няни и сиделки', 'm-nyani', 3710, 'Дом и быт', false, true),
  ('Клинеры (уборка)', 'm-kliner', 3720, 'Дом и быт', false, true),
  ('Грузчики и переезды', 'm-gruzchiki', 3730, 'Дом и быт', false, true),
  ('Швеи и ателье на дому', 'm-shvei', 3740, 'Дом и быт', false, true),
  ('Рукоделие и хендмейд', 'm-rukodelie', 3750, 'Дом и быт', false, true),
  ('Уход за животными', 'm-zoomaster', 3760, 'Дом и быт', false, true),
  ('Курьеры', 'm-kurery', 3770, 'Дом и быт', false, true),

  -- Услуги
  ('Юристы', 'm-yuristy', 3810, 'Услуги', false, true),
  ('Бухгалтеры', 'm-buhgaltery', 3820, 'Услуги', false, true),
  ('Риелторы', 'm-rieltory', 3830, 'Услуги', false, true),
  ('Переводчики', 'm-perevodchiki', 3840, 'Услуги', false, true),
  ('Персональные тренеры', 'm-trenery', 3850, 'Услуги', false, true),

  ('Другое', 'm-drugoe', 3999, 'Другое', false, true)
on conflict (slug) do nothing;
