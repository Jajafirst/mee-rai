# MEERAI (มีไร่) — notes for AI assistants

Fruit marketplace prototype: "Market-led Production" (ตลาดนำการผลิต). AI forecasts demand/supply and routes every
grade of fruit to a buyer — A → fresh market, B → food service/processing, C → puree/juice/jam,
Residual → feed/compost/biomaterial. Processors are the core of the model (they turn off-grade surplus into value).

- Live: https://mee-rai.vercel.app · https://jajafirst.github.io/mee-rai/
- Repo: https://github.com/Jajafirst/mee-rai (public, owner Jajafirst)
- Business overview doc: https://claude.ai/code/artifact/de0181df-1899-449b-814a-2311d646f979
- Team guide doc: https://claude.ai/code/artifact/0e559a85-c4cd-4c8f-bd1a-cef0b685303a

## Commands
```bash
npm install
npm run dev     # http://localhost:5173
npm run build   # tsc -b && vite build — must pass before any commit
```
No test suite yet. Verify UI changes in a browser, in both TH and EN.

## Product decisions (don't undo without asking the owner)
- **Fruit only.** Livestock and grains were removed on request. 8 fruits in `src/lib/catalog.ts`.
- **Three roles**, each with its own menu (`ROLE_PAGES` in `src/App.tsx`):
  - `farmer` = ชาวสวน (Grower): pages `farmer`, `insights`, `routing`
  - `business` = ผู้ประกอบการ (processor / product maker / retailer): `processor`, `goods`, `insights`, `routing`
  - `consumer` = ผู้บริโภค (Customer): `consumer`, `orders`
- Flows between roles: business sends `PurchaseRequest` → grower accepts/declines; business sells `Goods`
  made from fruit; customer checks out `Order`s that sellers see.
- **No emoji in the UI** — Lucide icons (`lucide-react`) and `ProductIcon`. Flags are inline SVG (`LangSwitch`).
- **Thai is the default language**, English via the TH/EN switch. Brand: teal #1f6f6a, leaf #4c9a3b, gold #b9a24a.
- AI stays **rule-based and explainable** (`src/lib/ai.ts`); every match carries human-readable reasons.

## Architecture
React 18 + TypeScript + Vite, single page, hash routing (`#farmer` …). No backend.
- `src/lib/store.tsx` — one context (`useStore()`), persisted to localStorage key `meerai-v6`.
  **Bump the key whenever types or seed data change.**
- `src/lib/seed.ts` — sample data; dates are relative to today (`addDays`, `inMonth`).
- `src/lib/types.ts` — Listing, Demand, PurchaseRequest, Goods, CartItem, Order, Role.
- `src/lib/ai.ts` — `forecast`, `gapAnalysis`, `matchDemand`/`matchAll` (global allocation, earliest deadline first,
  score capped at 100), `recommend`, `trends`, `routeGrade`.
- `src/lib/i18n.tsx` — module-level language; the provider remounts the tree on switch, so plain functions can call `t()`.
- `src/lib/catalog.ts` — fruits, provinces (+EN names), regions, grade routes, `fmt`/`fmtDate`/`monthYear`, `pname`, `prov`.
- `src/components/ui.tsx` — shared UI; `BusinessPicker.tsx`; `ForecastChart.tsx` (hand-rolled SVG).
- `src/styles.css` — all styles; tokens on `:root`. Light theme only. Chart colours supply #00897b / demand #c07a10
  (validated for colour-blind contrast).

## Conventions
- Every visible string: `t('ไทย', 'English')`. User/seed free text: `tx(th, en?)`. Names: `pname()`, `prov()`, `methodName()`.
- Units: tons (ตัน / t) for trade, kg for consumer prices (`retailPerKg`).
- Photos: `compressPhoto()` → JPEG data URL (max 900px); localStorage holds ~50–60 photos; `storageFull` shows a banner.
- Match the surrounding code style; keep comments sparse. Ask before adding dependencies.

## Deploy
Push to `main` → Vercel (project `jajafirsts-projects/mee-rai`, git-connected) and GitHub Pages
(`.github/workflows/pages.yml`) both redeploy. `vite.config.ts` uses `base: './'` so one build serves both — keep it.

## Gotchas
- This folder is its own git repo, but it sits inside a git repo covering the home folder (`/Users/firstz`).
  Run git commands from this folder.
- Commit author: `Jajafirst <jatuponitsara1234@gmail.com>` (no global git identity is set).
- `*.tsbuildinfo`, `dist`, `.vercel` are git-ignored.

## Known gaps / next work
Shared backend (Supabase/Firebase) for data, logins and photos · accepted requests should reduce available tons ·
seller-side order status updates · phone-width check of the role screens · payments and delivery later.
