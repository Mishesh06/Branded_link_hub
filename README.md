# branded-link-hub

A URL shortener + link-in-bio tool I built to learn how production-grade auth and analytics pipelines actually work under the hood. Think Bitly meets Linktree, but you own everything.

> **Live stack**: MongoDB · Express · React 18 · Node.js — TypeScript throughout.

---

## What it does

**Short links** — paste a URL, get a `/r/xyz123` shortcode back. You can set a custom vanity slug too (`/r/my-portfolio`). Every redirect is a `302` (not `301`) so click telemetry actually fires instead of getting cached by the browser.

**Bio hub** — one link-in-bio page at `/bio/:username` that shows your avatar, bio, social icons, and a curated set of your short links. Five visual themes to pick from.

**Analytics** — clicks over time, device breakdown, top referrers. Wired up with Mongo aggregation pipelines instead of a third-party service.

---

## Themes

The bio page supports five themes right now:

- `minimal-light` — clean white, high contrast
- `dark-slate` — deep zinc/obsidian
- `gradient` — indigo mesh gradient
- `midnight-aurora` — deep midnight with a slow atmospheric aurora effect
- `paper-studio` — warm editorial paper aesthetic

---

## Tech decisions worth noting

**Why `httpOnly` cookies instead of localStorage?**  
localStorage is readable by any JS on the page. One XSS and your JWT is gone. `httpOnly` cookies are invisible to scripts entirely.

**Why `302` not `301` for redirects?**  
`301` gets permanently cached. Browser sends the user straight to the destination on repeat visits — your analytics server never sees the click. `302` + `Cache-Control: no-store` forces every hit through the server.

**Why async telemetry?**  
The redirect response goes out immediately, then the click gets logged in the background. Visitor doesn't wait for a DB write. Latency stays under ~15ms.

**Token rotation:**  
Every refresh issues a new token pair. Old token gets invalidated. If someone tries to replay a stolen token, the server detects the reuse and wipes the whole session family.

---

## Stack

| Layer | What I used |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Lucide, Recharts |
| Backend | Express, TypeScript, Mongoose, Zod, Helmet |
| Auth | JWT (access + refresh), bcrypt, httpOnly cookies |
| DB | MongoDB 7 with compound indexes |
| Tests | Jest + Supertest |

---

## Running locally

You'll need Node 18+, npm, and MongoDB running on `localhost:27017`.

```bash
git clone https://github.com/Mishesh06/Branded_link_hub
cd Branded_link_hub
npm run install:all
```

Create `server/.env` (copy from `server/.env.example` and fill in your secrets):

```env
PORT=5001
MONGODB_URI=mongodb://127.0.0.1:27017/branded_link_hub
JWT_ACCESS_SECRET=change_this
JWT_REFRESH_SECRET=change_this_too
IP_HASH_SALT=and_this
CLIENT_URL=http://localhost:5173
BASE_URL=http://localhost:5001
NODE_ENV=development
```

Then:

```bash
# terminal 1 — API on :5001
npm run dev:server

# terminal 2 — Vite on :5173
npm run dev:client
```

Open `http://localhost:5173`.

---

## Seed data

Populates a demo account with links and ~180 click events spread across the last 2 weeks:

```bash
npm run seed
```

Demo login: `demo@brandedhub.dev` / `DemoPassword123!`  
Public bio: `http://localhost:5001/bio/sarahchen`

---

## Tests

```bash
npm test
```

Covers auth flow, token rotation, link CRUD, ownership checks, redirect engine, telemetry, analytics aggregations, and all five bio themes.

---

## API

```
POST   /api/v1/auth/signup
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password
GET    /api/v1/auth/me

GET    /api/v1/links
POST   /api/v1/links
GET    /api/v1/links/:id
DELETE /api/v1/links/:id

GET    /r/:shortCode          ← the actual redirect

GET    /api/v1/analytics/overview
GET    /api/v1/analytics/link/:id

GET    /api/v1/bio/me
PUT    /api/v1/bio/me
GET    /api/v1/bio/public/:username
```

---

## Stuff I want to add eventually

- Custom domain support (e.g. `links.yourbrand.com`)
- Geo analytics (country / city via MaxMind)
- Password-protected and expiry-based links
- More bio themes
