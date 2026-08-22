import type { Metadata } from "next";
import "./globals.css";
import { ServiceWorkerRegister } from "./components/service-worker-register";
import { TextSizeControl } from "./components/text-size-control";

export const metadata: Metadata = {
  title: "English Wizard",
  description: "Adaptive AI English learning platform",
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
