export type Session = { userId: string; expiresAt: string };
export type UserAccount = { id: string; email: string; displayName: string; passwordHash: string; createdAt: string };
export function normalizeEmail(email: string) { return email.trim().toLowerCase(); }
export function validateEmail(email: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
