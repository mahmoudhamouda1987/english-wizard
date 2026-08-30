import { redirect } from "next/navigation";

/** 2.0 Part 16 — IELTS is a product with its own route; this stub keeps old links alive. */
export default function PathwaysIeltsRedirect() {
  redirect("/ielts/course");
}
