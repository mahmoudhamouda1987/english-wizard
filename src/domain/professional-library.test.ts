import { describe, expect, it } from "vitest";
import { PROFESSIONAL_LIBRARY, LIBRARY_DOMAIN_IDS, findDomain, findTrack, buildCustomFieldPathway } from "./professional-library";

describe("Professional library", () => {
  it("contains at least 56 domains from the master prompt", () => {
    expect(PROFESSIONAL_LIBRARY.length).toBeGreaterThanOrEqual(56);
    expect(LIBRARY_DOMAIN_IDS.length).toBeGreaterThanOrEqual(56);
  });

  it("every domain has at least two tracks with vocabulary and objectives", () => {
    for (const domain of PROFESSIONAL_LIBRARY) {
      expect(domain.tracks.length).toBeGreaterThanOrEqual(2);
      for (const track of domain.tracks) {
        expect(track.objectives.length).toBeGreaterThanOrEqual(2);
        expect(track.vocabulary.length).toBeGreaterThanOrEqual(4);
        expect(track.tasks.length).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it("findDomain and findTrack resolve known IDs", () => {
    expect(findDomain("sales")).not.toBeNull();
    expect(findDomain("sales")?.tracks.some((t) => t.id === "objections")).toBe(true);
    expect(findTrack("sales", "objections")).not.toBeNull();
  });

  it("buildCustomFieldPathway returns a valid domain anchored to library", () => {
    const { profile, domain } = buildCustomFieldPathway({ field: "SaaS startup", role: "founder", goals: ["pitch investors"] });
    expect(profile.baseDomainId).toBeTruthy();
    expect(domain.label).toContain("SaaS startup");
    expect(domain.tracks.length).toBeGreaterThanOrEqual(2);
  });
});
