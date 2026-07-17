import { createClient } from "@/lib/supabase/server";
import { ListingsMap, type MapPoint } from "@/components/map/ListingsMap";
import { INGUSHETIA_CENTER } from "@/lib/map/constants";

export default async function MapPage() {
  const supabase = await createClient();

  const { data: listings } = await supabase
    .from("listings")
    .select("id, title, slug, lat, lng, cities(lat, lng)")
    .eq("status", "active");

  const points: MapPoint[] = (listings ?? [])
    .map((l): MapPoint | null => {
      const city = Array.isArray(l.cities) ? l.cities[0] : l.cities;
      const lat = l.lat ?? city?.lat;
      const lng = l.lng ?? city?.lng;
      if (lat == null || lng == null) return null;
      return { id: l.id, lat: Number(lat), lng: Number(lng), title: l.title, href: `/listings/${l.slug}` };
    })
    .filter((p): p is MapPoint => p !== null);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Карта объявлений</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {points.length > 0
          ? `Показано ${points.length} объявлений с указанным местоположением`
          : "Пока нет опубликованных объявлений с местоположением"}
      </p>

      <div className="mt-6">
        <ListingsMap
          points={points}
          center={points[0] ? [points[0].lat, points[0].lng] : INGUSHETIA_CENTER}
          zoom={points.length > 0 ? 11 : 9}
          height={560}
        />
      </div>
    </div>
  );
}
