-- ============================================================================
-- ING MARKET — Миграция 0023: запросы на удаление персональных данных
-- Форма в профиле вместо почты для запросов по 152-ФЗ — заявка видна
-- администрации в админ-панели.
-- ============================================================================

create table public.data_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'resolved')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid references public.profiles(id)
);

create index data_requests_status_idx on public.data_requests(status, created_at);

alter table public.data_requests enable row level security;

create policy "data_requests_select_own_or_staff" on public.data_requests
  for select using (auth.uid() = user_id or public.has_role(array['admin', 'superadmin']));

create policy "data_requests_insert_own" on public.data_requests
  for insert with check (auth.uid() = user_id);

create policy "data_requests_update_staff" on public.data_requests
  for update using (public.has_role(array['admin', 'superadmin']));
