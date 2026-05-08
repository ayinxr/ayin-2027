import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

export const runtime = "nodejs";

const KeySchema = z.enum(["campaign_goals", "community_events", "upcoming_plans"]);

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const d = db();
  const rows = d
    .prepare("SELECT key, value_json, updated_at FROM managed_content WHERE key IN (?, ?, ?)")
    .all("campaign_goals", "community_events", "upcoming_plans") as {
    key: string;
    value_json: string;
    updated_at: number;
  }[];

  return NextResponse.json({ items: rows });
}

const UpdateSchema = z.object({
  key: KeySchema,
  items: z.array(z.string().min(1).max(180)).max(40),
});

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const body = await req.json().catch(() => null);
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const cleaned = parsed.data.items.map((x) => x.trim()).filter(Boolean);
  const d = db();
  d.prepare(
    "INSERT OR REPLACE INTO managed_content (key, value_json, updated_at) VALUES (?, ?, ?)",
  ).run(parsed.data.key, JSON.stringify(cleaned), Date.now());

  return NextResponse.json({ ok: true });
}

