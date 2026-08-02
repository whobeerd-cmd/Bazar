import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bazar — объявления Ингушетии",
    short_name: "Bazar",
    description: "Площадка объявлений и бизнесов Республики Ингушетия",
    start_url: "/",
    display: "standalone",
    background_color: "#f9f8f4",
    theme_color: "#266447",
    lang: "ru",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
