import { redirect } from "next/navigation";

/** leaderboard was consolidated — Part 99 final IA. This route forwards to its new home. */
export default function LeaderboardRedirect() {
  redirect("/progress");
}
