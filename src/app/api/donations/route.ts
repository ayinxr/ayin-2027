import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { z } from "zod";
import { db } from "@/lib/db";

export const runtime = "nodejs";

const Schema = z.object({
  displayName: z.string().min(2).max(60),
  amount: z.number().min(1).max(5000),
  note: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const id = crypto.randomUUID();
  const d = db();
  d.prepare(
    `INSERT INTO donations (id, display_name, amount, note, status, created_at)
     VALUES (?, ?, ?, ?, 'pending', ?)`,
  ).run(
    id,
    parsed.data.displayName.trim(),
    parsed.data.amount,
    (parsed.data.note || "").trim(),
    Date.now(),
  );

  return NextResponse.json({
    ok: true,
    id,
    message:
      "Thanks — your pledge is pending review. Once council confirms the contribution, the public budget will update.",
  });
}
