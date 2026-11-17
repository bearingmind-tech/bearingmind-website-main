import type { SiteSettings } from "@/content/types";

export const telHref = (s: SiteSettings) => `tel:${s.phone.replace(/[^\d+]/g, "")}`;
export const waHref = (s: SiteSettings) => `https://wa.me/${s.whatsapp.replace(/\D/g, "")}`;
