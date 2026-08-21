import { NextResponse } from "next/server";
import { createAccount, createSession } from "@/src/infrastructure/auth-repository";
import { COOKIE } from "@/src/infrastructure/auth";
import { normalizeEmail, validateEmail } from "@/src/domain/auth";

function secureCookie(request: Request) {
  return request.headers.get("x-forwarded-proto") === "https";
}

export async function POST(req: Request) {
  try {
    const b = await req.json() as Record<string, unknown>;
    const email = normalizeEmail(String(b.email ?? ""));
    const displayName = String(b.displayName ?? "").trim();
    const password = String(b.password ?? "");
    if (!validateEmail(email) || displayName.length < 2 || displayName.length > 80 || password.length < 8) {
      return NextResponse.json({ error: "Use a valid email, a name, and a password of at least 8 characters." }, { status: 400 });
    }
    const user = await createAccount(email, displayName, password);
    const session = await createSession(user.id);
    const res = NextResponse.json({ user });
    res.cookies.set(COOKIE, session.token, { httpOnly: true, secure: secureCookie(req), sameSite: "lax", path: "/", maxAge: 30 * 86400 });
    return res;
  } catch (e) {
    const msg = String(e).includes("user_accounts_email_key") ? "An account with this email already exists." : "Unable to create account.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
