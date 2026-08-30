import type { ComponentType } from "react";
import {
  IconHome, IconRoute, IconBook, IconGlobe, IconChat, IconMask, IconMic, IconWand,
  IconClock, IconShield, IconTarget, IconFolder, IconEar, IconFilm, IconPen,
  IconLetters, IconPuzzle, IconBulb, IconCertificate, IconTeacher, IconUsers,
  IconGift, IconGear, IconChart, IconBriefcase, IconBoard, IconFlame,
} from "./nav-icons";

export interface NavItem {
  label: string;
  href: string;
  icon: ComponentType<{ size?: number }>;
  /** One-line description shown under group headings and in the mobile drawer. */
  desc?: string;
}

export interface NavGroup {
  key: string;
  label: string;
  desc: string;
  items: NavItem[];
}

/**
 * 2.0 information architecture (spec Part 37 — normative group structure):
 * nine collapsible groups. ASSESS is a pure assessment area (Tests & Exams);
 * products own their routes in PRODUCTS (General English, Business English,
 * Fluency Track, IELTS, Cambridge). TOOLS: Teacher AI, Community, Invite Friends.
 * Still absent by design: Quick Practice, Leaderboard, LevelQuest duplicate
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
    label: "Learn",
    desc: "Your path, lessons and worlds.",
    items: [
      { label: "My Journey", href: "/learning-path", icon: IconRoute, desc: "Your level-by-level path" },
      { label: "Lessons", href: "/learn", icon: IconBook, desc: "Guided lessons in sequence" },
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
    key: "products",
    label: "Products",
    desc: "Five focused programmes.",
    items: [
      { label: "General English", href: "/general-english", icon: IconGlobe, desc: "Pre-A1 → C2 core curriculum" },
      { label: "Business English", href: "/business-english", icon: IconBriefcase, desc: "Real workplace outcomes" },
      { label: "Fluency Track", href: "/fluency-track", icon: IconFlame, desc: "Spoken fluency, B1 → C2" },
      { label: "IELTS", href: "/ielts", icon: IconBoard, desc: "Academic & General Training" },
      { label: "Cambridge", href: "/cambridge", icon: IconCertificate, desc: "A2 Key → C2 Proficiency" },
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
