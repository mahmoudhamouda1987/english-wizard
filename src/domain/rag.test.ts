import { describe, expect, it } from "vitest";
import { buildExcerpt, canRetrieveForRag, lexicalScore, rankKnowledgeDocuments } from "./rag";

describe("controlled RAG", () => {
  it("blocks unapproved or rejected sources", () => {
    expect(canRetrieveForRag({ approvedForRag: false, rights: "OWNED" })).toBe(false);
    expect(canRetrieveForRag({ approvedForRag: true, rights: "PENDING_REVIEW" })).toBe(false);
    expect(canRetrieveForRag({ approvedForRag: true, rights: "LICENSED" })).toBe(true);
  });

  it("ranks relevant documents and limits output", () => {
    const hits = rankKnowledgeDocuments("past experiences", [
      { id: "1", sourceId: "s1", title: "Relevant", excerpt: "", version: "1", score: 0, body: "Use the past simple to describe past experiences." },
      { id: "2", sourceId: "s2", title: "Irrelevant", excerpt: "", version: "1", score: 0, body: "This document explains office furniture." },
    ]);
    expect(hits).toHaveLength(1);
    expect(hits[0].id).toBe("1");
    expect(hits[0].score).toBeGreaterThan(0);
  });

  it("builds bounded excerpts", () => {
    const excerpt = buildExcerpt("word ".repeat(200), "word", 50);
    expect(excerpt.length).toBeLessThanOrEqual(52);
  });

  it("calculates lexical overlap predictably", () => {
    expect(lexicalScore("past simple", "The past simple is used here.")).toBe(1);
    expect(lexicalScore("future perfect", "The past simple is used here.")).toBe(0);
  });
});
