import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ServiceWorkerRegister } from "./components/service-worker-register";
import { TextSizeControl } from "./components/text-size-control";

export const metadata: Metadata = {
  title: { default: "English Wizard — Prove your progress", template: "%s · English Wizard" },
  description: "Adaptive AI English learning platform — CEFR placement, a tutor that remembers you, verifiable certificates and progress you can hear.",
  openGraph: {
    title: "English Wizard — Prove your progress",
    description: "CEFR Pre-A1 to C2, AI tutor with persistent memory, reality checkpoints and QR-verifiable certificates.",
    type: "website",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "English Wizard — Prove your progress",
    description: "Most apps measure streaks. We prove progress.",
    images: ["/og-image.png"],
  },
  appleWebApp: { capable: true, title: "English Wizard", statusBarStyle: "black-translucent" },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icon-180.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0b1020",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const themeScript = `try{var t=localStorage.getItem("ew-theme");if(t==="dark"||( !t&&window.matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.dataset.theme="dark";}catch(e){}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <ServiceWorkerRegister />
        <div style={{ position: "fixed", bottom: 12, right: 12, zIndex: 900 }}><TextSizeControl /></div>
        {children}
      </body>
    </html>
  );
}
