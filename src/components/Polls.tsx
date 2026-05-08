"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { BarChart3, Check } from "lucide-react";

type Poll = {
  id: string;
  question: string;
  options: string[];
  counts: number[];
  total: number;
};

export function Polls() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    try {
      const res = await fetch("/api/polls", { cache: "no-store" });
      const json = (await res.json()) as { polls: Poll[] };
      setPolls(json.polls || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function vote(pollId: string, optionIdx: number) {
    setVoting(pollId);
    try {
      const res = await fetch(`/api/polls/${pollId}/vote`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ optionIdx }),
      });
      const json = (await res.json()) as { counts: number[]; total: number; votedOptionIdx: number };
      setPolls((prev) =>
        prev.map((p) => (p.id === pollId ? { ...p, counts: json.counts, total: json.total } : p)),
      );
    } finally {
      setVoting(null);
    }
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-[rgba(255,255,255,0.03)] p-6 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <BarChart3 className="h-4 w-4 text-[rgba(120,163,255,0.95)]" />
          Student Polls
        </div>
        <div className="text-xs text-white/55">Fast votes • real priorities</div>
      </div>

      {loading ? (
        <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/60">
          Loading polls…
        </div>
      ) : polls.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/60">
          No polls right now.
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {polls.map((p) => (
            <div key={p.id} className="rounded-2xl border border-white/10 bg-[rgba(10,12,18,0.55)] p-4">
              <div className="text-sm text-white/90">{p.question}</div>
              <div className="mt-3 grid gap-2">
                {p.options.map((opt, idx) => {
                  const count = p.counts[idx] ?? 0;
                  const pct = p.total ? Math.round((count / p.total) * 100) : 0;
                  return (
                    <button
                      key={opt}
                      disabled={voting === p.id}
                      onClick={() => void vote(p.id, idx)}
                      className={cn(
                        "group w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-left transition",
                        "hover:border-[rgba(120,163,255,0.32)] hover:bg-white/8 disabled:opacity-70",
                      )}
                      type="button"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm text-white/85">{opt}</div>
                        <div className="text-xs text-white/55">
                          {count} • {pct}%
                        </div>
                      </div>
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/8">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[rgba(120,163,255,0.92)] to-white/70"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-[11px] text-white/45">
                        <Check className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100" />
                        Tap to vote (you can change your choice).
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 text-[11px] text-white/45">
                Total votes: {p.total.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

