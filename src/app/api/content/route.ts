import { NextResponse } from "next/server";
import { readCampaignBudget, readIntramuralText, readList } from "@/lib/siteContent";

export const runtime = "nodejs";

export async function GET() {
  const goals = readList("campaign_goals", []);
  const events = readList("community_events", []);
  const plans = readList("upcoming_plans", []);
  const intramuralInfo = readIntramuralText();
  const budget = readCampaignBudget();
  return NextResponse.json({ goals, events, plans, intramuralInfo, budget });
}
