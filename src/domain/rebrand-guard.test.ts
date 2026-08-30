import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Rebrand guard — the string "LevelQuest" must never be DISPLAYED anywhere in
 * the product (the assess surface is "LevelCheck"). This walks the rendered
 * surface (every page/layout/component under app/) and fails on occurrences
 * that would reach a user: JSX text, string literals shown in the UI, and
 * component names that leak into the server-rendered RSC flight payload
 * (named client components referenced from server components).
 *
 * Internal identifiers that never render are exempt:
 *  - /api/levelquest fetch URLs and links (API paths)
 *  - imports from @/src/domain/levelquest (module specifier)
 *  - levelquest_sessions / levelquest_ DB tables and analytics event keys
 *  - code comment lines (// and block comments)
 */

const ALLOWED_DIR = join("app", "api") + "/";
const BANNED = /LevelQuest/i;
const EXEMPT_LINE =
  /(\/api\/levelquest|domain\/levelquest|levelquest_|FROM levelquest|levelquest-)/i;
const COMMENT_LINE = /^\s*(\/\/|\/\*|\*)/;

function collectFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (full.replaceAll("\\", "/").startsWith(ALLOWED_DIR)) continue;
    const st = statSync(full);
    if (st.isDirectory()) collectFiles(full, out);
    else if (/\.(tsx|jsx)$/.test(entry) && !/\.test\./.test(entry)) out.push(full);
  }
  return out;
}

describe("Rebrand guard — LevelQuest never displayed", () => {
  it("no page or component renders the banned token", () => {
    const files = collectFiles("app");
    expect(files.length).toBeGreaterThan(20);
    const offenders: string[] = [];
    for (const file of files) {
      const lines = readFileSync(file, "utf8").split("\n");
      lines.forEach((line, i) => {
        if (BANNED.test(line) && !EXEMPT_LINE.test(line) && !COMMENT_LINE.test(line)) {
          offenders.push(`${file}:${i + 1}: ${line.trim().slice(0, 90)}`);
        }
      });
    }
    expect(offenders, `banned token rendered in:\n${offenders.join("\n")}`).toEqual([]);
  });
});
