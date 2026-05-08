import { FloatingWords } from "@/components/FloatingWords";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/Button";
import { VoiceHub } from "@/components/VoiceHub";
import { Polls } from "@/components/Polls";
import { RequestForm } from "@/components/RequestForm";
import { Reviews } from "@/components/Reviews";
import { ArrowRight, BarChart3, MessageSquareText, Vote } from "lucide-react";

export default function HomePage() {
  return (
    <SmoothScroll>
      <main className="relative">
        <header className="sticky top-0 z-50 border-b border-white/6 bg-[rgba(9,11,16,0.55)] backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
            <div className="flex items-baseline gap-3">
              <span className="font-[var(--font-cinzel)] text-lg tracking-[0.24em]">
                AYIN
              </span>
              <span className="hidden text-xs text-white/55 sm:inline">
                Student Council President 2027 • Sentinel Secondary
              </span>
            </div>
            <nav className="hidden items-center gap-7 text-sm text-white/70 md:flex">
              <a className="hover:text-white transition" href="#voice">
                Student Voice Hub
              </a>
              <a className="hover:text-white transition" href="#goals">
                Goals
              </a>
              <a className="hover:text-white transition" href="#events">
                Events
              </a>
              <a className="hover:text-white transition" href="#reviews">
                Community
              </a>
              <Button href="#vote" variant="outline" className="px-4 py-2 text-xs">
                Vote
              </Button>
            </nav>
          </div>
        </header>

        {/* HERO */}
        <section className="relative min-h-[92vh] overflow-hidden">
          <FloatingWords className="opacity-90" />

          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-[-20%] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[rgba(120,163,255,0.18)] blur-3xl" />
            <div className="absolute left-[12%] top-[40%] h-[420px] w-[420px] rounded-full bg-[rgba(184,120,255,0.14)] blur-3xl" />
          </div>

          <div className="mx-auto flex max-w-6xl flex-col px-5 pb-16 pt-16 md:pt-24">
            <Reveal>
              <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70 backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-[rgba(120,163,255,0.95)] shadow-[0_0_18px_rgba(120,163,255,0.8)]" />
                Your Voice Shapes Sentinel
              </p>
            </Reveal>

            <Reveal delay={0.08}>
              <h1 className="max-w-4xl font-[var(--font-cinzel)] text-4xl leading-[1.08] tracking-[-0.02em] sm:text-5xl md:text-6xl">
                Sentinel Deserves a{" "}
                <span className="bg-gradient-to-r from-white via-[rgba(120,163,255,0.95)] to-white bg-clip-text text-transparent">
                  Stronger Student Voice.
                </span>
              </h1>
            </Reveal>

            <Reveal delay={0.14}>
              <p className="mt-6 max-w-2xl font-[var(--font-inter)] text-base leading-relaxed text-white/72 md:text-lg">
                A campaign built around students, not promises. Real listening, real
                transparency, and real voting on what we do next — all year.
              </p>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button href="#vote" variant="primary">
                  <Vote className="h-4 w-4" />
                  Vote for Ayin
                  <ArrowRight className="h-4 w-4 opacity-70" />
                </Button>
                <Button href="#request" variant="outline">
                  <MessageSquareText className="h-4 w-4" />
                  Share Your Ideas
                </Button>
                <Button href="#polls" variant="ghost">
                  <BarChart3 className="h-4 w-4" />
                  Student Polls
                </Button>
              </div>
            </Reveal>

            <Reveal delay={0.26}>
              <div className="mt-12 grid gap-4 md:grid-cols-3">
                {[
                  {
                    title: "Democracy, all year",
                    body:
                      "Monthly idea voting + quick polls so students steer what council prioritizes.",
                  },
                  {
                    title: "Transparent decisions",
                    body:
                      "Clear updates on what was voted in, what’s in progress, and what changed — with reasons.",
                  },
                  {
                    title: "Community & school spirit",
                    body:
                      "More student-selected events, spirit days, tournaments, and lunchtime activities.",
                  },
                ].map((c) => (
                  <div
                    key={c.title}
                    className="rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.04)] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl"
                  >
                    <div className="mb-2 text-sm font-semibold text-white">
                      {c.title}
                    </div>
                    <div className="text-sm leading-relaxed text-white/65">{c.body}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* STUDENT VOICE HUB */}
        <section id="voice" className="relative mx-auto max-w-6xl px-5 py-16 md:py-24">
          <Reveal>
            <h2 className="font-[var(--font-cinzel)] text-2xl tracking-[-0.01em] sm:text-3xl">
              Student Voice Hub
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/70 md:text-base">
              Submit ideas, vote on suggestions, request improvements, and shape events.
              <span className="text-white/85">
                {" "}
                Student opinions will directly influence council decisions throughout the
                school year.
              </span>
            </p>
          </Reveal>

          <div className="mt-10">
            <Reveal delay={0.06}>
              <VoiceHub />
            </Reveal>
          </div>
        </section>

        {/* POLLS */}
        <section id="polls" className="relative mx-auto max-w-6xl px-5 py-16 md:py-24">
          <Reveal>
            <h2 className="font-[var(--font-cinzel)] text-2xl sm:text-3xl">
              Student polls
            </h2>
            <p className="mt-3 max-w-3xl text-sm text-white/70 md:text-base">
              Quick votes, clear results, and zero “marketing”. If students pick it, council
              prioritizes it — transparently.
            </p>
          </Reveal>
          <div className="mt-10">
            <Reveal delay={0.06}>
              <Polls />
            </Reveal>
          </div>
        </section>

        {/* GOALS */}
        <section id="goals" className="relative mx-auto max-w-6xl px-5 py-16 md:py-24">
          <Reveal>
            <h2 className="font-[var(--font-cinzel)] text-2xl sm:text-3xl">
              Realistic campaign goals
            </h2>
            <p className="mt-3 max-w-3xl text-sm text-white/70 md:text-base">
              Practical changes that fit a real student council budget — and actually make
              school feel better day-to-day.
            </p>
          </Reveal>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {[
              "Better school events (student-selected themes + better planning)",
              "More student polls — short, frequent, and meaningful",
              "Stronger student involvement (committees + open sign-ups)",
              "Clear communication between students and council",
              "Improved spirit days with student voting",
              "More tournaments + school-wide challenges",
              "Recognition of achievements (clubs, sports, arts, academics)",
              "Fun lunchtime activities that rotate weekly",
              "Monthly idea voting + transparent council decisions",
            ].map((g) => (
              <Reveal key={g} delay={0.04}>
                <div className="rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.03)] p-5 backdrop-blur-xl transition hover:border-[rgba(120,163,255,0.28)] hover:bg-[rgba(255,255,255,0.045)]">
                  <div className="text-sm text-white/85">{g}</div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.08}>
            <div className="mt-10 rounded-3xl border border-white/10 bg-[rgba(255,255,255,0.025)] p-6 backdrop-blur-xl">
              <div className="text-sm font-semibold text-white">Spirit days students actually want</div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  "Formal vs Pajama Day",
                  "Teacher Twin Day",
                  "Random Nation Day",
                  "Meme Character Day",
                  "Opposite Day",
                  "Dress Like a Video Game NPC Day",
                  "Celebrity Lookalike Day",
                  "Construction Worker vs Businessman Day",
                  "Fictional Character Day",
                ].map((s) => (
                  <div
                    key={s}
                    className="rounded-2xl border border-white/10 bg-[rgba(10,12,18,0.55)] px-4 py-3 text-sm text-white/75"
                  >
                    {s}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </section>

        {/* EVENTS */}
        <section id="events" className="relative mx-auto max-w-6xl px-5 py-16 md:py-24">
          <Reveal>
            <h2 className="font-[var(--font-cinzel)] text-2xl sm:text-3xl">
              Events that build community
            </h2>
            <p className="mt-3 max-w-3xl text-sm text-white/70 md:text-base">
              Sports, challenges, rallies, and lunchtime moments that make Sentinel feel
              connected — without unrealistic spending.
            </p>
          </Reveal>

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              "Basketball tournaments",
              "Football tournaments",
              "Tennis competitions",
              "Dodgeball tournaments",
              "School-wide challenges",
              "Spirit rallies",
              "Lunchtime events",
              "Student-selected activities",
              "Recognition weeks",
            ].map((e) => (
              <Reveal key={e} delay={0.05}>
                <div className="rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.03)] p-5 backdrop-blur-xl transition hover:translate-y-[-2px] hover:border-[rgba(120,163,255,0.24)]">
                  <div className="text-sm text-white/85">{e}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* REQUEST / CONTACT */}
        <section id="request" className="relative mx-auto max-w-6xl px-5 py-16 md:py-24">
          <Reveal>
            <h2 className="font-[var(--font-cinzel)] text-2xl sm:text-3xl">
              Request system
            </h2>
            <p className="mt-3 max-w-3xl text-sm text-white/70 md:text-base">
              Send ideas directly to{" "}
              <a className="text-white underline decoration-white/20 underline-offset-4" href="mailto:ayinmohamamdi18@gmail.com">
                ayinmohamamdi18@gmail.com
              </a>
              . Requests will be moderated, categorized, and added to voting where it makes
              sense.
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="mt-10">
              <RequestForm />
            </div>
          </Reveal>
        </section>

        {/* COMMUNITY REVIEWS */}
        <section id="reviews" className="relative mx-auto max-w-6xl px-5 py-16 md:py-24">
          <Reveal>
            <h2 className="font-[var(--font-cinzel)] text-2xl sm:text-3xl">
              Community reviews (real students)
            </h2>
            <p className="mt-3 max-w-3xl text-sm text-white/70 md:text-base">
              No fake testimonials. Students can post feedback, upvote helpful comments, and
              keep the campaign accountable — with respectful moderation.
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="mt-10">
              <Reviews />
            </div>
          </Reveal>
        </section>

        {/* FINAL CTA */}
        <section id="vote" className="relative overflow-hidden py-20 md:py-28">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-1/2 h-[720px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(120,163,255,0.16)] blur-3xl" />
          </div>

          <div className="mx-auto max-w-6xl px-5">
            <Reveal>
              <div className="rounded-[32px] border border-white/12 bg-[rgba(255,255,255,0.035)] p-8 text-center shadow-[0_60px_160px_rgba(0,0,0,0.65)] backdrop-blur-xl md:p-12">
                <h2 className="font-[var(--font-cinzel)] text-3xl tracking-[-0.01em] sm:text-4xl">
                  Vote Ayin for Student Council President 2027
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-sm text-white/72 md:text-base">
                  Built by students. Driven by students. If you want a council that listens
                  and proves it with real voting, this is your moment.
                </p>

                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Button href="#request" variant="outline">
                    Share Your Ideas
                  </Button>
                  <Button href="#voice" variant="primary" className="px-6">
                    Vote Ayin
                  </Button>
                </div>

                <div className="mt-8 text-xs text-white/50">
                  Main message: <span className="text-white/75">“Your Voice Shapes Sentinel.”</span>
                </div>
              </div>
            </Reveal>
          </div>

          <div className="mt-10 h-px w-full bg-gradient-to-r from-transparent via-white/12 to-transparent" />
          <footer className="mx-auto flex max-w-6xl items-center justify-between px-5 py-8 text-xs text-white/45">
            <div>Sentinel Secondary School • West Vancouver, BC</div>
            <div className="hidden sm:block">© 2026 Ayin Campaign</div>
          </footer>
        </section>
      </main>
    </SmoothScroll>
  );
}

