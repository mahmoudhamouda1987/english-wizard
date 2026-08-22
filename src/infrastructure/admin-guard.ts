import { NextResponse } from "next/server";
import { currentUser } from "./auth";

type Session = NonNullable<Awaited<ReturnType<typeof currentUser>>>;

function isAdminEmail(email: string): boolean {
  const allowlist = (process.env.ADMIN_EMAILS ?? "").split(",").map((item) => item.trim().toLowerCase()).filter(Boolean);
  return allowlist.includes(email.toLowerCase());
}

export type AdminGuard =
  | { denied: NextResponse; session?: undefined }
  | { denied: null; session: Session };

/** Rejects non-admins with 401/403; hands back the session for admins. */
export async function requireAdmin(): Promise<AdminGuard> {
  const session = await currentUser();
  if (!session) return { denied: NextResponse.json({ error: "Authentication required." }, { status: 401 }) };
  if (!isAdminEmail(session.email)) return { denied: NextResponse.json({ error: "Forbidden." }, { status: 403 }) };
  return { denied: null, session };
}
