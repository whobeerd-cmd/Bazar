-- ============================================================================
-- Bazar — Миграция 0009: связь с продавцом (лёгкая версия), избранное,
-- простое "поднятие в списке".
-- Взамен полноценного чата — телефон продавца кликабельной ссылкой (тел. уже
-- есть в profiles.phone) и простые публичные комментарии под объявлением.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- ИЗБРАННОЕ
-- ----------------------------------------------------------------------------
create table public.favorites (
  user_id uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

create index favorites_listing_id_idx on public.favorites (listing_id);

alter table public.favorites enable row level security;

create policy "favorites_select_own" on public.favorites
  for select using (auth.uid() = user_id);

create policy "favorites_insert_own" on public.favorites
  for insert with check (auth.uid() = user_id);

create policy "favorites_delete_own" on public.favorites
  for delete using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- ПУБЛИЧНЫЕ КОММЕНТАРИИ ПОД ОБЪЯВЛЕНИЕМ (без вложенности — плоский список)
-- ----------------------------------------------------------------------------
create table public.listing_comments (
  id bigserial primary key,
  listing_id uuid not null references public.listings(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);

create index listing_comments_listing_id_idx on public.listing_comments (listing_id);

alter table public.listing_comments enable row level security;

create policy "listing_comments_select" on public.listing_comments
  for select using (
    exists (
      select 1 from public.listings l
      where l.id = listing_comments.listing_id
        and (l.status = 'active' or l.user_id = auth.uid() or public.has_role(array['admin', 'superadmin', 'moderator']))
    )
  );

create policy "listing_comments_insert_own" on public.listing_comments
  for insert with check (auth.uid() = user_id);

create policy "listing_comments_delete_own_or_staff" on public.listing_comments
  for delete using (auth.uid() = user_id or public.has_role(array['admin', 'superadmin', 'moderator']));

-- ----------------------------------------------------------------------------
-- ПРОСТОЕ "ПОДНЯТИЕ В СПИСКЕ" (без реальной оплаты — раз в 24 часа, бесплатно)
-- sort_priority — то, по чему сортируется лента по умолчанию: при создании
-- равен created_at, при "поднятии" выставляется в текущий момент — точно
-- так же, как будто объявление опубликовали заново.
-- ----------------------------------------------------------------------------
alter table public.listings add column boosted_at timestamptz;
alter table public.listings add column sort_priority timestamptz not null default now();

update public.listings set sort_priority = created_at where sort_priority is distinct from created_at;
