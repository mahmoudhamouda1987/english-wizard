export type BillingTier = 'FREE' | 'PREMIUM' | 'FAMILY' | 'INSTITUTION';
export interface BillingPlan { id: string; tier: BillingTier; currency: string; priceMinor: number; billingPeriod: 'MONTH' | 'YEAR'; features: string[]; providerProductId?: string; }
export interface Subscription { learnerId: string; tier: BillingTier; status: 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELLED'; provider: string; externalSubscriptionId?: string; renewsAt?: string; }
export function isActiveSubscription(subscription: Subscription | null): boolean { return Boolean(subscription && (subscription.status === 'ACTIVE' || subscription.status === 'TRIALING')); }
export function canAccessTier(current: BillingTier, required: BillingTier): boolean { const rank: Record<BillingTier, number> = { FREE: 0, PREMIUM: 1, FAMILY: 2, INSTITUTION: 3 }; return rank[current] >= rank[required]; }
