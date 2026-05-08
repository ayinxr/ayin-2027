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
        r.id,
        r.display_name,
        r.content,
        r.status,
        r.created_at,
        (SELECT COUNT(*) FROM review_reactions rr WHERE rr.review_id = r.id) AS upvotes
      FROM reviews r
      ORDER BY r.created_at DESC
      LIMIT 250;
    `,
    )
    .all();

  return NextResponse.json({ reviews: rows });
}

const UpdateSchema = z.object({
  id: z.string().min(1),
  action: z.enum(["set_status", "delete"]),
  status: z.enum(["pending", "approved", "rejected"]).optional(),
});

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const body = await req.json().catch(() => null);
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const d = db();
  if (parsed.data.action === "delete") {
    d.prepare("DELETE FROM review_reactions WHERE review_id = ?").run(parsed.data.id);
    d.prepare("DELETE FROM reviews WHERE id = ?").run(parsed.data.id);
    return NextResponse.json({ ok: true });
  }

  if (!parsed.data.status) {
    return NextResponse.json({ error: "Missing status" }, { status: 400 });
  }
  d.prepare("UPDATE reviews SET status = ? WHERE id = ?").run(parsed.data.status, parsed.data.id);
  return NextResponse.json({ ok: true });
}

