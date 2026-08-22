import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ServiceWorkerRegister } from "./components/service-worker-register";
import { TextSizeControl } from "./components/text-size-control";

export const metadata: Metadata = {
  title: "English Wizard",
  description: "Adaptive AI English learning platform — prove your progress, not just your streak.",
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
