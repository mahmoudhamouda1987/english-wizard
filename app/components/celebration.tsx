"use client";

import { useEffect, useRef, useState } from "react";

const COLORS = ["#f59e0b", "#ef4444", "#10b981", "#3b82f6", "#a855f7"];

/** Fires a one-shot confetti burst whenever `trigger` turns truthy or changes to a new truthy value. */
export function Celebration({ trigger }: { trigger: string | number | boolean | null | undefined }) {
  const [burst, setBurst] = useState(0);
  const last = useRef<string | number | boolean | null | undefined>(null);

  useEffect(() => {
    const truthy = Boolean(trigger);
    const changed = trigger !== last.current;
    if (truthy && changed) setBurst((b) => b + 1);
    last.current = trigger;
  }, [trigger]);

  if (!burst) return null;
  return (
    <div className="confetti-layer" aria-hidden="true" key={burst}>
      {Array.from({ length: 28 }).map((_, i) => (
        <span
          key={i}
          className="confetto"
          style={{
            left: `${(i * 13.7 + 7) % 100}%`,
            background: COLORS[i % COLORS.length],
            animationDelay: `${(i % 9) * 55}ms`,
            transform: `rotate(${i * 37}deg)`,
          }}
        />
      ))}
    </div>
  );
}
