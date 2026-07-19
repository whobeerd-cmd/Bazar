"use client";

import { useActionState, useEffect, useState } from "react";
import { createListingAction, updateListingAction } from "@/lib/actions/listings";
import type { AuthActionState } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/client";
import { ListingsMap } from "@/components/map/ListingsMap";
import { INGUSHETIA_CENTER } from "@/lib/map/constants";
import type { CategoryNode } from "@/lib/categories";

const inputClass = "field-input";

const DEAL_TYPE_OPTIONS = [
  { value: "sale", label: "Продам" },
  { value: "rent_out", label: "Сдам" },
  { value: "buy", label: "Куплю" },
  { value: "rent_seek", label: "Сниму" },
] as const;

type CityOption = { id: number; name: string };
type CategoryAttribute = {
  id: number;
  name: string;
  type: "select" | "number" | "text" | "bool";
  options: string[] | null;
  is_required: boolean;
};

// Ищет узел по id и возвращает путь от верхнего раздела до него —
// нужно, чтобы при редактировании сразу открыть нужный раздел/подраздел.
function findCategoryPath(tree: CategoryNode[], id: number): CategoryNode[] | null {
  for (const node of tree) {
    if (node.id === id) return [node];
    const childPath = findCategoryPath(node.children, id);
    if (childPath) return [node, ...childPath];
  }
  return null;
}

export function ListingForm({
  mode,
  categories,
  cities,
  defaultValues,
  attributeValues,
}: {
  mode: "create" | "edit";
  categories: CategoryNode[];
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
    dealType: "sale" | "rent_out" | "buy" | "rent_seek" | null;
    addressText: string | null;
    lat: number | null;
    lng: number | null;
  };
  attributeValues?: Record<number, unknown>;
}) {
  const action = mode === "create" ? createListingAction : updateListingAction;
  const [state, formAction, isPending] = useActionState<AuthActionState, FormData>(action, null);

  const initialPath = defaultValues ? findCategoryPath(categories, defaultValues.categoryId) : null;
  const [topCategoryId, setTopCategoryId] = useState<number | "">(initialPath?.[0]?.id ?? "");
  const [subCategoryId, setSubCategoryId] = useState<number | "">(initialPath?.[1]?.id ?? "");
  const [priceType, setPriceType] = useState(defaultValues?.priceType ?? "fixed");
  const [dealType, setDealType] = useState(defaultValues?.dealType ?? "");
  const [attributes, setAttributes] = useState<CategoryAttribute[]>([]);
  const [showMap, setShowMap] = useState(false);
  const [pickedPoint, setPickedPoint] = useState<[number, number] | null>(
    defaultValues?.lat != null && defaultValues?.lng != null
      ? [defaultValues.lat, defaultValues.lng]
      : null
  );

  const topNode = categories.find((c) => c.id === topCategoryId);
  const hasSubcategories = (topNode?.children.length ?? 0) > 0;
  const selectedNode = hasSubcategories
    ? topNode?.children.find((c) => c.id === subCategoryId)
    : topNode;
  const categoryId = hasSubcategories ? subCategoryId : topCategoryId;
  const showCondition = selectedNode?.showCondition ?? true;
  const showDealType = selectedNode?.showDealType ?? false;

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
    <form action={formAction} className="space-y-5">
      {defaultValues && <input type="hidden" name="id" value={defaultValues.id} />}
      <input type="hidden" name="categoryId" value={categoryId} />

      <div>
        <label htmlFor="title" className="field-label">
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

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="topCategoryId" className="field-label">
            Раздел
          </label>
          <select
            id="topCategoryId"
            required
            value={topCategoryId}
            onChange={(e) => {
              const id = e.target.value ? Number(e.target.value) : "";
              setTopCategoryId(id);
              setSubCategoryId("");
              const node = categories.find((c) => c.id === id);
              if (node?.slug === "otdam-darom") setPriceType("free");
            }}
            className={inputClass}
          >
            <option value="">Выберите раздел</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        {hasSubcategories && (
          <div>
            <label htmlFor="subCategoryId" className="field-label">
              Подраздел
            </label>
            <select
              id="subCategoryId"
              required
              value={subCategoryId}
              onChange={(e) => setSubCategoryId(e.target.value ? Number(e.target.value) : "")}
              className={inputClass}
            >
              <option value="">Выберите подраздел</option>
              {topNode!.children.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {showDealType && (
        <div>
          <p className="field-label">Тип сделки</p>
          <div className="mt-1.5 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
            {DEAL_TYPE_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-3 py-2 transition ${
                  dealType === opt.value
                    ? "border-primary bg-primary/10 font-semibold text-primary"
                    : "border-border text-foreground hover:bg-muted"
                }`}
              >
                <input
                  type="radio"
                  name="dealType"
                  value={opt.value}
                  checked={dealType === opt.value}
                  onChange={() => setDealType(opt.value)}
                  required
                  className="sr-only"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>
      )}

      <div>
        <label htmlFor="cityId" className="field-label">
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
        <label htmlFor="description" className="field-label">
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
          <label htmlFor="priceType" className="field-label">
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
          <label htmlFor="price" className="field-label">
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
            className={`${inputClass} disabled:opacity-50`}
          />
        </div>
      </div>

      {showCondition ? (
        <div>
          <p className="field-label">Состояние</p>
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
      ) : (
        <input type="hidden" name="condition" value="used" />
      )}

      <div>
        <label htmlFor="addressText" className="field-label">
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
          className="text-sm font-medium text-primary hover:underline"
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
        <div className="space-y-4 rounded-lg border border-border p-4">
          <p className="field-label">Характеристики категории</p>
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
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}
      {state?.success && (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{state.success}</p>
      )}

      <button type="submit" disabled={isPending} className="btn-primary">
        {isPending ? "Сохраняем..." : mode === "create" ? "Далее: добавить фото" : "Сохранить"}
      </button>
    </form>
  );
}
