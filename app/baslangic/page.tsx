"use client";

import { useEffect, useRef, useState } from "react";

/* ═══════════════════════════════════════════════════════════
   Kampanya maillerinin indiği karşılama sayfası.
   Ziyaretçi üç yoldan birini seçer; her yol kendi formunu açar.
   Form /api/baslangic adresine gider, oradan Resend ile
   satış ekibine e-posta düşer.
   ═══════════════════════════════════════════════════════════ */

type OptKey = "analiz" | "demo" | "fiyat";
type Durum = "idle" | "gonderiliyor" | "tamam" | "hata";

const SATIS_TEL = "0507 710 78 47";
const SATIS_TEL_HREF = "+905077107847";

const KONULAR = [
  "Sac metal",
  "Büyük montajlar",
  "Teknik resim",
  "Kaynak ve profil",
  "CAM / CNC",
  "Veri yönetimi (PDM)",
  "Dosya uyumluluğu",
];

const PROGRAMLAR = [
  "SolidWorks",
  "AutoCAD",
  "Inventor",
  "CATIA",
  "NX",
  "Solid Edge",
  "Başka bir program",
  "Henüz 3D CAD kullanmıyoruz",
];

const KULLANICI_SAYISI = ["1–2 kişi", "3–5 kişi", "6–10 kişi", "10+ kişi"];

const SECENEKLER: Record<
  OptKey,
  {
    etiket: string;
    baslik: string;
    ozet: string;
    maddeler: string[];
    sure: string;
    cta: string;
    formBaslik: string;
    formAlt: string;
    tamamBaslik: string;
    tamamMetin: string;
  }
> = {
  analiz: {
    etiket: "Ücretsiz",
    baslik: "CAD Altyapı Analizi",
    ozet: "Mevcut kurulumunuza bakalım, nerede zaman kaybettiğinizi yazılı olarak söyleyelim.",
    maddeler: [
      "Kullandığınız programlar ve dosya akışınız incelenir",
      "Sac metal, montaj ve teknik resim süreçleriniz değerlendirilir",
      "Sonuç tek sayfalık rapor — satın alma şartı yok",
    ],
    sure: "~2 iş günü",
    cta: "Analiz talep et",
    formBaslik: "CAD Altyapı Analizi",
    formAlt:
      "Birkaç soruyla mevcut durumunuzu anlayalım. Teknik ekibimiz inceleyip tek sayfalık bir değerlendirme hazırlayacak.",
    tamamBaslik: "Analiz talebiniz alındı",
    tamamMetin:
      "2 iş günü içinde sizi arayıp birkaç detay soracağız, ardından değerlendirme raporunuzu e-posta ile göndereceğiz. Bir ücret veya satın alma şartı yok.",
  },
  demo: {
    etiket: "Ücretsiz",
    baslik: "Canlı Demo",
    ozet: "30 dakika, online. İsterseniz kendi parçanız üzerinden gösterelim.",
    maddeler: [
      "Hangi konuya odaklanacağımızı siz seçersiniz",
      "Ekibinizden birkaç kişi birlikte katılabilir",
      "Uygun saatlerinizi yazın, takvimi biz ayarlayalım",
    ],
    sure: "30 dk · online",
    cta: "Demo ayarla",
    formBaslik: "Ücretsiz Canlı Demo",
    formAlt:
      "Ne göreceğinizi siz belirleyin. İsterseniz kendi parçanızı gönderin, demoyu onun üzerinden yapalım.",
    tamamBaslik: "Demo talebiniz alındı",
    tamamMetin:
      "Yazdığınız uygun saatlere göre size iki alternatif tarih önereceğiz. Onayladığınız saatte toplantı bağlantısını göndereceğiz — bilgisayarınıza kurulum yapmanıza gerek yok.",
  },
  fiyat: {
    etiket: "Telefonla dönüş",
    baslik: "Fiyat Teklifi",
    ozet: "İhtiyacınıza göre net fiyat. Bilgilerinizi bırakın, telefonla dönelim.",
    maddeler: [
      "Kaç kullanıcı, hangi modüller — kısa görüşmede netleşir",
      "Kalıcı lisans ve abonelik seçenekleri birlikte sunulur",
      "Kredi kartı, havale, çek/senet, leasing ve firma içi plan",
    ],
    sure: "1 iş günü içinde",
    cta: "Fiyat iste",
    formBaslik: "Fiyat Teklifi",
    formAlt:
      "Dört bilgi yeterli. Gerisini telefonda konuşalım — kaç kullanıcı ve hangi modüller gerektiğini birlikte netleştirelim.",
    tamamBaslik: "Talebiniz satış ekibine iletildi",
    tamamMetin:
      "Erkan Mülkpınar 1 iş günü içinde sizi arayacak. Acelesi varsa doğrudan da ulaşabilirsiniz.",
  },
};

