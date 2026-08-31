import type { ReactNode } from "react";

/** Shared 17px stroke icon set — one consistent visual language, no emoji. */

function base(path: ReactNode, extra?: ReactNode) {
  return function Icon({ size = 17 }: { size?: number }) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {path}
        {extra}
      </svg>
    );
  };
}

export const IconHome = base(<><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /><path d="M9.5 21v-6h5v6" /></>);
export const IconRoute = base(<><circle cx="6" cy="19" r="2.2" /><circle cx="18" cy="5" r="2.2" /><path d="M8 19h7a4 4 0 0 0 0-8H9a4 4 0 0 1 0-8h7" /></>);
export const IconBook = base(<><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></>);
export const IconGlobe = base(<><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18z" /></>);
export const IconChat = base(<path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 8.5-8.5c4.7 0 8.5 3.8 8.5 8.5z" />);
export const IconMask = base(<><path d="M3 5.5 10 4l2 2 2-2 7 1.5V17l-7 3-2-2-2 2-7-3z" /><path d="M7 9.5h.01M17 9.5h.01" /><path d="M8.5 13.5c1 1 2 1.4 3.5 1.4s2.5-.4 3.5-1.4" /></>);
export const IconMic = base(<><rect x="9" y="2.5" width="6" height="11.5" rx="3" /><path d="M5 11a7 7 0 0 0 14 0" /><path d="M12 18v3.5" /></>);
export const IconWand = base(<><path d="m5 19 10-10" /><path d="m13 5 6 6" /><path d="M3 21 2 20" /><path d="M19 3l1 1" /><path d="M15.5 3.5 17 2" /><path d="M21 8.5 22.5 7" /><path d="M3.5 15.5 2 17" /></>);
export const IconClock = base(<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></>);
export const IconShield = base(<><path d="M12 2 4.5 5v6c0 5 3.2 8.6 7.5 10.5 4.3-1.9 7.5-5.5 7.5-10.5V5z" /><path d="m9 11.5 2 2 4-4.5" /></>);
export const IconTarget = base(<><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.2" fill="currentColor" /></>);
export const IconFolder = base(<path d="M3.5 6.5A2 2 0 0 1 5.5 4.5h4l2 2.5h7a2 2 0 0 1 2 2v8.5a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z" />);
export const IconEar = base(<><path d="M6 10a6 6 0 1 1 12 0c0 3-2 3.5-2.5 5.5-.4 1.6-1 3.5-3 3.5s-2.6-1.2-3-2.5" /><path d="M9.5 10a2.5 2.5 0 1 1 5 0c0 1.5-1 1.8-1.2 3" /></>);
export const IconFilm = base(<><rect x="3.5" y="4" width="17" height="16" rx="2.5" /><path d="M7.5 4v16M16.5 4v16M3.5 9h4M3.5 15h4M16.5 9h4M16.5 15h4" /></>);
export const IconPen = base(<><path d="M14.5 4.5 19 9 8.5 19.5 4 20l.5-4.5z" /><path d="m13 6 4.5 4.5" /></>);
export const IconLetters = base(<><rect x="3" y="3" width="8" height="8" rx="1.5" /><rect x="13" y="3" width="8" height="8" rx="1.5" /><rect x="3" y="13" width="8" height="8" rx="1.5" /><rect x="13" y="13" width="8" height="8" rx="1.5" /></>);
export const IconPuzzle = base(<><path d="M5 8h3V5.5a2 2 0 1 1 4 0V8h3v3h2.5a2 2 0 1 1 0 4H15v3h-3v-2.5a2 2 0 1 0-4 0V18H5v-3h2.5" /></>);
export const IconBulb = base(<><path d="M9 18h6" /><path d="M10 21.5h4" /><path d="M12 2.5a6.5 6.5 0 0 0-4 11.6c.9.7 1.5 1.6 1.5 2.6h5c0-1 .6-1.9 1.5-2.6a6.5 6.5 0 0 0-4-11.6z" /></>);
export const IconCertificate = base(<><rect x="4" y="3.5" width="16" height="13" rx="2" /><path d="M8 8h8M8 11.5h5" /><circle cx="16.5" cy="17.5" r="3" /><path d="m15 20-.6 2.5 2.1-1.2 2.1 1.2L18 20" /></>);
export const IconTeacher = base(<><path d="M12 3 2 8l10 5 10-5z" /><path d="M6.5 10.5V15c0 1.4 2.5 3 5.5 3s5.5-1.6 5.5-3v-4.5" /><path d="M21 8.5V14" /></>);
export const IconUsers = base(<><circle cx="9" cy="8" r="3.2" /><path d="M3.5 20c0-3 2.5-5 5.5-5s5.5 2 5.5 5" /><path d="M16 5.6a3.2 3.2 0 0 1 0 4.9M17.5 15.3c1.8.6 3 2.2 3 4.7" /></>);
export const IconGift = base(<><rect x="3.5" y="8" width="17" height="4.5" rx="1" /><path d="M5 12.5V20a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 20v-7.5" /><path d="M12 8v13.5" /><path d="M12 8s-4.5.3-4.5-2.5C7.5 3.5 10 3 11 4c.9.9 1 4 1 4z" /><path d="M12 8s4.5.3 4.5-2.5C16.5 3.5 14 3 13 4c-.9.9-1 4-1 4z" /></>);
export const IconGear = base(<><circle cx="12" cy="12" r="3.2" /><path d="M19 12a7 7 0 0 0-.14-1.4l2-1.55-2-3.46-2.35.95a7 7 0 0 0-2.42-1.4L13.73 2.5h-3.46l-.36 2.64a7 7 0 0 0-2.42 1.4L5.14 5.6l-2 3.46 2 1.55A7 7 0 0 0 5 12c0 .48.05.94.14 1.4l-2 1.55 2 3.46 2.35-.95a7 7 0 0 0 2.42 1.4l.36 2.64h3.46l.36-2.64a7 7 0 0 0 2.42-1.4l2.35.95 2-3.46-2-1.55c.09-.46.14-.92.14-1.4z" /></>);
export const IconChevron = base(<path d="m6 9 6 6 6-6" />);
export const IconLock = base(<><rect x="5" y="10.5" width="14" height="10" rx="2" /><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" /></>);
export const IconCamera = base(<><path d="M4 8.5h3l1.5-2h7L17 8.5h3a1 1 0 0 1 1 1V19a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5a1 1 0 0 1 1-1z" /><circle cx="12" cy="13.5" r="3.4" /></>);
export const IconMenu = base(<path d="M4 7h16M4 12h16M4 17h16" />);
export const IconClose = base(<path d="M6 6l12 12M18 6 6 18" />);
export const IconSearch = base(<><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></>);
export const IconSpark = base(<path d="M12 2.5 14 9l6.5 2-6.5 2-2 6.5-2-6.5L3.5 11 10 9z" />);
export const IconCheck = base(<path d="m4.5 12.5 5 5 10-11" />);
export const IconChart = base(<><path d="M4 20V10M10 20V4M16 20v-7M21 20H3" /></>);
export const IconFlag = base(<><path d="M5 21V4" /><path d="M5 4c4-2 7 2 11 0v9c-4 2-7-2-11 0" /></>);

/** 2.0 product icons */
export const IconBriefcase = base(<><rect x="3" y="7.5" width="18" height="13" rx="2" /><path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5" /><path d="M3 12.5h18" /><path d="M12 11v3" /></>);
export const IconBoard = base(<><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M7 9h6M7 12.5h4" /><circle cx="16.5" cy="10.5" r="2" /><path d="M12 17v3.5M8.5 20.5h7" /></>);
export const IconFlame = base(<path d="M12 3c1 3-3.5 5-3.5 9a5.5 5.5 0 0 0 11 0c0-2.5-1.5-4-2.5-5-.3 1.2-1 2-2 2.3.6-2.3-.6-5-3-6.3z" />);
