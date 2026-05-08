import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

function readList(key: string, fallback: string[]) {
  const d = db();
  const row = d
    .prepare("SELECT value_json FROM managed_content WHERE key = ?")
    .get(key) as { value_json: string } | undefined;
  if (!row) return fallback;
  try {
    const parsed = JSON.parse(row.value_json) as unknown;
    if (Array.isArray(parsed) && parsed.every((x) => typeof x === "string")) {
      return parsed;
    }
    return fallback;
  } catch {
    return fallback;
  }
}

export async function GET() {
  const goals = readList("campaign_goals", []);
  const events = readList("community_events", []);
  const plans = readList("upcoming_plans", []);
  return NextResponse.json({ goals, events, plans });
}

