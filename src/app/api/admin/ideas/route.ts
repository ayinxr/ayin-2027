import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

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
      WHERE i.status IN ('pending', 'approved', 'rejected')
      ORDER BY i.created_at DESC
      LIMIT 200;
    `,
    )
    .all();

  return NextResponse.json({ ideas: rows });
}

const UpdateSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["approved", "rejected"]),
});

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const body = await req.json().catch(() => null);
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const d = db();
  d.prepare("UPDATE ideas SET status = ? WHERE id = ?").run(parsed.data.status, parsed.data.id);
  return NextResponse.json({ ok: true });
}

