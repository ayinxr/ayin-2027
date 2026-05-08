import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { addToCampaignBudget } from "@/lib/siteContent";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const d = db();
  const rows = d
    .prepare(
      `SELECT id, display_name, amount, note, status, created_at
       FROM donations
       ORDER BY created_at DESC
       LIMIT 200`,
    )
    .all();

  return NextResponse.json({ donations: rows });
}

const ActionSchema = z.object({
  id: z.string().min(1),
  action: z.enum(["approve", "reject", "delete"]),
});

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const body = await req.json().catch(() => null);
  const parsed = ActionSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const d = db();
  const row = d
    .prepare("SELECT id, amount, status FROM donations WHERE id = ?")
    .get(parsed.data.id) as { id: string; amount: number; status: string } | undefined;

  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (parsed.data.action === "delete") {
    d.prepare("DELETE FROM donations WHERE id = ?").run(parsed.data.id);
    return NextResponse.json({ ok: true });
  }

  if (parsed.data.action === "reject") {
    d.prepare("UPDATE donations SET status = 'rejected' WHERE id = ?").run(parsed.data.id);
    return NextResponse.json({ ok: true });
  }

  if (row.status === "approved") {
    return NextResponse.json({ error: "Already approved" }, { status: 400 });
  }

  addToCampaignBudget(row.amount);
  d.prepare("UPDATE donations SET status = 'approved' WHERE id = ?").run(parsed.data.id);
  return NextResponse.json({ ok: true });
}
