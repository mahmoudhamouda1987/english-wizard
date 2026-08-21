import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "English Wizard",
    short_name: "English Wizard",
    description: "Adaptive AI English learning platform",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#0b1020",
    theme_color: "#0b1020",
    icons: [],
  };
}
