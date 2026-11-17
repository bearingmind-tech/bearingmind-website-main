import type { Metadata } from "next";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { NotFoundView } from "@/components/ui/NotFoundView";
import { getBooking, getSite } from "@/lib/content";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

/* For addresses that match no page at all (outside the site layout), so it brings its own header and footer. */
export default async function NotFound() {
  const [site, booking] = await Promise.all([getSite(), getBooking()]);
  return (
    <>
      <Header
        site={{ nav: site.nav, bookLabel: site.bookLabel, phone: site.phone, phoneDisplay: site.phoneDisplay, whatsapp: site.whatsapp, email: site.email, address: site.address, mapUrl: site.mapUrl }}
      />
      <main id="main">
        <NotFoundView />
      </main>
      <Footer site={site} booking={booking} />
    </>
  );
}
