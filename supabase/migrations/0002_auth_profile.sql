-- ============================================================================
-- ING MARKET — Миграция 0002: Auth и профиль
-- Хранилище для аватарок, синхронизация статуса подтверждения email.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Bucket для аватарок пользователей (публичное чтение, запись — только владелец)
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- Файлы хранятся по пути "{user_id}/avatar.ext" — политика проверяет,
-- что первая часть пути совпадает с id текущего пользователя.
create policy "avatars_public_read" on storage.objects
  for select using (bucket_id = 'avatars');

create policy "avatars_owner_insert" on storage.objects
  for insert with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars_owner_update" on storage.objects
  for update using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars_owner_delete" on storage.objects
  for delete using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ----------------------------------------------------------------------------
-- Синхронизация: когда пользователь подтверждает email по ссылке,
-- Supabase проставляет auth.users.email_confirmed_at — отражаем это в profiles.
-- ----------------------------------------------------------------------------
create or replace function public.handle_user_email_confirmed()
returns trigger as $$
begin
  if new.email_confirmed_at is not null and old.email_confirmed_at is null then
    update public.profiles
    set email_verified = true
    where id = new.id;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_email_confirmed
  after update on auth.users
  for each row execute function public.handle_user_email_confirmed();
