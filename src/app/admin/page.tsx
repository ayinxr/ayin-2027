"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/cn";
import Link from "next/link";
import { ArrowLeft, LayoutDashboard, Sparkles } from "lucide-react";

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

type Donation = {
  id: string;
  display_name: string;
  amount: number;
  note: string;
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
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
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
    </motion.button>
  );
}

const sectionClass =
  "rounded-3xl border border-white/10 bg-[rgba(255,255,255,0.03)] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl";

export default function AdminPage() {
  const [token, setToken] = useState("");
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [goalsText, setGoalsText] = useState("");
  const [eventsText, setEventsText] = useState("");
  const [plansText, setPlansText] = useState("");
  const [intramuralText, setIntramuralText] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("400");
  const [budgetCurrency, setBudgetCurrency] = useState("CAD");
  const [newPollQuestion, setNewPollQuestion] = useState("");
  const [newPollOptions, setNewPollOptions] = useState("Option 1\nOption 2");
  const [loading, setLoading] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"overview" | "submissions" | "site" | "finance">("overview");

  useEffect(() => {
    const t = localStorage.getItem("adminToken") || "";
    setToken(t);
  }, []);

  useEffect(() => {
    localStorage.setItem("adminToken", token);
  }, [token]);

  const stats = useMemo(
    () => [
      { label: "Ideas", value: ideas.length },
      { label: "Reviews", value: reviews.length },
      { label: "Requests", value: requests.length },
      { label: "Polls", value: polls.length },
      { label: "Donations", value: donations.length },
    ],
    [ideas.length, reviews.length, requests.length, polls.length, donations.length],
  );

  async function refresh() {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [iRes, rRes, qRes, pRes, cRes, dRes] = await Promise.all([
        fetch("/api/admin/ideas", { headers: { authorization: `Bearer ${token}` } }),
        fetch("/api/admin/reviews", { headers: { authorization: `Bearer ${token}` } }),
        fetch("/api/admin/requests", { headers: { authorization: `Bearer ${token}` } }),
        fetch("/api/admin/polls", { headers: { authorization: `Bearer ${token}` } }),
        fetch("/api/admin/content", { headers: { authorization: `Bearer ${token}` } }),
        fetch("/api/admin/donations", { headers: { authorization: `Bearer ${token}` } }),
      ]);
      if (!iRes.ok || !rRes.ok || !qRes.ok || !pRes.ok || !cRes.ok || !dRes.ok) {
        throw new Error("Unauthorized or server error");
      }
      const iJson = (await iRes.json()) as { ideas: Idea[] };
      const rJson = (await rRes.json()) as { reviews: Review[] };
      const qJson = (await qRes.json()) as { requests: RequestItem[] };
      const pJson = (await pRes.json()) as { polls: Poll[] };
      const dJson = (await dRes.json()) as { donations: Donation[] };
      const cJson = (await cRes.json()) as {
        items: { key: string; value_json: string; updated_at: number }[];
      };
      setIdeas(iJson.ideas || []);
      setReviews(rJson.reviews || []);
      setRequests(qJson.requests || []);
      setPolls(pJson.polls || []);
      setDonations(dJson.donations || []);
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

      const intrRaw = map.get("intramural_info");
      if (intrRaw) {
        try {
          const o = JSON.parse(intrRaw) as { text?: string };
          setIntramuralText(typeof o.text === "string" ? o.text : "");
        } catch {
          setIntramuralText("");
        }
      } else setIntramuralText("");

      const budRaw = map.get("campaign_budget");
      if (budRaw) {
        try {
          const o = JSON.parse(budRaw) as { amount?: number; currency?: string };
          setBudgetAmount(String(typeof o.amount === "number" ? o.amount : 400));
          setBudgetCurrency(typeof o.currency === "string" && o.currency ? o.currency : "CAD");
        } catch {
          setBudgetAmount("400");
          setBudgetCurrency("CAD");
        }
      } else {
        setBudgetAmount("400");
        setBudgetCurrency("CAD");
      }

      setAuthorized(true);
    } catch {
      setAuthorized(false);
      setIdeas([]);
      setReviews([]);
      setRequests([]);
      setPolls([]);
      setDonations([]);
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

  async function donationAction(id: string, action: "approve" | "reject" | "delete") {
    await fetch("/api/admin/donations", {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({ id, action }),
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

  async function saveIntramural() {
    await fetch("/api/admin/content", {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({ key: "intramural_info", text: intramuralText }),
    });
    await refresh();
  }

  async function saveBudgetManual() {
    const amt = Number(budgetAmount);
    if (!Number.isFinite(amt) || amt < 0) return;
    await fetch("/api/admin/content", {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({
        key: "campaign_budget",
        amount: amt,
        currency: budgetCurrency.trim() || "CAD",
      }),
    });
    await refresh();
  }

  const tabBtn = (id: typeof tab, label: string) => (
    <button
      type="button"
      onClick={() => setTab(id)}
      className={cn(
        "rounded-full px-4 py-2 text-xs font-medium transition",
        tab === id
          ? "bg-white text-black shadow-[0_8px_30px_rgba(120,163,255,0.25)]"
          : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white",
      )}
    >
      {label}
    </button>
  );

  return (
    <main className="relative min-h-screen overflow-hidden px-5 py-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[10%] top-[15%] h-[380px] w-[380px] rounded-full bg-[rgba(120,163,255,0.12)] blur-3xl" />
        <div className="absolute right-[5%] top-[40%] h-[320px] w-[320px] rounded-full bg-[rgba(184,120,255,0.10)] blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
          className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <Link
              href="/"
              className="mb-3 inline-flex items-center gap-2 text-xs text-white/55 transition hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to site
            </Link>
            <h1 className="flex items-center gap-3 font-[var(--font-cinzel)] text-3xl tracking-[-0.01em]">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                <LayoutDashboard className="h-5 w-5 text-[rgba(120,163,255,0.95)]" />
              </span>
              Command center
            </h1>
            <p className="mt-2 flex items-center gap-2 text-sm text-white/65">
              <Sparkles className="h-4 w-4 text-[rgba(184,120,255,0.9)]" />
              Approve content, run polls, edit public copy, and manage the campaign budget.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.5 }}
          className={cn("mt-8", sectionClass, "border-[rgba(120,163,255,0.18)]")}
        >
          <div className="text-sm font-semibold text-white">Admin access</div>
          <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center">
            <input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste ADMIN_TOKEN"
              className="w-full flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 outline-none placeholder:text-white/35 focus:border-[rgba(120,163,255,0.35)]"
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => void refresh()}
              className="rounded-full bg-white px-5 py-2 text-xs font-medium text-black"
              type="button"
            >
              {loading ? "Syncing…" : "Unlock dashboard"}
            </motion.button>
          </div>
          {error && <div className="mt-3 text-xs text-red-200/80">{error}</div>}
        </motion.div>

        <AnimatePresence mode="wait">
          {!authorized ? (
            <motion.div
              key="locked"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={cn("mt-8", sectionClass)}
            >
              <p className="text-sm text-white/70">
                Enter your <span className="text-white">ADMIN_TOKEN</span> and tap{" "}
                <span className="text-white">Unlock dashboard</span> to load submissions, site copy,
                and finance tools.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45 }}
              className="mt-8 space-y-8"
            >
              <div className="flex flex-wrap gap-2">
                {tabBtn("overview", "Overview")}
                {tabBtn("submissions", "Submissions")}
                {tabBtn("site", "Site & polls")}
                {tabBtn("finance", "Budget & donations")}
              </div>

              {tab === "overview" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
                >
                  {stats.map((s, i) => (
                    <motion.div
                      key={s.label}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={cn(sectionClass, "p-5")}
                    >
                      <div className="text-[11px] uppercase tracking-[0.18em] text-white/45">
                        {s.label}
                      </div>
                      <div className="mt-2 font-[var(--font-cinzel)] text-2xl text-white">{s.value}</div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {tab === "submissions" && (
                <div className="grid gap-4 lg:grid-cols-2">
                  <motion.section
                    layout
                    className={sectionClass}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-white">Ideas</div>
                      <div className="text-xs text-white/55">{ideas.length}</div>
                    </div>
                    <div className="mt-4 max-h-[520px] space-y-3 overflow-y-auto pr-1">
                      {ideas.length === 0 ? (
                        <p className="text-sm text-white/55">No ideas yet.</p>
                      ) : (
                        ideas.slice(0, 120).map((i) => (
                          <motion.div
                            key={i.id}
                            layout
                            className="rounded-2xl border border-white/10 bg-[rgba(10,12,18,0.55)] p-4"
                          >
                            <div className="text-sm text-white/90">{i.title}</div>
                            <div className="mt-1 text-xs text-white/55">{i.details}</div>
                            <div className="mt-2 text-[11px] text-white/45">status: {i.status}</div>
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              <ActionButton tone="approve" onClick={() => void updateIdea(i.id, "approved")}>
                                Approve
                              </ActionButton>
                              <ActionButton tone="reject" onClick={() => void updateIdea(i.id, "rejected")}>
                                Reject
                              </ActionButton>
                              <ActionButton onClick={() => void updateIdea(i.id, "pending")}>
                                Pending
                              </ActionButton>
                              <ActionButton tone="delete" onClick={() => void deleteIdea(i.id)}>
                                Delete
                              </ActionButton>
                              <span className="ml-auto text-[11px] text-white/45">votes: {i.votes}</span>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </motion.section>

                  <motion.section layout className={sectionClass}>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-white">Reviews</div>
                      <div className="text-xs text-white/55">{reviews.length}</div>
                    </div>
                    <div className="mt-4 max-h-[520px] space-y-3 overflow-y-auto pr-1">
                      {reviews.length === 0 ? (
                        <p className="text-sm text-white/55">No reviews yet.</p>
                      ) : (
                        reviews.slice(0, 120).map((r) => (
                          <motion.div
                            key={r.id}
                            layout
                            className="rounded-2xl border border-white/10 bg-[rgba(10,12,18,0.55)] p-4"
                          >
                            <div className="text-sm font-semibold text-white/90">{r.display_name}</div>
                            <div className="mt-1 text-sm text-white/75">{r.content}</div>
                            <div className="mt-2 text-[11px] text-white/45">status: {r.status}</div>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <ActionButton tone="approve" onClick={() => void updateReview(r.id, "approved")}>
                                Approve
                              </ActionButton>
                              <ActionButton tone="reject" onClick={() => void updateReview(r.id, "rejected")}>
                                Reject
                              </ActionButton>
                              <ActionButton onClick={() => void updateReview(r.id, "pending")}>
                                Pending
                              </ActionButton>
                              <ActionButton tone="delete" onClick={() => void deleteReview(r.id)}>
                                Delete
                              </ActionButton>
                              <span className="ml-auto text-[11px] text-white/45">↑ {r.upvotes}</span>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </motion.section>

                  <motion.section layout className={cn(sectionClass, "lg:col-span-2")}>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-white">Requests</div>
                      <div className="text-xs text-white/55">{requests.length}</div>
                    </div>
                    <div className="mt-4 max-h-[480px] space-y-3 overflow-y-auto pr-1">
                      {requests.length === 0 ? (
                        <p className="text-sm text-white/55">No requests yet.</p>
                      ) : (
                        requests.slice(0, 120).map((r) => (
                          <motion.div
                            key={r.id}
                            layout
                            className="rounded-2xl border border-white/10 bg-[rgba(10,12,18,0.55)] p-4"
                          >
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                              <div className="text-sm font-semibold text-white/90">{r.subject}</div>
                              <div className="text-[11px] text-white/45">
                                {new Date(r.created_at).toLocaleString()}
                              </div>
                            </div>
                            <div className="mt-1 text-xs text-white/55">from: {r.email}</div>
                            <div className="mt-2 whitespace-pre-wrap text-sm text-white/75">{r.message}</div>
                            <div className="mt-2 text-[11px] text-white/45">status: {r.status}</div>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <ActionButton tone="approve" onClick={() => void updateRequest(r.id, "approved")}>
                                Approve
                              </ActionButton>
                              <ActionButton tone="reject" onClick={() => void updateRequest(r.id, "rejected")}>
                                Reject
                              </ActionButton>
                              <ActionButton onClick={() => void updateRequest(r.id, "pending")}>
                                Pending
                              </ActionButton>
                              <ActionButton tone="delete" onClick={() => void deleteRequest(r.id)}>
                                Delete
                              </ActionButton>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </motion.section>
                </div>
              )}

              {tab === "site" && (
                <div className="grid gap-4 lg:grid-cols-2">
                  <motion.section layout className={sectionClass}>
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
                        placeholder="One option per line"
                        className="min-h-[110px] w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 outline-none"
                      />
                      <ActionButton onClick={() => void createPoll()}>Create poll</ActionButton>
                    </div>
                    <div className="mt-4 max-h-[360px] space-y-2 overflow-y-auto">
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
                  </motion.section>

                  <motion.section layout className={sectionClass}>
                    <div className="text-sm font-semibold text-white">Live site copy</div>
                    <p className="mt-2 text-xs text-white/55">Lists: one item per line.</p>
                    <div className="mt-3 max-h-[560px] space-y-4 overflow-y-auto pr-1">
                      <div>
                        <div className="text-[11px] text-white/45">Campaign goals</div>
                        <textarea
                          value={goalsText}
                          onChange={(e) => setGoalsText(e.target.value)}
                          className="mt-1 min-h-[100px] w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/90 outline-none"
                        />
                        <div className="mt-2">
                          <ActionButton onClick={() => void saveList("campaign_goals", goalsText)}>
                            Save goals
                          </ActionButton>
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] text-white/45">Community events</div>
                        <textarea
                          value={eventsText}
                          onChange={(e) => setEventsText(e.target.value)}
                          className="mt-1 min-h-[100px] w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/90 outline-none"
                        />
                        <div className="mt-2">
                          <ActionButton onClick={() => void saveList("community_events", eventsText)}>
                            Save events
                          </ActionButton>
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] text-white/45">What’s up next</div>
                        <textarea
                          value={plansText}
                          onChange={(e) => setPlansText(e.target.value)}
                          className="mt-1 min-h-[100px] w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/90 outline-none"
                        />
                        <div className="mt-2">
                          <ActionButton onClick={() => void saveList("upcoming_plans", plansText)}>
                            Save plans
                          </ActionButton>
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] text-white/45">Sport intramurals (under Events)</div>
                        <textarea
                          value={intramuralText}
                          onChange={(e) => setIntramuralText(e.target.value)}
                          className="mt-1 min-h-[120px] w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/90 outline-none"
                        />
                        <div className="mt-2">
                          <ActionButton onClick={() => void saveIntramural()}>Save intramurals</ActionButton>
                        </div>
                      </div>
                    </div>
                  </motion.section>
                </div>
              )}

              {tab === "finance" && (
                <div className="grid gap-4 lg:grid-cols-2">
                  <motion.section layout className={sectionClass}>
                    <div className="text-sm font-semibold text-white">Public campaign budget</div>
                    <p className="mt-2 text-xs text-white/55">
                      Shown on the Donate page. Approving a pledge adds that amount here automatically;
                      you can also set the total manually (e.g. after cash is received).
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <input
                        value={budgetAmount}
                        onChange={(e) => setBudgetAmount(e.target.value)}
                        className="w-32 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 outline-none"
                        inputMode="decimal"
                      />
                      <input
                        value={budgetCurrency}
                        onChange={(e) => setBudgetCurrency(e.target.value.toUpperCase())}
                        className="w-24 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 outline-none"
                        placeholder="CAD"
                      />
                      <ActionButton onClick={() => void saveBudgetManual()}>Save budget</ActionButton>
                    </div>
                  </motion.section>

                  <motion.section layout className={sectionClass}>
                    <div className="text-sm font-semibold text-white">Donation pledges</div>
                    <p className="mt-2 text-xs text-white/55">
                      Approve to add the pledge amount to the public budget. Reject or delete to clean up.
                    </p>
                    <div className="mt-4 max-h-[420px] space-y-3 overflow-y-auto pr-1">
                      {donations.length === 0 ? (
                        <p className="text-sm text-white/55">No pledges yet.</p>
                      ) : (
                        donations.map((d) => (
                          <motion.div
                            key={d.id}
                            layout
                            className="rounded-2xl border border-white/10 bg-[rgba(10,12,18,0.55)] p-4"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="text-sm font-semibold text-white/90">{d.display_name}</div>
                              <div className="text-sm text-white/80">
                                {new Intl.NumberFormat(undefined, {
                                  style: "currency",
                                  currency: budgetCurrency || "CAD",
                                }).format(d.amount)}
                              </div>
                            </div>
                            {d.note ? (
                              <div className="mt-2 text-xs text-white/60">{d.note}</div>
                            ) : null}
                            <div className="mt-2 text-[11px] text-white/45">
                              {new Date(d.created_at).toLocaleString()} · {d.status}
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <ActionButton tone="approve" onClick={() => void donationAction(d.id, "approve")}>
                                Approve (+budget)
                              </ActionButton>
                              <ActionButton tone="reject" onClick={() => void donationAction(d.id, "reject")}>
                                Reject
                              </ActionButton>
                              <ActionButton tone="delete" onClick={() => void donationAction(d.id, "delete")}>
                                Delete
                              </ActionButton>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </motion.section>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
