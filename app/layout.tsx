import type { Metadata } from "next";
import "./globals.css";
import { ServiceWorkerRegister } from "./components/service-worker-register";

export const metadata: Metadata = {
  title: "English Wizard",
  description: "Adaptive AI English learning platform",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body><ServiceWorkerRegister />{children}</body>
    </html>
  );
}
