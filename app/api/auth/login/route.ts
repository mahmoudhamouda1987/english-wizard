import { NextResponse } from "next/server";
import { authenticate, createSession } from "@/src/infrastructure/auth-repository";
import { COOKIE } from "@/src/infrastructure/auth";
import { normalizeEmail } from "@/src/domain/auth";

function secureCookie(request: Request) {
  return new URL(request.url).protocol === "https:" || request.headers.get("x-forwarded-proto") === "https";
}

export async function POST(req: Request) {
  const b = await req.json().catch(() => null) as Record<string, unknown> | null;
  const email = normalizeEmail(String(b?.email ?? ""));
  const password = String(b?.password ?? "");
  if (!email || password.length < 8) return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  const user = await authenticate(email, password);
  if (!user) return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  const s = await createSession(user.id);
  const res = NextResponse.json({ user });
  res.cookies.set(COOKIE, s.token, { httpOnly: true, secure: secureCookie(req), sameSite: "lax", path: "/", maxAge: 30 * 86400 });
  return res;
}
