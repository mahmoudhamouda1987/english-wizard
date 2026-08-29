import { describe, expect, it } from "vitest";
import { buildPlacementReportDoc, reportReference, type PlacementReportInput } from "./placement-report";

const base: PlacementReportInput = {
  reportId: "9f1d4c2e-1111-2222-3333-444455556666",
  level: "B1",
  confidence: "Moderate",
  boundary: null,
  skillProfile: { grammar: "B1", vocabulary: "B1", reading: "B2", listening: "A2" },
  skillScores: { grammar: 60, vocabulary: 55, reading: 72, listening: 45 },
  skillAnswered: { grammar: 6, vocabulary: 6, reading: 6, listening: 6 },
  answeredCount: 24,
  presentedCount: 26,
  speakingSubmitted: true,
  speakingResponses: 2,
  displayName: "Hamouda",
  studentId: "EW-26-7F4K82",
  createdAt: "2026-08-29T10:00:00Z",
  durationSeconds: 1440,
  lowEvidenceSkills: [],
};

describe("placement report document model", () => {
  it("builds a complete document with the assessed level and professional naming", () => {
    const doc = buildPlacementReportDoc(base);
    expect(doc.status).toBe("COMPLETE");
    expect(doc.result?.level).toBe("B1");
    expect(doc.result?.name).toBe("INTERMEDIATE");
    expect(doc.programme).toBe("English Wizard B1 Programme");
    expect(doc.nextMilestone).toBe("B2");
    expect(doc.reportRef).toMatch(/^EW-RPT-[A-Z2-9]{6}$/);
    expect(doc.dateLong).toBe("29 August 2026");
    expect(doc.method).toBe("Adaptive CEFR-Aligned Assessment");
  });

  it("never exposes internal system data", () => {
    const json = JSON.stringify(buildPlacementReportDoc(base));
    expect(json).not.toMatch(/variant/i);
    expect(json).not.toMatch(/estimate/i);
    expect(json).not.toMatch(/LevelQuest/i);
  });

  it("reports exactly the five required metadata fields worth of content", () => {
    const doc = buildPlacementReportDoc(base);
    expect(doc.candidate).toBe("Hamouda");
    expect(doc.studentId).toBe("EW-26-7F4K82");
  });

  it("labels unassessed skills 'Not assessed' with no score or level", () => {
    const doc = buildPlacementReportDoc({ ...base, skillAnswered: { grammar: 6, vocabulary: 6, reading: 6, listening: 0 } });
    const listening = doc.skills.find((s) => s.skill === "listening")!;
    expect(listening.assessed).toBe(false);
    expect(listening.level).toBeNull();
    expect(listening.score).toBeNull();
    expect(listening.evidence).toContain("Not assessed");
    const writing = doc.skills.find((s) => s.skill === "writing")!;
    expect(writing.assessed).toBe(false);
    expect(writing.evidence).toContain("Not part of this assessment");
  });

  it("draws strengths and priorities only from assessed skills", () => {
    const doc = buildPlacementReportDoc({ ...base, skillAnswered: { grammar: 0, vocabulary: 0, reading: 6, listening: 6 } });
    expect(doc.strengths.map((s) => s.label).sort()).toEqual(["Listening", "Reading"]);
    expect(doc.priorities.map((s) => s.label).sort()).toEqual(["Listening", "Reading"]);
  });

  it("refuses to state strengths when nothing was assessed", () => {
    const doc = buildPlacementReportDoc({ ...base, skillAnswered: { grammar: 0, vocabulary: 0, reading: 0, listening: 0 } });
    expect(doc.strengths).toHaveLength(0);
    expect(doc.strengthsNote).toMatch(/Insufficient/i);
    expect(doc.priorities).toHaveLength(0);
    expect(doc.prioritiesNote).toMatch(/Insufficient/i);
  });

  it("downgrades to INCOMPLETE when there are no valid responses — never a level with zero evidence", () => {
    const doc = buildPlacementReportDoc({ ...base, skillAnswered: { grammar: 0, vocabulary: 0, reading: 0, listening: 0 }, answeredCount: 0, level: "B1" });
    expect(doc.status).toBe("INCOMPLETE");
    expect(doc.result).toBeNull();
    expect(doc.cefrIndex).toBe(-1);
    expect(doc.stats).toHaveLength(0);
    expect(doc.nextMilestone).toBeNull();
  });

  it("downgrades to INCOMPLETE when the level is not a valid CEFR level", () => {
    const doc = buildPlacementReportDoc({ ...base, level: "EXPERT" });
    expect(doc.status).toBe("INCOMPLETE");
    expect(doc.result).toBeNull();
  });

  it("shows the indicative speaking band when speaking was submitted, never a fabricated one", () => {
    const doc = buildPlacementReportDoc({ ...base, speakingBand: "B1" });
    const speaking = doc.skills.find((s) => s.skill === "speaking")!;
    expect(speaking.assessed).toBe(true);
    expect(speaking.level).toBe("B1");
    expect(speaking.score).toBeNull();

    const noBand = buildPlacementReportDoc({ ...base, speakingBand: null });
    expect(noBand.skills.find((s) => s.skill === "speaking")!.level).toBeNull();
  });

  it("derives a stable, unambiguous report reference", () => {
    expect(reportReference("9f1d4c2e-1111-2222-3333-444455556666")).toBe(reportReference("9f1d4c2e-1111-2222-3333-444455556666"));
    expect(reportReference("00000000-0000-0000-0000-000000000000")).not.toBe(reportReference("9f1d4c2e-1111-2222-3333-444455556666"));
    const ref = reportReference("9f1d4c2e-1111-2222-3333-444455556666");
    for (const ch of ["0", "O", "1", "I", "L", "U"]) expect(ref).not.toContain(ch);
  });
});
