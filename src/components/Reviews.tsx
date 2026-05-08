"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { Heart, MessageCirclePlus, Send } from "lucide-react";

type Review = {
  id: string;
  display_name: string;
  content: string;
  created_at: number;
  upvotes: number;
};

export function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/reviews", { cache: "no-store" });
      const json = (await res.json()) as { reviews: Review[] };
      setReviews(json.reviews || []);
    } catch {
      setError("Couldn’t load reviews right now.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function upvote(id: string) {
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, upvotes: (r.upvotes || 0) + 1 } : r)));
    const res = await fetch(`/api/reviews/${id}/upvote`, { method: "POST" }).catch(() => null);
    const json = res ? ((await res.json()) as { upvotes: number }) : null;
    if (!json) return refresh();
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, upvotes: json.upvotes } : r)));
  }

  async function submit() {
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ displayName: name, content }),
      });
      if (!res.ok) throw new Error("bad");
      setName("");
      setContent("");
    } catch {
      setError("Couldn’t post that. Try again in a moment.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-12">
      <div className="lg:col-span-5">
        <div className="rounded-3xl border border-white/10 bg-[rgba(255,255,255,0.03)] p-6 backdrop-blur-xl">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <MessageCirclePlus className="h-4 w-4 text-[rgba(120,163,255,0.95)]" />
            Post feedback
          </div>
          <p className="mt-2 text-sm text-white/70">
            Real student comments only. Posts are moderated to keep this respectful and safe.
          </p>

          <div className="mt-5 grid gap-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name (first name or nickname)"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 outline-none placeholder:text-white/35 focus:border-[rgba(120,163,255,0.35)]"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What do you want to see from student council this year?"
              className="min-h-[120px] w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 outline-none placeholder:text-white/35 focus:border-[rgba(120,163,255,0.35)]"
            />
            <button
              disabled={sending || name.trim().length < 2 || content.trim().length < 8}
              onClick={() => void submit()}
              className={cn(
                "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition",
                "bg-white text-black hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60",
              )}
              type="button"
            >
              <Send className="h-4 w-4" />
              {sending ? "Posting…" : "Post (pending approval)"}
            </button>
            <div className="text-[11px] text-white/50">
              Tip: Focus on ideas, not people. Keep it kind.
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-7">
        <div className="rounded-3xl border border-white/10 bg-[rgba(255,255,255,0.035)] p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-white">Live community feed</div>
            <div className="text-xs text-white/55">Upvote helpful feedback</div>
          </div>

          {loading ? (
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/60">
              Loading…
            </div>
          ) : reviews.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/60">
              No approved reviews yet. Be the first to post.
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {reviews.slice(0, 18).map((r) => (
                <div
                  key={r.id}
                  className="rounded-2xl border border-white/10 bg-[rgba(10,12,18,0.55)] p-4 transition hover:border-[rgba(120,163,255,0.3)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-white/90">{r.display_name}</div>
                      <div className="mt-1 text-sm text-white/75">{r.content}</div>
                    </div>
                    <button
                      onClick={() => void upvote(r.id)}
                      className="shrink-0 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 transition hover:bg-white/8"
                      type="button"
                    >
                      <span className="flex items-center gap-2">
                        <Heart className="h-4 w-4 text-[rgba(255,255,255,0.8)]" />
                        {r.upvotes}
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && <div className="mt-4 text-xs text-red-200/80">{error}</div>}
        </div>
      </div>
    </div>
  );
}

