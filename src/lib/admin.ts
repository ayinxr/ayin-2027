import { NextRequest } from "next/server";

export function requireAdmin(req: NextRequest) {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) return { ok: false, status: 500 as const, message: "ADMIN_TOKEN not set" };

  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice("Bearer ".length) : "";

  if (!token || token !== expected) {
    return { ok: false, status: 401 as const, message: "Unauthorized" };
  }
  return { ok: true as const };
}

