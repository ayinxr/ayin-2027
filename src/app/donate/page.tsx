"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SmoothScroll } from "@/components/SmoothScroll";
import { FloatingWords } from "@/components/FloatingWords";
import { Reveal } from "@/components/Reveal";
import { cn } from "@/lib/cn";
import { Heart, Home } from "lucide-react";

export default function DonatePage() {
  const [budget, setBudget] = useState<{ amount: number; currency: string } | null>(null);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/content", { cache: "no-store" })
      .then((r) => r.json())
      .then((j: { budget?: { amount: number; currency: string } }) => {
        if (j?.budget && typeof j.budget.amount === "number") {
          setBudget(j.budget);
        } else {
          setBudget({ amount: 400, currency: "CAD" });
        }
      })
      .catch(() => setBudget({ amount: 400, currency: "CAD" }));
  }, []);

  async function submit() {
    setSubmitting(true);
    setMsg(null);
    try {
      const n = Number(amount);
      const res = await fetch("/api/donations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ displayName: name, amount: n, note }),
      });
      const json = (await res.json()) as { ok?: boolean; message?: string; error?: string };
      if (!res.ok || !json.ok) throw new Error(json.error || "failed");
      setMsg(json.message || "Submitted.");
      setName("");
      setAmount("");
      setNote("");
    } catch {
      setMsg("Could not submit. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const fmt =
    budget != null
      ? new Intl.NumberFormat(undefined, { style: "currency", currency: budget.currency }).format(
          budget.amount,
        )
      : "…";

  return (
    <SmoothScroll>
      <main className="relative min-h-screen">
        <FloatingWords className="opacity-70" density={14} />
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-[10%] h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-[rgba(120,163,255,0.12)] blur-3xl" />
        </div>

        <header className="sticky top-0 z-50 border-b border-white/6 bg-[rgba(9,11,16,0.55)] backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-white/70 transition hover:text-white"
            >
              <Home className="h-4 w-4" />
              Back to campaign
            </Link>
            <span className="font-[var(--font-cinzel)] text-xs tracking-[0.2em] text-white/55">
              SUPPORT
            </span>
          </div>
        </header>

        <div className="relative mx-auto max-w-2xl px-5 py-16 md:py-24">
          <Reveal>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70 backdrop-blur">
              <Heart className="h-3.5 w-3.5 text-[rgba(120,163,255,0.95)]" />
              Transparent campaign budget
            </p>
            <h1 className="font-[var(--font-cinzel)] text-3xl tracking-[-0.02em] sm:text-4xl">
              Donate to the campaign
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-white/72 md:text-base">
              Student council campaigns have real costs: printing, events, supplies. If you want to
              help grow what we can do for Sentinel, you can pledge a contribution. Pledges are
              reviewed by council before the public budget updates.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-10 rounded-3xl border border-white/12 bg-[rgba(255,255,255,0.04)] p-8 backdrop-blur-xl">
              <div className="text-xs uppercase tracking-[0.2em] text-white/50">Current budget</div>
              <div className="mt-2 font-[var(--font-cinzel)] text-4xl text-white">{fmt}</div>
              <p className="mt-3 text-xs text-white/55">
                Shown amount is set by campaign admins and increases when approved pledges are
                recorded.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="mt-8 rounded-3xl border border-white/10 bg-[rgba(255,255,255,0.03)] p-6 backdrop-blur-xl">
              <h2 className="text-sm font-semibold text-white">Pledge a contribution</h2>
              <p className="mt-2 text-xs text-white/60">
                This form records your intent. Bring cash or e-transfer details can be coordinated
                with council — nothing is charged online here.
              </p>
              <div className="mt-5 grid gap-3">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 outline-none placeholder:text-white/35"
                />
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Amount (e.g. 25)"
                  inputMode="decimal"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 outline-none placeholder:text-white/35"
                />
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Optional note (how you’d like to pay, etc.)"
                  className="min-h-[90px] w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 outline-none placeholder:text-white/35"
                />
                <button
                  type="button"
                  disabled={submitting || name.trim().length < 2 || !amount || Number(amount) < 1}
                  onClick={() => void submit()}
                  className={cn(
                    "rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50",
                  )}
                >
                  {submitting ? "Submitting..." : "Submit pledge"}
                </button>
                {msg && (
                  <p className="text-sm text-white/75" role="status">
                    {msg}
                  </p>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </main>
    </SmoothScroll>
  );
}
