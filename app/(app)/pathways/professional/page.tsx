"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProfessionalPage() {
  const router = useRouter();
  useEffect(() => { router.replace("/learning-path"); }, [router]);
  return <main style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px" }}><p>Redirecting to Professional English curriculum…</p></main>;
}
