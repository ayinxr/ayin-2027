import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

export const runtime = "nodejs";

const LIST_KEYS = ["campaign_goals", "community_events", "upcoming_plans"] as const;
const ALL_KEYS = [...LIST_KEYS, "intramural_info", "campaign_budget"] as const;

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const d = db();
  const placeholders = ALL_KEYS.map(() => "?").join(", ");
  const rows = d
    .prepare(`SELECT key, value_json, updated_at FROM managed_content WHERE key IN (${placeholders})`)
    .all(...ALL_KEYS) as {
    key: string;
    value_json: string;
    updated_at: number;
  }[];

  return NextResponse.json({ items: rows });
}

const PostSchema = z.union([
  z.object({
    key: z.enum(LIST_KEYS),
    items: z.array(z.string().min(1).max(180)).max(40),
  }),
  z.object({
    key: z.literal("intramural_info"),
    text: z.string().min(1).max(6000),
  }),
  z.object({
    key: z.literal("campaign_budget"),
    amount: z.number().min(0).max(1_000_000),
    currency: z.string().min(2).max(8).optional(),
  }),
]);

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const body = await req.json().catch(() => null);
  const parsed = PostSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const d = db();
  const now = Date.now();

  if (parsed.data.key === "intramural_info") {
    d.prepare("INSERT OR REPLACE INTO managed_content (key, value_json, updated_at) VALUES (?, ?, ?)").run(
      "intramural_info",
      JSON.stringify({ text: parsed.data.text.trim() }),
      now,
    );
    return NextResponse.json({ ok: true });
  }

  if (parsed.data.key === "campaign_budget") {
    const currency = parsed.data.currency?.trim() || "CAD";
    d.prepare("INSERT OR REPLACE INTO managed_content (key, value_json, updated_at) VALUES (?, ?, ?)").run(
      "campaign_budget",
      JSON.stringify({ amount: parsed.data.amount, currency }),
      now,
    );
    return NextResponse.json({ ok: true });
  }

  const cleaned = parsed.data.items.map((x) => x.trim()).filter(Boolean);
  d.prepare("INSERT OR REPLACE INTO managed_content (key, value_json, updated_at) VALUES (?, ?, ?)").run(
    parsed.data.key,
    JSON.stringify(cleaned),
    now,
  );

  return NextResponse.json({ ok: true });
}
