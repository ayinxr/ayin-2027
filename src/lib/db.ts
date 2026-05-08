import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

let _db: Database.Database | null = null;

function ensureDbFile() {
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  return path.join(dataDir, "campaign.db");
}

export function db() {
  if (_db) return _db;
  const file = ensureDbFile();
  const database = new Database(file);
  database.pragma("journal_mode = WAL");

  database.exec(`
    CREATE TABLE IF NOT EXISTS ideas (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      details TEXT NOT NULL,
      category TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS idea_votes (
      idea_id TEXT NOT NULL,
      voter_id TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      PRIMARY KEY (idea_id, voter_id)
    );

    CREATE TABLE IF NOT EXISTS polls (
      id TEXT PRIMARY KEY,
      question TEXT NOT NULL,
      options_json TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS poll_votes (
      poll_id TEXT NOT NULL,
      option_idx INTEGER NOT NULL,
      voter_id TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      PRIMARY KEY (poll_id, voter_id)
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      display_name TEXT NOT NULL,
      content TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS review_reactions (
      review_id TEXT NOT NULL,
      voter_id TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      PRIMARY KEY (review_id, voter_id)
    );

    CREATE TABLE IF NOT EXISTS requests (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS managed_content (
      key TEXT PRIMARY KEY,
      value_json TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);

  const defaults: Record<string, string[]> = {
    campaign_goals: [
      "Better school events (student-selected themes + better planning)",
      "More student polls — short, frequent, and meaningful",
      "Stronger student involvement (committees + open sign-ups)",
      "Clear communication between students and council",
      "Improved spirit days with student voting",
      "More tournaments + school-wide challenges",
      "Recognition of achievements (clubs, sports, arts, academics)",
      "Fun lunchtime activities that rotate weekly",
      "Monthly idea voting + transparent council decisions",
    ],
    community_events: [
      "Basketball tournaments",
      "Football tournaments",
      "Tennis competitions",
      "Dodgeball tournaments",
      "School-wide challenges",
      "Spirit rallies",
      "Lunchtime events",
      "Student-selected activities",
      "Recognition weeks",
    ],
    upcoming_plans: [
      "Open student voting for next month’s spirit day",
      "Publish monthly council transparency update",
      "Launch lunchtime dodgeball + basketball schedule",
    ],
  };

  for (const [key, items] of Object.entries(defaults)) {
    const exists = database
      .prepare("SELECT 1 FROM managed_content WHERE key = ?")
      .get(key) as { 1: number } | undefined;
    if (!exists) {
      database
        .prepare("INSERT INTO managed_content (key, value_json, updated_at) VALUES (?, ?, ?)")
        .run(key, JSON.stringify(items), Date.now());
    }
  }

  const pollCount = database.prepare("SELECT COUNT(*) as c FROM polls").get() as { c: number };
  if (pollCount.c === 0) {
    const defaultPollId = crypto.randomUUID();
    const defaultOptions = [
      "Next spirit day theme",
      "Lunchtime tournament schedule",
      "School-wide challenge idea",
      "Event theme (rally / activity)",
    ];
    database
      .prepare(
        `INSERT INTO polls (id, question, options_json, status, created_at)
         VALUES (?, ?, ?, 'active', ?)`,
      )
      .run(defaultPollId, "What should we vote on first this month?", JSON.stringify(defaultOptions), Date.now());
  }

  _db = database;
  return database;
}

