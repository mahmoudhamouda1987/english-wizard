"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/app/components/theme-toggle";

/**
 * Public verification (2.0 Parts 88/92-93).
 * Anyone holding a verification reference can confirm it was issued by
 * English Wizard. No personal data beyond the issued level and date.
 */

export default function VerificationPage() {
  const [id, setId] = useState(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("id") ?? "";
  });
  const [state, setState] = useState<"idle" | "checking" | "valid" | "unknown">("idle");
  const [detail, setDetail] = useState<string>("");

  const checkedRef = useRef(false);
  useEffect(() => {
    // Verify once on load when a reference is present in the URL.
    if (id && !checkedRef.current) {
      checkedRef.current = true;
      void check(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function check(reference: string) {
    const ref = reference.trim();
    if (!ref) return;
    setState("checking");
    setDetail("");
    try {
      const res = await fetch(`/api/verify?id=${encodeURIComponent(ref)}`, { cache: "no-store" });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.valid) {
        setState("valid");
        setDetail(data.detail ?? "Issued by English Wizard.");
      } else {
        setState("unknown");
        setDetail(data?.error ?? "No matching record.");
      }
    } catch {
      setState("unknown");
      setDetail("Verification service unavailable. Please try again shortly.");
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg-muted)", padding: "24px 16px" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, fontWeight: 700, color: "var(--text-primary)", textDecoration: "none" }}>
            English Wizard · Verification
          </Link>
          <ThemeToggle />
        </header>

        <section className="panel" style={{ padding: 28 }}>
          <h1 style={{ marginTop: 0, fontSize: 24 }}>Verify a credential</h1>
          <p className="subtle" style={{ lineHeight: 1.65 }}>
            Enter the verification reference shown on a Fluency Passport, report or certificate. English Wizard confirms
            whether the record was genuinely issued — the CEFR-aligned evidence stays honest and checkable.
          </p>
          <form
            onSubmit={(e) => { e.preventDefault(); void check(id); }}
            style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}
          >
            <input
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="Verification reference (e.g. EW-1A2B3C4D5E)"
              aria-label="Verification reference"
              style={{ flex: "1 1 260px", padding: "12px 14px", borderRadius: 10, border: "1px solid var(--border-default)", background: "var(--bg-primary)", color: "var(--text-primary)", fontSize: 14 }}
            />
            <button type="submit" className="button" disabled={state === "checking"}>
              {state === "checking" ? "Checking…" : "Verify"}
            </button>
          </form>

          {state === "valid" && (
            <p role="status" style={{ marginTop: 18, padding: "14px 16px", borderRadius: 10, background: "var(--bg-muted)", color: "var(--success)", fontWeight: 600 }}>
              Verified — {detail}
            </p>
          )}
          {state === "unknown" && (
            <p role="status" style={{ marginTop: 18, padding: "14px 16px", borderRadius: 10, background: "var(--bg-muted)", color: "var(--danger)", fontWeight: 600 }}>
              Not verified — {detail}
            </p>
          )}
          <p className="subtle" style={{ marginTop: 22, fontSize: 13 }}>
            Credentials issued here are CEFR-aligned English Wizard assessments. They are not government, IELTS or Cambridge certifications.
          </p>
        </section>
      </div>
    </main>
  );
}
