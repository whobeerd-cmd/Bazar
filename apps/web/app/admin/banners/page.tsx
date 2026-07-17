import { createClient } from "@/lib/supabase/server";
import { BannerForm } from "./BannerForm";
import { BannerRow } from "./BannerRow";

export default async function AdminBannersPage() {
  const supabase = await createClient();
  const { data: banners } = await supabase
    .from("banners")
    .select("id, image_url, link_url, position, sort_order, is_active")
    .order("sort_order");

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Баннеры</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Управление рекламными баннерами на главной странице.
      </p>

      <div className="mt-6 rounded-lg border border-border p-4">
        <p className="mb-3 text-sm font-medium">Добавить баннер</p>
        <BannerForm />
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left">
          <thead className="border-b border-border bg-muted text-xs text-muted-foreground">
            <tr>
              <th className="p-3 font-medium">Картинка</th>
              <th className="p-3 font-medium">Место</th>
              <th className="p-3 font-medium">Порядок</th>
              <th className="p-3 font-medium">Статус</th>
              <th className="p-3 font-medium text-right">Действия</th>
            </tr>
          </thead>
          <tbody>
            {(banners ?? []).map((banner) => (
              <BannerRow key={banner.id} banner={banner} />
            ))}
          </tbody>
        </table>
        {(banners ?? []).length === 0 && (
          <p className="p-4 text-sm text-muted-foreground">Баннеров пока нет.</p>
        )}
      </div>
    </div>
  );
}
