"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { ArrowUp, Flame, Plus, Send } from "lucide-react";

type Idea = {
  id: string;
  title: string;
  details: string;
  category: string;
  created_at: number;
  votes: number;
};

const CATEGORIES: { id: Idea["category"] | "other"; label: string }[] = [
  { id: "events", label: "Events" },
  { id: "spirit", label: "Spirit days" },
  { id: "tournaments", label: "Tournaments" },
  { id: "communication", label: "Communication" },
  { id: "recognition", label: "Recognition" },
  { id: "other", label: "Other" },
];

export function VoiceHub() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [category, setCategory] = useState<Idea["category"]>("events");

  const topVotes = useMemo(() => ideas.reduce((a, b) => a + (b.votes ?? 0), 0), [ideas]);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ideas", { cache: "no-store" });
      const json = (await res.json()) as { ideas: Idea[] };
      setIdeas(json.ideas || []);
    } catch {
      setError("Couldn’t load ideas right now.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function vote(ideaId: string) {
    setIdeas((prev) =>
      prev.map((i) => (i.id === ideaId ? { ...i, votes: (i.votes || 0) + 1 } : i)),
    );
    const res = await fetch(`/api/ideas/${ideaId}/vote`, { method: "POST" }).catch(() => null);
    const json = res ? ((await res.json()) as { votes: number; voted: boolean }) : null;
    if (!json) return refresh();
    setIdeas((prev) => prev.map((i) => (i.id === ideaId ? { ...i, votes: json.votes } : i)));
  }

  async function submit() {
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title, details, category }),
      });
      if (!res.ok) throw new Error("bad");
      setTitle("");
      setDetails("");
      setOpen(false);
    } catch {
      setError("Couldn’t submit that. Try again in a moment.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <div className="rounded-3xl border border-white/10 bg-[rgba(255,255,255,0.035)] p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Flame className="h-4 w-4 text-[rgba(120,163,255,0.95)]" />
                Trending ideas
              </div>
              <div className="mt-1 text-xs text-white/60">
                Approved ideas only • votes update live
              </div>
            </div>
            <button
              onClick={() => setOpen((v) => !v)}
              className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-4 py-2 text-xs text-white/80 transition hover:bg-white/8"
              type="button"
            >
              <Plus className="h-4 w-4" />
              Submit an idea
            </button>
          </div>

          {open && (
            <div className="mt-5 rounded-2xl border border-white/10 bg-[rgba(10,12,18,0.55)] p-4">
              <div className="grid gap-3">
                <div className="grid gap-2 md:grid-cols-2">
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Idea title (short + clear)"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 outline-none ring-0 placeholder:text-white/35 focus:border-[rgba(120,163,255,0.35)]"
                  />
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Idea["category"])}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 outline-none focus:border-[rgba(120,163,255,0.35)]"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id} className="bg-[#0b0d13]">
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Details (what should change, and how would it help students?)"
                  className="min-h-[110px] w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 outline-none placeholder:text-white/35 focus:border-[rgba(120,163,255,0.35)]"
                />

                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs text-white/50">
                    Submissions are moderated to keep this respectful and realistic.
                  </div>
                  <button
                    disabled={sending || title.trim().length < 3 || details.trim().length < 10}
                    onClick={() => void submit()}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition",
                      "bg-white text-black hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60",
                    )}
                    type="button"
                  >
                    <Send className="h-4 w-4" />
                    {sending ? "Sending…" : "Submit"}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="mt-5 grid gap-3">
            {loading ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/60">
                Loading…
              </div>
            ) : ideas.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/60">
                No approved ideas yet — submit one to start the conversation.
              </div>
            ) : (
              ideas.slice(0, 8).map((x) => (
                <div
                  key={x.id}
                  className="group rounded-2xl border border-white/10 bg-[rgba(10,12,18,0.55)] px-4 py-3 transition hover:border-[rgba(120,163,255,0.35)] hover:bg-[rgba(255,255,255,0.05)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm text-white/90">{x.title}</div>
                      <div className="mt-1 text-xs text-white/55">{x.details}</div>
                      <div className="mt-2 inline-flex rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white/60">
                        {CATEGORIES.find((c) => c.id === x.category)?.label ?? "Other"}
                      </div>
                    </div>
                    <button
                      onClick={() => void vote(x.id)}
                      className="shrink-0 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 transition hover:bg-white/8"
                      type="button"
                    >
                      <span className="flex items-center gap-2">
                        <ArrowUp className="h-4 w-4" />
                        {x.votes}
                      </span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {error && <div className="mt-4 text-xs text-red-200/80">{error}</div>}
        </div>
      </div>

      <div className="lg:col-span-5">
        <div className="rounded-3xl border border-white/10 bg-[rgba(255,255,255,0.03)] p-6 shadow-[0_40px_110px_rgba(0,0,0,0.55)] backdrop-blur-xl">
          <div className="text-sm font-semibold text-white">Signal, not noise</div>
          <p className="mt-2 text-sm leading-relaxed text-white/70">
            This hub is designed to make students feel heard and respected — without spam or
            unrealistic “fantasy” promises.
          </p>

          <div className="mt-5 rounded-2xl border border-white/10 bg-[rgba(10,12,18,0.55)] p-4">
            <div className="text-xs text-white/60">Total votes cast</div>
            <div className="mt-1 text-3xl font-[var(--font-cinzel)] tracking-tight">
              {topVotes.toLocaleString()}
            </div>
            <div className="mt-2 text-xs text-white/50">
              Votes help rank priorities; council updates will explain outcomes transparently.
            </div>
          </div>

          <div className="mt-5 space-y-3 text-sm text-white/70">
            <div className="flex gap-3">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[rgba(120,163,255,0.95)]" />
              Monthly idea voting + quick polls.
            </div>
            <div className="flex gap-3">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[rgba(120,163,255,0.95)]" />
              “What changed” updates with reasons.
            </div>
            <div className="flex gap-3">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[rgba(120,163,255,0.95)]" />
              Moderation to keep it respectful.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

