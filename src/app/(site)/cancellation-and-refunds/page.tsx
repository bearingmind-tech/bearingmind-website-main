import { LegalPage, legalMetadata } from "@/components/legal/legalPage";

export const revalidate = 60;
export const generateMetadata = () => legalMetadata("cancellation-and-refunds");

export default function Page() {
  return <LegalPage slug="cancellation-and-refunds" />;
}
