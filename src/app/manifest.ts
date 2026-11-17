import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BearingMind Health Services",
    short_name: "BearingMind",
    start_url: "/",
    description: "CBT-based counselling and coaching, Richmond Town, Bangalore and online.",
    display: "browser",
    lang: "en-IN",
    scope: "/",
    background_color: "#FBFCFB",
    theme_color: "#1F4D3A",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
