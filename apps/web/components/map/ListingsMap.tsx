"use client";

import { useEffect, useRef, useState } from "react";

// ============================================================================
// Единственное место в проекте, завязанное на конкретного провайдера карт
// (сейчас — Яндекс.Карты). Если провайдера придётся сменить, БД менять не
// нужно (координаты хранятся провайдер-независимо в listings.lat/lng и
// cities.lat/lng) — переписать нужно будет только этот файл, интерфейс
// пропсов (points/center/onPick) можно оставить прежним.
// ============================================================================

declare global {
  interface Window {
    ymaps?: any;
  }
}

export type MapPoint = { id: string; lat: number; lng: number; title?: string; href?: string };

let scriptLoadingPromise: Promise<void> | null = null;

function loadYandexMaps(apiKey: string): Promise<void> {
  if (window.ymaps) return Promise.resolve();
  if (scriptLoadingPromise) return scriptLoadingPromise;

  scriptLoadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU`;
    script.onload = () => window.ymaps.ready(() => resolve());
    script.onerror = () => reject(new Error("Не получилось загрузить Яндекс.Карты"));
    document.head.appendChild(script);
  });

  return scriptLoadingPromise;
}

export function ListingsMap({
  points = [],
  center,
  zoom = 11,
  height = 400,
  interactive = false,
  onPick,
  pickedPoint,
}: {
  points?: MapPoint[];
  center: [number, number];
  zoom?: number;
  height?: number;
  /** Режим выбора точки кликом по карте (используется в форме подачи объявления) */
  interactive?: boolean;
  onPick?: (lat: number, lng: number) => void;
  pickedPoint?: [number, number] | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);

  const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;

  useEffect(() => {
    if (!apiKey) return;
    if (!containerRef.current) return;

    let cancelled = false;

    loadYandexMaps(apiKey)
      .then(() => {
        if (cancelled || !containerRef.current) return;

        const map = new window.ymaps.Map(containerRef.current, {
          center,
          zoom,
          controls: ["zoomControl"],
        });
        mapRef.current = map;

        for (const point of points) {
          const placemark = new window.ymaps.Placemark(
            [point.lat, point.lng],
            { hintContent: point.title, balloonContent: point.title },
            { preset: "islands#blueDotIcon" }
          );
          if (point.href) {
            placemark.events.add("click", () => {
              window.location.href = point.href as string;
            });
          }
          map.geoObjects.add(placemark);
        }

        if (pickedPoint) {
          map.geoObjects.add(new window.ymaps.Placemark(pickedPoint, {}, { preset: "islands#redIcon" }));
        }

        if (interactive && onPick) {
          map.events.add("click", (e: any) => {
            const coords = e.get("coords") as [number, number];
            onPick(coords[0], coords[1]);
          });
        }
      })
      .catch(() => setError("Карта временно недоступна"));

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.destroy();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey, JSON.stringify(points), JSON.stringify(center), JSON.stringify(pickedPoint), interactive]);

  if (!apiKey) return null;

  if (error) {
    return (
      <div
        style={{ height }}
        className="flex items-center justify-center rounded-lg border border-dashed border-border bg-muted p-4 text-center text-sm text-muted-foreground"
      >
        {error}
      </div>
    );
  }

  return <div ref={containerRef} style={{ height }} className="w-full rounded-lg border border-border" />;
}
