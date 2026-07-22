const inputClass =
  "mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-border-strong focus:ring-2 focus:ring-primary/25";
const labelClass = "text-xs font-semibold uppercase tracking-wide text-muted-foreground";

export type BusinessFiltersValues = { q?: string; city?: string; sort?: string };

export function BusinessFiltersForm({
  basePath,
  cities,
  current,
}: {
  basePath: string;
  cities: { id: number; name: string }[];
  current: BusinessFiltersValues;
}) {
  return (
    <form
      action={basePath}
      method="get"
      className="flex flex-col gap-3 rounded-xl border border-border bg-background p-4 shadow-card sm:flex-row sm:items-end"
    >
      <div className="flex-1">
        <label htmlFor="q" className={labelClass}>
          Поиск
        </label>
        <input id="q" name="q" type="text" defaultValue={current.q} placeholder="Название бизнеса..." className={inputClass} />
      </div>

      <div className="sm:w-56">
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

      <div className="sm:w-48">
        <label htmlFor="sort" className={labelClass}>
          Сортировка
        </label>
        <select id="sort" name="sort" defaultValue={current.sort ?? "rating"} className={inputClass}>
          <option value="rating">По рейтингу</option>
          <option value="newest">Сначала новые</option>
        </select>
      </div>

      <button type="submit" className="btn-primary sm:mb-0.5">
        Применить
      </button>
    </form>
  );
}
