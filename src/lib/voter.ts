import { cookies } from "next/headers";
import crypto from "node:crypto";

export const VOTER_COOKIE = "svh_vid";

export async function readOrCreateVoterId() {
  const jar = await cookies();
  const existing = jar.get(VOTER_COOKIE)?.value;
  if (existing) return { voterId: existing, isNew: false };

  const voterId = crypto.randomUUID();
  return { voterId, isNew: true };
}

