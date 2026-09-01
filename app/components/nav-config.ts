import type { ComponentType } from "react";
import {
  IconHome, IconRoute, IconBook, IconGlobe, IconChat, IconMic, IconWand,
  IconShield, IconTarget, IconFolder, IconEar, IconFilm, IconPen,
  IconLetters, IconPuzzle, IconBulb, IconCertificate, IconTeacher, IconUsers,
  IconGift, IconGear, IconChart, IconBriefcase, IconBoard, IconFlame, IconLock,
} from "./nav-icons";

export interface NavItem {
  label: string;
  href: string;
  icon: ComponentType<{ size?: number }>;
  /** One-line description shown under group headings and in the mobile drawer. */
  desc?: string;
  /** Nested destinations (e.g. the Skills Studio studios) rendered indented. */
  children?: NavItem[];
}

export interface NavGroup {
  key: string;
  label: string;
  desc: string;
  items: NavItem[];
}

/**
 * 2.0 final information architecture (learning-paths spec, parts 2/45).
 *
 * The sidebar answers WHAT CAN I DO?; the five products live ONLY inside
 * LEARN → Learning Paths (the commercial hub) and are surfaced contextually
 * by the Current Path switcher in the header. No product appears twice.
 * Removed by design: standalone Products group, per-product sidebar items,
 * Check My English, Quick Practice, Leaderboard, LevelQuest destination,
 * Voice Time Machine / Review & Mastery nav rows (routes stay reachable).
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
    desc: "Choose and follow your journey.",
    items: [
      { label: "Learning Paths", href: "/learning-paths", icon: IconGlobe, desc: "The five English Wizard products" },
      { label: "My Journey", href: "/learning-path", icon: IconRoute, desc: "Your level-by-level path" },
      { label: "Lessons", href: "/lessons", icon: IconBook, desc: "Lessons from your current path" },
      { label: "Worlds & Missions", href: "/worlds", icon: IconGlobe, desc: "Learn through worlds" },
    ],
  },
  {
    key: "practise",
    label: "Practise",
    desc: "Live skills, every day.",
    items: [
      { label: "Conversation & Role-play", href: "/conversation", icon: IconChat },
      { label: "Speaking Coach", href: "/pronunciation", icon: IconMic },
      { label: "Say It Better", href: "/say-it-better", icon: IconWand },
      {
        label: "Skills Studio",
        href: "/english-ear",
        icon: IconBulb,
        desc: "Focused skill studios.",
        children: [
          { label: "English Ear", href: "/english-ear", icon: IconEar },
          { label: "Scenes", href: "/scenes", icon: IconFilm },
          { label: "Reading Studio", href: "/reading", icon: IconBook },
          { label: "Writing Studio", href: "/writing", icon: IconPen },
          { label: "Vocabulary Studio", href: "/vocabulary", icon: IconLetters },
          { label: "Grammar Studio", href: "/grammar", icon: IconPuzzle },
          { label: "Thinking in English", href: "/thinking-in-english", icon: IconBulb },
        ],
      },
    ],
  },
  {
    key: "assess",
    label: "Assess",
    desc: "Measure where you are.",
    items: [
      { label: "LevelCheck", href: "/diagnostic", icon: IconTarget, desc: "Adaptive placement — retake any time" },
      { label: "Checkpoints", href: "/checkpoints", icon: IconShield },
      { label: "Mock Exams", href: "/pathways", icon: IconCertificate, desc: "Full mock exams" },
    ],
  },
  {
    key: "track",
    label: "Track",
    desc: "Strengthen and prove it.",
    items: [
      { label: "Progress & Insights", href: "/progress", icon: IconChart },
      { label: "Study Plan & Readiness", href: "/study-plan", icon: IconTarget },
      { label: "Portfolio & Evidence", href: "/portfolio", icon: IconFolder },
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
    items: [
      { label: "Settings", href: "/settings", icon: IconGear },
      { label: "Billing & Subscription", href: "/billing", icon: IconGift },
    ],
  },
];

/** Flat list for search and mobile tab bar lookups (children included). */
export const NAV_FLAT: Array<NavItem & { group: string }> = NAV_GROUPS.flatMap((g) =>
  g.items.flatMap((i) => [
    { ...i, group: g.label },
    ...(i.children ?? []).map((c) => ({ ...c, group: g.label })),
  ]),
);

/** Icon lookup for catalogue product tiles (shared by hub, switcher, dashboard). */
export const PRODUCT_ICON_COMPONENTS = {
  globe: IconGlobe,
  briefcase: IconBriefcase,
  flame: IconFlame,
  board: IconBoard,
  certificate: IconCertificate,
  lock: IconLock,
} as const;
