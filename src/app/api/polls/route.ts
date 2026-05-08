import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
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

