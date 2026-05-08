"use client";

import { useEffect, useState } from "react";
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

type Poll = {
  id: string;
  question: string;
  options: string[];
  status: string;
  created_at: number;
};

function ActionButton({
  children,
  tone = "approve",
  onClick,
}: {
  children: React.ReactNode;
  tone?: "approve" | "reject" | "delete";
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full px-3 py-1.5 text-xs font-medium transition",
        tone === "approve"
          ? "bg-[rgba(120,163,255,0.14)] text-white/90 hover:bg-[rgba(120,163,255,0.22)]"
          : tone === "reject"
            ? "bg-red-200/10 text-red-100/85 hover:bg-red-200/18"
            : "bg-white/10 text-white/90 hover:bg-white/20",
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
  const [polls, setPolls] = useState<Poll[]>([]);
  const [goalsText, setGoalsText] = useState("");
  const [eventsText, setEventsText] = useState("");
  const [plansText, setPlansText] = useState("");
  const [newPollQuestion, setNewPollQuestion] = useState("");
  const [newPollOptions, setNewPollOptions] = useState("Option 1\nOption 2");
  const [loading, setLoading] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem("adminToken") || "";
    setToken(t);
  }, []);

  useEffect(() => {
    localStorage.setItem("adminToken", token);
  }, [token]);

  async function refresh() {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [iRes, rRes, qRes, pRes, cRes] = await Promise.all([
        fetch("/api/admin/ideas", { headers: { authorization: `Bearer ${token}` } }),
        fetch("/api/admin/reviews", { headers: { authorization: `Bearer ${token}` } }),
        fetch("/api/admin/requests", { headers: { authorization: `Bearer ${token}` } }),
        fetch("/api/admin/polls", { headers: { authorization: `Bearer ${token}` } }),
        fetch("/api/admin/content", { headers: { authorization: `Bearer ${token}` } }),
      ]);
      if (!iRes.ok || !rRes.ok || !qRes.ok || !pRes.ok || !cRes.ok) {
        throw new Error("Unauthorized or server error");
      }
      const iJson = (await iRes.json()) as { ideas: Idea[] };
      const rJson = (await rRes.json()) as { reviews: Review[] };
      const qJson = (await qRes.json()) as { requests: RequestItem[] };
      const pJson = (await pRes.json()) as { polls: Poll[] };
      const cJson = (await cRes.json()) as {
        items: { key: string; value_json: string; updated_at: number }[];
      };
      setIdeas(iJson.ideas || []);
      setReviews(rJson.reviews || []);
      setRequests(qJson.requests || []);
      setPolls(pJson.polls || []);
      const map = new Map(cJson.items.map((x) => [x.key, x.value_json]));
      const toText = (k: string) => {
        const v = map.get(k);
        if (!v) return "";
        try {
          const arr = JSON.parse(v) as string[];
          return arr.join("\n");
        } catch {
          return "";
        }
      };
      setGoalsText(toText("campaign_goals"));
      setEventsText(toText("community_events"));
      setPlansText(toText("upcoming_plans"));
      setAuthorized(true);
    } catch {
      setAuthorized(false);
      setIdeas([]);
      setReviews([]);
      setRequests([]);
      setError("Couldn’t load moderation queue. Check ADMIN_TOKEN.");
    } finally {
      setLoading(false);
    }
  }

  async function updateIdea(id: string, status: "pending" | "approved" | "rejected") {
    await fetch("/api/admin/ideas", {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ id, action: "set_status", status }),
    });
    await refresh();
  }

  async function deleteIdea(id: string) {
    await fetch("/api/admin/ideas", {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({ id, action: "delete" }),
    });
    await refresh();
  }

  async function updateReview(id: string, status: "pending" | "approved" | "rejected") {
    await fetch("/api/admin/reviews", {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ id, action: "set_status", status }),
    });
    await refresh();
  }

  async function deleteReview(id: string) {
    await fetch("/api/admin/reviews", {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({ id, action: "delete" }),
    });
    await refresh();
  }

  async function updateRequest(id: string, status: "pending" | "approved" | "rejected") {
    await fetch("/api/admin/requests", {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ id, action: "set_status", status }),
    });
    await refresh();
  }

  async function deleteRequest(id: string) {
    await fetch("/api/admin/requests", {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({ id, action: "delete" }),
    });
    await refresh();
  }

  async function createPoll() {
    const options = newPollOptions
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean);
    await fetch("/api/admin/polls", {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({ question: newPollQuestion, options }),
    });
    setNewPollQuestion("");
    setNewPollOptions("Option 1\nOption 2");
    await refresh();
  }

  async function deletePoll(id: string) {
    await fetch("/api/admin/polls", {
      method: "DELETE",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await refresh();
  }

  async function saveList(key: "campaign_goals" | "community_events" | "upcoming_plans", text: string) {
    const items = text
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean);
    await fetch("/api/admin/content", {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({ key, items }),
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
          Full control panel: submissions, polls, campaign goals, events, and upcoming plans.
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

        {authorized ? (
          <>
            <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <section className="rounded-3xl border border-white/10 bg-[rgba(255,255,255,0.03)] p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-white">Ideas (all)</div>
              <div className="text-xs text-white/55">{ideas.length}</div>
            </div>
            <div className="mt-4 space-y-3">
              {ideas.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/60">
                  No ideas yet.
                </div>
              ) : (
                ideas.slice(0, 120).map((i) => (
                  <div
                    key={i.id}
                    className="rounded-2xl border border-white/10 bg-[rgba(10,12,18,0.55)] p-4"
                  >
                    <div className="text-sm text-white/90">{i.title}</div>
                    <div className="mt-1 text-xs text-white/55">{i.details}</div>
                    <div className="mt-2 text-[11px] text-white/45">status: {i.status}</div>
                    <div className="mt-3 flex items-center gap-2">
                      <ActionButton tone="approve" onClick={() => void updateIdea(i.id, "approved")}>
                        Approve
                      </ActionButton>
                      <ActionButton tone="reject" onClick={() => void updateIdea(i.id, "rejected")}>
                        Reject
                      </ActionButton>
                      <ActionButton onClick={() => void updateIdea(i.id, "pending")}>Set pending</ActionButton>
                      <ActionButton tone="delete" onClick={() => void deleteIdea(i.id)}>
                        Delete
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
              <div className="text-sm font-semibold text-white">Reviews (all)</div>
              <div className="text-xs text-white/55">{reviews.length}</div>
            </div>
            <div className="mt-4 space-y-3">
              {reviews.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/60">
                  No reviews yet.
                </div>
              ) : (
                reviews.slice(0, 120).map((r) => (
                  <div
                    key={r.id}
                    className="rounded-2xl border border-white/10 bg-[rgba(10,12,18,0.55)] p-4"
                  >
                    <div className="text-sm font-semibold text-white/90">{r.display_name}</div>
                    <div className="mt-1 text-sm text-white/75">{r.content}</div>
                    <div className="mt-2 text-[11px] text-white/45">status: {r.status}</div>
                    <div className="mt-3 flex items-center gap-2">
                      <ActionButton tone="approve" onClick={() => void updateReview(r.id, "approved")}>
                        Approve
                      </ActionButton>
                      <ActionButton tone="reject" onClick={() => void updateReview(r.id, "rejected")}>
                        Reject
                      </ActionButton>
                      <ActionButton onClick={() => void updateReview(r.id, "pending")}>Set pending</ActionButton>
                      <ActionButton tone="delete" onClick={() => void deleteReview(r.id)}>
                        Delete
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
            <div className="text-sm font-semibold text-white">Requests (all)</div>
            <div className="text-xs text-white/55">{requests.length}</div>
          </div>
          <p className="mt-2 text-sm text-white/65">
            Every request is saved here and can be approved or rejected.
          </p>

          <div className="mt-4 space-y-3">
            {requests.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/60">
                No requests yet. Submit one from the main site to test.
              </div>
            ) : (
              requests.slice(0, 120).map((r) => (
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
                  <div className="mt-2 text-[11px] text-white/45">status: {r.status}</div>
                  <div className="mt-3 flex items-center gap-2">
                    <ActionButton tone="approve" onClick={() => void updateRequest(r.id, "approved")}>
                      Approve
                    </ActionButton>
                    <ActionButton tone="reject" onClick={() => void updateRequest(r.id, "rejected")}>
                      Reject
                    </ActionButton>
                    <ActionButton onClick={() => void updateRequest(r.id, "pending")}>Set pending</ActionButton>
                    <ActionButton tone="delete" onClick={() => void deleteRequest(r.id)}>
                      Delete
                    </ActionButton>
                  </div>
                  <div className="mt-3 text-[11px] text-white/45">id: {r.id}</div>
                </div>
              ))
            )}
          </div>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <section className="rounded-3xl border border-white/10 bg-[rgba(255,255,255,0.03)] p-6 backdrop-blur-xl">
                <div className="text-sm font-semibold text-white">Student polls</div>
                <div className="mt-4 space-y-3">
                  <input
                    value={newPollQuestion}
                    onChange={(e) => setNewPollQuestion(e.target.value)}
                    placeholder="Poll question"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 outline-none"
                  />
                  <textarea
                    value={newPollOptions}
                    onChange={(e) => setNewPollOptions(e.target.value)}
                    placeholder={"One option per line"}
                    className="min-h-[110px] w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 outline-none"
                  />
                  <ActionButton onClick={() => void createPoll()}>Create poll</ActionButton>
                </div>
                <div className="mt-4 space-y-2">
                  {polls.map((p) => (
                    <div key={p.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <div className="text-sm text-white/85">{p.question}</div>
                      <div className="mt-1 text-xs text-white/55">{p.options.join(" • ")}</div>
                      <div className="mt-2">
                        <ActionButton tone="delete" onClick={() => void deletePoll(p.id)}>
                          Delete poll
                        </ActionButton>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-3xl border border-white/10 bg-[rgba(255,255,255,0.03)] p-6 backdrop-blur-xl">
                <div className="text-sm font-semibold text-white">Live website content</div>
                <p className="mt-2 text-xs text-white/60">One item per line.</p>
                <div className="mt-3 space-y-3">
                  <textarea
                    value={goalsText}
                    onChange={(e) => setGoalsText(e.target.value)}
                    className="min-h-[120px] w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/90 outline-none"
                  />
                  <ActionButton onClick={() => void saveList("campaign_goals", goalsText)}>
                    Save campaign goals
                  </ActionButton>
                  <textarea
                    value={eventsText}
                    onChange={(e) => setEventsText(e.target.value)}
                    className="min-h-[120px] w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/90 outline-none"
                  />
                  <ActionButton onClick={() => void saveList("community_events", eventsText)}>
                    Save community events
                  </ActionButton>
                  <textarea
                    value={plansText}
                    onChange={(e) => setPlansText(e.target.value)}
                    className="min-h-[120px] w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/90 outline-none"
                  />
                  <ActionButton onClick={() => void saveList("upcoming_plans", plansText)}>
                    Save upcoming plans
                  </ActionButton>
                </div>
              </section>
            </div>
          </>
        ) : (
          <div className="mt-8 rounded-3xl border border-white/10 bg-[rgba(255,255,255,0.03)] p-6 text-sm text-white/70 backdrop-blur-xl">
            Enter your ADMIN_TOKEN and click <span className="text-white">Load queue</span> to view submissions.
          </div>
        )}
      </div>
    </main>
  );
}

