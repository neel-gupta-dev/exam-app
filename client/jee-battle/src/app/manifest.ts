import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "JEE Battle by Vayl",
    short_name: "JEE Battle",
    description:
      "The most exciting way to practice for JEE. Challenge friends to quick 1v1 duels in Physics, Chemistry, and Math.",
    start_url: "/",
    display: "standalone",
    background_color: "#0f1115",
    theme_color: "#4f46e5",
    icons: [
      {
        src: "/og-image.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
