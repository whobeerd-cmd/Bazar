const inputClass =
  "mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-border-strong focus:ring-2 focus:ring-primary/25";

const labelClass = "text-xs font-semibold uppercase tracking-wide text-muted-foreground";

export type ListingFiltersValues = {
  q?: string;
  city?: string;
  price_min?: string;
  price_max?: string;
  condition?: string;
  has_photo?: string;
  has_video?: string;
  vip?: string;
  sort?: string;
};

// Обычная GET-форма — работает без клиентского JS, значения фильтров приходят
// через searchParams на сервер. Используется страницами /category/[slug] и /search.
export function FiltersForm({
  basePath,
  cities,
  current,
  searchPlaceholder,
}: {
  basePath: string;
  cities: { id: number; name: string }[];
  current: ListingFiltersValues;
  searchPlaceholder: string;
}) {
  return (
    <form
      action={basePath}
      method="get"
      className="space-y-5 rounded-xl border border-border bg-background p-5 shadow-card"
    >
      <div>
        <label htmlFor="q" className={labelClass}>
          Поиск
        </label>
        <input
          id="q"
          name="q"
          type="text"
          defaultValue={current.q}
          placeholder={searchPlaceholder}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="city" className={labelClass}>
          Населённый пункт
        </label>
        <select id="city" name="city" defaultValue={current.city ?? ""} className={inputClass}>
          <option value="">Все</option>
          {cities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="price_min" className={labelClass}>
            Цена от
          </label>
          <input
            id="price_min"
            name="price_min"
            type="number"
            min={0}
            defaultValue={current.price_min}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="price_max" className={labelClass}>
            Цена до
          </label>
          <input
            id="price_max"
            name="price_max"
            type="number"
            min={0}
            defaultValue={current.price_max}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="condition" className={labelClass}>
          Состояние
        </label>
        <select id="condition" name="condition" defaultValue={current.condition ?? ""} className={inputClass}>
          <option value="">Любое</option>
          <option value="new">Новое</option>
          <option value="used">Б/у</option>
        </select>
      </div>

      <div className="space-y-2.5 border-t border-border pt-4 text-sm text-foreground">
        <label className="flex items-center gap-2.5">
          <input type="checkbox" name="has_photo" value="1" defaultChecked={current.has_photo === "1"} className="h-4 w-4 accent-primary" />
          С фото
        </label>
        <label className="flex items-center gap-2.5">
          <input type="checkbox" name="has_video" value="1" defaultChecked={current.has_video === "1"} className="h-4 w-4 accent-primary" />
          С видео
        </label>
        <label className="flex items-center gap-2.5">
          <input type="checkbox" name="vip" value="1" defaultChecked={current.vip === "1"} className="h-4 w-4 accent-primary" />
          Только VIP
        </label>
      </div>

      <div>
        <label htmlFor="sort" className={labelClass}>
          Сортировка
        </label>
        <select id="sort" name="sort" defaultValue={current.sort ?? "newest"} className={inputClass}>
          <option value="newest">Сначала новые</option>
          <option value="price_asc">Сначала дешевле</option>
          <option value="price_desc">Сначала дороже</option>
        </select>
      </div>

      <button
        type="submit"
        className="w-full rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary-hover"
      >
        Применить
      </button>
    </form>
  );
}
