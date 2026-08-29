import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { query } from "@/src/infrastructure/database";
import { certificateFingerprint, certificateQrDataUrl } from "@/src/domain/certificate-verification";

export const dynamic = "force-dynamic";

interface CertRow { display_name: string; level: string; overall_percent: number; issued_at: Date; revoked: boolean }

const LEVEL_DESCRIPTION: Record<string, string> = {
  "Pre-A1": "Beginner — can understand and use familiar everyday expressions.",
  A1: "Elementary — can communicate in simple, routine tasks.",
  A2: "Basic user — can describe immediate environment and needs.",
  B1: "Independent user — can deal with most situations while travelling.",
  B2: "Upper-intermediate — can interact with fluency and spontaneity.",
  C1: "Advanced — can use language flexibly for social and professional purposes.",
  C2: "Mastery — can express themselves effortlessly and precisely.",
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return { title: "Certificate not found" };
  const certs = await query<CertRow>(`SELECT display_name, level, overall_percent, issued_at, revoked FROM certificates WHERE id = $1`, [id]);
  const cert = certs.rows[0];
  if (!cert || cert.revoked) return { title: "Certificate not found" };
  const title = `${cert.display_name} — CEFR ${cert.level} · English Wizard`;
  const description = `Verified evidence-based proficiency record: ${LEVEL_DESCRIPTION[cert.level] ?? ""} Overall mastery ${cert.overall_percent}%.`;
  return { title, description, openGraph: { title, description }, twitter: { card: "summary_large_image", title, description } };
}

export default async function CertificatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const certs = await query<CertRow>(`SELECT display_name, level, overall_percent, issued_at, revoked FROM certificates WHERE id = $1`, [id]);
  const cert = certs.rows[0];
  if (!cert || cert.revoked) notFound();

  const fingerprint = certificateFingerprint(id, cert.level, new Date(cert.issued_at));
  const verifyUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/certificate/${id}`;
  const qr = await certificateQrDataUrl(verifyUrl);

  return (
    <main id="main-content" style={{ maxWidth: 780, margin: "0 auto", padding: "48px 24px" }}>
      <section className="panel" style={{ textAlign: "center", padding: "48px 32px", border: "3px solid #6840d6", borderRadius: 24 }}>
        <Image src="/logo.png" alt="English Wizard logo" width={72} height={72} style={{ borderRadius: 16 }} unoptimized />
        <p className="eyebrow" style={{ marginTop: 14 }}>Certificate of achievement</p>
        <h1 style={{ margin: "6px 0 2px" }}>{cert.display_name}</h1>
        <p className="subtle">has demonstrated an evidence-based proficiency level of</p>
        <div style={{ fontSize: 56, fontWeight: 800, color: "#4626b8", letterSpacing: "-.02em", margin: "8px 0" }}>{cert.level}</div>
        <p style={{ color: "#5b6272", maxWidth: 480, margin: "0 auto 18px" }}>{LEVEL_DESCRIPTION[cert.level] ?? ""}</p>
        <p><strong>Overall mastery score:</strong> {cert.overall_percent}%</p>
        <p className="subtle">Issued {new Date(cert.issued_at).toLocaleDateString("en", { year: "numeric", month: "long", day: "numeric" })}</p>
        <Image src={qr} alt={`QR code linking to verification page ${verifyUrl}`} width={160} height={160} style={{ margin: "18px auto 6px", borderRadius: 12, border: "1px solid #e4e8f0" }} unoptimized />
        <p className="subtle" style={{ fontSize: 12 }}>Scan to verify this credential</p>
        <div style={{ display: "inline-block", marginTop: 10, padding: "8px 14px", background: "#f4f2fb", borderRadius: 10, fontSize: 11, fontFamily: "monospace", color: "#4626b8" }}>
          Signature {fingerprint.slice(0, 16)}…{fingerprint.slice(-8)}
        </div>
        <p className="subtle" style={{ marginTop: 16, fontSize: 12 }}>
          Verifiable record · ID {id}<br />
          This certificate reflects measured learning evidence inside English Wizard, follows the CEFR scale,
          and carries a tamper-evident signature bound to the holder, level and issue date.
        </p>
        <Link className="button secondary" href="/" style={{ marginTop: 16, display: "inline-block" }}>Learn with English Wizard →</Link>
      </section>
    </main>
  );
}
