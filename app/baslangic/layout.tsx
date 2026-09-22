import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nereden Başlayalım — Ücretsiz Analiz, Demo veya Fiyat Teklifi",
  description:
    "Siemens Solid Edge ile başlamanın üç yolu: ücretsiz CAD altyapı analizi, ücretsiz canlı demo veya firmanıza özel fiyat teklifi. Hiçbiri taahhüt gerektirmez.",
  alternates: { canonical: "/baslangic" },
};

export default function BaslangicLayout({ children }: { children: React.ReactNode }) {
  return children;
}
