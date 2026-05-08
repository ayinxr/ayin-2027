import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { z } from "zod";
import { db } from "@/lib/db";

export const runtime = "nodejs";

const CreateSchema = z.object({
  displayName: z.string().min(2).max(40),
  content: z.string().min(8).max(500),
});

export async function GET() {
  const d = db();
  const rows = d
    .prepare(
      `
      SELECT
        r.id,
        r.display_name,
        r.content,
        r.created_at,
        (SELECT COUNT(*) FROM review_reactions rr WHERE rr.review_id = r.id) AS upvotes
      FROM reviews r
      WHERE r.status = 'approved'
      ORDER BY upvotes DESC, r.created_at DESC
      LIMIT 60;
    `,
    )
    .all();
  return NextResponse.json({ reviews: rows });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const d = db();
  const id = crypto.randomUUID();
  d.prepare(
    `INSERT INTO reviews (id, display_name, content, status, created_at)
     VALUES (?, ?, ?, 'pending', ?)`,
  ).run(id, parsed.data.displayName.trim(), parsed.data.content.trim(), Date.now());

  return NextResponse.json({ ok: true, id });
}

