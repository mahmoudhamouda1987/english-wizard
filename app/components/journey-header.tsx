import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/app/components/theme-toggle";

/**
 * Slim persistent header for the onboarding / assessment journey (Part 8).
 * The learner always feels inside the same English Wizard product:
 * brand + journey context on the left, theme switcher + exit on the right.
 */
export function JourneyHeader({ context, exitHref = "/" }: { context: string; exitHref?: string }) {
  return (
    <header className="journey-header">
      <div className="journey-header-inner">
        <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
          <Image src="/logo.png" alt="" width={28} height={28} className="brand-logo" unoptimized />
          <strong style={{ fontSize: 15 }}>English Wizard</strong>
          <span className="pill">{context}</span>
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
          <ThemeToggle />
          <Link className="button secondary" style={{ padding: "8px 14px", fontSize: 13 }} href={exitHref}>Exit</Link>
        </span>
      </div>
    </header>
  );
}
