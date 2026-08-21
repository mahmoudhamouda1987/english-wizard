export type RagRights = "OWNED" | "LICENSED" | "PUBLIC_DOMAIN" | "ATTRIBUTED" | "PENDING_REVIEW" | "REJECTED";

export interface KnowledgeHit {
  id: string;
  sourceId: string;
  title: string;
  excerpt: string;
  level?: string;
  objectiveId?: string;
  version: string;
  score: number;
}

export interface KnowledgeSourcePolicy {
  approvedForRag: boolean;
  rights: RagRights;
  url?: string;
}

export function canRetrieveForRag(source: KnowledgeSourcePolicy): boolean {
  return source.approvedForRag && !["PENDING_REVIEW", "REJECTED"].includes(source.rights);
}

export function lexicalScore(query: string, body: string): number {
  const terms = [...new Set(query.toLowerCase().split(/\W+/).filter(Boolean))];
  if (!terms.length) return 0;
  const haystack = body.toLowerCase();
  const matched = terms.filter((term) => haystack.includes(term)).length;
  return matched / terms.length;
}

export function buildExcerpt(body: string, query: string, maxLength = 360): string {
  const clean = body.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) return clean;
  const lower = clean.toLowerCase();
  const firstTerm = query.toLowerCase().split(/\W+/).find(Boolean);
  const index = firstTerm ? lower.indexOf(firstTerm) : -1;
  const start = Math.max(0, Math.min(index >= 0 ? index - 90 : 0, clean.length - maxLength));
  return `${start > 0 ? "…" : ""}${clean.slice(start, start + maxLength)}${start + maxLength < clean.length ? "…" : ""}`;
}

export function rankKnowledgeDocuments(query: string, documents: Array<KnowledgeHit & { body: string }>): KnowledgeHit[] {
  return documents
    .map((document) => ({ ...document, score: lexicalScore(query, document.body), excerpt: buildExcerpt(document.body, query) }))
    .filter((document) => document.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(({ body: _body, ...hit }) => {
      void _body;
      return hit;
    });
}
