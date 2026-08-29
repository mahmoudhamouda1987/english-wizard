export type TrialStatus = "ACTIVE" | "EXPIRED" | "CONVERTED";

export interface TrialRecord {
  learnerId: string;
  startedAt: string;
  endsAt: string;
  status: TrialStatus;
}

export const TRIAL_DURATION_DAYS = 7;

/** Compute the trial end time from a start time. */
export function trialEndsAt(start: Date): Date {
  return new Date(start.getTime() + TRIAL_DURATION_DAYS * 86400000);
}

/** Resolve a stored trial to its effective status (expire lazily when read). */
export function effectiveTrialStatus(record: TrialRecord | null, now = new Date()): TrialStatus {
  if (!record) return "EXPIRED";
  if (record.status === "CONVERTED") return "CONVERTED";
  if (record.status === "ACTIVE" && now < new Date(record.endsAt)) return "ACTIVE";
  return "EXPIRED";
}

export interface TrialView {
  active: boolean;
  status: TrialStatus;
  startedAt?: string;
  endsAt?: string;
  /** Whole remaining days (floor); 0 on the final day but still counts down in hours. */
  daysLeft: number;
  hoursLeft: number;
  totalHours: number;
  /** 0..1 fraction of the trial remaining. */
  fractionRemaining: number;
}

/** Build a client-friendly trial view with countdown data. */
export function trialView(record: TrialRecord | null, now = new Date()): TrialView {
  const status = effectiveTrialStatus(record, now);
  if (!record || status !== "ACTIVE") {
    return { active: false, status, daysLeft: 0, hoursLeft: 0, totalHours: 0, fractionRemaining: 0 };
  }
  const end = new Date(record.endsAt);
  const totalMs = new Date(record.endsAt).getTime() - new Date(record.startedAt).getTime();
  const remainingMs = Math.max(0, end.getTime() - now.getTime());
  const totalHours = Math.round(totalMs / 3600000);
  const fractionRemaining = totalMs > 0 ? remainingMs / totalMs : 0;
  return {
    active: true,
    status,
    startedAt: record.startedAt,
    endsAt: record.endsAt,
    daysLeft: Math.floor(remainingMs / 86400000),
    hoursLeft: Math.floor((remainingMs % 86400000) / 3600000),
    totalHours,
    fractionRemaining,
  };
}

/**
 * Student ID character set: unambiguous uppercase alphanumerics.
 * Excludes 0/O (zero/letter O) and 1/I/L (one/I/ell) so IDs can be read aloud
 * or transcribed from paper without confusion.
 */
const STUDENT_ID_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

/**
 * Generate a unique Student ID in the EW-YY-XXXXXX format (e.g. EW-26-7F4K82).
 * Six unambiguous alphanumeric characters give ~733 million combinations per
 * year; the caller re-rolls on the (vanishingly unlikely) collision.
 */
export function generateStudentId(now: Date = new Date(), random = (): number => Math.random()): string {
  const yy = String(now.getFullYear() % 100).padStart(2, "0");
  let suffix = "";
  for (let i = 0; i < 6; i++) suffix += STUDENT_ID_ALPHABET[Math.floor(random() * STUDENT_ID_ALPHABET.length)];
  return `EW-${yy}-${suffix}`;
}

/** Legacy sequential scheme (EW-YYYY-NNNNNN) kept for recognising existing IDs. */
export function generateSequentialStudentId(year: number, seq: number): string {
  const padded = String(Math.max(0, Math.min(999999, seq))).padStart(6, "0");
  return `EW-${year}-${padded}`;
}
