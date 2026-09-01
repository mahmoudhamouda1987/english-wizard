"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

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

/**
 * TEXT SIZE CONTROL (accessibility) — a collapsed floating "Aa" pill that
 * expands upward into the reading-scale options. Collapsed by default so the
 * resting footprint (44px) never covers page content; outside click, Escape
 * or the toggle collapses it again. The chosen scale persists per learner
 * (localStorage + <html data-text-size>).
 */
export function TextSizeControl() {
  const size = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [expanded, setExpanded] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!expanded) return;
    function onDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setExpanded(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setExpanded(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [expanded]);

  return (
    <div ref={rootRef} className="ts-root">
      {expanded && (
        <div role="group" aria-label="Text size" className="ts-panel">
          <span aria-hidden="true">Text size</span>
          {SIZES.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={size === option}
              className={size === option ? "button secondary" : "button"}
              onClick={() => choose(option)}
            >
              {option === "NORMAL" ? "A" : option === "LARGE" ? "A+" : "A++"}
            </button>
          ))}
        </div>
      )}
      <button
        type="button"
        className="ts-toggle"
        aria-expanded={expanded}
        aria-label={expanded ? "Close text size control" : "Adjust text size"}
        onClick={() => setExpanded((v) => !v)}
      >
        Aa
      </button>
    </div>
  );
}
