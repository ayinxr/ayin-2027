import { NextRequest, NextResponse } from "next/server";
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
      SELECT id, email, subject, message, status, created_at
      FROM requests
      ORDER BY created_at DESC
      LIMIT 300;
    `,
    )
    .all();

  return NextResponse.json({ requests: rows });
}

