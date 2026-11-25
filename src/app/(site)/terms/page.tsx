import { LegalPage, legalMetadata } from "@/components/legal/legalPage";

export const revalidate = 60;
export const generateMetadata = () => legalMetadata("terms");

export default function Page() {
  return <LegalPage slug="terms" />;
}
