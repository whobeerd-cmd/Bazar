-- ============================================================================
-- Bazar — Миграция 0015: закрываем оставшиеся пробелы против berkat.ru
-- ============================================================================
-- После 0010/0011/0014 сверил ещё раз полностью — эти шесть штук реально
-- нужны (заметный спрос у конкурента), не мелкие листья вроде "Ножи"/"Сейфы",
-- которые сознательно не переносим ради разумного объёма каталога.

-- "Разное" — у конкурента это отдельный крупный раздел (по объёму третий
-- после "Транспорта" и "Строительства"), у нас такого предохранительного
-- клапана для объявлений "не пойми что" не было вообще.
insert into public.categories (name, slug, sort_order) values
  ('Разное', 'raznoe', 195)
on conflict (slug) do nothing;

insert into public.categories (parent_id, name, slug, sort_order) values
  ((select id from public.categories where slug = 'avtomobili'), 'Тюнинг', 'tyuning', 35),
  ((select id from public.categories where slug = 'avtomobili'), 'Автозвук', 'avtozvuk', 65),
  ((select id from public.categories where slug = 'uslugi'), 'Компьютерные и IT-услуги', 'it-uslugi', 55),
  ((select id from public.categories where slug = 'kompyutery'), 'Аксессуары для компьютера', 'aksessuary-dlya-kompyutera', 45),
  ((select id from public.categories where slug = 'stroymaterialy'), 'Отопление и вентиляция', 'otoplenie-i-ventilyaciya', 15),
  ((select id from public.categories where slug = 'sport'), 'Спортивное питание', 'sportivnoe-pitanie', 45)
on conflict (slug) do nothing;
