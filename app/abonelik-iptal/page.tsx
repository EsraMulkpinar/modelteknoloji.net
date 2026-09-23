"use client";

import { useEffect, useState } from "react";

/* ═══════════════════════════════════════════════════════════
   Ticari e-postalardan çıkma sayfası.
   Maildeki "Listeden çık" bağlantısı buraya gelir; adres
   sorgu dizesinden okunur, kullanıcı onaylayınca
   /api/abonelik-iptal adresine gider.
   ═══════════════════════════════════════════════════════════ */

type Durum = "idle" | "gonderiliyor" | "tamam" | "hata";

export default function AbonelikIptalPage() {
  const [eposta, setEposta] = useState("");
  const [durum, setDurum] = useState<Durum>("idle");
  const [hataMesaji, setHataMesaji] = useState("");

  useEffect(() => {
    const e = new URLSearchParams(window.location.search).get("e");
    if (e) setEposta(e.trim().toLowerCase());
  }, []);

  const cik = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (durum === "gonderiliyor") return;

    setDurum("gonderiliyor");
    setHataMesaji("");

    try {
      const yanit = await fetch("/api/abonelik-iptal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eposta }),
      });
      if (!yanit.ok) {
        const govde = await yanit.json().catch(() => ({}));
        throw new Error(govde?.hata || "İşlem tamamlanamadı.");
      }
      setDurum("tamam");
    } catch (err) {
      setDurum("hata");
      setHataMesaji(
        err instanceof Error && err.message ? err.message : "İşlem tamamlanamadı."
      );
    }
  };

  return (
    <div className="container page-shell abn-shell">
      {durum === "tamam" ? (
        <>
          <h1 className="page-title abn-title">Listeden çıkarıldınız.</h1>
          <p className="page-lead">
            <strong>{eposta}</strong> adresine bundan sonra tanıtım e-postası göndermeyeceğiz.
            İşlem hemen geçerli oldu.
          </p>
          <p className="abn-not">
            Yanlışlıkla çıktıysanız ya da tekrar eklenmek isterseniz{" "}
            <a href="mailto:satis@modelteknoloji.net">satis@modelteknoloji.net</a> adresine
            yazmanız yeterli.
          </p>
          <a className="btn btn--outline abn-geri" href="/">
            Ana sayfaya dön
          </a>
        </>
      ) : (
        <>
          <h1 className="page-title abn-title">Listeden çıkmak istiyor musunuz?</h1>
          <p className="page-lead">
            Onaylarsanız bu adrese bir daha tanıtım e-postası göndermeyiz. Teklif, sipariş ve
            destek yazışmalarınız bundan etkilenmez.
          </p>

          <form className="abn-form" onSubmit={cik}>
            <label className="field field--full">
              <span className="field__label">E-posta adresiniz</span>
              <input
                name="eposta"
                type="email"
                required
                value={eposta}
                onChange={(ev) => setEposta(ev.target.value)}
                placeholder="ornek@firma.com"
              />
            </label>

            <div className="contact-form__actions">
              <button
                type="submit"
                className="btn btn--primary"
                disabled={durum === "gonderiliyor" || !eposta}
              >
                {durum === "gonderiliyor" ? "İşleniyor…" : "Evet, listeden çıkar"}
              </button>
              <a className="abn-vazgec" href="/">
                Vazgeç
              </a>
              {durum === "hata" && <span className="bas-err">{hataMesaji}</span>}
            </div>
          </form>
        </>
      )}
    </div>
  );
}