/* ─── Teknik resim dilinde çizilmiş kart ikonları ───────── */

function IkonAnaliz() {
  return (
    <svg viewBox="0 0 110 78" width="96" height="68" fill="none" stroke="currentColor"
      strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 30h30v10h16v22H22z" />
      <path d="M22 30V20h18v10" />
      <path d="M22 18v-8M52 18v-8" strokeWidth="1" opacity=".5" />
      <path d="M22 14h30" strokeWidth="1" />
      <path d="M25 11.5 22 14l3 2.5M49 11.5 52 14l-3 2.5" strokeWidth="1" />
      <path d="M74 40h8M74 62h8" strokeWidth="1" opacity=".5" />
      <path d="M78 40v22" strokeWidth="1" />
      <path d="M75.5 43 78 40l2.5 3M75.5 59 78 62l2.5-3" strokeWidth="1" />
      <circle cx="88" cy="24" r="9" />
      <path d="M94.5 30.5 101 37" />
      <path d="M84 24h8M88 20v8" strokeWidth="1.2" />
    </svg>
  );
}

function IkonDemo() {
  return (
    <svg viewBox="0 0 110 78" width="96" height="68" fill="none" stroke="currentColor"
      strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="14" y="14" width="68" height="44" rx="3" />
      <path d="M40 58v6h16v-6M34 64h28" strokeWidth="1.4" />
      <path d="m48 26 14 7v14l-14 7-14-7V33z" strokeWidth="1.4" />
      <path d="m34 33 14 7 14-7M48 40v14" strokeWidth="1.1" opacity=".65" />
      <path d="M88 26a20 20 0 0 1 4 12 20 20 0 0 1-4 12" strokeWidth="1.2" opacity=".75" />
      <path d="m85 28.5 3.2-2.8 2.4 3.6" strokeWidth="1.2" />
      <circle cx="97" cy="38" r="3.5" strokeWidth="1.2" />
    </svg>
  );
}

function IkonFiyat() {
  return (
    <svg viewBox="0 0 110 78" width="96" height="68" fill="none" stroke="currentColor"
      strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M26 12h34l12 12v42H26z" />
      <path d="M60 12v12h12" strokeWidth="1.3" />
      <path d="M34 34h30M34 42h30M34 50h16" strokeWidth="1.2" opacity=".6" />
      <rect x="31" y="56" width="36" height="1.8" rx=".9" fill="currentColor" stroke="none" opacity=".25" />
      <path d="M83 44a14 14 0 0 0 10 10l3-4 8 4-2 7c-11 1-22-9-23-21l7-2z" strokeWidth="1.4" />
    </svg>
  );
}

const IKONLAR: Record<OptKey, () => React.ReactElement> = {
  analiz: IkonAnaliz,
  demo: IkonDemo,
  fiyat: IkonFiyat,
};

/* ─── Sayfa ─────────────────────────────────────────────── */

