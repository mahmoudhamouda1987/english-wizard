import { describe, expect, it } from "vitest";
import { buildTransferTask, qualifiesAsTransferEvidence, recordTransferAttempt } from "./transfer-engine";

describe("transfer engine", () => {
  it("creates a task with explicit unfamiliar context criteria", () => {
    const task = buildTransferTask("B1", "b1-opinion-writing", "write a workplace opinion", "respond to a community issue");
    expect(task.successCriteria).toHaveLength(3);
    expect(task.unfamiliarContext).toContain("community");
  });

  it("does not treat an unassessed response as a scored result", () => {
    const attempt = recordTransferAttempt({ taskId: "t1", learnerId: "l1", context: "TRANSFER", response: "My response", assessed: false });
    expect(attempt.score).toBeUndefined();
    expect(qualifiesAsTransferEvidence(attempt)).toBe(true);
  });
});
