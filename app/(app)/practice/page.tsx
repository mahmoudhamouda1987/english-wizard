import { redirect } from "next/navigation";

/** practice was consolidated — Part 99 final IA. This route forwards to its new home. */
export default function PracticeRedirect() {
  redirect("/review");
}
