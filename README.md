# Ayin — Student Council President 2027 (Sentinel)

Premium, cinematic, interactive campaign website built with Next.js + Tailwind + Framer Motion.

## Run locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Student Voice systems (Ideas / Polls / Reviews / Requests)

- **Ideas**: `/api/ideas` (approved ideas are public; new submissions are **pending**)
- **Polls**: `/api/polls` (auto-seeded with a realistic starter poll)
- **Reviews**: `/api/reviews` (public feed is **approved** only; new posts are **pending**)
- **Requests**: `/api/requests` (stored + optionally emailed to campaign inbox)

### Moderation (admin)

Admin endpoints require:

- `ADMIN_TOKEN` in environment
- `Authorization: Bearer <ADMIN_TOKEN>` header

Endpoints:

- `GET /api/admin/ideas` + `POST /api/admin/ideas`
- `GET /api/admin/reviews` + `POST /api/admin/reviews`

## Email (requests → inbox)

Requests will **always** be saved to the moderation queue.
To also send an email, configure SMTP in `.env.local`:

See `.env.example`.

## Deployment

This site is deployable anywhere that supports **Node.js + persistent disk** (SQLite).
Examples: Render (persistent disk), Fly.io (volume), Railway (volume).

# ayin-2027
