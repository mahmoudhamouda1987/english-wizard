"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import { ThemeToggle } from "@/app/components/theme-toggle";
import { InstallButton } from "@/app/components/install-button";
import { NAV_GROUPS, NAV_FLAT } from "@/app/components/nav-config";
import type { NavGroup } from "@/app/components/nav-config";
import { IconChevron, IconMenu, IconClose, IconSearch, IconHome, IconRoute, IconChat, IconChart, IconBulb } from "@/app/components/nav-icons";

/** Mobile bottom tab bar — five calm destinations, everything else in More. */
const TABBAR = [
  { label: "Home", href: "/dashboard", icon: IconHome },
  { label: "Learn", href: "/learning-path", icon: IconRoute },
  { label: "Practise", href: "/conversation", icon: IconChat },
  { label: "Progress", href: "/progress", icon: IconChart },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function groupDefaultOpen(pathname: string, group: NavGroup) {
  return group.items.some((i) => isActive(pathname, i.href));
}

/* Persisted sidebar group state (spec Part 37: state remembered).
 * localStorage is an external store, so we read it through
 * useSyncExternalStore — the server snapshot is empty defaults, and React
 * re-renders with the stored value after hydration without a mismatch. */
const navOverridesCache: { raw: string | null; value: Record<string, boolean> } = { raw: null, value: {} };

function readNavOverrides(): Record<string, boolean> {
  let raw: string | null = null;
  try { raw = window.localStorage.getItem("ew-nav-groups"); } catch { /* storage unavailable */ }
  if (raw !== navOverridesCache.raw) {
    navOverridesCache.raw = raw;
    try { navOverridesCache.value = raw ? JSON.parse(raw) : {}; } catch { navOverridesCache.value = {}; }
  }
  return navOverridesCache.value;
}

const navStore = {
  listeners: new Set<() => void>(),
  subscribe(listener: () => void) {
    navStore.listeners.add(listener);
    return () => { navStore.listeners.delete(listener); };
  },
  set(next: Record<string, boolean>) {
    try { window.localStorage.setItem("ew-nav-groups", JSON.stringify(next)); } catch { /* session-only */ }
    navOverridesCache.raw = null; // invalidate so the next read reparses
    navStore.listeners.forEach((l) => l());
  },
};

function SidebarNav({ pathname, compact, onNavigate }: { pathname: string; compact?: boolean; onNavigate?: () => void }) {
  // User overrides persist across visits; a group is open by default when it holds the active route.
  const overrides = useSyncExternalStore<Record<string, boolean>>(navStore.subscribe, readNavOverrides, () => ({}));

  function toggle(key: string, defaultValue: boolean) {
    navStore.set({ ...overrides, [key]: !(overrides[key] ?? defaultValue) });
  }

  return (
    <nav aria-label="Primary navigation" onClick={onNavigate} style={{ display: "grid", gap: 2 }}>
      {NAV_GROUPS.map((group) => {
        const isOpen = overrides[group.key] ?? groupDefaultOpen(pathname, group);
        return (
          <div key={group.key} className={`snav-group ${isOpen ? "open" : ""}`}>
            <button
              type="button"
              className="snav-group-toggle"
              onClick={() => toggle(group.key, groupDefaultOpen(pathname, group))}
              aria-expanded={isOpen}
              aria-controls={`nav-group-${group.key}`}
            >
              {group.label}
              <span className="chev" aria-hidden="true"><IconChevron size={13} /></span>
            </button>
            {!compact && <div className="snav-group-desc">{group.desc}</div>}
            <div id={`nav-group-${group.key}`} className="snav-group-items" style={{ display: isOpen ? "grid" : "none" }}>
              {group.items.map((item) => {
                const active = isActive(pathname, item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    className={`snav-item ${active ? "active" : ""}`}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    title={item.desc ?? item.label}
                  >
                    <span className="snav-icon" aria-hidden="true"><Icon /></span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawer, setDrawer] = useState(false);
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<{ cefr: string; percent: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/dashboard", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled || !d?.level) return;
        const next = { cefr: String(d.level), percent: Math.min(100, Math.max(0, Number(d.overallPercent) || 0)) };
        setLevel(next);
        try { sessionStorage.setItem("ew-level", JSON.stringify(next)); } catch { /* ignore */ }
      })
      .catch(() => { /* widget keeps its resting state */ });
    return () => { cancelled = true; };
  }, []);

  function search(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    const hit = NAV_FLAT.find((item) => item.label.toLowerCase().includes(q.toLowerCase()));
    if (hit && hit.href !== "/dashboard") router.push(hit.href);
    else router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  const moreActive = !TABBAR.some((t) => isActive(pathname, t.href));

  return (
    <div className="app-shell">
      <aside className="snav" aria-label="Sidebar navigation">
        <Link className="snav-brand" href="/dashboard">
          <Image src="/logo.png" alt="" width={34} height={34} className="brand-logo" unoptimized />
          <strong>English Wizard</strong>
        </Link>
        <SidebarNav pathname={pathname} />
        <div className="cefr-widget" aria-label="Current level">
          <div className="cefr-top"><span>Current level</span></div>
          <div className="cefr-level">{level?.cefr ?? "—"}</div>
          <div className="mini-track" aria-hidden="true"><span style={{ width: `${level?.percent ?? 0}%` }} /></div>
        </div>
        <InstallButton />
        <Link className="upgrade-btn" href="/plan">Go further with Premium</Link>
      </aside>

      <div className="dash-host">
        <header className="top-header">
          <button type="button" className="th-icon-btn menu-btn" aria-label="Open menu" onClick={() => setDrawer(true)}>
            <IconMenu />
          </button>
          <Link className="th-brand" href="/dashboard">
            <Image src="/logo.png" alt="" width={26} height={26} className="brand-logo" unoptimized />
            English&nbsp;Wizard
          </Link>
          <form className="th-search" role="search" onSubmit={search}>
            <IconSearch size={15} />
            <input aria-label="Search the platform" placeholder="Search lessons, skills, tools…" value={query} onChange={(e) => setQuery(e.target.value)} />
            <kbd>Ctrl K</kbd>
          </form>
          <div className="th-spacer" />
          <Link className="th-icon-btn" href="/review" aria-label="Review queue">
            <IconTargetIcon />
          </Link>
          <ThemeToggle />
          <Link className="avatar" href="/settings" aria-label="Your account">EW</Link>
        </header>
        {children}
      </div>

      <nav className="mobile-tabbar" aria-label="Primary mobile navigation">
        {TABBAR.map((t) => {
          const Icon = t.icon;
          const active = isActive(pathname, t.href);
          return (
            <Link key={t.label} href={t.href} className={active ? "active" : ""} aria-current={active ? "page" : undefined}>
              <Icon size={21} />
              {t.label}
            </Link>
          );
        })}
        <button type="button" onClick={() => setDrawer(true)} className={moreActive ? "active" : ""} aria-label="More sections">
          <IconBulb size={21} />
          More
        </button>
      </nav>

      <div className="mobile-drawer-bg" data-open={drawer} onClick={() => setDrawer(false)} aria-hidden="true" />
      <div className="mobile-drawer" data-open={drawer} role="dialog" aria-modal="true" aria-label="Navigation menu">
        <div className="snav-head">
          <Link className="snav-brand" href="/dashboard">
            <Image src="/logo.png" alt="" width={30} height={30} className="brand-logo" unoptimized />
            <strong>English Wizard</strong>
          </Link>
          <button type="button" className="th-icon-btn" aria-label="Close menu" onClick={() => setDrawer(false)} style={{ background: "transparent", border: 0, color: "inherit" }}>
            <IconClose />
          </button>
        </div>
        <SidebarNav pathname={pathname} compact onNavigate={() => setDrawer(false)} />
        <Link className="upgrade-btn" href="/plan" style={{ marginTop: 16 }}>Go further with Premium</Link>
      </div>
    </div>
  );
}

function IconTargetIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.2" fill="currentColor" />
    </svg>
  );
}
