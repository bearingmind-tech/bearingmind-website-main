import localFont from "next/font/local";

/* Headings (variable weight; lighter files than the optical-size version) */
export const newsreader = localFont({
  src: [
    { path: "../fonts/newsreader-latin-wght-normal.woff2", style: "normal", weight: "300 500" },
    { path: "../fonts/newsreader-latin-wght-italic.woff2", style: "italic", weight: "300 500" },
  ],
  variable: "--font-newsreader",
  display: "swap",
  fallback: ["Georgia", "Times New Roman", "serif"],
  adjustFontFallback: "Times New Roman",
});

export const instrumentSans = localFont({
  src: [{ path: "../fonts/instrument-sans-latin-wght-normal.woff2", style: "normal", weight: "400 700" }],
  variable: "--font-instrument",
  display: "swap",
  fallback: ["system-ui", "-apple-system", "Segoe UI", "sans-serif"],
});

export const cormorant = localFont({
  src: [
    { path: "../fonts/cormorant-garamond-latin-500-italic.woff2", style: "italic", weight: "500" },
    { path: "../fonts/cormorant-garamond-latin-600-italic.woff2", style: "italic", weight: "600" },
    { path: "../fonts/cormorant-garamond-latin-600-normal.woff2", style: "normal", weight: "600" },
  ],
  variable: "--font-cormorant",
  display: "swap",
  preload: false,
  fallback: ["Georgia", "serif"],
});
