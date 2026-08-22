"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const NAV: Array<{ section?: string; items: Array<{ icon: string; label: string; href: string }> }> = [
  { items: [
    { icon: "▦", label: "Dashboard", href: "/dashboard" },
    { icon: "🧭", label: "My Journey", href: "/learning-path" },
    { icon: "📚", label: "Lessons", href: "/learn" },
  ] },
  { section: "Practice", items: [
    { icon: "⚡", label: "Quick Practice", href: "/practice" },
    { icon: "🌍", label: "Worlds & Missions", href: "/worlds" },
    { icon: "💬", label: "Conversation", href: "/conversation" },
    { icon: "🎙️", label: "Say It Better", href: "/say-it-better" },
    { icon: "🗣️", label: "Pronunciation", href: "/pronunciation" },
  ] },
  { section: "Review & Progress", items: [
    { icon: "🎯", label: "Review & Mastery", href: "/review" },
    { icon: "📈", label: "Progress", href: "/progress" },
    { icon: "⚠️", label: "Mistakes", href: "/mistakes" },
    { icon: "🏆", label: "Achievements", href: "/achievements" },
    { icon: "🥇", label: "Leaderboard", href: "/leaderboard" },
  ] },
  { section: "Skills", items: [
    { icon: "👂", label: "English Ear", href: "/english-ear" },
    { icon: "📖", label: "Reading Engine", href: "/reading" },
    { icon: "✍️", label: "Writing", href: "/writing" },
    { icon: "🔤", label: "Vocabulary", href: "/vocabulary" },
    { icon: "🧩", label: "Grammar", href: "/grammar" },
    { icon: "💡", label: "Thinking in English", href: "/thinking-in-english" },
  ] },
  { section: "More", items: [
    { icon: "🎓", label: "Tests & Exams", href: "/pathways" },
    { icon: "🥗", label: "Chunks & Mediation", href: "/chunks" },
    { icon: "🤖", label: "Teacher AI", href: "/teacher-help" },
    { icon: "👥", label: "Community", href: "/community" },
    { icon: "⚙️", label: "Settings", href: "/settings" },
  ] },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="app-shell">
      <aside className="snav" aria-label="Primary navigation">
        <Link className="snav-brand" href="/dashboard"><img src="/logo.png" alt="" width={34} height={34} className="brand-logo" /> <strong>English Wizard</strong></Link>
        <nav>
          {NAV.map((group, gi) => (
            <div key={gi}>
              {group.section ? <div className="snav-section">{group.section}</div> : null}
              {group.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link key={item.label} className={`snav-item ${active ? "active" : ""}`} href={item.href}>
                    <span aria-hidden="true" className="snav-icon">{item.icon}</span> {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        <a className="upgrade-btn" href="/pathways">👑 Go Premium</a>
      </aside>
      <div className="dash-host">{children}</div>
    </div>
  );
}
