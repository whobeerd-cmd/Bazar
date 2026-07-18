-- ============================================================================
-- Bazar — Миграция 0011: закрываем реальные пробелы в подкатегориях
-- Точечные добавления там, где спрос точно есть, а раздела не было —
-- не копирование чужой структуры, а то, чего не хватало у нас самих.
-- ============================================================================

insert into public.categories (parent_id, name, slug, sort_order) values
  ((select id from public.categories where slug = 'mebel'), 'Для ванной', 'dlya-vannoy', 35),
  ((select id from public.categories where slug = 'mebel'), 'Другая мебель', 'drugaya-mebel', 55),

  ((select id from public.categories where slug = 'odezhda'), 'Аксессуары', 'odezhda-aksessuary', 30),

  ((select id from public.categories where slug = 'dom-i-sad'), 'Бытовая химия и хозтовары', 'hoztovary', 40),

  ((select id from public.categories where slug = 'elektronika'), 'Умные часы и гаджеты', 'umnye-chasy-i-gadzhety', 50),

  ((select id from public.categories where slug = 'nedvizhimost'), 'Гаражи и парковочные места', 'garazhi-i-parkovki', 45),

  ((select id from public.categories where slug = 'stroymaterialy'), 'Двери и окна', 'dveri-i-okna', 45),

  ((select id from public.categories where slug = 'uslugi'), 'Ремонт бытовой техники', 'remont-bytovoy-tehniki', 45)
on conflict (slug) do nothing;
