import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Every page opens with the same professional structure (Part 68):
 * eyebrow context, title, one-line purpose statement, optional primary action.
 */
export function PageHeader({
  eyebrow,
  title,
  purpose,
  action,
  actionHref,
  children,
}: {
  eyebrow?: string;
  title: string;
  purpose: string;
  action?: string;
  actionHref?: string;
  children?: ReactNode;
}) {
  return (
    <header className="page-header">
      <div>
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1>{title}</h1>
        <p className="ph-sub">{purpose}</p>
        {children}
      </div>
      {action && actionHref ? (
        <div className="ph-actions">
          <Link className="button" href={actionHref}>{action}</Link>
        </div>
      ) : null}
    </header>
  );
}
