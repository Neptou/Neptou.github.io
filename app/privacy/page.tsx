import type { Metadata } from "next";
import PrivacyPolicy from "@/components/PrivacyPolicy";

export const metadata: Metadata = {
  title: "Privacy Policy",
  alternates: { canonical: "/privacy/" },
};

export default function Page() {
  return <PrivacyPolicy platform="all" />;
}
