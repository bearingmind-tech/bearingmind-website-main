import type { Metadata } from "next";
import { NotFoundView } from "@/components/ui/NotFoundView";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

/* For notFound() inside site pages (for example a blog post that no longer exists). */
export default function SiteNotFound() {
  return <NotFoundView />;
}
