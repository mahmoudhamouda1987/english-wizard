import { isAuditMode } from "@/src/infrastructure/audit-mode";
import { AuditPanel } from "./panel";

export const metadata = { title: "Audit — English Wizard", robots: { index: false, follow: false } };

/**
 * Developer audit control panel (spec Parts 94–99). The page itself is
 * rendered ONLY when the environment enables audit mode — in production this
 * route shows a locked state and every control API returns 404. It is never
 * linked from navigation.
 */
export default function AuditPage() {
  if (!isAuditMode()) {
    return (
      <main style={{ minHeight: "70vh", display: "grid", placeItems: "center", padding: 24 }}>
        <div className="panel" style={{ padding: 32, maxWidth: 460, textAlign: "center" }}>
          <h1 style={{ margin: "0 0 8px", fontSize: 22 }}>Audit unavailable</h1>
          <p className="subtle" style={{ margin: 0 }}>
            Audit mode is disabled on this deployment. It can only be enabled with
            <code style={{ padding: "2px 6px", borderRadius: 6, background: "var(--surface-hover)" }}> AUDIT_MODE=true </code>
            in a non-production environment.
          </p>
        </div>
      </main>
    );
  }
  return <AuditPanel />;
}
