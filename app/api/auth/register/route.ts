import { NextResponse } from "next/server";
import { createAccount, createSession } from "@/src/infrastructure/auth-repository";
import { COOKIE } from "@/src/infrastructure/auth";
import { normalizeEmail, validateEmail } from "@/src/domain/auth";
import { completeReferral } from "@/src/infrastructure/referral-repository";
import { query } from "@/src/infrastructure/database";
import { clientIpFrom, hitRateLimit } from "@/src/infrastructure/rate-limit";
import { randomUUID } from "crypto";

function secureCookie(request: Request) {
  return request.headers.get("x-forwarded-proto") === "https";
}

export async function POST(req: Request) {
try {
// Bulk-abuse guard: per-IP when the request arrives through a proxy (production).
// Direct local connections (no x-forwarded-for) are never limited, keeping dev and e2e frictionless.
const ip = clientIpFrom(req);
if (ip) {
  const limit = await hitRateLimit(`register:${ip}`, "auth.register", 20, 60);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many accounts created from this connection. Please try again later." }, { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds ?? 3600) } });
  }
}
const b = await req.json() as Record<string, unknown>;
    const email = normalizeEmail(String(b.email ?? ""));
    const displayName = String(b.displayName ?? "").trim();
    const password = String(b.password ?? "");
    if (!validateEmail(email) || displayName.length < 2 || displayName.length > 80 || password.length < 8) {
      return NextResponse.json({ error: "Use a valid email, a name, and a password of at least 8 characters." }, { status: 400 });
    }
const user = await createAccount(email, displayName, password);
const session = await createSession(user.id);
let referred = false;
if (typeof b.referralCode === "string" && b.referralCode.trim()) {
  try {
    const referrerId = await completeReferral(b.referralCode.trim(), user.learnerId);
    if (referrerId) {
      referred = true;
      await query("INSERT INTO learning_events (id, learner_id, event_type, payload) VALUES ($1, $2, $3, $4::jsonb)", [randomUUID(), referrerId, "referral.joined", JSON.stringify({ invitedLearnerId: user.learnerId })]);
      await query("INSERT INTO learning_events (id, learner_id, event_type, payload) VALUES ($1, $2, $3, $4::jsonb)", [randomUUID(), user.learnerId, "referral.welcome", JSON.stringify({ via: "friend invite" })]);
    }
  } catch {
    // referral attribution must never block account creation
  }
}
const res = NextResponse.json({ user, referred });
    res.cookies.set(COOKIE, session.token, { httpOnly: true, secure: secureCookie(req), sameSite: "lax", path: "/", maxAge: 30 * 86400 });
    return res;
  } catch (e) {
    const msg = String(e).includes("user_accounts_email_key") ? "An account with this email already exists." : "Unable to create account.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
