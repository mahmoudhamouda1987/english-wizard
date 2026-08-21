import { describe, expect, it } from "vitest";
import { CAMBRIDGE_PATHWAY, IELTS_PATHWAY, buildProfessionalPathway, pathwayReadiness } from "./pathways";

describe("pathways", () => {
  it("keeps exam pathways distinct from certification claims", () => {
    expect(IELTS_PATHWAY.certificationClaim).toBe(false);
    expect(CAMBRIDGE_PATHWAY.certificationClaim).toBe(false);
  });

  it("requires transfer evidence for professional readiness", () => {
    const pathway = buildProfessionalPathway("BUSINESS", "B2", ["persuade-b2"], "MEETINGS");
    expect(pathwayReadiness(pathway, [{ capabilityId: "persuade-b2", skill: "speaking", score: 80, transfer: false }]).ready).toBe(false);
    expect(pathwayReadiness(pathway, [{ capabilityId: "persuade-b2", skill: "speaking", score: 80, transfer: true }]).ready).toBe(true);
  });

  it("can detect missing exam readiness criteria", () => {
    const result = pathwayReadiness(IELTS_PATHWAY, [{ capabilityId: "writing", skill: "writing", score: 80, transfer: true }]);
    expect(result.ready).toBe(false);
    expect(result.missing.length).toBeGreaterThan(0);
  });
});
