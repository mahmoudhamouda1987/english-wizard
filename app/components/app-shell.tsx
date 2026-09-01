"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import { ThemeToggle } from "@/app/components/theme-toggle";
import { InstallButton } from "@/app/components/install-button";
import { NAV_GROUPS, NAV_FLAT, PRODUCT_ICON_COMPONENTS } from "@/app/components/nav-config";
import type { NavGroup, NavItem } from "@/app/components/nav-config";
import type { PlanTier, CatalogueProduct } from "@/src/domain/entitlements";
import { productAccessible, productAccessState, isProductUnlockedFor } from "@/src/domain/entitlements";
import { PRODUCT_CATALOGUE, productMeta } from "@/src/domain/product-catalogue";
import { IconChevron, IconMenu, IconClose, IconSearch, IconHome, IconChat, IconChart, IconBulb, IconLock, IconCheck } from "@/app/components/nav-icons";

/** Mobile bottom tab bar — five calm destinations, everything else in More. */
const TABBAR = [
  { label: "Home", href: "/dashboard", icon: IconHome },
  { label: "Learn", href: "/learning-paths", icon: IconBulb },
  { label: "Practise", href: "/conversation", icon: IconChat },
  { label: "Progress", href: "/progress", icon: IconChart },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function groupDefaultOpen(pathname: string, group: NavGroup) {
  return group.items.some((i) => isActive(pathname, i.href) || (i.children ?? []).some((c) => isActive(pathname, c.href)));
}

/* Persisted sidebar state (group open/closed, collapsed rail) — remembered
 * across visits. localStorage is an external store, so it is read through
 * useSyncExternalStore (makeLocalStore below): the server snapshot is empty
 * defaults, and React re-renders with the stored value after hydration
 * without a mismatch. */

function makeLocalStore(key: string) {
  const cache: { raw: string | null; value: Record<string, boolean> } = { raw: null, value: {} };
  return {
    subscribe(listener: () => void) {
      const wrapped = () => listener();
      window.addEventListener(`ew-store-${key}`, wrapped);
      return () => window.removeEventListener(`ew-store-${key}`, wrapped);
    },
    read(): Record<string, boolean> {
      let raw: string | null = null;
      try { raw = window.localStorage.getItem(key); } catch { /* storage unavailable */ }
      if (raw !== cache.raw) {
        cache.raw = raw;
        try { cache.value = raw ? JSON.parse(raw) : {}; } catch { cache.value = {}; }
      }
      return cache.value;
    },
    set(next: Record<string, boolean>) {
      try { window.localStorage.setItem(key, JSON.stringify(next)); } catch { /* session-only */ }
      cache.raw = null;
      window.dispatchEvent(new Event(`ew-store-${key}`));
    },
  };
}

const navStore = makeLocalStore("ew-nav-groups");
const collapsedStore = makeLocalStore("ew-sidebar-collapsed");

/** Name monogram: "John Smith" → JS; single name → its first two letters. */
function initialsFor(name: string | undefined | null): string {
  const trimmed = (name ?? "").trim();
  if (!trimmed) return "EW";
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return trimmed.slice(0, 2).toUpperCase();
}

/* ═══════════════════════════════════════════════════════════════════════════
 * CURRENT PATH SWITCHER — one premium control, two placements (sidebar block
 * and compact header chip). Entitled products are selectable; locked products
 * navigate to their explore page. In audit mode everything is selectable so
 * reviewers can walk every path (spec DoD: audit supports switching).
 * ═══════════════════════════════════════════════════════════════════════════ */

function PathSwitcher({ variant, tier, activeProduct, onSelect, onNavigate }: {
  variant: "sidebar" | "header";
  tier: PlanTier | null;
  activeProduct: CatalogueProduct | null;
  onSelect: (product: CatalogueProduct) => void;
  onNavigate?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const current = productMeta(activeProduct ?? "general-english");

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDocClick); document.removeEventListener("keydown", onKey); };
  }, [open]);

  const canSelect = (product: CatalogueProduct) => (tier ? productAccessible(tier, product) : true);

  return (
    <div className={`path-switcher path-switcher-${variant}`} ref={ref}>
      <button
        type="button"
        className="path-switcher-btn"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`Current path: ${current?.name ?? "General English"} — switch learning path`}
      >
        <span className="ps2-eyebrow">Current path</span>
        <span className="ps2-row">
          <span className="ps2-dot" style={{ background: current?.gradient }} aria-hidden="true" />
          <span className="ps2-name">{current?.name ?? "General English"}</span>
          <span className="chev" aria-hidden="true"><IconChevron size={13} /></span>
        </span>
        {variant === "sidebar" && <span className="ps2-level">B1 · Intermediate</span>}
      </button>
      {open && (
        <div className="path-switcher-menu" role="listbox" aria-label="Switch learning path">
          <div className="psm-head">Switch learning path</div>
          {PRODUCT_CATALOGUE.map((p) => {
            const Icon = PRODUCT_ICON_COMPONENTS[p.icon];
            const state = productAccessState(tier ?? "FREE", p.id, activeProduct);
            const selectable = canSelect(p.id);
            return (
              <button
                key={p.id}
                type="button"
                role="option"
                aria-selected={state === "CURRENT"}
                className={`psm-item ${state === "CURRENT" ? "current" : ""} ${selectable ? "" : "locked"}`}
                onClick={() => {
                  if (selectable) { onSelect(p.id); setOpen(false); onNavigate?.(); }
                  else { setOpen(false); onNavigate?.(); router.push(`/learning-paths/${p.id}`); }
                }}
              >
                <span className="psm-icon" style={{ background: p.gradient }} aria-hidden="true"><Icon size={15} /></span>
                <span className="psm-body">
                  <span className="psm-name">{p.name}</span>
                  <span className={`psm-state ${state.toLowerCase()}`}>
                    {state === "CURRENT" && <><IconCheck size={11} /> Current path</>}
                    {state === "ACTIVE" && <><IconCheck size={11} /> Active</>}
                    {state === "LOCKED" && <><IconLock size={10} /> Locked</>}
                  </span>
                </span>
                {!selectable && <span className="psm-explore">Explore</span>}
              </button>
            );
          })}
          <Link className="psm-foot" href="/learning-paths" onClick={() => { setOpen(false); onNavigate?.(); }}>
            Explore all five paths →
          </Link>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * SIDEBAR NAVIGATION — premium grouped rail with icon tiles, animated active
 * indicator and the expandable Skills Studio subgroup (auto-opens when a
 * studio route is active).
 * ═══════════════════════════════════════════════════════════════════════════ */

function NavRow({ item, pathname, depth, onNavigate }: { item: NavItem; pathname: string; depth: 0 | 1; onNavigate?: () => void }) {
  const active = isActive(pathname, item.href);
  const Icon = item.icon;
  return (
    <Link
      className={`snav-item depth-${depth} ${active ? "active" : ""}`}
      href={item.href}
      aria-current={active ? "page" : undefined}
      title={item.desc ?? item.label}
      onClick={() => onNavigate?.()}
    >
      <span className="snav-icon" aria-hidden="true"><Icon size={depth === 0 ? 16 : 14} /></span>
      <span className="snav-label">{item.label}</span>
      <span className="snav-focus-ring" aria-hidden="true" />
    </Link>
  );
}

function SidebarNav({ pathname, compact, collapsed, onNavigate }: { pathname: string; compact?: boolean; collapsed?: boolean; onNavigate?: () => void }) {
  const overrides = useSyncExternalStore<Record<string, boolean>>(navStore.subscribe, () => navStore.read(), () => ({}));

  function toggle(key: string, defaultValue: boolean) {
    navStore.set({ ...overrides, [key]: !(overrides[key] ?? defaultValue) });
  }

  return (
    <nav aria-label="Primary navigation" onClick={onNavigate} style={{ display: "grid", gap: 2 }}>
      {NAV_GROUPS.map((group) => {
        const isOpen = overrides[group.key] ?? groupDefaultOpen(pathname, group);
        return (
          <div key={group.key} className={`snav-group ${isOpen ? "open" : ""}`}>
            {!collapsed && (
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
            )}
            {collapsed && <div className="snav-group-divider" role="presentation" aria-label={group.label} />}
            {!collapsed && !compact && <div className="snav-group-desc">{group.desc}</div>}
            <div id={`nav-group-${group.key}`} className="snav-group-items" style={{ display: isOpen ? "grid" : "none" }}>
              {group.items.map((item) => {
                const hasChildren = Boolean(item.children?.length);
                const childActive = (item.children ?? []).some((c) => isActive(pathname, c.href));
                const selfActive = isActive(pathname, item.href);
                if (collapsed && !compact) {
                  // Collapsed rail: children flatten to their first destination anchor row.
                  return <NavRow key={item.label} item={item} pathname={pathname} depth={0} onNavigate={onNavigate} />;
                }
                return (
                  <div key={item.label} className={`snav-subtree ${hasChildren ? "has-children" : ""}`}>
                    {hasChildren ? (
                      <>
                        <button
                          type="button"
                          className={`snav-item snav-parent ${selfActive || childActive ? "active" : ""}`}
                          onClick={() => toggle(`${group.key}:${item.label}`, Boolean(childActive))}
                          aria-expanded={overrides[`${group.key}:${item.label}`] ?? Boolean(childActive)}
                          aria-controls={`nav-sub-${item.label.replace(/\s+/g, "-")}`}
                        >
                          <span className="snav-icon" aria-hidden="true"><item.icon size={16} /></span>
                          <span className="snav-label">{item.label}</span>
                          <span className="chev" aria-hidden="true"><IconChevron size={13} /></span>
                        </button>
                        <div
                          id={`nav-sub-${item.label.replace(/\s+/g, "-")}`}
                          className="snav-children"
                          style={{ display: (overrides[`${group.key}:${item.label}`] ?? Boolean(childActive)) ? "grid" : "none" }}
                        >
                          {(item.children ?? []).map((child) => (
                            <NavRow key={child.label} item={child} pathname={pathname} depth={1} onNavigate={onNavigate} />
                          ))}
                        </div>
                      </>
                    ) : (
                      <NavRow item={item} pathname={pathname} depth={0} onNavigate={onNavigate} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </nav>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * APP SHELL
 * ═══════════════════════════════════════════════════════════════════════════ */

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawer, setDrawer] = useState(false);
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<{ cefr: string; percent: number } | null>(null);
  const [tier, setTier] = useState<PlanTier | null>(null);
  const [activeProduct, setActiveProduct] = useState<CatalogueProduct | null>(null);
  const [firstName, setFirstName] = useState<string>("");
  const [avatar, setAvatar] = useState<{ initials: string; photoUrl: string | null }>({ initials: "EW", photoUrl: null });
  const [profileMenu, setProfileMenu] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const collapsedState = useSyncExternalStore<Record<string, boolean>>(collapsedStore.subscribe, () => collapsedStore.read(), () => ({}));
  // Derived straight from the persisted store — no state mirror, no cascading render.
  const collapsed = Boolean(collapsedState["collapsed"]);

  function toggleCollapsed() {
    collapsedStore.set({ ...collapsedState, collapsed: !collapsed });
  }

  const refreshProfile = useCallback(() => {
    fetch("/api/profile", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((p) => {
        if (!p?.profile) return;
        const name = String(p.profile.displayName ?? "");
        setFirstName(String(p.profile.displayName ?? "").split(/\s+/)[0] ?? "");
        setAvatar({ initials: initialsFor(name), photoUrl: typeof p.profile.avatarUrl === "string" && p.profile.avatarKind !== "initials" ? p.profile.avatarUrl : null });
        if (p.profile.activeProduct) setActiveProduct(p.profile.activeProduct as CatalogueProduct);
      })
      .catch(() => { /* keep current */ });
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/dashboard", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled || !d?.level) return;
        const next = { cefr: String(d.level), percent: Math.min(100, Math.max(0, Number(d.overallPercent) || 0)) };
        setLevel(next);
        setAvatar((a) => (a.initials === "EW" && d.firstName ? { ...a, initials: initialsFor(String(d.firstName)) } : a));
        setFirstName((f) => f || String(d.firstName ?? ""));
        try { sessionStorage.setItem("ew-level", JSON.stringify(next)); } catch { /* ignore */ }
      })
      .catch(() => { /* widget keeps its resting state */ });
    fetch("/api/subscription", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((s) => { if (!cancelled && s?.effectiveTier) setTier(String(s.gatingTier ?? s.effectiveTier) as PlanTier); })
      .catch(() => { /* badges stay neutral */ });
    refreshProfile();
    return () => { cancelled = true; };
  }, [refreshProfile]);

  // Settings can update the profile picture — refresh the header avatar instantly.
  useEffect(() => {
    function onAvatarChanged() { refreshProfile(); }
    window.addEventListener("ew-avatar-changed", onAvatarChanged);
    return () => window.removeEventListener("ew-avatar-changed", onAvatarChanged);
  }, [refreshProfile]);

  // Learning Paths hub can switch the product — the shell follows instantly.
  useEffect(() => {
    function onPathChanged(e: Event) {
      const detail = (e as CustomEvent<{ productId?: string }>).detail;
      if (detail?.productId) setActiveProduct(detail.productId as CatalogueProduct);
      refreshProfile();
    }
    window.addEventListener("ew-path-changed", onPathChanged);
    return () => window.removeEventListener("ew-path-changed", onPathChanged);
  }, [refreshProfile]);

  useEffect(() => {
    if (!profileMenu) return;
    function onDocClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileMenu(false);
    }
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setProfileMenu(false); }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDocClick); document.removeEventListener("keydown", onKey); };
  }, [profileMenu]);

  function selectPath(product: CatalogueProduct) {
    setActiveProduct(product);
    fetch("/api/profile", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ activeProduct: product }),
    })
      .then(async (r) => {
        if (!r.ok) {
          const payload = await r.json().catch(() => null);
          if (r.status === 403) {
            router.push(`/learning-paths/${product}`);
            return;
          }
          throw new Error(payload?.error ?? "Unable to switch path");
        }
        window.dispatchEvent(new CustomEvent("ew-path-changed", { detail: { productId: product } }));
      })
      .catch(() => { /* selection stays local */ });
  }

  function search(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    const hit = NAV_FLAT.find((item) => item.label.toLowerCase().includes(q.toLowerCase()));
    if (hit && hit.href !== "/dashboard") router.push(hit.href);
    else router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  async function signOut() {
    setProfileMenu(false);
    try { await fetch("/api/auth/logout", { method: "POST" }); } catch { /* clear locally anyway */ }
    router.push("/");
    router.refresh();
  }

  const moreActive = !TABBAR.some((t) => isActive(pathname, t.href));
  const currentMeta = productMeta(activeProduct ?? "general-english");
  const levelLine = level?.cefr ? `${level.cefr} · ${currentMeta?.shortName ?? "General"}` : currentMeta?.shortName ?? "";

  return (
    <div className="app-shell" data-collapsed={collapsed || undefined}>
      <aside className="snav" aria-label="Sidebar navigation" data-collapsed={collapsed || undefined}>
        <div className="snav-top">
          <Link className="snav-brand" href="/dashboard" title="English Wizard — Dashboard">
            <Image src="/logo.png" alt="" width={34} height={34} className="brand-logo" unoptimized />
            {!collapsed && <strong>English Wizard</strong>}
          </Link>
          <button
            type="button"
            className="snav-collapse-btn"
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-pressed={collapsed}
          >
            <span className="chev" style={{ display: "inline-flex", transform: collapsed ? "none" : "rotate(180deg)" }} aria-hidden="true"><IconChevron size={14} /></span>
          </button>
        </div>

        {!collapsed && (
          <div className="snav-path-block">
            <PathSwitcher variant="sidebar" tier={tier} activeProduct={activeProduct} onSelect={selectPath} />
          </div>
        )}

        <div className="snav-scroll">
          <SidebarNav pathname={pathname} collapsed={collapsed} />
        </div>

        <div className="snav-bottom">
          <div className="cefr-widget" aria-label="Current level">
            {!collapsed && <div className="cefr-top"><span>Current level</span></div>}
            <div className="cefr-level">{level?.cefr ?? "—"}</div>
            <div className="mini-track" aria-hidden="true"><span style={{ width: `${level?.percent ?? 0}%` }} /></div>
          </div>
          {!collapsed && <InstallButton />}
          {!collapsed && <Link className="upgrade-btn" href="/plan">Go further with All Access</Link>}
          <div className={`snav-profile ${profileMenu ? "open" : ""}`} ref={profileRef}>
            <button type="button" className="snav-profile-btn" onClick={() => setProfileMenu((v) => !v)} aria-expanded={profileMenu} aria-haspopup="menu" aria-label="Your account menu">
              <span className="avatar avatar-sm" aria-hidden="true">
                {avatar.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- data-URL profile pictures only
                  <img src={avatar.photoUrl} alt="" className="avatar-img" />
                ) : (
                  avatar.initials
                )}
              </span>
              {!collapsed && (
                <span className="snav-profile-meta">
                  <strong>{firstName || "Learner"}</strong>
                  <small>{levelLine}</small>
                </span>
              )}
              {!collapsed && <span className="chev" aria-hidden="true"><IconChevron size={12} /></span>}
            </button>
            {profileMenu && (
              <div className="snav-profile-menu" role="menu" aria-label="Account">
                <Link role="menuitem" href="/settings" onClick={() => setProfileMenu(false)}>Profile &amp; settings</Link>
                <Link role="menuitem" href="/billing" onClick={() => setProfileMenu(false)}>Billing &amp; subscription</Link>
                <Link role="menuitem" href="/plan" onClick={() => setProfileMenu(false)}>Plans</Link>
                <button type="button" role="menuitem" onClick={signOut}>Sign out</button>
              </div>
            )}
          </div>
        </div>
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
          <div className="th-path">
            <PathSwitcher variant="header" tier={tier} activeProduct={activeProduct} onSelect={selectPath} />
          </div>
          <form className="th-search" role="search" onSubmit={search}>
            <IconSearch size={15} />
            <input aria-label="Search the platform" placeholder="Search lessons, skills, tools…" value={query} onChange={(e) => setQuery(e.target.value)} />
            <kbd>Ctrl K</kbd>
          </form>
          <div className="th-spacer" />
          <ThemeToggle />
          <button type="button" className="avatar th-avatar" onClick={() => setProfileMenu(true)} aria-label="Your account">
            {avatar.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- data-URL profile pictures only
              <img src={avatar.photoUrl} alt="" className="avatar-img" />
            ) : (
              avatar.initials
            )}
          </button>
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
        <div className="mobile-drawer-path">
          <PathSwitcher variant="header" tier={tier} activeProduct={activeProduct} onSelect={selectPath} />
        </div>
        <div className="mobile-drawer-scroll">
          <SidebarNav pathname={pathname} compact onNavigate={() => setDrawer(false)} />
        </div>
        <Link className="upgrade-btn" href="/plan" style={{ margin: "12px 16px 16px" }}>Go further with All Access</Link>
      </div>
    </div>
  );
}

/** Exposed for tests / consumers that need the same initial logic. */
export { initialsFor, isProductUnlockedFor };
