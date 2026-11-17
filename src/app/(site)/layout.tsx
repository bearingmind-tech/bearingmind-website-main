import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { getBooking, getSite } from "@/lib/content";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [site, booking] = await Promise.all([getSite(), getBooking()]);
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <Header
        site={{
          nav: site.nav,
          bookLabel: site.bookLabel,
          phone: site.phone,
          phoneDisplay: site.phoneDisplay,
          whatsapp: site.whatsapp,
          email: site.email,
          address: site.address,
          mapUrl: site.mapUrl,
        }}
      />
      <main id="main">{children}</main>
      <Footer site={site} booking={booking} />
    </>
  );
}
