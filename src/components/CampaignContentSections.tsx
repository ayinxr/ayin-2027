"use client";

import { useEffect, useState } from "react";
import { Reveal } from "@/components/Reveal";

type ContentPayload = {
  goals: string[];
  events: string[];
  plans: string[];
  intramuralInfo?: string;
};

const FALLBACK: ContentPayload = {
  goals: [
    "Better school events (student-selected themes + better planning)",
    "More student polls — short, frequent, and meaningful",
    "Stronger student involvement (committees + open sign-ups)",
    "Clear communication between students and council",
    "Improved spirit days with student voting",
  ],
  events: [
    "Basketball tournaments",
    "Football tournaments",
    "Tennis competitions",
    "Dodgeball tournaments",
    "School-wide challenges",
  ],
  plans: [
    "Open student voting for next month’s spirit day",
    "Publish monthly council transparency update",
  ],
  intramuralInfo:
    "intramurals happen once every 2 months everytime with a different sport e.g. Football, Basketball, Volleyball and Tennis. Students are able to cast a vote for which intramural they are looking for every two months.",
};

export function CampaignContentSections() {
  const [content, setContent] = useState<ContentPayload>(FALLBACK);

  useEffect(() => {
    fetch("/api/content", { cache: "no-store" })
      .then((r) => r.json())
      .then((json: ContentPayload & { intramuralInfo?: string }) => {
        if (!json) return;
        setContent({
          goals: json.goals?.length ? json.goals : FALLBACK.goals,
          events: json.events?.length ? json.events : FALLBACK.events,
          plans: json.plans?.length ? json.plans : FALLBACK.plans,
          intramuralInfo: json.intramuralInfo?.trim()
            ? json.intramuralInfo.trim()
            : FALLBACK.intramuralInfo,
        });
      })
      .catch(() => null);
  }, []);

  return (
    <>
      <section id="goals" className="relative mx-auto max-w-6xl px-5 py-16 md:py-24">
        <Reveal>
          <h2 className="font-[var(--font-cinzel)] text-2xl sm:text-3xl">Realistic campaign goals</h2>
          <p className="mt-3 max-w-3xl text-sm text-white/70 md:text-base">
            Practical changes that fit a real student council budget — and actually make school
            feel better day-to-day.
          </p>
        </Reveal>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {content.goals.map((g) => (
            <Reveal key={g} delay={0.04}>
              <div className="rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.03)] p-5 backdrop-blur-xl transition hover:border-[rgba(120,163,255,0.28)] hover:bg-[rgba(255,255,255,0.045)]">
                <div className="text-sm text-white/85">{g}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="events" className="relative mx-auto max-w-6xl px-5 py-16 md:py-24">
        <Reveal>
          <h2 className="font-[var(--font-cinzel)] text-2xl sm:text-3xl">Events that build community</h2>
          <p className="mt-3 max-w-3xl text-sm text-white/70 md:text-base">
            Sports, challenges, rallies, and lunchtime moments that make Sentinel feel connected.
          </p>
        </Reveal>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {content.events.map((e) => (
            <Reveal key={e} delay={0.05}>
              <div className="rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.03)] p-5 backdrop-blur-xl transition hover:translate-y-[-2px] hover:border-[rgba(120,163,255,0.24)]">
                <div className="text-sm text-white/85">{e}</div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.08}>
          <div
            id="intramurals"
            className="mt-10 rounded-3xl border border-white/10 bg-[rgba(255,255,255,0.025)] p-6 backdrop-blur-xl"
          >
            <h3 className="font-[var(--font-cinzel)] text-lg text-white sm:text-xl">
              Sport intramurals
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-white/75 md:text-base">
              {content.intramuralInfo}
            </p>
          </div>
        </Reveal>
      </section>

      <section id="next-plans" className="relative mx-auto max-w-6xl px-5 py-16 md:py-24">
        <Reveal>
          <h2 className="font-[var(--font-cinzel)] text-2xl sm:text-3xl">What’s up next</h2>
          <p className="mt-3 max-w-3xl text-sm text-white/70 md:text-base">
            Live roadmap from council. Updated by admins so students can see what is coming next.
          </p>
        </Reveal>
        <div className="mt-10 grid gap-4">
          {content.plans.map((p) => (
            <Reveal key={p} delay={0.04}>
              <div className="rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.03)] p-5 backdrop-blur-xl">
                <div className="text-sm text-white/85">{p}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
