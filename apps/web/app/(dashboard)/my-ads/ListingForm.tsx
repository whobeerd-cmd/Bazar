"use client";

import { useActionState, useEffect, useState } from "react";
import { createListingAction, updateListingAction } from "@/lib/actions/listings";
import type { AuthActionState } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/client";
import { ListingsMap } from "@/components/map/ListingsMap";
import { INGUSHETIA_CENTER } from "@/lib/map/constants";

const inputClass =
  "mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary";

type CategoryOption = { id: number; name: string; depth: number };
type CityOption = { id: number; name: string };
type CategoryAttribute = {
  id: number;
  name: string;
  type: "select" | "number" | "text" | "bool";
  options: string[] | null;
  is_required: boolean;
};

export function ListingForm({
  mode,
  categories,
  cities,
  defaultValues,
  attributeValues,
}: {
  mode: "create" | "edit";
  categories: CategoryOption[];
  cities: CityOption[];
  defaultValues?: {
    id: string;
    title: string;
    categoryId: number;
    cityId: number | null;
    description: string;
    price: number | null;
    priceType: "fixed" | "negotiable" | "free";
    condition: "new" | "used";
    addressText: string | null;
    lat: number | null;
    lng: number | null;
  };
  attributeValues?: Record<number, unknown>;
}) {
  const action = mode === "create" ? createListingAction : updateListingAction;
  const [state, formAction, isPending] = useActionState<AuthActionState, FormData>(action, null);

  const [categoryId, setCategoryId] = useState<number | "">(defaultValues?.categoryId ?? "");
  const [priceType, setPriceType] = useState(defaultValues?.priceType ?? "fixed");
  const [attributes, setAttributes] = useState<CategoryAttribute[]>([]);
  const [showMap, setShowMap] = useState(false);
  const [pickedPoint, setPickedPoint] = useState<[number, number] | null>(
    defaultValues?.lat != null && defaultValues?.lng != null
      ? [defaultValues.lat, defaultValues.lng]
      : null
  );

  useEffect(() => {
    if (!categoryId) {
      setAttributes([]);
      return;
    }
    let cancelled = false;
    const supabase = createClient();
    supabase
      .from("category_attributes")
      .select("id, name, type, options, is_required")
      .eq("category_id", categoryId)
      .order("sort_order")
      .then(({ data }) => {
        if (!cancelled) setAttributes((data as CategoryAttribute[]) ?? []);
      });
    return () => {
      cancelled = true;
    };
  }, [categoryId]);

  return (
    <form action={formAction} className="max-w-xl space-y-4">
      {defaultValues && <input type="hidden" name="id" value={defaultValues.id} />}

      <div>
        <label htmlFor="title" className="text-sm font-medium">
          Заголовок
        </label>
        <input
          id="title"
          name="title"
          required
          defaultValue={defaultValues?.title}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="categoryId" className="text-sm font-medium">
          Категория
        </label>
        <select
          id="categoryId"
          name="categoryId"
          required
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : "")}
          className={inputClass}
        >
          <option value="">Выберите категорию</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {"— ".repeat(c.depth)}
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="cityId" className="text-sm font-medium">
          Населённый пункт
        </label>
        <select
          id="cityId"
          name="cityId"
          required
          defaultValue={defaultValues?.cityId ?? ""}
          className={inputClass}
        >
          <option value="">Выберите населённый пункт</option>
          {cities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="description" className="text-sm font-medium">
          Описание
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={5}
          defaultValue={defaultValues?.description}
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="priceType" className="text-sm font-medium">
            Цена
          </label>
          <select
            id="priceType"
            name="priceType"
            value={priceType}
            onChange={(e) => setPriceType(e.target.value as typeof priceType)}
            className={inputClass}
          >
            <option value="fixed">Цена указана</option>
            <option value="negotiable">Договорная</option>
            <option value="free">Бесплатно</option>
          </select>
        </div>
        <div>
          <label htmlFor="price" className="text-sm font-medium">
            Сумма, ₽
          </label>
          <input
            id="price"
            name="price"
            type="number"
            min={0}
            step="1"
            disabled={priceType !== "fixed"}
            defaultValue={defaultValues?.price ?? ""}
            className={inputClass + " disabled:opacity-50"}
          />
        </div>
      </div>

      <div>
        <p className="text-sm font-medium">Состояние</p>
        <div className="mt-1 flex gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="condition"
              value="new"
              defaultChecked={(defaultValues?.condition ?? "used") === "new"}
            />
            Новое
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="condition"
              value="used"
              defaultChecked={(defaultValues?.condition ?? "used") === "used"}
            />
            Б/у
          </label>
        </div>
      </div>

      <div>
        <label htmlFor="addressText" className="text-sm font-medium">
          Адрес (необязательно)
        </label>
        <input
          id="addressText"
          name="addressText"
          defaultValue={defaultValues?.addressText ?? ""}
          className={inputClass}
        />
      </div>

      <div>
        <input type="hidden" name="lat" value={pickedPoint ? pickedPoint[0] : ""} />
        <input type="hidden" name="lng" value={pickedPoint ? pickedPoint[1] : ""} />
        <button
          type="button"
          onClick={() => setShowMap((v) => !v)}
          className="text-sm text-primary underline"
        >
          {showMap ? "Скрыть карту" : "Указать точку на карте"}
        </button>
        {pickedPoint && (
          <span className="ml-2 text-xs text-muted-foreground">
            Точка выбрана ({pickedPoint[0].toFixed(4)}, {pickedPoint[1].toFixed(4)})
          </span>
        )}
        {showMap && (
          <div className="mt-2">
            <ListingsMap
              center={pickedPoint ?? INGUSHETIA_CENTER}
              zoom={pickedPoint ? 14 : 9}
              height={300}
              interactive
              pickedPoint={pickedPoint}
              onPick={(lat, lng) => setPickedPoint([lat, lng])}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Кликните по карте, чтобы отметить точное место — необязательно, без точки
              объявление на карте отображается по центру населённого пункта.
            </p>
          </div>
        )}
      </div>

      {attributes.length > 0 && (
        <div className="space-y-4 rounded-md border border-border p-4">
          <p className="text-sm font-medium">Характеристики категории</p>
          {attributes.map((attr) => {
            const existing = attributeValues?.[attr.id];
            return (
              <div key={attr.id}>
                <label className="text-sm">
                  {attr.name}
                  {attr.is_required && " *"}
                </label>
                {attr.type === "select" && (
                  <select
                    name={`attr_${attr.id}`}
                    required={attr.is_required}
                    defaultValue={existing ? String(existing) : ""}
                    className={inputClass}
                  >
                    <option value="">—</option>
                    {(attr.options ?? []).map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                )}
                {attr.type === "number" && (
                  <input
                    type="number"
                    name={`attr_${attr.id}`}
                    required={attr.is_required}
                    defaultValue={existing !== undefined ? String(existing) : ""}
                    className={inputClass}
                  />
                )}
                {attr.type === "text" && (
                  <input
                    type="text"
                    name={`attr_${attr.id}`}
                    required={attr.is_required}
                    defaultValue={existing !== undefined ? String(existing) : ""}
                    className={inputClass}
                  />
                )}
                {attr.type === "bool" && (
                  <label className="mt-1 flex items-center gap-2 text-sm">
                    <input type="checkbox" name={`attr_${attr.id}`} defaultChecked={Boolean(existing)} />
                    Да
                  </label>
                )}
              </div>
            );
          })}
        </div>
      )}

      {state?.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}
      {state?.success && (
        <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">{state.success}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
      >
        {isPending ? "Сохраняем..." : mode === "create" ? "Создать черновик" : "Сохранить"}
      </button>
    </form>
  );
}
