import { NextRequest } from "next/server";

/* ═══════════════════════════════════════════════════════════
   /baslangic sayfasındaki üç formun tek uç noktası.
   Talep Resend üzerinden satış ekibine e-posta olarak düşer.

   Gerekli ortam değişkeni (Vercel → Settings → Environment Variables):
     RESEND_API_KEY = re_...
   ═══════════════════════════════════════════════════════════ */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GONDEREN = "Model Teknoloji Web <bildirim@modelteknoloji.net>";
const SATIS = "satis@modelteknoloji.net";
const TEKNIK = "m.ali@modelteknoloji.net";

type Tur = "analiz" | "demo" | "fiyat";

const BASLIKLAR: Record<Tur, string> = {
  analiz: "CAD Altyapı Analizi talebi",
  demo: "Ücretsiz canlı demo talebi",
  fiyat: "Fiyat teklifi talebi",
};

/** Analiz ve demo teknik ekibi de ilgilendirir; fiyat yalnızca satışa gider. */
const KOPYA: Record<Tur, string[]> = {
  analiz: [TEKNIK],
  demo: [TEKNIK],
  fiyat: [],
};

const EPOSTA_DESENI = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

function metin(v: unknown, enfazla = 2000): string {
  return typeof v === "string" ? v.trim().slice(0, enfazla) : "";
}

function kacisli(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function satir(etiket: string, deger: string): string {
  if (!deger) return "";
  return `<tr>
    <td style="padding:9px 16px 9px 0;color:#5A6B78;font-size:13px;white-space:nowrap;vertical-align:top;border-bottom:1px solid #E4EAEF;">${kacisli(etiket)}</td>
    <td style="padding:9px 0;color:#0D2740;font-size:15px;font-weight:600;vertical-align:top;border-bottom:1px solid #E4EAEF;">${kacisli(deger).replace(/\n/g, "<br>")}</td>
  </tr>`;
}

export async function POST(req: NextRequest) {
  const anahtar = process.env.RESEND_API_KEY;
  if (!anahtar) {
    console.error("[baslangic] RESEND_API_KEY tanımlı değil.");
    return Response.json(
      { hata: "Şu anda talebinizi alamıyoruz. Lütfen bizi arayın: 0507 710 78 47" },
      { status: 500 }
    );
  }

  let govde: Record<string, unknown>;
  try {
    govde = await req.json();
  } catch {
    return Response.json({ hata: "Geçersiz istek." }, { status: 400 });
  }

  // Bot tuzağı: gizli alan doluysa sessizce başarılı dön, mail gönderme.
  if (metin(govde.website)) {
    return Response.json({ tamam: true });
  }

  const tur = metin(govde.tur) as Tur;
  if (!["analiz", "demo", "fiyat"].includes(tur)) {
    return Response.json({ hata: "Geçersiz talep türü." }, { status: 400 });
  }

  const ad = metin(govde.ad, 120);
  const firma = metin(govde.firma, 160);
  const eposta = metin(govde.eposta, 160);
  const telefon = metin(govde.telefon, 40);

  if (ad.length < 2 || firma.length < 2) {
    return Response.json({ hata: "Ad ve firma alanlarını doldurun." }, { status: 400 });
  }
  if (!EPOSTA_DESENI.test(eposta)) {
    return Response.json({ hata: "E-posta adresi geçerli görünmüyor." }, { status: 400 });
  }
  if (telefon.replace(/\D/g, "").length < 10) {
    return Response.json({ hata: "Telefon numarası eksik görünüyor." }, { status: 400 });
  }

  const program = metin(govde.program, 80);
  const kullanici = metin(govde.kullanici, 40);
  const notlar = metin(govde.notlar);
  const uygunluk = metin(govde.uygunluk, 600);
  const konular = Array.isArray(govde.konular)
    ? (govde.konular as unknown[]).map((k) => metin(k, 60)).filter(Boolean).slice(0, 12)
    : [];

  const satirlar = [
    satir("Talep türü", BASLIKLAR[tur]),
    satir("Ad Soyad", ad),
    satir("Firma", firma),
    satir("E-posta", eposta),
    satir("Telefon", telefon),
    satir("Kullandığı program", program),
    satir("Kullanıcı sayısı", kullanici),
    satir("Odak konular", konular.join(", ")),
    satir("Uygun saatler", uygunluk),
    satir("Notlar", notlar),
  ]
    .filter(Boolean)
    .join("");

  const html = `<!doctype html>
<html lang="tr"><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#F5F7F9;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F5F7F9;">
<tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"
  style="width:100%;max-width:600px;background:#ffffff;border:1px solid #E4EAEF;border-radius:8px;">
  <tr><td bgcolor="#0D2740" style="background:#0D2740;padding:20px 28px;border-radius:8px 8px 0 0;">
    <p style="margin:0 0 3px;color:#6FD0E0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:1.5px;font-weight:bold;">MODELTEKNOLOJI.NET</p>
    <p style="margin:0;color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:19px;font-weight:bold;line-height:26px;">${kacisli(BASLIKLAR[tur])}</p>
  </td></tr>
  <tr><td style="padding:24px 28px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
      style="font-family:Arial,Helvetica,sans-serif;">${satirlar}</table>
  </td></tr>
  <tr><td style="padding:0 28px 26px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
      <tr><td bgcolor="#00819C" style="background:#00819C;border-radius:6px;padding:11px 22px;">
        <a href="mailto:${kacisli(eposta)}" style="color:#ffffff;text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;">Yanıtla</a>
      </td></tr>
    </table>
    <p style="margin:16px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#9AA7B1;line-height:18px;">
      Bu talep modelteknoloji.net/baslangic sayfasından geldi. Bu e-postayı yanıtlarsanız doğrudan müşteriye gider.
    </p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;

  const duzMetin = [
    BASLIKLAR[tur],
    "",
    `Ad Soyad : ${ad}`,
    `Firma    : ${firma}`,
    `E-posta  : ${eposta}`,
    `Telefon  : ${telefon}`,
    program ? `Program  : ${program}` : "",
    kullanici ? `Kullanıcı: ${kullanici}` : "",
    konular.length ? `Konular  : ${konular.join(", ")}` : "",
    uygunluk ? `Uygunluk : ${uygunluk}` : "",
    notlar ? `\nNotlar:\n${notlar}` : "",
    "",
    "— modelteknoloji.net/baslangic",
  ]
    .filter((s) => s !== "")
    .join("\n");

  try {
    const yanit = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${anahtar}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: GONDEREN,
        to: [SATIS],
        cc: KOPYA[tur],
        reply_to: [eposta],
        subject: `${BASLIKLAR[tur]} — ${firma}`,
        html,
        text: duzMetin,
      }),
    });

    if (!yanit.ok) {
      const detay = await yanit.text().catch(() => "");
      console.error("[baslangic] Resend hatası:", yanit.status, detay);
      return Response.json(
        { hata: "Talebinizi şu anda iletemedik. Lütfen bizi arayın: 0507 710 78 47" },
        { status: 502 }
      );
    }
  } catch (err) {
    console.error("[baslangic] Ağ hatası:", err);
    return Response.json(
      { hata: "Talebinizi şu anda iletemedik. Lütfen bizi arayın: 0507 710 78 47" },
      { status: 502 }
    );
  }

  return Response.json({ tamam: true });
}
