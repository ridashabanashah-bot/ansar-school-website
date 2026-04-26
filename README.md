# Ansar School Padhinjarangadi — Website

Modern, mobile-first website for **Ansar School Padhinjarangadi** (Kerala, India).

**Stack**

- `frontend/` — Next.js 14 (App Router) + TypeScript + Tailwind CSS
- `cms/` — Strapi 5 headless CMS (deployed to Strapi Cloud)
- Hosting — Vercel for the frontend, Strapi Cloud for the CMS
- Source control — GitHub

The frontend works **out of the box with placeholder content** if Strapi is unreachable, so you can deploy immediately and connect the CMS later without breaking the live site.

---

## 1. Local development quickstart

The CMS ships with a bootstrap script that takes a fresh clone all the way
to "Strapi built, admin user created, full-access API token generated, root
.env populated." It is **idempotent** — re-running `fresh-setup` is safe and
will not overwrite existing secrets, admin users, or tokens.

```bash
# 1. CMS — install, build, and bootstrap (one shot)
cd cms
npm run fresh-setup
# This runs: npm install && npm run build && npm run bootstrap
# When it finishes:
#   - cms/.env is generated with random secrets (skipped if it exists)
#   - cms/.tokens/seed-token.txt holds a full-access API token
#   - cms/.tokens/admin-creds.txt holds the admin email + password
#   - the repo-root .env contains STRAPI_URL + STRAPI_TOKEN

# 2. Start Strapi (terminal 1)
cd cms
npm run develop          # http://localhost:1337/admin
# Log in with the credentials from cms/.tokens/admin-creds.txt

# 3. Seed content from the legacy site (terminal 2, after Strapi is up)
cd ../..                 # back to repo root
npx tsx scrape/seed.ts --dry-run    # sanity check
npx tsx scrape/seed.ts              # real run
npx tsx scrape/seed.ts              # second run should be 0 created / 0 updated

# 4. Frontend (terminal 3)
cd frontend
npm install
cp .env.example .env.local
# Set NEXT_PUBLIC_STRAPI_URL=http://localhost:1337 in .env.local
npm run dev              # http://localhost:3000
```

Override the admin email/password by exporting `BOOTSTRAP_ADMIN_EMAIL` and
`BOOTSTRAP_ADMIN_PASSWORD` before running `npm run bootstrap`.

---

## 2. Step-by-step go-live

### 2.1 Push to GitHub

```bash
cd "<this folder>"
git init
git add .
git commit -m "Initial commit: Ansar School site"

# Create a new empty repo on github.com (private is fine), then:
git branch -M main
git remote add origin git@github.com:<your-username>/ansar-school-website.git
git push -u origin main
```

### 2.2 Deploy the CMS to Strapi Cloud

1. Sign up at **https://cloud.strapi.io** (free tier is enough to start).
2. Click **"Create project"** → **"Connect with GitHub"**.
3. Select the repo, set **Project root** to `cms`.
4. Pick a region close to Kerala — Mumbai (`ap-south-1`) is best.
5. Strapi Cloud auto-generates production secrets and a managed Postgres DB. Wait for the first deploy.
6. Open the admin URL it gives you (`https://<project>.strapiapp.com/admin`) and create your admin account.
7. Go to **Settings → Users & Permissions Plugin → Roles → Public** and enable `find` (and `findOne`) on:
   - `Site-setting`, `Home-page`, `About-page`, `Academics-page`, `Admissions-page`
   - `News-article`, `Event`, `Gallery-item`, `Staff-member`
8. Add real content under **Content Manager** (start with Site Settings + Home Page).
9. Hit **Publish** on each entry.

### 2.3 Deploy the frontend to Vercel

