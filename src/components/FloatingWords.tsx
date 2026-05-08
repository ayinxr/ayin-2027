"use client";

import { useMemo } from "react";
import { cn } from "@/lib/cn";

type Word = {
  text: string;
  top: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  blur: number;
  opacity: number;
};

const WORDS = [
  "Leadership",
  "Community",
  "Voice",
  "Change",
  "Spirit",
  "Students First",
  "Sentinel",
  "Together",
  "Democracy",
  "Heard",
  "Respect",
  "Future",
  "Transparency",
  "Voting",
  "Belonging",
  "Representation",
];

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function FloatingWords({
  className,
  density = 18,
  seed = 2027,
}: {
  className?: string;
  density?: number;
  seed?: number;
}) {
  const items = useMemo(() => {
    const rand = mulberry32(seed);
    const out: Word[] = [];
    for (let i = 0; i < density; i++) {
      const text = WORDS[Math.floor(rand() * WORDS.length)]!;
      out.push({
        text,
        top: rand() * 100,
        left: rand() * 100,
        delay: rand() * 8,
        duration: 16 + rand() * 18,
        size: 12 + rand() * 22,
        blur: rand() * 2.25,
        opacity: 0.10 + rand() * 0.18,
      });
    }
    return out;
  }, [density, seed]);

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {items.map((w, idx) => (
        <span
          key={`${w.text}-${idx}`}
          className="absolute select-none whitespace-nowrap tracking-[0.18em] uppercase"
          style={{
            top: `${w.top}%`,
            left: `${w.left}%`,
            fontSize: `${w.size}px`,
            opacity: w.opacity,
            filter: `blur(${w.blur}px)`,
            animationDelay: `${w.delay}s`,
            animationDuration: `${w.duration}s`,
          }}
        >
          <span className="floatingWord bg-gradient-to-r from-white/80 via-[rgba(120,163,255,0.85)] to-white/70 bg-clip-text text-transparent">
            {w.text}
          </span>
        </span>
      ))}
    </div>
  );
}

