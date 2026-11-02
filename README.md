# Aerolex Advisors — Website + Admin Panel

Full-stack build of the **Aerolex** Figma design.

| Layer    | Tech                                   |
|----------|----------------------------------------|
| Frontend | React 18 + Vite, React Router, Lucide icons, self-hosted Fraunces + Manrope fonts |
| Backend  | Node.js + Express (REST API, JWT auth, Multer uploads) |
| Database | MySQL (tables created and seeded automatically on first start) |

Colours: `#282C30` (dark), `#DF273C` (red), `#F4F5F7` (light grey). Headings: Fraunces, text: Manrope.

---

## What's included

### Public website (single page, top to bottom as in Figma)
1. **Top status bar** — live ops items + frequency + "Operations Desk Login" (opens the admin panel)
2. **Sticky header** — logo, menu (smooth-scrolls to each section, active link highlight), "Book a Consultation", mobile menu
3. **Hero** — background image, heading, buttons, "Operations Desk 24/7" floating card, 4-item dark highlight strip
4. **About Aerolex** — image, text, 4 feature boxes, button
5. **Our Services** — 12 numbered cards with icon, tags and **category filter tabs**; "Enquire Service" scrolls to the contact form and pre-selects that service
6. **VIP & Business Aviation** — feature list + jet image
7. **Our Process** — 4 arrow-shaped step cards over the sky background
8. **Aviation Insights** — 3 article cards → **"Read Article" opens an article detail page** (`/insights/:slug`) with breadcrumb, meta, content, share buttons, related articles
9. **Get Started CTA** banner
10. **Contact** — enquiry form (validation, service dropdown from DB, spam honeypot, rate limit) → saved in MySQL
11. **Footer** — about, quick links, services, contact, copyright

Fully responsive (desktop → tablet → mobile), keyboard accessible, 404 page.

### Admin Panel (`/admin`, every section manageable — add / view / edit / update / delete)
| Website part | Admin module |
|---|---|
| Top bar | Top Bar Items + Site Settings (frequency, login link) |
| Header & footer menu | Navigation Links |
| Hero | Page Sections → Hero + Hero Highlights |
| About | Page Sections → About + About Features |
| Services | Page Sections → Services + Services + Service Categories |
| VIP Aviation | Page Sections → VIP + VIP Features |
| Our Process | Page Sections → Process + Process Steps |
| Insights | Page Sections → Insights + Insights (full article editor) |
| CTA | Page Sections → CTA |
| Contact | Page Sections → Contact + **Enquiries** (status, notes, search, filter, CSV export) |
| Footer / brand / SEO | Site Settings |
| Images | Media Library (uploads are stored in MySQL, so they survive redeploys) |
| Users | Admin Users + My Account (change password) |

Also: dashboard with stats, show/hide any section, reorder items (↑ ↓), visible toggle per item, icon picker, image upload on every image field.

**Default admin login:** `admin` / `Admin@123` (change it under *My Account* after first login, or set `ADMIN_PASSWORD` before first start).

---

## Run locally

Requirements: Node 18+, MySQL 8 (or MariaDB 10.6+).

```bash
# 1. create an empty database
mysql -u root -p -e "CREATE DATABASE aerolex CHARACTER SET utf8mb4;"

# 2. configure the API
cp server/.env.example server/.env      # then edit DB_USER / DB_PASSWORD

# 3. install
npm run install:all

# 4. start API (creates tables + seed data automatically)
npm run dev:server                      # http://localhost:5000

# 5. start the React app in another terminal
npm run dev:client                      # http://localhost:5173  (admin: /admin)
```

Production-style run on one port:

```bash
npm run build && npm start              # http://localhost:5000
```

`npm run db:reset` drops all tables and restores the original Figma content.
A full SQL dump (schema + seed data) is also in `database/aerolex.sql` if you prefer to import it manually.

---

## Deploy (free): Aiven MySQL + Render

### 1. MySQL on Aiven (no credit card)
1. Sign up at aiven.io → **Create service → MySQL → Free plan**.
2. When it is running, copy the **Service URI** (looks like `mysql://avnadmin:PASSWORD@HOST:PORT/defaultdb?ssl-mode=REQUIRED`).

### 2. Push the code to GitHub
```bash
git init && git add . && git commit -m "Aerolex website"
git branch -M main
git remote add origin https://github.com/<you>/aerolex.git
git push -u origin main
```

### 3. Web service on Render
1. render.com → **New → Web Service** → pick the repo.
2. Settings:
   - Build command: `npm run build`
   - Start command: `npm start`
   - Instance type: Free
3. Environment variables:
   - `DATABASE_URL` = the Aiven Service URI
   - `DB_SSL` = `true`
   - `JWT_SECRET` = any long random text
   - `ADMIN_PASSWORD` = the password you want for `admin`
   - `NODE_VERSION` = `20`
4. Deploy. On first start the API creates all tables and loads the design content.
   Check `https://<your-app>.onrender.com/api/health` → `{"ok":true,"db":"connected"}`.

(Alternatively, the included `render.yaml` sets this up as a Blueprint.)

> Render's free plan sleeps after 15 minutes without traffic; the first visit after that takes about a minute. Open the site once before sharing or demoing it.

### Alternative: frontend on Vercel
Deploy `client/` to Vercel with env `VITE_API_URL=https://<your-api>.onrender.com`, add a rewrite of all paths to `/index.html`, and set `CORS_ORIGIN=https://<your-vercel-app>.vercel.app` on the API.

---

## API overview

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/public/home` | – | Everything the home page needs |
| GET | `/api/public/insights/:slug` | – | Article + related articles |
| POST | `/api/public/enquiries` | – | Contact form |
| POST | `/api/auth/login` | – | Admin login (JWT) |
| GET/PUT | `/api/admin/settings` | ✓ | Site settings |
| GET/PUT | `/api/admin/sections/:key` | ✓ | Page section content |
| GET/POST/PUT/DELETE | `/api/admin/:module[/:id]` | ✓ | topbar-items, nav-links, hero-highlights, about-features, service-categories, services, vip-features, process-steps, insights, enquiries |
| POST/GET/DELETE | `/api/admin/media` | ✓ | Image uploads |
| GET/POST/PUT/DELETE | `/api/admin/admins` | ✓ | Admin users |
| GET | `/api/admin/stats` | ✓ | Dashboard numbers |

## Project structure
```
aerolex/
├── client/                 React + Vite
│   ├── public/images/      design images (from Figma)
│   └── src/
│       ├── site/           public website (sections, article page, layout)
│       ├── admin/          admin panel (dashboard, modules, sections, enquiries…)
│       └── styles/         site.css, admin.css
├── server/                 Express API
│   └── src/
│       ├── schema.js       MySQL tables
│       ├── seed.js         default content from the design
│       ├── resources.js    module definitions + validation
│       └── routes/         auth, public, admin
├── database/aerolex.sql    SQL dump (schema + seed)
├── render.yaml
└── package.json            build/start scripts for one-service deploy
```
