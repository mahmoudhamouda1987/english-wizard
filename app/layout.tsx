import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegister } from "./components/service-worker-register";
import { TextSizeControl } from "./components/text-size-control";
import { ThemeApply } from "./components/theme-apply";

const display = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-fraunces",
  display: "swap",
});

const body = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "English Wizard | Intelligent English. Measurable Progress.", template: "%s · English Wizard" },
  description: "Personalised English learning from Pre-A1 to C2 — adaptive assessment places your level, a guided path builds your skills, and every step is measured so your progress is provable.",
  openGraph: {
    title: "English Wizard | Intelligent English. Measurable Progress.",
    description: "Personalised English learning from Pre-A1 to C2 — adaptive CEFR assessment, a guided learning path, and professional reports that prove your progress.",
    type: "website",
    siteName: "English Wizard",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "English Wizard | Intelligent English. Measurable Progress.",
    description: "Adaptive CEFR assessment, personalised learning from Pre-A1 to C2, and professional reports that prove your progress.",
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
    <html lang="en-GB" suppressHydrationWarning className={`${display.variable} ${body.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <ServiceWorkerRegister />
        <ThemeApply />
        <div className="text-size-fab"><TextSizeControl /></div>
        {children}
      </body>
    </html>
  );
}
