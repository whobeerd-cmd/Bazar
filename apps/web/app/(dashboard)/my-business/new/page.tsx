import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BusinessForm } from "../BusinessForm";
import { getBusinessCategories } from "@/lib/business/queries";

export default async function NewBusinessPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/my-business/new");

  const [categories, { data: cities }] = await Promise.all([
    getBusinessCategories(supabase),
    supabase.from("cities").select("id, name").order("name"),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Добавить бизнес</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Заполните основные данные — бизнес появится в справочнике сразу. Фото добавите на следующем шаге.
      </p>
      <div className="card mt-6 max-w-xl p-6">
        <BusinessForm mode="create" categories={categories} cities={cities ?? []} />
      </div>
    </div>
  );
}
