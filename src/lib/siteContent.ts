import { db } from "@/lib/db";

const INTRAMURAL_FALLBACK =
  "intramurals happen once every 2 months everytime with a different sport e.g. Football, Basketball, Volleyball and Tennis. Students are able to cast a vote for which intramural they are looking for every two months.";

export function readList(key: string, fallback: string[]) {
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

export function readIntramuralText() {
  const d = db();
  const row = d
    .prepare("SELECT value_json FROM managed_content WHERE key = 'intramural_info'")
    .get() as { value_json: string } | undefined;
  if (!row) return INTRAMURAL_FALLBACK;
  try {
    const o = JSON.parse(row.value_json) as { text?: string };
    if (o && typeof o.text === "string" && o.text.trim()) return o.text.trim();
  } catch {
    /* ignore */
  }
  return INTRAMURAL_FALLBACK;
}

export function readCampaignBudget() {
  const d = db();
  const row = d
    .prepare("SELECT value_json FROM managed_content WHERE key = 'campaign_budget'")
    .get() as { value_json: string } | undefined;
  if (!row) return { amount: 400, currency: "CAD" };
  try {
    const o = JSON.parse(row.value_json) as { amount?: number; currency?: string };
    const amount = typeof o.amount === "number" && Number.isFinite(o.amount) ? o.amount : 400;
    const currency = typeof o.currency === "string" && o.currency.trim() ? o.currency.trim() : "CAD";
    return { amount, currency };
  } catch {
    return { amount: 400, currency: "CAD" };
  }
}

export function addToCampaignBudget(delta: number) {
  const cur = readCampaignBudget();
  const next = Math.max(0, cur.amount + delta);
  const d = db();
  d.prepare("INSERT OR REPLACE INTO managed_content (key, value_json, updated_at) VALUES (?, ?, ?)").run(
    "campaign_budget",
    JSON.stringify({ amount: next, currency: cur.currency }),
    Date.now(),
  );
}
