import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ListingForm } from "../ListingForm";
import { buildCategoryOptions, getCityOptions } from "../categoryOptions";

export default async function NewListingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/my-ads/new");

  const [categories, cities] = await Promise.all([
    buildCategoryOptions(supabase),
    getCityOptions(supabase),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Новое объявление</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Заполните основные поля — фото и отправку на модерацию можно будет сделать на следующем шаге.
      </p>
      <div className="card mt-6 max-w-xl p-6">
        <ListingForm mode="create" categories={categories} cities={cities} />
      </div>
    </div>
  );
}
