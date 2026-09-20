# Branded Short-Link & Bio-Link Hub (Project 04)

> A high-performance URL shortening engine with custom vanity slugs and real-time click telemetry analytics, alongside a customizable "Link-in-Bio" creator hub manager. Built strictly according to the Project 04 MERN Stack Evaluation Specification.

---

## 1. Project Name & Concept
* **Project**: Branded Short-Link & Bio-Link Hub (Bitly + Linktree Hybrid)
* **Design Standard**: Coss UI component primitives (Cal.com design system standards) + Tailwind CSS + Lucide Icons + Recharts
* **Stack**: MongoDB, Express.js, React 18, Node.js (TypeScript end-to-end)

---

## 2. Problem Statement
Modern creators and engineering teams need two distinct link tools:
1. **High-Speed URL Shortener**: A redirection engine that produces branded vanity links, avoids cache-bypassing issues, and records telemetry (device type, referrer, privacy-compliant IP hash) without slowing down visitor redirects.
2. **Creator Bio-Link Hub**: A single-link-in-bio destination that showcases active short links, social handles, and five customizable themes (`Minimal Light`, `Dark Slate`, `Gradient`, `Midnight Aurora`, `Paper Studio`).

This project solves both problems within a single unified platform with strict ownership security, refresh token rotation, and robust rate limiting.

---

## 3. Key Features

### Authentication & Security
* **Pair-Token Architecture**: Short-lived JWT Access Token (15m) + Long-lived Refresh Token (7d) stored strictly in `httpOnly`, `SameSite=Lax`, secure cookies.
* **Token Family Rotation**: Every call to `/api/v1/auth/refresh` issues a fresh pair and rotates the stored token hash. If an old token is reused, the entire token family is immediately invalidated to neutralize token theft attacks.
* **Email Verification Simulation**: Signup generates a verification token; developers can simulate verification with one click from the UI banner or API.
* **Password Recovery**: Secure forgot password flow returning time-limited simulation tokens with one-click reset links.
* **Strict Ownership Isolation**: All link, bio, and analytics operations are securely scoped to `req.user._id` from server-side JWT verification.

### High-Speed URL Redirection Engine
* **6-Character Short Codes**: Base62 crypto-random generator (`62^6 = 56.8B` combinations).
* **Vanity Slugs**: Alphanumeric custom slugs with reserved-word filtering (`admin`, `api`, `r`, etc.).
* **Duplicate Collision Detection**: MongoDB unique indexes combined with graceful `409 Conflict` error reporting.
* **Non-blocking 302 Found Redirects**: Emits `302 Found` with `Cache-Control: no-store` headers so CDNs/browsers never bypass click tracking. Redirection latency is `<15ms`.
* **Asynchronous Telemetry Logging**: Redirection responses are returned immediately while click logging (`linkId`, `timestamp`, `deviceType`, `referrer`, `ipHash`) executes asynchronously in a background microtask.
* **Privacy-Safe IP Hashing**: Salted HMAC SHA-256 IP hashing for GDPR/CCPA compliance; raw IPs are never persisted.

### Link Library Studio
* **Management Table**: Displays short code, target destination, click counts, creation timestamps, and action buttons.
* **One-Click Copy**: Instant clipboard copy with visual feedback badge.
* **QR Code Generation**: Client-side QR generator with PNG export and scan preview.
* **Search & Server-Side Pagination**: Full-text and regex search over links with page boundary controls.
* **Cascading Delete**: Removing a link cleans up associated telemetry events and bio showcase links.

### Link-in-Bio Studio & Public Page
* **Interactive Visual Builder**: Split-screen editor on the left with a live mobile phone device mockup on the right.
* **Themes**:
  * `Minimal Light`: Crisp white canvas, subtle borders, high contrast.
  * `Dark Slate`: Obsidian and zinc background with card borders.
  * `Gradient`: Subtle tech-forward indigo mesh gradient.
  * `Midnight Aurora`: Deep `#05070A` midnight background with slow 25-second atmospheric aurora lighting (muted teal + violet radial gradients), `#F5F7FA` text, glass-surface link buttons. Animation respects `prefers-reduced-motion`.
  * `Paper Studio`: Warm `#F5F1E8` editorial paper background, `#1E1D1A` text, `#FFFDF8` card surfaces with terracotta-warm borders. Fully static, elegant.
* **Social Profiles**: Platform selector (GitHub, X/Twitter, LinkedIn, YouTube, Instagram, Website) with direct URLs.
* **Public Route (`/bio/:username`)**: High-performance, unauthenticated, mobile-first responsive profile page.

---

## 4. Technology Stack

| Area | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Coss UI Primitives, Lucide Icons, Recharts, QRCode |
| **Backend** | Node.js, Express.js, TypeScript, Mongoose, Zod, Helmet, Cors, CookieParser, Express-Rate-Limit |
| **Database** | MongoDB v7.0 (Apple Silicon native) with compound indexing |
| **Auth** | JSON Web Tokens (JWT), bcryptjs, httpOnly cookies, Token Family Rotation |
| **Testing** | Jest, Supertest, ts-jest |

