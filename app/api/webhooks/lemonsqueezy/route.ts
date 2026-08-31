import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { query } from "@/src/infrastructure/database";
import { getSubscription, upsertSubscription } from "@/src/infrastructure/subscription-repository";
import { effectiveTierWithGrace, mapLemonEventName, tierFromVariant, GRACE_DAYS, type LemonWebhookPayload } from "@/src/domain/billing-webhooks";

export const dynamic = "force-dynamic";

function verifySignature(rawBody: string, signatureHeader: string | null, secret: string): boolean {
  if (!signatureHeader) return false;
  const digest = createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(digest);
  const b = Buffer.from(signatureHeader);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  const secret = process.env.LEMON_SQUEEZY_SIGNING_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook not configured. Set LEMON_SQUEEZY_SIGNING_SECRET." }, { status: 503 });
  }
  const raw = await request.text();
  if (!verifySignature(raw, request.headers.get("x-signature"), secret)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  let payload: LemonWebhookPayload;
  try {
    payload = JSON.parse(raw) as LemonWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Malformed JSON." }, { status: 400 });
  }

  const eventName = payload.meta?.event_name;
  const mappedStatus = mapLemonEventName(eventName);
  const learnerId = payload.meta?.custom_data?.learnerId ?? null;
  const attributes = payload.data?.attributes;

  let resolvedLearnerId = learnerId;
  if (!resolvedLearnerId && attributes && typeof attributes === "object" && "user_email" in (attributes as Record<string, unknown>)) {
    const email = String((attributes as Record<string, unknown>).user_email ?? "").toLowerCase();
    const account = await query<{ learner_id: string }>(`SELECT a.learner_id FROM user_accounts a WHERE a.email = $1 LIMIT 1`, [email]);
    resolvedLearnerId = account.rows[0]?.learner_id ?? null;
  }
  if (!resolvedLearnerId) {
    // Nothing to attribute — acknowledge so the provider does not retry forever.
    return NextResponse.json({ ok: true, note: "No learner attribution available; ignored.", event: eventName ?? null });
  }

  const externalReference = (payload.data && typeof payload.data === "object" && "id" in (payload.data as Record<string, unknown>))
    ? String((payload.data as Record<string, unknown>).id)
    : undefined;

  const existing = await getSubscription(resolvedLearnerId);
  const referenceForLookup = externalReference ?? existing?.externalReference ?? `ls-${resolvedLearnerId}`;

  if (mappedStatus === "IGNORED") {
    await query(`INSERT INTO audit_events (id, learner_id, actor_id, action, entity_type, entity_id, metadata) VALUES ($1, $2, $2, 'webhook.ignored', 'subscription', $3, $4::jsonb)`,
      [crypto.randomUUID(), resolvedLearnerId, referenceForLookup, JSON.stringify({ event: eventName })]);
    return NextResponse.json({ ok: true, note: `Event ${eventName} requires no state change.` });
  }

  // tierFromVariant resolves any paid variant onto a catalogue product (unknown
  // names map to All Access — the safest complete grant), so the fallback chain
  // for FREE-mapped variants no longer exists.
  const tier = tierFromVariant(attributes?.variant_name);
  const periodEnd = attributes?.ends_at ?? attributes?.renews_at ?? existing?.periodEnd;

  const record = await upsertSubscription({
    learnerId: resolvedLearnerId,
    tier,
    status: mappedStatus,
    provider: "LEMONSQUEEZY",
    externalReference: referenceForLookup,
    ...(periodEnd ? { periodEnd } : {}),
  });

  await query(
    `INSERT INTO audit_events (id, learner_id, actor_id, action, entity_type, entity_id, metadata)
     VALUES ($1, $2, $2, 'webhook.subscription', 'subscription', $3, $4::jsonb)`,
    [crypto.randomUUID(), resolvedLearnerId, referenceForLookup, JSON.stringify({ event: eventName, status: mappedStatus, tier })],
  );

  const access = effectiveTierWithGrace({ status: record.status, tier: record.tier, periodEnd: record.periodEnd });
  return NextResponse.json({
    ok: true,
    event: eventName,
    status: record.status,
    accessTier: access.tier,
    graceActive: access.inGrace,
    message: access.inGrace
      ? `Payment failed — premium access continues for ${GRACE_DAYS} days while billing is retried.`
      : undefined,
  });
}
