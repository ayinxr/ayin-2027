"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/cn";

type Idea = {
  id: string;
  title: string;
  details: string;
  category: string;
  status: "pending" | "approved" | "rejected";
  created_at: number;
  votes: number;
};

type Review = {
  id: string;
  display_name: string;
  content: string;
  status: "pending" | "approved" | "rejected";
  created_at: number;
  upvotes: number;
};

type RequestItem = {
  id: string;
  email: string;
  subject: string;
  message: string;
  status: "pending" | "approved" | "rejected";
  created_at: number;
};

function ActionButton({
  children,
  tone,
  onClick,
}: {
  children: React.ReactNode;
  tone: "approve" | "reject";
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full px-3 py-1.5 text-xs font-medium transition",
        tone === "approve"
          ? "bg-[rgba(120,163,255,0.14)] text-white/90 hover:bg-[rgba(120,163,255,0.22)]"
          : "bg-red-200/10 text-red-100/85 hover:bg-red-200/18",
      )}
      type="button"
    >
      {children}
    </button>
  );
}

export default function AdminPage() {
  const [token, setToken] = useState("");
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem("adminToken") || "";
    setToken(t);
  }, []);

  useEffect(() => {
    localStorage.setItem("adminToken", token);
  }, [token]);

  const pendingIdeas = useMemo(() => ideas.filter((i) => i.status === "pending"), [ideas]);
  const pendingReviews = useMemo(() => reviews.filter((r) => r.status === "pending"), [reviews]);
  const pendingRequests = useMemo(
    () => requests.filter((r) => r.status === "pending"),
    [requests],
  );

  async function refresh() {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [iRes, rRes, qRes] = await Promise.all([
        fetch("/api/admin/ideas", { headers: { authorization: `Bearer ${token}` } }),
        fetch("/api/admin/reviews", { headers: { authorization: `Bearer ${token}` } }),
        fetch("/api/admin/requests", { headers: { authorization: `Bearer ${token}` } }),
      ]);
      if (!iRes.ok || !rRes.ok || !qRes.ok) throw new Error("Unauthorized or server error");
      const iJson = (await iRes.json()) as { ideas: Idea[] };
      const rJson = (await rRes.json()) as { reviews: Review[] };
      const qJson = (await qRes.json()) as { requests: RequestItem[] };
      setIdeas(iJson.ideas || []);
      setReviews(rJson.reviews || []);
      setRequests(qJson.requests || []);
    } catch {
      setError("Couldn’t load moderation queue. Check ADMIN_TOKEN.");
    } finally {
      setLoading(false);
    }
  }

  async function updateIdea(id: string, status: "approved" | "rejected") {
    await fetch("/api/admin/ideas", {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ id, status }),
    });
    await refresh();
  }

  async function updateReview(id: string, status: "approved" | "rejected") {
    await fetch("/api/admin/reviews", {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ id, status }),
    });
    await refresh();
  }

  async function updateRequest(id: string, status: "approved" | "rejected") {
    await fetch("/api/admin/requests", {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ id, status }),
    });
    await refresh();
  }

  return (
    <main className="min-h-screen px-5 py-10">
      <div className="mx-auto max-w-6xl">
        <h1 className="font-[var(--font-cinzel)] text-3xl tracking-[-0.01em]">
          Moderation
        </h1>
        <p className="mt-2 text-sm text-white/65">
          Approve or reject ideas + reviews. (Requests are stored server-side; email is optional.)
        </p>

        <div className="mt-6 rounded-3xl border border-white/10 bg-[rgba(255,255,255,0.03)] p-6 backdrop-blur-xl">
          <div className="text-sm font-semibold text-white">Admin token</div>
          <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center">
            <input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste ADMIN_TOKEN"
              className="w-full flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 outline-none placeholder:text-white/35 focus:border-[rgba(120,163,255,0.35)]"
            />
            <button
              onClick={() => void refresh()}
              className="rounded-full bg-white px-4 py-2 text-xs font-medium text-black transition hover:bg-white/90"
              type="button"
            >
              {loading ? "Loading…" : "Load queue"}
            </button>
          </div>
          {error && <div className="mt-3 text-xs text-red-200/80">{error}</div>}
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <section className="rounded-3xl border border-white/10 bg-[rgba(255,255,255,0.03)] p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-white">Ideas pending</div>
              <div className="text-xs text-white/55">{pendingIdeas.length}</div>
            </div>
            <div className="mt-4 space-y-3">
              {pendingIdeas.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/60">
                  Nothing pending.
                </div>
              ) : (
                pendingIdeas.slice(0, 60).map((i) => (
                  <div
                    key={i.id}
                    className="rounded-2xl border border-white/10 bg-[rgba(10,12,18,0.55)] p-4"
                  >
                    <div className="text-sm text-white/90">{i.title}</div>
                    <div className="mt-1 text-xs text-white/55">{i.details}</div>
                    <div className="mt-3 flex items-center gap-2">
                      <ActionButton tone="approve" onClick={() => void updateIdea(i.id, "approved")}>
                        Approve
                      </ActionButton>
                      <ActionButton tone="reject" onClick={() => void updateIdea(i.id, "rejected")}>
                        Reject
                      </ActionButton>
                      <div className="ml-auto text-[11px] text-white/45">
                        votes: {i.votes}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-[rgba(255,255,255,0.03)] p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-white">Reviews pending</div>
              <div className="text-xs text-white/55">{pendingReviews.length}</div>
            </div>
            <div className="mt-4 space-y-3">
              {pendingReviews.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/60">
                  Nothing pending.
                </div>
              ) : (
                pendingReviews.slice(0, 60).map((r) => (
                  <div
                    key={r.id}
                    className="rounded-2xl border border-white/10 bg-[rgba(10,12,18,0.55)] p-4"
                  >
                    <div className="text-sm font-semibold text-white/90">{r.display_name}</div>
                    <div className="mt-1 text-sm text-white/75">{r.content}</div>
                    <div className="mt-3 flex items-center gap-2">
                      <ActionButton tone="approve" onClick={() => void updateReview(r.id, "approved")}>
                        Approve
                      </ActionButton>
                      <ActionButton tone="reject" onClick={() => void updateReview(r.id, "rejected")}>
                        Reject
                      </ActionButton>
                      <div className="ml-auto text-[11px] text-white/45">
                        upvotes: {r.upvotes}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <div className="mt-4 rounded-3xl border border-white/10 bg-[rgba(255,255,255,0.03)] p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-white">Requests pending</div>
            <div className="text-xs text-white/55">{pendingRequests.length}</div>
          </div>
          <p className="mt-2 text-sm text-white/65">
            Every request is saved here and can be approved or rejected.
          </p>

          <div className="mt-4 space-y-3">
            {pendingRequests.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/60">
                No requests yet. Submit one from the main site to test.
              </div>
            ) : (
              pendingRequests.slice(0, 120).map((r) => (
                <div
                  key={r.id}
                  className="rounded-2xl border border-white/10 bg-[rgba(10,12,18,0.55)] p-4"
                >
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-sm font-semibold text-white/90">{r.subject}</div>
                    <div className="text-[11px] text-white/45">
                      {new Date(r.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-white/55">from: {r.email}</div>
                  <div className="mt-3 whitespace-pre-wrap text-sm text-white/75">{r.message}</div>
                  <div className="mt-3 flex items-center gap-2">
                    <ActionButton tone="approve" onClick={() => void updateRequest(r.id, "approved")}>
                      Approve
                    </ActionButton>
                    <ActionButton tone="reject" onClick={() => void updateRequest(r.id, "rejected")}>
                      Reject
                    </ActionButton>
                  </div>
                  <div className="mt-3 text-[11px] text-white/45">id: {r.id}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

