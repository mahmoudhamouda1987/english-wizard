import type { Metadata } from "next";
import "./globals.css";
import { ServiceWorkerRegister } from "./components/service-worker-register";
import { TextSizeControl } from "./components/text-size-control";

export const metadata: Metadata = {
  title: "English Wizard",
  description: "Adaptive AI English learning platform",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <ServiceWorkerRegister />
        <div style={{ position: "fixed", bottom: 12, right: 12, zIndex: 900 }}><TextSizeControl /></div>
        {children}
      </body>
    </html>
  );
}
