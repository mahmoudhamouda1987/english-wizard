import { NextResponse } from "next/server";
import { currentUser } from "@/src/infrastructure/auth";
import { query } from "@/src/infrastructure/database";
import { canRetrieveForRag, rankKnowledgeDocuments, type RagRights } from "@/src/domain/rag";

export const dynamic = "force-dynamic";

function validRights(value: unknown): value is RagRights {
  return ["OWNED", "LICENSED", "PUBLIC_DOMAIN", "ATTRIBUTED", "PENDING_REVIEW", "REJECTED"].includes(String(value));
}

export async function GET(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const url = new URL(request.url);
  const search = (url.searchParams.get("q") ?? "").trim();
  if (search.length < 2) return NextResponse.json({ error: "q must contain at least two characters." }, { status: 400 });

  const result = await query<{
    document_id: string;
    source_id: string;
    title: string;
    body: string;
    version: string;
    level: string | null;
    objective_id: string | null;
    approved_for_rag: boolean;
    rights: string;
  }>(
    `SELECT d.id AS document_id, d.source_id, d.title, d.body, d.version, d.level, d.objective_id,
            d.approved_for_rag, s.rights
       FROM knowledge_documents d
       JOIN knowledge_sources s ON s.id = d.source_id
      WHERE d.approved_for_rag = TRUE
        AND s.approved_for_rag = TRUE
      ORDER BY d.created_at DESC
      LIMIT 100`,
    [],
  );

  const candidates = result.rows
    .filter((row) => validRights(row.rights) && canRetrieveForRag({ approvedForRag: row.approved_for_rag, rights: row.rights as RagRights }))
    .map((row) => ({
      id: row.document_id,
      sourceId: row.source_id,
      title: row.title,
      excerpt: "",
      version: row.version,
      score: 0,
      body: row.body,
      level: row.level ?? undefined,
      objectiveId: row.objective_id ?? undefined,
    }));

  return NextResponse.json({ query: search, hits: rankKnowledgeDocuments(search, candidates) });
}
