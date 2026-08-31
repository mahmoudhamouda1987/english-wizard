import type { ComponentType } from "react";
import {
  IconHome, IconRoute, IconBook, IconGlobe, IconChat, IconMask, IconMic, IconWand,
  IconClock, IconShield, IconTarget, IconFolder, IconEar, IconFilm, IconPen,
  IconLetters, IconPuzzle, IconBulb, IconCertificate, IconTeacher, IconUsers,
  IconGift, IconGear, IconChart, IconBriefcase, IconBoard, IconFlame,
} from "./nav-icons";
import type { CatalogueProduct } from "@/src/domain/entitlements";

export interface NavItem {
  label: string;
  href: string;
  icon: ComponentType<{ size?: number }>;
  /** One-line description shown under group headings and in the mobile drawer. */
  desc?: string;
  /** When set, the item is a subscribable product — the shell renders a lock/unlock badge from the subscription. */
  product?: CatalogueProduct;
}

export interface NavGroup {
  key: string;
  label: string;
  desc: string;
  items: NavItem[];
}

/**
 * 2.0 information architecture (Part 37 + learning-paths consolidation):
 * LEARNING PATHS is the commercial spine — the five products are its
 * sub-tabs (lock badges reflect the subscription; during AUDIT_MODE every
 * path stays accessible). ASSESS is a pure assessment area (Tests & Exams:
 * Full Check placement and full mock exams only). The former standalone
 * PRODUCTS group is retired — its five courses live under Learning Paths.
 * Still absent by design: Quick Practice, Leaderboard, LevelCheck duplicate
 * navigation, standalone Mistakes/Achievements (redirected), Chunks & Mediation
 * and Search (routes remain reachable; deliberately not in the sidebar).
 */
export const NAV_GROUPS: NavGroup[] = [
  {
    key: "home",
    label: "Home",
    desc: "Your daily starting point.",
    items: [{ label: "Dashboard", href: "/dashboard", icon: IconHome }],
  },
  {
    key: "learn",
    label: "Learning Paths",
    desc: "Five products, one journey.",
    items: [
      { label: "General English", href: "/general-english", icon: IconGlobe, product: "general-english", desc: "Pre-A1 → C2 core curriculum" },
      { label: "Business English", href: "/business-english", icon: IconBriefcase, product: "business-english", desc: "Real workplace outcomes" },
      { label: "Fluency Track (Conversation)", href: "/fluency-track", icon: IconFlame, product: "fluency-track", desc: "Spoken fluency, B1 → C2" },
      { label: "IELTS Preparation", href: "/ielts", icon: IconBoard, product: "ielts", desc: "Academic & General Training" },
      { label: "Cambridge English Qualifications", href: "/cambridge", icon: IconCertificate, product: "cambridge", desc: "A2 Key → C2 Proficiency" },
      { label: "My Journey", href: "/learning-path", icon: IconRoute, desc: "Your level-by-level path" },
      { label: "Worlds & Missions", href: "/worlds", icon: IconGlobe, desc: "Learn through worlds" },
    ],
  },
  {
    key: "practise",
    label: "Practise",
    desc: "Live skills, every day.",
    items: [
      { label: "Conversation", href: "/conversation", icon: IconChat },
      { label: "Role-play", href: "/roleplay", icon: IconMask },
      { label: "Speaking Coach", href: "/pronunciation", icon: IconMic },
      { label: "Say It Better", href: "/say-it-better", icon: IconWand },
      { label: "Voice Time Machine", href: "/time-machine", icon: IconClock },
      { label: "Reality Checkpoints", href: "/checkpoints", icon: IconShield },
    ],
  },
  {
    key: "review-progress",
    label: "Review & Progress",
    desc: "Strengthen and measure.",
    items: [
      { label: "Review & Mastery", href: "/review", icon: IconTarget },
      { label: "Progress & Insights", href: "/progress", icon: IconChart },
      { label: "Portfolio & Evidence", href: "/portfolio", icon: IconFolder },
    ],
  },
  {
    key: "skills",
    label: "Skills",
    desc: "Focused skill studios.",
    items: [
      { label: "English Ear", href: "/english-ear", icon: IconEar },
      { label: "Scenes", href: "/scenes", icon: IconFilm },
      { label: "Reading Engine", href: "/reading", icon: IconBook },
      { label: "Writing", href: "/writing", icon: IconPen },
      { label: "Vocabulary", href: "/vocabulary", icon: IconLetters },
      { label: "Grammar", href: "/grammar", icon: IconPuzzle },
      { label: "Thinking in English", href: "/thinking-in-english", icon: IconBulb },
    ],
  },
  {
    key: "assess",
    label: "Assess",
    desc: "Checkpoints and exams.",
    items: [
      { label: "Tests & Exams", href: "/pathways", icon: IconCertificate, desc: "LevelCheck, mocks and module tests" },
    ],
  },
  {
    key: "tools",
    label: "Tools",
    desc: "Support and community.",
    items: [
      { label: "Teacher AI", href: "/teacher-help", icon: IconTeacher },
      { label: "Community", href: "/community", icon: IconUsers },
      { label: "Invite Friends", href: "/referral", icon: IconGift },
    ],
  },
  {
    key: "account",
    label: "Account",
    desc: "Your preferences.",
    items: [{ label: "Settings", href: "/settings", icon: IconGear }],
  },
];

/** Flat list for search and mobile tab bar lookups. */
export const NAV_FLAT = NAV_GROUPS.flatMap((g) => g.items.map((i) => ({ ...i, group: g.label })));
