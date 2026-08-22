export function dayOfYear(now = new Date()): number {
  const start = Date.UTC(now.getFullYear(), 0, 0);
  return Math.floor((Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) - start) / 86400000);
}

/** Deterministic daily pick so learners meet fresh material every visit without randomness drift between server/client. */
export function rotate<T>(pool: T[], level: string, salt = ""): T {
  if (pool.length === 0) throw new Error("rotate() called with an empty pool");
  const day = dayOfYear();
  let hash = day;
  for (const ch of level + salt) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return pool[hash % pool.length];
}

/** Deterministic shuffle producing a stable order per day+level+salt. */
export function rotatedPool<T>(pool: T[], level: string, salt = ""): T[] {
  const day = dayOfYear();
  return pool
    .map((item, index) => ({ item, key: ((day * 2654435761) ^ (index * 40503) ^ hashOf(level + salt)) >>> 0 }))
    .sort((a, b) => a.key - b.key)
    .map((entry) => entry.item);
}

function hashOf(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
