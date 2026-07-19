import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ListingForm } from "../../ListingForm";
import { ImageUploader } from "../../ImageUploader";
import { ListingStatusActions } from "../../ListingStatusActions";
import { getCityOptions } from "../../categoryOptions";
import { getCategoryTree } from "@/lib/categories";

const STATUS_LABELS: Record<string, string> = {
  draft: "Черновик",
  pending: "На модерации",
  active: "Опубликовано",
  rejected: "Отклонено",
  archived: "В архиве",
  sold: "Продано",
};

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/my-ads/${id}/edit`);

  const { data: listing } = await supabase
    .from("listings")
    .select(
      "id, user_id, title, category_id, city_id, description, price, price_type, condition, deal_type, address_text, lat, lng, status, rejection_reason"
    )
    .eq("id", id)
    .single();

  if (!listing || listing.user_id !== user.id) notFound();

  const [{ data: images }, { data: attrRows }, categories, cities] = await Promise.all([
    supabase
      .from("listing_images")
      .select("id, url")
      .eq("listing_id", id)
      .order("sort_order"),
    supabase.from("listing_attributes").select("attribute_id, value").eq("listing_id", id),
    getCategoryTree(),
    getCityOptions(supabase),
  ]);

  const attributeValues = Object.fromEntries(
    (attrRows ?? []).map((row) => [row.attribute_id, (row.value as { value: unknown })?.value])
  );

  return (
    <div>
      {listing.status === "draft" && (
        <p className="text-sm font-semibold text-primary">Шаг 2 из 2</p>
      )}
      <div className="mt-1 flex items-center gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          {listing.status === "draft" ? "Фото и публикация" : "Редактирование объявления"}
        </h1>
        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
          {STATUS_LABELS[listing.status] ?? listing.status}
        </span>
      </div>

      {listing.status === "rejected" && listing.rejection_reason && (
        <p className="mt-3 max-w-xl rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
          Причина отклонения: {listing.rejection_reason}
        </p>
      )}

      <div className="card mt-6 max-w-xl p-6">
        <p className="mb-3 text-sm font-semibold text-foreground">Фото</p>
        <ImageUploader userId={user.id} listingId={id} initialImages={images ?? []} />

        <div className="mt-6 border-t border-border pt-6">
          <ListingForm
            mode="edit"
            categories={categories}
            cities={cities}
            defaultValues={{
              id: listing.id,
              title: listing.title,
              categoryId: listing.category_id,
              cityId: listing.city_id,
              description: listing.description,
              price: listing.price,
              priceType: listing.price_type,
              condition: listing.condition,
              dealType: listing.deal_type,
              addressText: listing.address_text,
              lat: listing.lat,
              lng: listing.lng,
            }}
            attributeValues={attributeValues}
          />
        </div>

        <div className="mt-6 border-t border-border pt-6">
          <ListingStatusActions listingId={id} status={listing.status} />
        </div>
      </div>
    </div>
  );
}
