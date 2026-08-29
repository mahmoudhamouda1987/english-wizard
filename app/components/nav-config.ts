import type { ComponentType } from "react";
import {
  IconHome, IconRoute, IconBook, IconGlobe, IconChat, IconMask, IconMic, IconWand,
  IconClock, IconShield, IconTarget, IconFolder, IconEar, IconFilm, IconPen,
  IconLetters, IconPuzzle, IconBulb, IconCertificate, IconTeacher, IconUsers,
  IconGift, IconGear, IconChart,
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
 * Final information architecture (Part 99):
 * eight collapsible groups, one assessment destination, no duplicates.
 * Removed: Quick Practice, Leaderboard, LevelQuest duplicate navigation,
 * standalone Mistakes (folded into Review & Mastery) and Achievements
 * (folded into Portfolio & Evidence).
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
    key: "assess-prepare",
    label: "Assess & Prepare",
    desc: "Checkpoints and exams.",
    items: [
      { label: "Tests & Exams", href: "/pathways", icon: IconCertificate },
      { label: "Chunks & Mediation", href: "/chunks", icon: IconPuzzle },
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
