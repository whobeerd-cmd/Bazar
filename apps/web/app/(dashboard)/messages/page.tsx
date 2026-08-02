import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function MessagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/messages");

  const { data: conversations } = await supabase
    .from("conversations")
    .select(
      "id, buyer_id, seller_id, last_message_at, listings(title, slug, cover_image_url), buyer:profiles!conversations_buyer_id_fkey(full_name), seller:profiles!conversations_seller_id_fkey(full_name)"
    )
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .order("last_message_at", { ascending: false });

  const conversationIds = (conversations ?? []).map((c) => c.id);
  const { data: unreadRows } = conversationIds.length
    ? await supabase
        .from("messages")
        .select("conversation_id")
        .is("read_at", null)
        .neq("sender_id", user.id)
        .in("conversation_id", conversationIds)
    : { data: [] as { conversation_id: string }[] };

  const unreadByConversation = new Map<string, number>();
  for (const row of unreadRows ?? []) {
    unreadByConversation.set(row.conversation_id, (unreadByConversation.get(row.conversation_id) ?? 0) + 1);
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Сообщения</h1>
      <p className="mt-1 text-sm text-muted-foreground">Переписка с покупателями и продавцами по объявлениям.</p>

      {!conversations || conversations.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Пока нет диалогов — напишите продавцу со страницы объявления, и переписка появится здесь.
        </div>
      ) : (
        <div className="mt-6 space-y-2">
          {conversations.map((conv) => {
            const listing = Array.isArray(conv.listings) ? conv.listings[0] : conv.listings;
            const isBuyer = conv.buyer_id === user.id;
            const otherRaw = isBuyer ? conv.seller : conv.buyer;
            const other = Array.isArray(otherRaw) ? otherRaw[0] : otherRaw;
            const unread = unreadByConversation.get(conv.id) ?? 0;

            return (
              <Link
                key={conv.id}
                href={`/messages/${conv.id}`}
                className="flex items-center gap-3 rounded-xl border border-border bg-background p-3 shadow-card transition hover:border-border-strong hover:bg-muted"
              >
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {listing?.cover_image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={listing.cover_image_url} alt={listing.title ?? ""} className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {other?.full_name || "Пользователь"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{listing?.title ?? "Объявление удалено"}</p>
                </div>
                {unread > 0 && (
                  <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                    {unread}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
