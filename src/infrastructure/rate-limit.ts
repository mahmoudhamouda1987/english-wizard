import { query } from "./database";

export interface RateLimitResult { allowed: boolean; remaining: number; retryAfterSeconds: number | null }

/**
 * Database-backed fixed-window rate limiter. Survives restarts and works across
 * the single-node production process. Keys are caller-chosen (e.g. "ip:1.2.3.4"
 * or "email:user@x.com"); each (key, action) pair has its own window.
 */
export async function hitRateLimit(key: string, action: string, limit: number, windowMinutes: number): Promise<RateLimitResult> {
  const result = await query<{ count: number; within_window: boolean }>(
    `
    INSERT INTO rate_limits (key, action, count, window_start)
    VALUES ($1, $2, 1, NOW())
    ON CONFLICT (key, action) DO UPDATE SET
      count = CASE WHEN rate_limits.window_start < NOW() - make_interval(mins => $3) THEN 1 ELSE rate_limits.count + 1 END,
      window_start = CASE WHEN rate_limits.window_start < NOW() - make_interval(mins => $3) THEN NOW() ELSE rate_limits.window_start END
    RETURNING count, window_start >= NOW() - make_interval(mins => $3) AS within_window
    `,
    [key, action, windowMinutes],
  );
  const row = result.rows[0];
  const count = Number(row?.count ?? 1);
  const allowed = row?.within_window ? count <= limit : true;
  const retryAfterSeconds = allowed ? null : Math.max(1, Math.ceil(windowMinutes * 60));
  return { allowed, remaining: Math.max(0, limit - count), retryAfterSeconds };
}

/** Client IP from the proxy header. Returns null for direct/loopback connections (dev/tests), which are never limited. */
export function clientIpFrom(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (!forwarded) return null;
  const first = forwarded.split(",")[0]?.trim();
  if (!first) return null;
  const normalized = first.replace(/^::ffff:/, "");
  if (normalized === "127.0.0.1" || normalized === "::1") return null;
  return first;
}
