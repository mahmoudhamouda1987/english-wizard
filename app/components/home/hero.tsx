"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/app/components/theme-toggle";
import {
  IconHeadphones, IconMic, IconBook, IconPen, IconMenu, IconClose,
  IconShield, IconTarget, IconRoute, IconDoc, IconChart,
} from "./icons";

const NAV = [
  { label: "Learn", href: "/dashboard" },
  { label: "Levels", href: "/#cefr" },
  { label: "Skills", href: "/#skills" },
  { label: "LevelCheck", href: "/diagnostic" },
  { label: "For Organizations", href: "/#organizations" },
  { label: "Pricing", href: "/pricing" },
];

const SKILLS = [
  { key: "listening", label: "Listening", score: "A2", icon: IconHeadphones,
    text: "Train your ear with real conversations, captioned audio and questions that adapt to what you actually hear." },
  { key: "speaking", label: "Speaking", score: "B1", icon: IconMic,
    text: "Speak from day one. Record, compare yourself over time, and get feedback you can act on immediately." },
  { key: "reading", label: "Reading", score: "B2", icon: IconBook,
    text: "Work through articles and stories at your level, with instant help on the words that block you." },
  { key: "writing", label: "Writing", score: "B1+", icon: IconPen,
    text: "Write emails, essays and messages — every submission scored against visible criteria, never a black box." },
] as const;

const TRUST = [
  { icon: IconTarget, text: "CEFR-aligned learning" },
  { icon: IconRoute, text: "Pre-A1 → C2" },
  { icon: IconChart, text: "4 core skills" },
  { icon: IconShield, text: "Adaptive LevelCheck" },
  { icon: IconRoute, text: "Personalized learning path" },
  { icon: IconDoc, text: "Professional assessment report" },
];

const RAIL = ["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"];

export function Hero() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeSkill, setActiveSkill] = useState<string>("speaking");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const skill = SKILLS.find((s) => s.key === activeSkill) ?? SKILLS[1];

  return (
    <>
      <header className={`hp-nav${scrolled ? " is-scrolled" : ""}`}>
        <div className="hp-nav-inner">
          <Link className="hp-brand" href="/">
            <Image src="/logo.png" alt="English Wizard logo" width={34} height={34} unoptimized />
            English&nbsp;Wizard
          </Link>
          <nav className="hp-links" aria-label="Primary">
            {NAV.map((n) => (
              <Link key={n.label} href={n.href}>{n.label}</Link>
            ))}
          </nav>
          <div className="hp-nav-cta">
            <Link className="hp-nav-signin" href="/auth">Sign in</Link>
            <Link className="hp-btn hp-btn-primary" href="/diagnostic">Discover My Level</Link>
            <ThemeToggle />
          </div>
          <button
            className="hp-burger" aria-expanded={open} aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <IconClose /> : <IconMenu />}
          </button>
        </div>
        <div className={`hp-mobile-menu${open ? " open" : ""}`}>
          <nav aria-label="Mobile">
            <Link href="/diagnostic" onClick={() => setOpen(false)} style={{ fontWeight: 800, color: "#c9b8ff" }}>
              Discover My Level
            </Link>
            {NAV.map((n) => (
              <Link key={n.label} href={n.href} onClick={() => setOpen(false)}>{n.label}</Link>
            ))}
            <Link href="/auth" onClick={() => setOpen(false)}>Sign in</Link>
          </nav>
        </div>
      </header>

      <main id="main-content">
        <section className="hp-hero" aria-labelledby="hp-hero-title">
          <div className="hp-hero-inner">
            <div>
              <span className="hp-hero-badge"><i aria-hidden="true" />English Wizard · CEFR Pre-A1 → C2</span>
              <h1 id="hp-hero-title" className="hp-display hp-h1">
                Master English.
                <br />
                Know exactly
                <br />
                where <em className="hp-hero-em">you stand.</em>
              </h1>
              <p className="hp-lead">
                English Wizard measures your English, builds your personalized learning path,
                and helps you progress from Pre-A1 to C2 — with proof, not promises.
              </p>
              <div className="hp-hero-ctas">
                <Link className="hp-btn hp-btn-primary" href="/diagnostic">Discover My Level</Link>
                <Link className="hp-btn hp-btn-ghost on-dark" href="/plan">Explore the Journey</Link>
              </div>
              <p className="hp-hero-micro">Adaptive placement &bull; Pre-A1 to C2 &bull; About 30 minutes</p>

              <div className="hp-hero-rail" aria-label="CEFR journey from Pre-A1 to C2, example learner at B2">
                {RAIL.map((r, i) => (
                  <div key={r} className={`hp-rail-step${i < 4 ? " is-past" : i === 4 ? " is-now" : ""}`}>
                    <span className="hp-rail-dot">{r === "Pre-A1" ? "∅" : r}</span>
                    {i < RAIL.length - 1 && <span className="hp-rail-line" aria-hidden="true">{i < 3 && <i />}</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive learner ecosystem */}
            <div className="hp-eco" role="group" aria-label="Interactive preview of the English Wizard learner experience">
              <div className="hp-eco-card hp-eco-check" aria-hidden="true">
                <div className="hp-eco-check-head"><span>LevelCheck</span><span style={{ color: "#2fbd8f" }}>done</span></div>
                <div className="hp-eco-check-body">
                  <div style={{ fontSize: 13, fontWeight: 700 }}>Result: <span style={{ color: "#6a3fe0" }}>B2 · Upper-intermediate</span></div>
                  <div className="hp-cefr-sbar"><span>Reading</span><span className="track"><i style={{ width: "78%" }} /></span></div>
                  <div className="hp-cefr-sbar"><span>Listening</span><span className="track"><i style={{ width: "64%" }} /></span></div>
                  <div className="hp-cefr-sbar"><span>Speaking</span><span className="track"><i style={{ width: "58%" }} /></span></div>
                </div>
              </div>

              <div className="hp-orbit">
                {SKILLS.map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    className="hp-skill"
                    data-active={activeSkill === s.key}
                    onMouseEnter={() => setActiveSkill(s.key)}
                    onFocus={() => setActiveSkill(s.key)}
                    onClick={() => setActiveSkill(s.key)}
                  >
                    <s.icon size={17} />
                    <span>{s.label}<small>{s.score}</small></span>
                  </button>
                ))}
              </div>

              <div className="hp-eco-center">
                <Image src="/logo.png" alt="" width={58} height={58} unoptimized />
                <strong>Learner profile</strong>
                <span className="hp-eco-level"><b>B2</b></span>
                <span className="hp-eco-next">Next milestone · C1</span>
              </div>

              <div className="hp-focus" aria-live="polite">
                <div className="hp-focus-head">
                  <skill.icon size={22} />
                  <strong>{skill.label} · {skill.score}</strong>
                </div>
                <p>{skill.text}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="hp-trust" aria-label="What English Wizard provides">
          <div className="hp-trust-inner">
            {TRUST.map((t) => (
              <span className="hp-trust-item" key={t.text}>
                <t.icon size={16} /> {t.text}
              </span>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
