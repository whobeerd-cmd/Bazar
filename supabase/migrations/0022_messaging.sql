-- ============================================================================
-- ING MARKET — Миграция 0022: сообщения между покупателем и продавцом
-- Простой чат, привязанный к объявлению: один тред на пару (объявление,
-- покупатель). Не заменяет телефон/WhatsApp — это дополнительный канал,
-- обе кнопки остаются на странице объявления.
-- ============================================================================

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  seller_id uuid not null references public.profiles(id) on delete cascade,
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (listing_id, buyer_id)
);

create table public.messages (
  id bigint generated always as identity primary key,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index conversations_buyer_idx on public.conversations(buyer_id, last_message_at desc);
create index conversations_seller_idx on public.conversations(seller_id, last_message_at desc);
create index messages_conversation_idx on public.messages(conversation_id, created_at);

alter table public.conversations enable row level security;
alter table public.messages enable row level security;

create policy "conversations_select_participant" on public.conversations
  for select using (auth.uid() = buyer_id or auth.uid() = seller_id);

create policy "conversations_insert_buyer" on public.conversations
  for insert with check (auth.uid() = buyer_id and buyer_id <> seller_id);

create policy "conversations_update_participant" on public.conversations
  for update using (auth.uid() = buyer_id or auth.uid() = seller_id);

create policy "messages_select_participant" on public.messages
  for select using (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

create policy "messages_insert_participant" on public.messages
  for insert with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

create policy "messages_update_participant" on public.messages
  for update using (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );
