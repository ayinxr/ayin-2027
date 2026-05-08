"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { Mail, Send } from "lucide-react";

export function RequestForm() {
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<null | { ok: boolean; note: string }>(null);

  async function submit() {
    setSending(true);
    setStatus(null);
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, subject, message }),
      });
      const json = (await res.json()) as { ok?: boolean; emailed?: boolean; error?: string };
      if (!res.ok || !json.ok) throw new Error(json.error || "failed");
      setEmail("");
      setSubject("");
      setMessage("");
      setStatus({
        ok: true,
        note: json.emailed
          ? "Sent. Ayin will read this and follow up when possible."
          : "Saved. Email sending isn’t configured yet, but your request is recorded for moderation.",
      });
    } catch {
      setStatus({ ok: false, note: "Couldn’t send that right now. Try again soon." });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-[rgba(255,255,255,0.03)] p-6 backdrop-blur-xl">
      <div className="flex items-center gap-2 text-sm font-semibold text-white">
        <Mail className="h-4 w-4 text-[rgba(120,163,255,0.95)]" />
        Send a request / idea
      </div>
      <p className="mt-2 text-sm text-white/70">
        This goes straight to the campaign inbox. Requests are moderated and can be added to voting.
      </p>

      <div className="mt-5 grid gap-3">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email (so Ayin can reply)"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 outline-none placeholder:text-white/35 focus:border-[rgba(120,163,255,0.35)]"
          inputMode="email"
        />
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Subject"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 outline-none placeholder:text-white/35 focus:border-[rgba(120,163,255,0.35)]"
        />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Describe the change, event, or improvement you want to see — and why it matters to students."
          className="min-h-[140px] w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 outline-none placeholder:text-white/35 focus:border-[rgba(120,163,255,0.35)]"
        />

        <div className="flex items-center justify-between gap-3">
          <div className="text-[11px] text-white/50">
            Be respectful. No personal info about others.
          </div>
          <button
            disabled={
              sending ||
              !email.includes("@") ||
              subject.trim().length < 3 ||
              message.trim().length < 10
            }
            onClick={() => void submit()}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition",
              "bg-white text-black hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60",
            )}
            type="button"
          >
            <Send className="h-4 w-4" />
            {sending ? "Sending…" : "Send"}
          </button>
        </div>

        {status && (
          <div
            className={cn(
              "rounded-2xl border px-4 py-3 text-sm",
              status.ok
                ? "border-[rgba(120,163,255,0.22)] bg-[rgba(120,163,255,0.08)] text-white/85"
                : "border-red-200/20 bg-red-200/10 text-red-100/85",
            )}
          >
            {status.note}
          </div>
        )}
      </div>
    </div>
  );
}

