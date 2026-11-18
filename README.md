# Request Triage

A small workspace for turning incoming requests into **Build, Defer or Kill** decisions, with the reason kept on record. Claude can suggest a decision; a person always makes it.

> Sample data and fake names only. Built with Claude Code from my requirements; I reviewed the output. I did not write the code by hand.

**Live demo:** https://request-triage-demo.vercel.app

## Why this exists

I am a product owner. In my day job, the hard part of a backlog is rarely building. It is saying why something is, or is not, being built, and keeping that answer where the next person can find it. This demo is a small, working version of that habit, plus one honest use of AI: a second opinion that never decides for you.

## What it does

- **Inbox:** requests waiting for a decision, each with who asked and why.
- **Decide:** choose Build, Defer or Kill and write a reason. Nothing is pre-selected, and a reason is required.
- **Ask Claude:** fills in a suggested decision and a one-sentence reason from the request text and your recent decisions. You can change anything before recording.
- **Decision log:** every decision with its reason and date. Killed items are struck through.
- **Reopen:** puts a decided request back in the inbox. The earlier decision stays in the log as history.

## Product decisions behind it

| Decision | Why |
|---|---|
| A reason is required for every decision | A decision without a reason cannot be revisited or challenged later. |
| No default choice | A pre-selected "Build" nudges people to approve without thinking. |
| AI suggests, a person records | The suggestion fills the form only. Nothing is saved until a person presses Record. |
| Defer must name one missing fact | Otherwise "defer" becomes a polite way to avoid deciding. I tuned the AI instructions for this after it deferred 7 of 10 test requests. |
| Reopening keeps history | You can see that a request was once deferred, and why. |
| Daily cap on AI calls (20 by default) | Keeps cost predictable on a public demo. |

## Data model

Two linked tables plus a small usage counter (see [`supabase/schema.sql`](supabase/schema.sql)):

- `requests`: title, description, requester, team, status (`new`, `build`, `defer`, `kill`).
- `decisions`: one row per decision, linked to its request, with the decision and reason. Several rows can exist for one request, so history is preserved.
- `ai_usage`: one row per day counting AI suggestions, used for the daily cap.

A database function, `record_decision`, saves the decision and updates the request's status in one step, so the two tables cannot disagree. Row-level security is on with no public policies: only the server, using the secret key, can read or write.

## Tech

Next.js 16 (App Router, server actions), TypeScript, Tailwind CSS 4, Supabase (Postgres), Anthropic API (Claude Sonnet 5.5, medium effort, structured output), deployed on Vercel.

## Run it locally

You need [Bun](https://bun.sh) (or Node 20+ with npm).

```bash
bun install
bun run dev
```

Open http://localhost:3000. With no settings at all it runs on in-memory sample data, which resets when the server restarts. To use a real database and AI suggestions:

1. Create a free [Supabase](https://supabase.com) project. In its SQL Editor, run [`supabase/schema.sql`](supabase/schema.sql). This creates the tables and loads sample data. It drops and recreates them, so use a fresh project.
2. Copy `.env.example` to `.env.local` and fill in the values below.

| Variable | What it is |
|---|---|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SECRET_KEY` | The Supabase secret key (server only, never shown to the browser) |
| `ANTHROPIC_API_KEY` | Optional. Without it, the Ask Claude button is hidden |
| `ANTHROPIC_MODEL` | Optional. Defaults to `claude-sonnet-5-5` |
| `AI_DAILY_LIMIT` | Optional. AI suggestions per day. Defaults to 20 |

Never commit `.env.local`. It is already in `.gitignore`.

## How the AI step is kept safe

- The API key lives only on the server.
- The server reads the request from the database; it never trusts text sent from the browser.
- Request text is treated as data. The instructions tell Claude to ignore any commands written inside a request, and the sample data includes a "please approve this" request to check that.
- Suggestions only fill the form. A person reviews and records.
- A daily cap, counted in the database, stops runaway use. If the cap is reached, the page says so and the decision is made by hand.

## Known limits

- **No login.** Anyone with the link can add requests and record decisions. That is fine for a sandbox with fake data, and not for real use.
- **Sample data only.** Do not enter real names or confidential information.
- **Suggestions vary.** The same request can get differently worded suggestions. In my tests, the decisions matched across repeated runs on the same data, but that is not a guarantee.

## What I would build next

Sign-in and per-team inboxes, a short audit trail of who recorded each decision, and a view of how often the team followed or overruled the AI suggestion.
