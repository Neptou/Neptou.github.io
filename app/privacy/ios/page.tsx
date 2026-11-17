import type { Metadata } from "next";
import PrivacyPolicy from "@/components/PrivacyPolicy";

export const metadata: Metadata = {
  title: "Privacy Policy — iOS",
  alternates: { canonical: "/privacy/ios/" },
};

export default function Page() {
  return <PrivacyPolicy platform="ios" />;
}
