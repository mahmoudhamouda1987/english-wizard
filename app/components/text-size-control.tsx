"use client";

import { useSyncExternalStore } from "react";

const SIZES = ["NORMAL", "LARGE", "XLARGE"] as const;
type TextSize = (typeof SIZES)[number];
const STORAGE_KEY = "ew-text-size";

const listeners = new Set<() => void>();
let snapshot: TextSize | null = null;

function normalize(value: string | undefined | null): TextSize {
  return value && SIZES.includes(value as TextSize) ? (value as TextSize) : "NORMAL";
}

function readPersisted(): TextSize {
  if (typeof window === "undefined") return "NORMAL";
  try {
    return normalize(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return "NORMAL";
  }
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getServerSnapshot(): TextSize {
  return "NORMAL";
}

function getSnapshot(): TextSize {
  if (snapshot !== null) return snapshot;
  const applied = normalize(document.documentElement.dataset.textSize);
  snapshot = applied === "NORMAL" ? readPersisted() : applied;
  if (snapshot !== "NORMAL") document.documentElement.dataset.textSize = snapshot;
  return snapshot;
}

function choose(next: TextSize) {
  document.documentElement.dataset.textSize = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    /* storage unavailable */
  }
  snapshot = next;
  for (const listener of listeners) listener();
}

export function TextSizeControl() {
  const size = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <div role="group" aria-label="Text size" style={{ display: "inline-flex", gap: 6, alignItems: "center", background: "var(--surface-inverse)", color: "var(--bg-elevated)", padding: "6px 10px", borderRadius: 12 }}>
      <span aria-hidden="true">Text size</span>
      {SIZES.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={size === option}
          className={size === option ? "button secondary" : "button"}
          style={{ padding: "4px 10px", fontSize: 13 }}
          onClick={() => choose(option)}
        >
          {option === "NORMAL" ? "A" : option === "LARGE" ? "A+" : "A++"}
        </button>
      ))}
    </div>
  );
}
