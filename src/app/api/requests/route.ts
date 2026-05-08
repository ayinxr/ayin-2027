import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { z } from "zod";
import nodemailer from "nodemailer";
import { db } from "@/lib/db";

export const runtime = "nodejs";

const Schema = z.object({
  email: z.string().email().max(120),
  subject: z.string().min(3).max(120),
  message: z.string().min(10).max(1200),
});

function mailTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) return null;
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const id = crypto.randomUUID();
  const now = Date.now();
  const d = db();

  d.prepare(
    `INSERT INTO requests (id, email, subject, message, status, created_at)
     VALUES (?, ?, ?, ?, 'pending', ?)`,
  ).run(
    id,
    parsed.data.email.trim().toLowerCase(),
    parsed.data.subject.trim(),
    parsed.data.message.trim(),
    now,
  );

  const transporter = mailTransport();
  const to = process.env.TO_EMAIL || "ayinmohamamdi18@gmail.com";
  const from = process.env.FROM_EMAIL || "Ayin Campaign <no-reply@ayin-campaign.local>";

  // If SMTP isn't configured, we still accept + store the request (moderation queue).
  if (transporter) {
    await transporter.sendMail({
      to,
      from,
      replyTo: parsed.data.email,
      subject: `[Sentinel Voice] ${parsed.data.subject}`,
      text: `New student request\n\nFrom: ${parsed.data.email}\n\n${parsed.data.message}\n\nRequest ID: ${id}`,
    });
  }

  return NextResponse.json({ ok: true, id, emailed: Boolean(transporter) });
}

