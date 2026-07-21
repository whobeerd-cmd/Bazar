-- ============================================================================
-- Bazar — Миграция 0018: пометка демо-данных (seed-скрипт)
-- ============================================================================
-- Демо-профили и их объявления помечаются is_demo = true, чтобы их можно
-- было найти и удалить одной командой (см. scripts/seed-demo/purge.mjs),
-- не трогая настоящих пользователей.

alter table public.profiles add column if not exists is_demo boolean not null default false;
create index if not exists profiles_is_demo_idx on public.profiles (is_demo) where is_demo;
