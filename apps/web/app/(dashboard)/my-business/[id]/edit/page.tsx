import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BusinessForm } from "../../BusinessForm";
import { BusinessImageUploader } from "../../BusinessImageUploader";
import { getBusinessCategories } from "@/lib/business/queries";
import type { BusinessHours } from "@/lib/business/hours";

export default async function EditBusinessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/my-business/${id}/edit`);

  const { data: business } = await supabase
    .from("businesses")
    .select("id, owner_id, name, category_id, city_id, description, address_text, phone, whatsapp, instagram, website, hours, status, slug")
    .eq("id", id)
    .single();

  if (!business || business.owner_id !== user.id) notFound();

  const [{ data: images }, categories, { data: cities }] = await Promise.all([
    supabase.from("business_images").select("id, url").eq("business_id", id).order("sort_order"),
    getBusinessCategories(supabase),
    supabase.from("cities").select("id, name").order("name"),
  ]);

  return (
    <div>
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Редактирование бизнеса</h1>
        <a href={`/business/${business.slug}`} className="text-sm font-medium text-primary hover:underline">
          Смотреть страницу →
        </a>
      </div>

      <div className="card mt-6 max-w-xl p-6">
        <p className="mb-3 text-sm font-semibold text-foreground">Фото</p>
        <BusinessImageUploader userId={user.id} businessId={id} initialImages={images ?? []} />

        <div className="mt-6 border-t border-border pt-6">
          <BusinessForm
            mode="edit"
            categories={categories}
            cities={cities ?? []}
            defaultValues={{
              id: business.id,
              name: business.name,
              categoryId: business.category_id,
              cityId: business.city_id,
              description: business.description,
              addressText: business.address_text,
              phone: business.phone,
              whatsapp: business.whatsapp,
              instagram: business.instagram,
              website: business.website,
              hours: (business.hours as BusinessHours) ?? {},
            }}
          />
        </div>
      </div>
    </div>
  );
}
