import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "English Wizard",
    short_name: "English Wizard",
    description: "Personalised English learning from Pre-A1 to C2 — adaptive assessment, guided practice, and progress you can prove.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#0b1020",
    theme_color: "#0b1020",
    categories: ["education", "productivity"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
