"use client";

import { useState } from "react";
import emailjs from "emailjs-com";
import { Icon, MAIL, PHONE, PIN } from "@/components/Icons";

const PRODUCT_OPTIONS = [
  "Solid Edge",
  "Solid Edge Electrical",
  "FloEFD",
  "KeyShot",
  "Simulation",
  "PDM",
  "CAM Pro",
  "Solid Edge 2D",
];

const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

const WHATSAPP_NUMBER = "905330703629";

type Status = "idle" | "sent";

/** Form alanlarını okunaklı tek bir mesaja çevirir. Boş alanlar atlanır. */
function buildMessage(data: Record<string, string>) {
  const satir = (etiket: string, deger?: string) =>
    deger && deger.trim() ? `${etiket}: ${deger.trim()}` : null;

  return [
    "Model Teknoloji — web sitesinden yeni talep",
    "",
    satir("Ad Soyad", data.name),
    satir("Kurumsal e-posta", data.email),
    satir("Şirket", data.company),
    satir("Ünvan / Rol", data.role),
    satir("Telefon", data.phone),
    satir("Konu", data.subject),
    satir("İlgilendiği ürün", data.product),
    data.message?.trim() ? "" : null,
    data.message?.trim() ? data.message.trim() : null,
  ]
    .filter((s): s is string => s !== null)
    .join("\n");
}

