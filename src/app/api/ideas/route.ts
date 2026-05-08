import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { z } from "zod";
import { db } from "@/lib/db";

export const runtime = "nodejs";

const CreateIdeaSchema = z.object({
  title: z.string().min(3).max(90),
  details: z.string().min(10).max(700),
  category: z.enum(["events", "spirit", "communication", "tournaments", "recognition", "other"]),
});

export async function GET() {
  const d = db();
  const rows = d
    .prepare(
      `
      SELECT
        i.id,
        i.title,
        i.details,
        i.category,
        i.status,
        i.created_at,
        (SELECT COUNT(*) FROM idea_votes v WHERE v.idea_id = i.id) AS votes
      FROM ideas i
      WHERE i.status = 'approved'
      ORDER BY votes DESC, i.created_at DESC
      LIMIT 50;
    `,
    )
    .all();

  return NextResponse.json({ ideas: rows });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = CreateIdeaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const d = db();
  const id = crypto.randomUUID();
  d.prepare(
    `INSERT INTO ideas (id, title, details, category, status, created_at)
     VALUES (?, ?, ?, ?, 'pending', ?)`,
  ).run(id, parsed.data.title.trim(), parsed.data.details.trim(), parsed.data.category, Date.now());

  return NextResponse.json({ ok: true, id });
}