export default function BaslangicPage() {
  const [secili, setSecili] = useState<OptKey | null>(null);
  const [durum, setDurum] = useState<Durum>("idle");
  const [hataMesaji, setHataMesaji] = useState("");
  const [konular, setKonular] = useState<string[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);

  const sec = (k: OptKey) => {
    setSecili(k);
    setDurum("idle");
    setHataMesaji("");
    setKonular([]);
    window.setTimeout(() => {
      panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 40);
  };

  const kapat = () => {
    setSecili(null);
    setDurum("idle");
    setKonular([]);
  };

  /* Mailden /baslangic?tur=demo gibi gelen ziyaretçinin önüne
     ilgili form doğrudan açık gelsin. useSearchParams yerine
     window kullanılıyor; sayfa böylece statik kalıyor. */
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("tur");
    if (t === "analiz" || t === "demo" || t === "fiyat") {
      setSecili(t);
      window.setTimeout(() => {
        panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 120);
    }
  }, []);

  const konuDegis = (konu: string) => {
    setKonular((onceki) =>
      onceki.includes(konu) ? onceki.filter((k) => k !== konu) : [...onceki, konu]
    );
  };

  const gonder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!secili || durum === "gonderiliyor") return;

    const form = e.currentTarget;
    const veri = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;

    if (secili === "demo" && konular.length === 0) {
      setHataMesaji("En az bir konu seçin.");
      setDurum("hata");
      return;
    }

    setDurum("gonderiliyor");
    setHataMesaji("");

    try {
      const yanit = await fetch("/api/baslangic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tur: secili, ...veri, konular }),
      });

      if (!yanit.ok) {
        const govde = await yanit.json().catch(() => ({}));
        throw new Error(govde?.hata || "Talep gönderilemedi.");
      }

      window.gtag?.("event", "generate_lead", { form: `baslangic_${secili}` });
      setDurum("tamam");
      form.reset();
      window.setTimeout(() => {
        panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 40);
    } catch (err) {
      setDurum("hata");
      setHataMesaji(
        err instanceof Error && err.message
          ? err.message
          : "Talep gönderilemedi. Lütfen tekrar deneyin veya bizi arayın."
      );
    }
  };

  const o = secili ? SECENEKLER[secili] : null;

  return (
    <div className="container page-shell bas-shell">
      <p className="bas-eyebrow">Siemens Solid Edge · Yetkili Çözüm Ortağı</p>
      <h1 className="page-title bas-title">Nereden başlamak istersiniz?</h1>
      <p className="page-lead bas-lead">
        Üç yol var, üçü de <strong>ücretsiz</strong> ve hiçbiri taahhüt değil. Size en uygun
        olanı seçin, gerisini biz halledelim.
      </p>

      {/* ─── Kartlar ─── */}
      <div className="bas-grid">
        {(Object.keys(SECENEKLER) as OptKey[]).map((k) => {
          const s = SECENEKLER[k];
          const Ikon = IKONLAR[k];
          return (
            <button
              key={k}
              type="button"
              className="bas-card"
              aria-pressed={secili === k}
              onClick={() => sec(k)}
            >
              <span className="bas-card__tag">{s.etiket}</span>
              <span className="bas-card__ico">
                <Ikon />
              </span>
              <span className="bas-card__h">{s.baslik}</span>
              <span className="bas-card__p">{s.ozet}</span>
              <ul className="bas-pts">
                {s.maddeler.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
              <span className="bas-card__foot">
                <span className="bas-when">{s.sure}</span>
                <span className="bas-pick">
                  {s.cta}
                  <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor"
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" />
                  </svg>
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* ─── Form paneli ─── */}
      {o && secili && (
        <div className="bas-panel" ref={panelRef}>
          <div className="bas-sheet">
            <div className="bas-sheet__head">
              <div>
                <h2 className="bas-sheet__h">{durum === "tamam" ? o.tamamBaslik : o.formBaslik}</h2>
                {durum !== "tamam" && <p className="bas-sheet__p">{o.formAlt}</p>}
              </div>
              <button type="button" className="bas-close" onClick={kapat}>
                Kapat
              </button>
            </div>

            {durum === "tamam" ? (
              <div className="bas-done">
                <p className="bas-done__lead">Teşekkürler, talebiniz bize ulaştı.</p>
                <div className="bas-next">
                  <strong>Bundan sonra ne olacak:</strong> {o.tamamMetin}
                </div>
                <p className="bas-done__tel">
                  Acil bir durum varsa:{" "}
                  <a href={`tel:${SATIS_TEL_HREF}`}>{SATIS_TEL}</a>
                </p>
                <button type="button" className="btn btn--outline bas-again" onClick={kapat}>
                  Başka bir seçeneğe de bakayım
                </button>
              </div>
            ) : (
              <form className="bas-form" onSubmit={gonder} noValidate={false}>
                {/* bot tuzağı — insan görmez, doldurulursa talep reddedilir */}
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  className="visually-hidden"
                  aria-hidden="true"
                />

                <label className="field">
                  <span className="field__label">Ad Soyad</span>
                  <input name="ad" type="text" autoComplete="name" required minLength={2} />
                </label>
                <label className="field">
                  <span className="field__label">Firma</span>
                  <input name="firma" type="text" autoComplete="organization" required minLength={2} />
                </label>
                <label className="field">
                  <span className="field__label">E-posta</span>
                  <input name="eposta" type="email" autoComplete="email" required />
                </label>
                <label className="field">
                  <span className="field__label">Telefon</span>
                  <input name="telefon" type="tel" autoComplete="tel" placeholder="05XX XXX XX XX" required />
                </label>

                {secili === "analiz" && (
                  <>
                    <label className="field">
                      <span className="field__label">Şu an hangi programı kullanıyorsunuz?</span>
                      <select name="program" required defaultValue="">
                        <option value="" disabled>
                          Seçiniz
                        </option>
                        {PROGRAMLAR.map((p) => (
                          <option key={p}>{p}</option>
                        ))}
                      </select>
                    </label>
                    <label className="field">
                      <span className="field__label">Kaç kişi kullanıyor?</span>
                      <select name="kullanici" required defaultValue="">
                        <option value="" disabled>
                          Seçiniz
                        </option>
                        {KULLANICI_SAYISI.map((k) => (
                          <option key={k}>{k}</option>
                        ))}
                      </select>
                    </label>
                    <label className="field field--full">
                      <span className="field__label">
                        Eklemek istediğiniz bir şey var mı? <small>— isteğe bağlı</small>
                      </span>
                      <textarea
                        name="notlar"
                        rows={3}
                        placeholder="Örn. sac metal açınımlarında zorlanıyoruz, teknik resimler elle hazırlanıyor…"
                      />
                    </label>
                  </>
                )}

                {secili === "demo" && (
                  <>
                    <div className="field field--full">
                      <span className="field__label">
                        Hangi konulara odaklanalım? <small>— birden fazla seçebilirsiniz</small>
                      </span>
                      <div className="bas-chips">
                        {KONULAR.map((konu) => (
                          <label key={konu} className="bas-chip">
                            <input
                              type="checkbox"
                              checked={konular.includes(konu)}
                              onChange={() => konuDegis(konu)}
                            />
                            <span>{konu}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <label className="field field--full">
                      <span className="field__label">Hangi gün ve saatler size uygun?</span>
                      <textarea
                        name="uygunluk"
                        rows={2}
                        required
                        placeholder="Örn. Salı–Perşembe öğleden sonra, ya da hafta içi 09:00–11:00 arası"
                      />
                    </label>
                  </>
                )}

                <div className="contact-form__actions">
                  <button type="submit" className="btn btn--primary" disabled={durum === "gonderiliyor"}>
                    {durum === "gonderiliyor" ? "Gönderiliyor…" : "Talebi gönder"}
                  </button>
                  <span className="bas-fine">
                    {secili === "fiyat"
                      ? "Talebiniz doğrudan satış sorumlumuza iletilir."
                      : "Bilgileriniz yalnızca bu talep için kullanılır, üçüncü kişilerle paylaşılmaz."}
                  </span>
                  {durum === "hata" && <span className="bas-err">{hataMesaji}</span>}
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