export default function ContactPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [waUrl, setWaUrl] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    const mesaj = buildMessage(data);

    // GA4: potansiyel müşteri
    window.gtag?.("event", "generate_lead", { form: "contact" });

    // EmailJS yapılandırılmışsa arka planda bir kopya da e-postayla gitsin.
    // Beklemiyoruz: WhatsApp penceresinin açılabilmesi için kullanıcı hareketi korunmalı.
    if (EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_PUBLIC_KEY) {
      emailjs
        .send(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID,
          {
            name: data.name,
            email: data.email,
            company: data.company,
            role: data.role,
            phone: data.phone,
            subject: data.subject,
            product: data.product || "-",
            message: data.message,
          },
          EMAILJS_PUBLIC_KEY
        )
        .catch(() => {
          /* e-posta gitmezse WhatsApp yolu yine çalışır */
        });
    }

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mesaj)}`;
    setWaUrl(url);
    window.gtag?.("event", "whatsapp_click", { link_url: url });
    // Açılmazsa (pop-up engeli) aşağıdaki bağlantı devreye giriyor
    window.open(url, "_blank", "noopener,noreferrer");
    setStatus("sent");
  };

  return (
    <div className="container page-shell">
      <h1 className="page-title" style={{ textWrap: "pretty" }}>
        Kurumsal ihtiyaçlarınızı birlikte netleştirelim
      </h1>
      <p style={{ margin: "0 0 12px", color: "var(--text-2)", fontSize: 17 }}>
        Aynı iş günü içinde geri dönüş yapıyoruz.
      </p>
      <div className="chip-row" style={{ marginBottom: 40 }}>
        <span className="soft-chip">Aynı iş günü geri dönüş</span>
        <span className="soft-chip">Kurumsal onboarding &amp; destek</span>
        <span className="soft-chip">SLA opsiyonu</span>
      </div>

      <div className="contact-grid">
        <form className="contact-form" onSubmit={handleSubmit}>
          <label className="field">
            <span className="field__label">Ad Soyad</span>
            <input name="name" type="text" placeholder="Adınız ve soyadınız" autoComplete="name" required />
          </label>
          <label className="field">
            <span className="field__label">Kurumsal e-posta</span>
            <input name="email" type="email" placeholder="ad@sirketiniz.com" autoComplete="email" required />
          </label>
          <label className="field">
            <span className="field__label">Şirket</span>
            <input name="company" type="text" placeholder="Şirket adı" autoComplete="organization" />
          </label>
          <label className="field">
            <span className="field__label">Ünvan / Rol</span>
            <input name="role" type="text" placeholder="Örn. Mühendislik Müdürü" autoComplete="organization-title" />
          </label>
          <label className="field">
            <span className="field__label">Telefon</span>
            <input name="phone" type="tel" placeholder="+90" autoComplete="tel" />
          </label>
          <label className="field">
            <span className="field__label">Konu</span>
            <input name="subject" type="text" placeholder="Kısaca konu" />
          </label>
          <label className="field field--full">
            <span className="field__label">İlgilendiğiniz ürün <small>(opsiyonel)</small></span>
            <select name="product" defaultValue="">
              <option value="">Seçiniz</option>
              {PRODUCT_OPTIONS.map((p) => <option key={p}>{p}</option>)}
            </select>
          </label>
          <label className="field field--full">
            <span className="field__label">Kısa not</span>
            <textarea name="message" rows={4} placeholder="İhtiyacınızı birkaç cümleyle anlatın" />
          </label>
          <div className="contact-form__actions">
            <button type="submit" className="btn btn--primary">
              WhatsApp&apos;tan gönder
            </button>
            {status === "idle" && (
              <span className="form-sent-note">
                Bilgileriniz hazır bir mesaj olarak WhatsApp&apos;ta açılır; göndermeniz yeterli.
              </span>
            )}
            {status === "sent" && (
              <span className="form-sent-note">
                Teşekkürler — aynı iş günü içinde dönüş yapıyoruz. WhatsApp açılmadıysa{" "}
                <a href={waUrl} target="_blank" rel="noopener noreferrer">
                  buraya tıklayın
                </a>{" "}
                veya <a href="mailto:info@modelteknoloji.net">info@modelteknoloji.net</a> adresine yazın.
              </span>
            )}
          </div>
        </form>

        <aside className="quick-contact">
          <h3>Hızlı iletişim</h3>
          <div className="quick-contact__row">
            <span className="quick-contact__icon"><Icon paths={MAIL} size={20} strokeWidth={1.8} /></span>
            <a href="mailto:info@modelteknoloji.net">info@modelteknoloji.net</a>
          </div>
          <div className="quick-contact__row">
            <span className="quick-contact__icon"><Icon paths={PHONE} size={20} strokeWidth={1.8} /></span>
            <a href="tel:+903129994613">+90 312 999 46 13</a>
          </div>
          <div className="quick-contact__row">
            <span className="quick-contact__icon"><Icon paths={PHONE} size={20} strokeWidth={1.8} /></span>
            <a href="tel:+905330703629">+90 533 070 36 29 <small>(mobil)</small></a>
          </div>
          <div className="quick-contact__row">
            <span className="quick-contact__icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M20.52 3.48A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.15 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.69 1.45h.005c6.55 0 11.89-5.33 11.89-11.89 0-3.18-1.24-6.17-3.48-8.42zM12.05 21.79h-.004a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.89 9.89-9.89 2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.89 6.99c0 5.45-4.43 9.89-9.89 9.89zm5.42-7.41c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.46-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35z" />
              </svg>
            </span>
            <a href="https://wa.me/905330703629" target="_blank" rel="noopener noreferrer">
              WhatsApp&apos;tan yazın
            </a>
          </div>
          <div className="quick-contact__row">
            <span className="quick-contact__icon"><Icon paths={PIN} size={20} strokeWidth={1.8} /></span>
            <p>
              Kızılırmak Mah. Dumlupınar Bulvarı<br />
              No:3C1-160 Next Level Plaza<br />
              Çankaya / Ankara
            </p>
          </div>
          <div className="quick-contact__social">
            <a
              href="https://www.linkedin.com/company/model-yaz%C4%B1l%C4%B1m/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M4.98 3.5 C4.98 4.88 3.87 6 2.5 6 S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5 Z M0.4 8.4 H4.6 V23 H0.4 Z M8.6 8.4 H12.6 V10.4 C13.2 9.3 14.7 8.1 16.9 8.1 C21.4 8.1 22.3 11 22.3 14.8 V23 H18.1 V15.7 C18.1 13.9 18 11.6 15.6 11.6 C13.1 11.6 12.8 13.5 12.8 15.5 V23 H8.6 Z" />
              </svg>
            </a>
            <a
              href="https://www.youtube.com/@modelteknoloji"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M23 7.2 C22.7 6 21.8 5.1 20.6 4.8 C18.5 4.3 12 4.3 12 4.3 S5.5 4.3 3.4 4.8 C2.2 5.1 1.3 6 1 7.2 C0.5 9.3 0.5 12 0.5 12 S0.5 14.7 1 16.8 C1.3 18 2.2 18.9 3.4 19.2 C5.5 19.7 12 19.7 12 19.7 S18.5 19.7 20.6 19.2 C21.8 18.9 22.7 18 23 16.8 C23.5 14.7 23.5 12 23.5 12 S23.5 9.3 23 7.2 Z M9.8 15.3 V8.7 L15.8 12 Z" />
              </svg>
            </a>
            <a
              href="https://www.instagram.com/modelteknoloji/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.43.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.43.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.43-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.43-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16Zm0 1.98c-3.14 0-3.51.01-4.75.07-1.15.05-1.77.24-2.18.4-.55.21-.94.47-1.35.88-.41.41-.67.8-.88 1.35-.16.41-.35 1.03-.4 2.18-.06 1.24-.07 1.61-.07 4.75s.01 3.51.07 4.75c.05 1.15.24 1.77.4 2.18.21.55.47.94.88 1.35.41.41.8.67 1.35.88.41.16 1.03.35 2.18.4 1.24.06 1.61.07 4.75.07s3.51-.01 4.75-.07c1.15-.05 1.77-.24 2.18-.4.55-.21.94-.47 1.35-.88.41-.41.67-.8.88-1.35.16-.41.35-1.03.4-2.18.06-1.24.07-1.61.07-4.75s-.01-3.51-.07-4.75c-.05-1.15-.24-1.77-.4-2.18-.21-.55-.47-.94-.88-1.35-.41-.41-.8-.67-1.35-.88-.41-.16-1.03-.35-2.18-.4-1.24-.06-1.61-.07-4.75-.07Zm0 3.37a6.49 6.49 0 1 1 0 12.98 6.49 6.49 0 0 1 0-12.98Zm0 1.98a4.51 4.51 0 1 0 0 9.02 4.51 4.51 0 0 0 0-9.02Zm6.71-3.5a1.52 1.52 0 1 1 0 3.03 1.52 1.52 0 0 1 0-3.03Z" />
              </svg>
            </a>
            <a
              href="https://wa.me/905330703629"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M20.52 3.48A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.15 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.69 1.45h.005c6.55 0 11.89-5.33 11.89-11.89 0-3.18-1.24-6.17-3.48-8.42zM12.05 21.79h-.004a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.89 9.89-9.89 2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.89 6.99c0 5.45-4.43 9.89-9.89 9.89zm5.42-7.41c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.46-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35z" />
              </svg>
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
