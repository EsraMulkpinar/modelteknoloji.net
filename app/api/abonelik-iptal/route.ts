import { NextRequest } from "next/server";

/* ═══════════════════════════════════════════════════════════
   Ticari e-postalardan çıkma (abonelikten ayrılma) uç noktası.

   İki yoldan çağrılır:
   1. /abonelik-iptal sayfasındaki düğme  → POST, JSON gövde
   2. Posta istemcisinin tek tık başlığı  → POST, ?e= sorgu
      (List-Unsubscribe + List-Unsubscribe-Post: One-Click)

   Adres Resend'in bastırma (suppression) listesine eklenir;
   hesap genelinde bir daha mail gitmez.
   ═══════════════════════════════════════════════════════════ */

export const runtime = "edge";
export const dynamic = "force-dynamic";

const EPOSTA_DESENI = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

function temizle(v: unknown): string {
  return typeof v === "string" ? v.trim().toLowerCase().slice(0, 160) : "";
}

async function eposta_oku(req: NextRequest): Promise<string> {
  // Önce sorgu dizesi (tek tık başlığı buradan gelir)
  const sorgudan = temizle(req.nextUrl.searchParams.get("e"));
  if (sorgudan) return sorgudan;

  const tur = req.headers.get("content-type") || "";
  try {
    if (tur.includes("application/json")) {
      const govde = (await req.json()) as Record<string, unknown>;
      return temizle(govde.eposta);
    }
    if (tur.includes("form")) {
      const form = await req.formData();
      return temizle(form.get("eposta"));
    }
  } catch {
    /* gövde okunamadıysa boş dön */
  }
  return "";
}

export async function POST(req: NextRequest) {
  const eposta = await eposta_oku(req);

  if (!EPOSTA_DESENI.test(eposta)) {
    return Response.json({ hata: "Geçerli bir e-posta adresi gerekiyor." }, { status: 400 });
  }

  const anahtar = process.env.RESEND_API_KEY;
  if (!anahtar) {
    console.error("[abonelik-iptal] RESEND_API_KEY tanımlı değil.");
    return Response.json(
      { hata: "İşleminizi şu anda alamıyoruz. Lütfen satis@modelteknoloji.net adresine yazın." },
      { status: 500 }
    );
  }

  try {
    const yanit = await fetch("https://api.resend.com/suppressions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${anahtar}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: eposta }),
    });

    // 409 = adres zaten listede; kullanıcı açısından başarı sayılır.
    if (!yanit.ok && yanit.status !== 409) {
      const detay = await yanit.text().catch(() => "");
      console.error("[abonelik-iptal] Resend hatası:", yanit.status, detay);
      return Response.json(
        { hata: "İşleminizi şu anda tamamlayamadık. Lütfen satis@modelteknoloji.net adresine yazın." },
        { status: 502 }
      );
    }
  } catch (err) {
    console.error("[abonelik-iptal] Ağ hatası:", err);
    return Response.json(
      { hata: "İşleminizi şu anda tamamlayamadık. Lütfen satis@modelteknoloji.net adresine yazın." },
      { status: 502 }
    );
  }

  return Response.json({ tamam: true });
}

/* Bağlantıya tarayıcıdan GET ile gelinirse onay sayfasına yönlendir.
   Tek tıkla çıkarma yalnızca POST ile olur; böylece mail tarayıcıları
   ve bağlantı önizlemeleri kimseyi yanlışlıkla listeden düşürmez. */
export async function GET(req: NextRequest) {
  const eposta = temizle(req.nextUrl.searchParams.get("e"));
  const hedef = new URL("/abonelik-iptal", req.nextUrl.origin);
  if (eposta) hedef.searchParams.set("e", eposta);
  return Response.redirect(hedef, 302);
}
