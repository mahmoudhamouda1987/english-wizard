import { redirect } from "next/navigation";

/** achievements was consolidated — Part 99 final IA. This route forwards to its new home. */
export default function AchievementsRedirect() {
  redirect("/portfolio");
}
