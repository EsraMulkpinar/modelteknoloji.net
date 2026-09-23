import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Listeden Çık",
  description: "Model Teknoloji ticari e-posta listesinden çıkma.",
  robots: { index: false, follow: false },
};

export default function AbonelikIptalLayout({ children }: { children: React.ReactNode }) {
  return children;
}
