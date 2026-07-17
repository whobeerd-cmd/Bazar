-- ============================================================================
-- ING MARKET — Миграция 0003: вход через Google
-- Обновляем handle_new_user(), чтобы аватар из Google-аккаунта (если есть)
-- сразу попадал в профиль при первом входе.
-- ============================================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, email_verified)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture'),
    new.email_confirmed_at is not null
  );

  insert into public.user_roles (user_id, role_id)
  select new.id, id from public.roles where code = 'user';

  return new;
end;
$$ language plpgsql security definer set search_path = public;