---

## 5. Architecture & Request Flow

```
[ Visitor / Client Browser ]
             │
             ├── 1. GET /r/:shortCode  ────────────────────────┐
             │                                                │
             └── 2. REST API / Frontend (/dashboard, /bio)    │
                             │                                │
                             ▼                                ▼
       [ Express App Server (Security & Rate Limiters) ]      │
      ┌─────────────────────────────────────────────────┐     │
      │ • Helmet & CORS (withCredentials: true)         │     │
      │ • Rate Limiters (Auth, Create, Redirect, API)   │     │
      │ • Cookie Parser (JWT Access + Refresh)          │     │
      │ • requireAuth Middleware (req.user._id)         │     │
      └──────────────────────┬──────────────────────────┘     │
                             │                                │
       ┌─────────────────────┴──────────────────────┐         │
       ▼                                            ▼         ▼
[/api/v1 REST Services]                      [Redirect Engine (/r/:code)]
├── AuthService (Tokens, Rotation)           ├── 1. Indexed lookup
├── LinkService (CRUD, Pagination, Slugs)    ├── 2. Return 302 Location Header
├── AnalyticsService (Mongo Aggregations)    └── 3. Async Telemetry Dispatch
└── BioService (Profile, Themes)                            │
       │                                                    │
       └─────────────────────┬──────────────────────────────┘
                             ▼
                 [ MongoDB v7.0 Database ]
                 ├── users (indexes: email)
                 ├── links (indexes: shortCode, {userId, createdAt})
                 ├── clickevents (indexes: {linkId, timestamp})
                 └── bioprofiles (indexes: userId, username)
```

---

## 6. Database Schema & Indexing

1. **`User` Collection (`models/User.ts`)**
   * `email`: String (unique, indexed, lowercase)
   * `passwordHash`: String (bcrypt, salt rounds 10)
   * `name`: String
   * `isEmailVerified`: Boolean (default `false`)
   * `emailVerificationToken`: String (private)
   * `refreshTokenHashes`: Array of String (family rotation hashes)

2. **`Link` Collection (`models/Link.ts`)**
   * `userId`: ObjectId -> User (indexed)
   * `title`: String
   * `originalUrl`: String
   * `shortCode`: String (unique index)
   * `isCustomSlug`: Boolean
   * `clickCount`: Number (default 0)
   * `status`: 'active' | 'archived'
   * **Compound Index**: `{ userId: 1, createdAt: -1 }` (optimizes paginated library listing)

3. **`ClickEvent` Collection (`models/ClickEvent.ts`)**
   * `linkId`: ObjectId -> Link (indexed)
   * `timestamp`: Date (default `Date.now`, indexed)
   * `referrer`: String
   * `deviceType`: 'Desktop' | 'Mobile' | 'Tablet' | 'Unknown'
   * `ipHash`: String (HMAC SHA-256 with server salt)
   * **Compound Index**: `{ linkId: 1, timestamp: -1 }` (optimizes time-series analytics)

4. **`BioProfile` Collection (`models/BioProfile.ts`)**
   * `userId`: ObjectId -> User (unique index)
   * `username`: String (unique index, lowercase)
   * `displayName`: String
   * `avatarUrl`: String
   * `bio`: String (max 500 chars)
   * `theme`: `'minimal-light'` | `'dark-slate'` | `'gradient'` | `'midnight-aurora'` | `'paper-studio'`
   * `socialLinks`: Array of `{ platform, url, title, isEnabled }`
   * `showcaseLinkIds`: Array of ObjectId -> Link

---

## 7. Installation & Setup

### Prerequisites
* **Node.js**: v18+ (tested on Node v26.7.0)
* **npm**: v9+ (tested on npm 11.19.0)
* **MongoDB**: v6+ or v7+ running locally on `mongodb://127.0.0.1:27017`

### Clone & Install
```bash
git clone <repo-url>
cd Branded_link_hub

# Install all dependencies (root, server, client)
npm run install:all
```

---

## 8. Environment Variables

### Server (`server/.env`)
Create `server/.env` (or copy from `server/.env.example`):
```env
PORT=5001
MONGODB_URI=mongodb://127.0.0.1:27017/branded_link_hub
JWT_ACCESS_SECRET=dev_jwt_access_secret_super_secure_key_12345
JWT_REFRESH_SECRET=dev_jwt_refresh_secret_super_secure_key_67890
IP_HASH_SALT=dev_ip_hash_salt_pepper_99999
CLIENT_URL=http://localhost:5173
BASE_URL=http://localhost:5001
NODE_ENV=development
```

---

## 9. Running Locally

### Development Mode (Concurrent Vite + Express)
```bash
# Terminal 1: Backend API (port 5001)
npm run dev:server

# Terminal 2: Frontend Client (port 5173 with Vite proxy)
npm run dev:client
```
Visit `http://localhost:5173`.

