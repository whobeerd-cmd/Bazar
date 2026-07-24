-- ============================================================================
-- ING MARKET — Миграция 0021: обязательное имя профиля для новых пользователей
-- Существующие пользователи не считаются обязанными (name_required = false по
-- умолчанию). Начиная с этой миграции, каждый новый профиль создаётся с
-- name_required = true — приложение (middleware) не пускает такого
-- пользователя в личный кабинет, пока он не укажет имя в /profile.
-- ============================================================================

alter table public.profiles add column name_required boolean not null default false;

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

  insert into public.user_roles (user_id, role_id)
  select new.id, id from public.roles where code = 'user';

  return new;
end;
$$ language plpgsql security definer set search_path = public;
