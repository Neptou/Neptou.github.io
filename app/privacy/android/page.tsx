import type { Metadata } from "next";
import PrivacyPolicy from "@/components/PrivacyPolicy";

export const metadata: Metadata = {
  title: "Privacy Policy — Android",
  alternates: { canonical: "/privacy/android/" },
};

export default function Page() {
  return <PrivacyPolicy platform="android" />;
}
