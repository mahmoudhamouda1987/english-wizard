/** Coherent line-icon family (24px, 1.8 stroke) for the homepage. */
import type { CSSProperties } from "react";
type P = { size?: number; className?: string; style?: CSSProperties };
const base = (size: number, style?: CSSProperties) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  style,
});

export const IconHeadphones = ({ size = 20, className, style }: P) => (
  <svg {...base(size, style)} className={className}><path d="M3 18v-6a9 9 0 0 1 18 0v6" /><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" /></svg>
);
export const IconMic = ({ size = 20, className, style }: P) => (
  <svg {...base(size, style)} className={className}><rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 10a7 7 0 0 0 14 0" /><path d="M12 19v3" /></svg>
);
export const IconBook = ({ size = 20, className, style }: P) => (
  <svg {...base(size, style)} className={className}><path d="M2 4c2.5-1.5 5.5-1.5 8 0v15c-2.5-1.5-5.5-1.5-8 0z" /><path d="M22 4c-2.5-1.5-5.5-1.5-8 0v15c2.5-1.5 5.5-1.5 8 0z" /></svg>
);
export const IconPen = ({ size = 20, className, style }: P) => (
  <svg {...base(size, style)} className={className}><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></svg>
);
export const IconCheck = ({ size = 20, className, style }: P) => (
  <svg {...base(size, style)} className={className}><path d="M20 6 9 17l-5-5" /></svg>
);
export const IconCheckCircle = ({ size = 20, className, style }: P) => (
  <svg {...base(size, style)} className={className}><circle cx="12" cy="12" r="10" /><path d="m8.5 12.5 2.5 2.5 5-5.5" /></svg>
);
export const IconXCircle = ({ size = 20, className, style }: P) => (
  <svg {...base(size, style)} className={className}><circle cx="12" cy="12" r="10" /><path d="m9 9 6 6M15 9l-6 6" /></svg>
);
export const IconArrow = ({ size = 20, className, style }: P) => (
  <svg {...base(size, style)} className={className}><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg>
);
export const IconSparkle = ({ size = 20, className, style }: P) => (
  <svg {...base(size, style)} className={className}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" /></svg>
);
export const IconTarget = ({ size = 20, className, style }: P) => (
  <svg {...base(size, style)} className={className}><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
);
export const IconRoute = ({ size = 20, className, style }: P) => (
  <svg {...base(size, style)} className={className}><circle cx="6" cy="19" r="3" /><circle cx="18" cy="5" r="3" /><path d="M12.5 19H15a3 3 0 0 0 3-3v-2a3 3 0 0 0-3-3H9a3 3 0 0 1-3-3V6" /></svg>
);
export const IconChart = ({ size = 20, className, style }: P) => (
  <svg {...base(size, style)} className={className}><path d="M3 3v18h18" /><path d="M7 15v-4M12 17V7M17 17v-8" /></svg>
);
export const IconDoc = ({ size = 20, className, style }: P) => (
  <svg {...base(size, style)} className={className}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M9 13h6M9 17h6" /></svg>
);
export const IconShield = ({ size = 20, className, style }: P) => (
  <svg {...base(size, style)} className={className}><path d="M12 22s8-3.5 8-10V5l-8-3-8 3v7c0 6.5 8 10 8 10z" /></svg>
);
export const IconBuilding = ({ size = 20, className, style }: P) => (
  <svg {...base(size, style)} className={className}><path d="M4 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18" /><path d="M16 8h2a2 2 0 0 1 2 2v12" /><path d="M8 6h4M8 10h4M8 14h4M2 22h20" /></svg>
);
export const IconBriefcase = ({ size = 20, className, style }: P) => (
  <svg {...base(size, style)} className={className}><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /></svg>
);
export const IconPlane = ({ size = 20, className, style }: P) => (
  <svg {...base(size, style)} className={className}><path d="M17.8 19.2 16 11l3.5-3.5a2.1 2.1 0 0 0-3-3L13 8 4.8 6.2a.5.5 0 0 0-.5.8l4.2 4.2-2 2H3.8a.5.5 0 0 0-.35.85l2.7 2.7a.5.5 0 0 0 .85-.35v-2.7l2-2 4.2 4.2a.5.5 0 0 0 .8-.5z" /></svg>
);
export const IconGraduation = ({ size = 20, className, style }: P) => (
  <svg {...base(size, style)} className={className}><path d="M22 10 12 5 2 10l10 5 10-5z" /><path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5" /></svg>
);
export const IconUsers = ({ size = 20, className, style }: P) => (
  <svg {...base(size, style)} className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>
);
export const IconPlay = ({ size = 20, className, style }: P) => (
  <svg {...base(size, style)} className={className}><path d="m6 4 14 8-14 8z" /></svg>
);
export const IconMenu = ({ size = 20, className, style }: P) => (
  <svg {...base(size, style)} className={className}><path d="M4 6h16M4 12h16M4 18h16" /></svg>
);
export const IconClose = ({ size = 20, className, style }: P) => (
  <svg {...base(size, style)} className={className}><path d="M18 6 6 18M6 6l12 12" /></svg>
);
