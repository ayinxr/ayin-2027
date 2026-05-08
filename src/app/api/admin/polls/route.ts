import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const d = db();
  const rows = d
    .prepare("SELECT id, question, options_json, status, created_at FROM polls ORDER BY created_at DESC")
    .all() as { id: string; question: string; options_json: string; status: string; created_at: number }[];

  return NextResponse.json({
    polls: rows.map((p) => ({
      id: p.id,
      question: p.question,
      options: JSON.parse(p.options_json) as string[],
      status: p.status,
      created_at: p.created_at,
    })),
  });
}

const CreateSchema = z.object({
  question: z.string().min(5).max(180),
  options: z.array(z.string().min(1).max(90)).min(2).max(8),
});

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const body = await req.json().catch(() => null);
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const id = crypto.randomUUID();
  const options = parsed.data.options.map((x) => x.trim()).filter(Boolean);
  const d = db();
  d.prepare(
    `INSERT INTO polls (id, question, options_json, status, created_at)
     VALUES (?, ?, ?, 'active', ?)`,
  ).run(id, parsed.data.question.trim(), JSON.stringify(options), Date.now());

  return NextResponse.json({ ok: true, id });
}

const DeleteSchema = z.object({ id: z.string().min(1) });

export async function DELETE(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const body = await req.json().catch(() => null);
  const parsed = DeleteSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const d = db();
  d.prepare("DELETE FROM poll_votes WHERE poll_id = ?").run(parsed.data.id);
  d.prepare("DELETE FROM polls WHERE id = ?").run(parsed.data.id);
  return NextResponse.json({ ok: true });
}

