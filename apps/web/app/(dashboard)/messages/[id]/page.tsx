import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { markConversationReadAction } from "@/lib/actions/messages";
import { MessageForm } from "./MessageForm";

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/messages/${id}`);

  const { data: conversation } = await supabase
    .from("conversations")
    .select(
      "id, buyer_id, seller_id, listings(title, slug), buyer:profiles!conversations_buyer_id_fkey(full_name), seller:profiles!conversations_seller_id_fkey(full_name)"
    )
    .eq("id", id)
    .single();

  if (!conversation || (conversation.buyer_id !== user.id && conversation.seller_id !== user.id)) {
    notFound();
  }

  await markConversationReadAction(id);

  const { data: messages } = await supabase
    .from("messages")
    .select("id, sender_id, body, created_at")
    .eq("conversation_id", id)
    .order("created_at");

  const listing = Array.isArray(conversation.listings) ? conversation.listings[0] : conversation.listings;
  const isBuyer = conversation.buyer_id === user.id;
  const otherRaw = isBuyer ? conversation.seller : conversation.buyer;
  const other = Array.isArray(otherRaw) ? otherRaw[0] : otherRaw;

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <div className="border-b border-border pb-3">
        <Link href="/messages" className="text-xs font-medium text-muted-foreground hover:text-foreground">
          ← Все сообщения
        </Link>
        <h1 className="mt-1 text-xl font-extrabold tracking-tight text-foreground">
          {other?.full_name || "Пользователь"}
        </h1>
        {listing?.slug && (
          <Link href={`/listings/${listing.slug}`} className="text-sm text-primary hover:underline">
            {listing.title}
          </Link>
        )}
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto py-4">
        {!messages || messages.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">Сообщений пока нет — начните разговор.</p>
        ) : (
          messages.map((m) => {
            const mine = m.sender_id === user.id;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
                    mine ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.body}</p>
                  <p className={`mt-1 text-[10px] ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {new Date(m.created_at).toLocaleString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <MessageForm conversationId={id} />
    </div>
  );
}
