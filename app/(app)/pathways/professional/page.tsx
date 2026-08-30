import { redirect } from "next/navigation";

/** 2.0 Part 54 — "Professional English" is now Business English, a separate product. */
export default function PathwaysProfessionalRedirect() {
  redirect("/business-english");
}
