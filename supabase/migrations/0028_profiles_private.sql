-- ============================================================================
-- ING MARKET — Миграция 0028: убрать публичный доступ к телефонам через API
--
-- Была найдена и сознательно отложена: политика "profiles_select_all
-- using(true)" открывает ЛЮБОМУ (даже анонимному) запросу к API все столбцы
-- profiles, включая phone — то есть телефон вообще любого зарегистрированного
-- пользователя можно было выкачать напрямую, в обход того, что реально
-- показывает сайт (там телефон виден только на странице конкретного
-- активного объявления/бизнеса — то есть только у тех, кто сам согласился
-- быть на связи, разместив что-то).
--
-- RLS работает на уровне СТРОКИ, а не столбца — нельзя одной политикой на
-- profiles сказать "имя видно всем, а телефон только кому надо". Поэтому
-- выносим чувствительные поля (phone, phone_verified, block_reason) в
-- отдельную таблицу со своими правилами; остальные поля profiles (имя,
-- аватар, рейтинг и т.п.) остаются публичными как были.
--
-- Идемпотентна — безопасно выполнить повторно, даже если прошлый запуск
-- прервался на середине.
-- ============================================================================

create table if not exists public.profiles_private (
  id uuid primary key references public.profiles(id) on delete cascade,
  phone text unique,
  phone_verified boolean not null default false,
  block_reason text
);

-- Переносим данные и убираем столбцы из profiles — только если это ещё не
-- было сделано в прошлый раз.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'phone'
  ) then
    insert into public.profiles_private (id, phone, phone_verified, block_reason)
    select id, phone, phone_verified, block_reason from public.profiles
    on conflict (id) do nothing;

    alter table public.profiles drop column phone;
    alter table public.profiles drop column phone_verified;
    alter table public.profiles drop column block_reason;
  end if;
end $$;

alter table public.profiles_private enable row level security;

-- Видно: себе; персоналу (модерация/жалобы/удаление данных); и любому — если
-- у этого пользователя есть активное объявление или активный бизнес/анкета
-- мастера. Последнее — не новая дыра, а ровно то же самое, что страница
-- объявления/бизнеса и так публично показывает через join; здесь просто то
-- же самое правило переносится на уровень API, вместо "видно всем без
-- разбора".
drop policy if exists "profiles_private_select" on public.profiles_private;
create policy "profiles_private_select" on public.profiles_private
  for select using (
    auth.uid() = id
    or public.has_role(array['admin', 'superadmin', 'moderator'])
    or exists (
      select 1 from public.listings l
      where l.user_id = profiles_private.id and l.status = 'active'
    )
    or exists (
      select 1 from public.businesses b
      where b.owner_id = profiles_private.id and b.status = 'active'
    )
  );

drop policy if exists "profiles_private_insert_own" on public.profiles_private;
create policy "profiles_private_insert_own" on public.profiles_private
  for insert with check (auth.uid() = id);

drop policy if exists "profiles_private_update_own_or_admin" on public.profiles_private;
create policy "profiles_private_update_own_or_admin" on public.profiles_private
  for update using (auth.uid() = id or public.has_role(array['admin', 'superadmin']));

-- handle_new_user должен теперь создавать и вторую строку — с пустым
-- телефоном, дозаполнится при первом сохранении профиля.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, email_verified, name_required)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture'),
    new.email_confirmed_at is not null,
    true
  );

  insert into public.profiles_private (id) values (new.id);

  insert into public.user_roles (user_id, role_id)
  select new.id, id from public.roles where code = 'user';

  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Пользователи, у которых уже есть profiles, но ещё нет profiles_private
-- (созданные до этой миграции, но не попавшие в первый insert по какой-то
-- причине) — подстраховка, чтобы ни у кого не потерялась возможность
-- дозаполнить телефон.
insert into public.profiles_private (id)
select p.id from public.profiles p
where not exists (select 1 from public.profiles_private pp where pp.id = p.id)
on conflict (id) do nothing;
