import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { readOrCreateVoterId, VOTER_COOKIE } from "@/lib/voter";

export const runtime = "nodejs";

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const { voterId, isNew } = await readOrCreateVoterId();
  const d = db();
  const now = Date.now();

  const existing = d
    .prepare("SELECT 1 FROM review_reactions WHERE review_id = ? AND voter_id = ?")
    .get(id, voterId);

  if (existing) {
    d.prepare("DELETE FROM review_reactions WHERE review_id = ? AND voter_id = ?").run(id, voterId);
  } else {
    d.prepare(
      "INSERT OR IGNORE INTO review_reactions (review_id, voter_id, created_at) VALUES (?, ?, ?)",
    ).run(id, voterId, now);
  }

  const upvotes = d
    .prepare("SELECT COUNT(*) as c FROM review_reactions WHERE review_id = ?")
    .get(id) as { c: number };

  const res = NextResponse.json({ ok: true, upvotes: upvotes.c, upvoted: !existing });
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

