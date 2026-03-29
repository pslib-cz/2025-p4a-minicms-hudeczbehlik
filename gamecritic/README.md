# GameCritic

Publikační webová aplikace postavená na **Next.js (App Router)** s **Prisma ORM** a **Auth.js (NextAuth)**. Uživatelé přidávají hry, píší recenze, přiřazují tagy a žánry; každý spravuje jen vlastní obsah v dashboardu.

## Datový model (Prisma)

| Entita | Popis |
|--------|--------|
| **User** | Identita z Auth.js (jméno, e-mail, volitelně `passwordHash` pro přihlášení e-mailem). |
| **Game** | Hlavní katalogová entita: `title`, `slug`, `description`, `coverImage`, `releaseYear`, vazba `addedBy` → User. |
| **Review** | Hlavní publikovaný obsah: `title`, `slug`, `content`, `score`, `status` (DRAFT / PUBLISHED), `publishDate`, `createdAt`, `updatedAt`, vazby na `Game` a `User` (autor). |
| **Tag**, **Genre** | Kategorizace; vazba **N:M** s `Game` (`_GameTags`, `_GameGenres`). |
| **Screenshot** | Obrázky k hrám, vlastník `User`. |

**Vztahy:** User → Review (1:N), Game → Review (1:N), Game ↔ Tag / Genre (N:M).

Databáze: **PostgreSQL** (lokálně i na Vercelu). SQLite je možné použít po úpravě `provider` v `prisma/schema.prisma` a přegenerování migrací.

## Funkce

### Veřejná část (Server Components)

- Domovská stránka s výběrem nejnovějších a nejlépe hodnocených recenzí.
- **Katalog recenzí** (`/reviews`): vyhledávání v titulku a textu, filtr podle tagu (u hry), stránkování, revalidace (`revalidate`).
- Katalog her (`/games`) s filtry žánr / tag / fulltext a stránkováním.
- Detail **hry** a **recenze** (dynamické routy), **profil autora**.
- SEO: **dynamická metadata**, **OpenGraph**, **canonical URL** (`metadataBase` v `app/layout.tsx`), **`sitemap.xml`**, **`robots.txt`**.
- **next/image** u obrázků, **ISR / revalidace** (`revalidate`, `revalidateTag` po změnách).

### Dashboard (Client Components + React Bootstrap)

- Seznam **vlastních** recenzí se **stránkováním**.
- Vytvoření / úprava recenze s **TipTap** WYSIWYG, validace (react-hook-form + Zod).
- Přepínání **DRAFT / PUBLISHED**, mazání.
- **Správa her** (včetně tagů a žánrů) a **screenshotů** (server actions jako dříve).
- UI: **React Bootstrap** (formuláře, tabulky, karty, navigace).

### REST API (Route Handlers)

- `GET /api/reviews` — vlastní recenze (stránkování `?page=`), vyžaduje session.
- `POST /api/reviews` — vytvoření recenze (validace, vlastnictví přes `authorId`).
- `PATCH /api/reviews/[id]` — úprava.
- `DELETE /api/reviews/[id]` — smazání.
- `POST /api/reviews/[id]/toggle-status` — přepnutí draft/published.

Všechny mutace kontrolují **session** a **autorství** (`authorId`).

### Analytika a cookies

- **vanilla-cookieconsent** (v3): nezbytné vs. analytické cookies; **Google Analytics 4** se načte jen po souhlasu (`NEXT_PUBLIC_GA_MEASUREMENT_ID`).
- Bez souhlasu běží web bez GA (pageview se neposílá).

### Lighthouse (kontrola kvality)

Po nasazení spusťte v Chrome DevTools → **Lighthouse** (Desktop, kategorie Performance, Accessibility, Best Practices, SEO). Uložte PDF nebo screenshot výsledku a případné poznámky (např. lazy load, kontrast, meta) do dokumentace předmětu.

---

## Lokální spuštění

### 1. Závislosti

```bash
cd gamecritic
npm install
```

### 2. PostgreSQL

Buď **Docker**:

```bash
docker compose up -d
```

nebo vlastní instance PostgreSQL.

### 3. Proměnné prostředí

```bash
cp .env.example .env
```

Upravte `DATABASE_URL`, `AUTH_SECRET` (např. `openssl rand -base64 32`), volitelně `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `GITHUB_ID` / `GITHUB_SECRET` pro OAuth.

### 4. Migrace a seed

```bash
npx prisma migrate deploy
# nebo při vývoji: npm run db:migrate

npm run db:seed
```

Demo účet: **`demo@gamecritic.local`** / **`demo123456`**.

### 5. Vývojový server

```bash
npm run dev
```

Aplikace běží na [http://localhost:3000](http://localhost:3000).

---

## Nasazení (Vercel)

1. Projekt připojte k Vercelu (repo z GitHubu).
2. **Root directory** nastavte na `gamecritic`, pokud je monorepo v nadřazené složce.
3. V **Environment Variables** nastavte:
   - `DATABASE_URL` — connection string z **Vercel Postgres**, Neon, Supabase nebo jiného Postgresu.
   - `AUTH_SECRET`
   - `NEXT_PUBLIC_SITE_URL` — veřejná URL produkce (např. `https://vase-app.vercel.app`).
   - Volitelně `NEXT_PUBLIC_GA_MEASUREMENT_ID`, GitHub OAuth.
4. Build command: `npm run build` (obsahuje `prisma generate`).
5. Po prvním nasazení na databázi spusťte **`prisma migrate deploy`** (Vercel CLI / jednorázový job) nebo použijte příkaz z dokumentace poskytovatele DB.

---

## Po nasazení (Search Console / Bing)

1. **Google Search Console**: přidejte vlastnost (URL prefix nebo doménu), ověřte vlastnictví (DNS nebo HTML soubor), odešlete `sitemap.xml` (`https://<vaše-domena>/sitemap.xml`).
2. **Bing Webmaster Tools**: import z Google nebo ruční přidání webu a sitemap.

---

## Skripty npm

| Příkaz | Popis |
|--------|--------|
| `npm run dev` | Vývojový server |
| `npm run build` | Produkový build |
| `npm run start` | Spuštění po buildu |
| `npm run db:migrate` | Migrace (Prisma) |
| `npm run db:seed` | Seed demo dat |
| `npm run db:studio` | Prisma Studio |

---

## Technologie

Next.js 16, React 19, Prisma, PostgreSQL, NextAuth v5, React Bootstrap, TipTap, Zod, vanilla-cookieconsent.
