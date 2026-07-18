-- ============================================================================
-- Bazar — Миграция 0012: публикация без обязательной модерации +
-- поле "Состояние" (новое/б/у) показывается только там, где оно осмысленно
-- ============================================================================

-- Раньше опубликовать объявление ("active") мог только модератор — обычный
-- пользователь мог выставить себе только "draft"/"pending" и застревал в
-- очереди на проверку. Теперь публикация происходит сразу самим автором;
-- "rejected" остаётся действием только модератора — это вердикт по чужому
-- объявлению, а не статус, который выставляют себе.
create or replace function public.enforce_listing_status()
returns trigger as $$
declare
  is_staff boolean := public.has_role(array['admin', 'superadmin', 'moderator']);
begin
  if tg_op = 'INSERT' then
    if not is_staff and new.status = 'rejected' then
      new.status := 'draft';
    end if;
    if new.status = 'active' and new.published_at is null then
      new.published_at := now();
    end if;
    return new;
  end if;

  if not is_staff then
    if new.user_id is distinct from old.user_id then
      raise exception 'Нельзя изменить владельца объявления';
    end if;
    if new.status is distinct from old.status and new.status = 'rejected' then
      raise exception 'Этот статус может выставить только модератор';
    end if;
    new.rejection_reason := old.rejection_reason;
  end if;

  if new.status = 'active' and old.status is distinct from 'active' and new.published_at is null then
    new.published_at := now();
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- "Новое/б/у" не имеет смысла для недвижимости, услуг, вакансий, живых
-- животных/растений и продажи бизнеса — раньше поле показывалось всегда,
-- из-за чего, например, у земельного участка спрашивали "новый или б/у".
alter table public.categories add column if not exists show_condition boolean not null default true;

update public.categories set show_condition = false
where slug in (
  'nedvizhimost', 'kvartiry', 'doma', 'zemelnye-uchastki', 'kommercheskaya-nedvizhimost', 'garazhi-i-parkovki',
  'rabota', 'vakansii', 'ischu-rabotu',
  'uslugi', 'remont-i-stroitelstvo', 'krasota-i-zdorove', 'obuchenie-i-repetitorstvo',
  'prazdniki-i-meropriyatiya', 'yuridicheskie-i-finansovye', 'gruzoperevozki', 'prochie-uslugi',
  'remont-bytovoy-tehniki', 'avtouslugi',
  'selskoe-hozyaystvo', 'zhivotnye', 'ptitsy', 'korma', 'rasteniya-selhoz', 'pchely',
  'biznes', 'prodazha-biznesa', 'delovoe-partnerstvo'
);
