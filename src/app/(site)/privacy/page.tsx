import { LegalPage, legalMetadata } from "@/components/legal/legalPage";

export const revalidate = 60;
export const generateMetadata = () => legalMetadata("privacy");

export default function PrivacyPage() {
  return <LegalPage slug="privacy" />;
}
