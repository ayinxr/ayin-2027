import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { readOrCreateVoterId, VOTER_COOKIE } from "@/lib/voter";

export const runtime = "nodejs";

const Schema = z.object({ optionIdx: z.number().int().min(0).max(20) });

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { voterId, isNew } = await readOrCreateVoterId();
  const d = db();

  const poll = d.prepare("SELECT options_json FROM polls WHERE id = ? AND status = 'active'").get(id) as
    | { options_json: string }
    | undefined;
  if (!poll) return NextResponse.json({ error: "Poll not found" }, { status: 404 });

  const options = JSON.parse(poll.options_json) as string[];
  if (parsed.data.optionIdx >= options.length) {
    return NextResponse.json({ error: "Invalid option" }, { status: 400 });
  }

  const now = Date.now();
  d.prepare("DELETE FROM poll_votes WHERE poll_id = ? AND voter_id = ?").run(id, voterId);
  d.prepare(
    "INSERT OR REPLACE INTO poll_votes (poll_id, option_idx, voter_id, created_at) VALUES (?, ?, ?, ?)",
  ).run(id, parsed.data.optionIdx, voterId, now);

  const counts = options.map((_, idx) => {
    const r = d
      .prepare("SELECT COUNT(*) as c FROM poll_votes WHERE poll_id = ? AND option_idx = ?")
      .get(id, idx) as { c: number };
    return r.c;
  });

  const res = NextResponse.json({
    ok: true,
    counts,
    total: counts.reduce((a, b) => a + b, 0),
    votedOptionIdx: parsed.data.optionIdx,
  });

  if (isNew) {
    res.cookies.set(VOTER_COOKIE, voterId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
  }
  return res;
}

