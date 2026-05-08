import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { db } from "@/lib/db";

export const runtime = "nodejs";

function ensureSeed() {
  const d = db();
  const existing = d.prepare("SELECT COUNT(*) as c FROM polls").get() as { c: number };
  if (existing.c > 0) return;

  const id = crypto.randomUUID();
  const question = "What should we vote on first this month?";
  const options = [
    "Next spirit day theme",
    "Lunchtime tournament schedule",
    "School-wide challenge idea",
    "Event theme (rally / activity)",
  ];

  d.prepare(
    `INSERT INTO polls (id, question, options_json, status, created_at)
     VALUES (?, ?, ?, 'active', ?)`,
  ).run(id, question, JSON.stringify(options), Date.now());
}

export async function GET() {
  ensureSeed();
  const d = db();
  const polls = d
    .prepare(
      `
      SELECT p.id, p.question, p.options_json, p.status, p.created_at
      FROM polls p
      WHERE p.status = 'active'
      ORDER BY p.created_at DESC
      LIMIT 5;
    `,
    )
    .all() as { id: string; question: string; options_json: string; status: string; created_at: number }[];

  const out = polls.map((p) => {
    const options = JSON.parse(p.options_json) as string[];
    const counts = options.map((_, idx) => {
      const r = d
        .prepare("SELECT COUNT(*) as c FROM poll_votes WHERE poll_id = ? AND option_idx = ?")
        .get(p.id, idx) as { c: number };
      return r.c;
    });
    const total = counts.reduce((a, b) => a + b, 0);
    return { id: p.id, question: p.question, options, counts, total };
  });

  return NextResponse.json({ polls: out });
}