### Production Mode (Single Port Unified Server)
```bash
# Build frontend and compile backend
npm run build

# Start production server (serves frontend + API on port 5001)
npm start
```
Visit `http://localhost:5001`.

---

## 10. Demo Seed Data

To populate realistic demo data for presentation and interview evaluation:
```bash
npm run seed
```
**Seed Output**:
* **Demo Account**: `demo@brandedhub.dev`
* **Demo Password**: `DemoPassword123!`
* **Pre-populated Links**: 5 realistic developer tool links
* **Telemetry**: 180+ click events distributed across the past 14 days
* **Public Bio URL**: `http://localhost:5001/bio/sarahchen`

---

## 11. Automated Test Suite

Run the full automated Jest test suite covering authentication, token rotation, link management, collision detection, 302 redirects, telemetry logging, and MongoDB aggregations:
```bash
npm test
```
**Test Results**: 29 tests across 5 suites, 100% passing.

---

## 12. REST API Overview

### Authentication (`/api/v1/auth`)
* `POST /signup` — Register, sets httpOnly cookie pair, returns simulated verification token.
* `GET /verify-email/:token` — Activates account email status.
* `POST /login` — Validates credentials, sets `access_token` and `refresh_token` cookies.
* `POST /refresh` — Rotates refresh token, invalidates old token, sets fresh pair.
* `POST /logout` — Revokes refresh token session and clears cookies.
* `POST /forgot-password` — Generates simulated password recovery token.
* `POST /reset-password` — Validates token and replaces password hash.
* `GET /me` — Current authenticated user session details.

### Links (`/api/v1/links`)
* `GET /?page=1&limit=10&search=...` — Paginated link library scoped to user.
* `POST /` — Creates short link with 6-char generator or custom vanity slug (409 on collision).
* `GET /:id` — Single link metadata.
* `DELETE /:id` — Cascading delete for owned link.

### Redirection Engine (`/r/:shortCode`)
* `GET /r/:shortCode` — Returns `302 Found` with `Location: <originalUrl>`. Asynchronously records click telemetry.

### Analytics (`/api/v1/analytics`)
* `GET /overview?days=30` — Aggregated metrics: total links, lifetime clicks, time series, devices, top referrers.
* `GET /link/:id?days=30` — Single-link drilldown analytics with recent telemetry log.

### Bio Hub (`/api/v1/bio`)
* `GET /me` — Fetch authenticated user's bio profile.
* `PUT /me` — Update display name, avatar, bio text, theme, social links, and featured links.
* `GET /public/:username` — Public unauthenticated bio resolver.

---

## 13. Security Considerations & Interview Defense

| Topic | Question | Architectural Defense |
| :--- | :--- | :--- |
| **Cookies vs LocalStorage** | Why use `httpOnly` cookies? | `localStorage` is vulnerable to Cross-Site Scripting (XSS). Any injected script can read JWTs. `httpOnly` cookies are inaccessible to JavaScript, eliminating token theft via XSS. |
| **Token Rotation** | Why rotate refresh tokens? | If a refresh token is stolen, rotation ensures that the first time either the legitimate user or attacker uses it, the server detects token reuse, immediately revoking all active sessions. |
| **302 vs 301** | Why use `302 Found` instead of `301 Moved Permanently`? | `301` responses are permanently cached by browsers and CDNs. Repeat clicks would never hit our server, completely breaking click telemetry. `302 Found` with `Cache-Control: no-store` forces every click to be logged. |
| **Asynchronous Logging** | Why log telemetry asynchronously? | Redirection speed is paramount (<15ms). A visitor should never wait for database write locks. The server sends the 302 response immediately and executes telemetry logging in a background promise. |
| **IP Privacy** | Why use SHA-256 IP hashing? | Storing raw IP addresses violates privacy regulations (GDPR/CCPA). HMAC SHA-256 with a secret server salt allows unique visitor metrics without ever persisting PII. |
| **Ownership Isolation** | How is multitenant security enforced? | The backend never trusts client-provided user IDs. Every database query enforces `{ userId: req.user._id }` from verified server-side JWT session cookies. |

---

## 14. Assumptions & Design Decisions
* **Base62 Alphanumeric Short Codes**: 6 characters using `[0-9a-zA-Z]` provides `56.8 billion` unique permutations, avoiding collisions while keeping URLs concise.
* **Email Verification Simulation**: To avoid requiring a paid SendGrid/AWS SES account during local assessment testing, verification tokens are returned in development responses and can be simulated with one click in the UI banner.
* **Coss UI Design Standard**: Built strictly with accessible primitives (Radix UI / Base UI foundation) styled with Tailwind CSS, avoiding AI dashboard clichés (no neon glows, no random floating blobs, no decorative noise).

---

## 15. Future Improvements
* Custom domain CNAME mapping (e.g. `link.mybrand.com/slug`).
* Geo-IP country and city analytics via MaxMind GeoLite2.
* Password-protected and expiring short links.
* Scheduled link redirects (time-based campaigns).
