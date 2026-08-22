import { createHmac } from "crypto";
import QRCode from "qrcode";

/**
 * Certificates carry a verifiable HMAC fingerprint so anyone holding the public
 * URL can confirm the record was issued by this platform and has not been altered.
 */
export function certificateFingerprint(id: string, level: string, issuedAt: Date): string {
  const secret = process.env.CERT_SIGNING_SECRET ?? process.env.APP_SECRET ?? "english-wizard-dev-secret";
  return createHmac("sha256", secret).update(`${id}|${level}|${issuedAt.toISOString()}`).digest("hex").slice(0, 32);
}

export async function certificateQrDataUrl(verifyUrl: string): Promise<string> {
  return QRCode.toDataURL(verifyUrl, { width: 220, margin: 1, color: { dark: "#1d1444", light: "#ffffff" } });
}