1. Sign up at **https://vercel.com** with your GitHub account.
2. Click **"Add New… → Project"** → import the same GitHub repo.
3. Set **Root Directory** to `frontend` and click **Deploy** — Vercel auto-detects Next.js.
4. Open the project's **Settings → Environment Variables** and add:

   | Name | Value |
   | --- | --- |
   | `NEXT_PUBLIC_STRAPI_URL` | `https://<your-project>.strapiapp.com` |
   | `NEXT_PUBLIC_SITE_URL` | `https://<your-vercel-domain>.vercel.app` |
   | `STRAPI_API_TOKEN` | _(optional, only if you restrict public access)_ |

5. Click **Redeploy** so the new env vars take effect.
6. Visit your Vercel URL — the site should load with content from Strapi.

### 2.4 Connect a custom domain (optional)

1. In Vercel: **Settings → Domains** → add `ansarschoolpdi.in` (and `www.ansarschoolpdi.in`).
2. Update DNS at your registrar:
   - `A` record `@` → `76.76.21.21`
   - `CNAME` record `www` → `cname.vercel-dns.com`
3. Wait for DNS to propagate (usually < 1 hour). Vercel issues an SSL cert automatically.

---

## 3. What's in this repo

```
ansar-website/
├── README.md                            ← you are here
├── frontend/                            ← Next.js 14 site
│   ├── src/app/                         ← pages (Home, About, Academics, …)
│   ├── src/components/                  ← Header, Footer, Hero, etc.
│   ├── src/lib/                         ← Strapi client + fallback content
│   ├── tailwind.config.ts               ← brand colors (green/blue Kerala palette)
│   └── package.json
└── cms/                                 ← Strapi 5
    ├── config/                          ← server, database, middlewares
    ├── src/api/<type>/                  ← content types (one folder per type)
    │   ├── content-types/<type>/schema.json
    │   ├── controllers/<type>.ts
    │   ├── routes/<type>.ts
    │   └── services/<type>.ts
    ├── src/components/                  ← shared component schemas (SEO, Highlight, …)
    └── package.json
```

### Content model overview

| Content type | Kind | What it is |
| --- | --- | --- |
| Site Settings | Single | School name, contact, social links, map embed |
| Home Page | Single | Hero, intro, highlights, CTA |
| About Page | Single | Vision, mission, history, principal's message |
| Academics Page | Single | Programs (LP/UP/HS) and facilities |
| Admissions Page | Single | Process steps, documents, fees, eligibility |
| News Article | Collection | Title, slug, excerpt, body, cover image |
| Event | Collection | Title, description, date, location |
| Gallery Item | Collection | Image + caption + category |
| Staff Member | Collection | Name, role, bio, photo |

---

## 4. Editing the site after launch

1. Sign in to **`https://<project>.strapiapp.com/admin`**.
2. Use **Content Manager** in the sidebar to edit any page.
3. Click **Save** then **Publish**.
4. The Vercel site refreshes automatically (ISR revalidates every 60 s). For an instant refresh, add a Strapi webhook → Vercel deploy hook.

To add a new news article: **Content Manager → News Article → Create new entry**.

---

## 5. Notes on the original site

The existing `https://ansarschoolpdi.in/` site couldn't be auto-fetched from this environment (network egress is restricted). To migrate the actual copy and images:

- **Option A (manual, fastest):** Copy text and download images from the live site, then paste/upload into Strapi after deploy.
- **Option B (automated):** Add `ansarschoolpdi.in` to your Cowork network allowlist (Settings → Capabilities), then ask me to scrape and load the content into Strapi for you.

Until then, the placeholder fallback content lets the site build and render so you can ship the structure first and refine the copy later.

---

## 6. Troubleshooting

- **Vercel build fails with "Module not found":** Make sure the **Root Directory** is set to `frontend`.
- **Strapi shows 403/404 on the frontend:** Re-check the public role permissions in step 2.2.7.
- **Images don't load:** Confirm the image domain in `frontend/next.config.mjs` — it auto-includes the host from `NEXT_PUBLIC_STRAPI_URL` plus `*.strapiapp.com` and `*.media.strapiapp.com`.
- **CORS errors:** `cms/config/middlewares.ts` allows all origins by default. Tighten this once your Vercel domain is final.
