import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "JEE Battle by Vayl",
    short_name: "JEE Battle",
    description:
      "Challenge friends or random opponents to a head-to-head JEE quiz battle. 10 questions, 60 seconds each.",
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
