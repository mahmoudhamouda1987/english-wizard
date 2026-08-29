"use client";

import { useEffect, useRef, useState } from "react";

interface ExamTimerProps {
  durationMinutes: number;
  attemptKey: string;
  onTimeUp: () => void;
}

export function ExamTimer({ durationMinutes, attemptKey, onTimeUp }: ExamTimerProps) {
  const totalSeconds = durationMinutes * 60;
  const [remaining, setRemaining] = useState(() => {
    if (typeof window === "undefined") return totalSeconds;
    const stored = sessionStorage.getItem(`exam-timer-${attemptKey}`);
    if (stored) {
      const { seconds, deadline } = JSON.parse(stored) as { seconds: number; deadline: number };
      const elapsed = Math.floor((Date.now() - deadline + seconds * 1000) / 1000);
      return Math.max(0, Math.min(totalSeconds, elapsed));
    }
    return totalSeconds;
  });
  const deadlineRef = useRef<number>(0);
  const warnedRef = useRef(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(`exam-timer-${attemptKey}`);
    if (stored) {
      const parsed = JSON.parse(stored) as { seconds: number; deadline: number };
      deadlineRef.current = parsed.deadline;
    } else {
      deadlineRef.current = Date.now() + totalSeconds * 1000;
      sessionStorage.setItem(`exam-timer-${attemptKey}`, JSON.stringify({ seconds: totalSeconds, deadline: deadlineRef.current }));
    }
  }, [attemptKey, totalSeconds]);

  useEffect(() => {
    const tick = () => {
      const left = Math.max(0, Math.floor((deadlineRef.current - Date.now()) / 1000));
      setRemaining(left);
      if (left <= 0) { onTimeUp(); clearInterval(id); return; }
      if (left <= 60 && !warnedRef.current) { warnedRef.current = true; }
    };
    const id = window.setInterval(tick, 1000);
    tick();
    return () => clearInterval(id);
  }, [onTimeUp]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const low = remaining <= 60;

  return (
    <div role="status" aria-live="polite" style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 700, fontSize: 15, color: low ? "#c0392b" : "#1c2340" }}>
      {low && <span aria-hidden="true">⚠</span>}
      <span>{String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}</span>
      <span className="subtle" style={{ fontWeight: 400 }}>remaining</span>
    </div>
  );
}

export function clearExamTimer(attemptKey: string) {
  if (typeof window !== "undefined") sessionStorage.removeItem(`exam-timer-${attemptKey}`);
}
