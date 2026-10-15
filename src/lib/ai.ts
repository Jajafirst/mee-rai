/**
 * MEERAI "AI" engine — a transparent, rule-based forecasting & matching model.
 * It runs entirely in the browser on platform data, so it is explainable for a demo.
 * Swap `forecast()` for a trained model (e.g. Prophet / gradient boosting) behind an API later.
 */
import { GRADE_ROUTES, PRODUCTS, REGION, fmt, fmtDate, methodName, monthYear, pname, productById, prov, regionName, ton } from './catalog'
import { t, tx } from './i18n'
import type { Demand, Grade, Listing, Match } from './types'

const monthKey = (iso: string) => {
  const d = new Date(iso)
  return d.getFullYear() * 12 + d.getMonth()
}
const nowKey = () => monthKey(new Date().toISOString())

/** Quantity a listing contributes to supply, in the product's unit. */
export const listingQty = (l: Listing) => l.qty
export const listingDate = (l: Listing) => l.harvestDate
export const listingGrade = (l: Listing): Grade => l.grade

export interface MonthPoint {
  key: number
  month: number // 0..11
  year: number
  supply: number
  demand: number
  listedSupply: number
  listedDemand: number
}

/**
 * 1) Demand & Supply Forecast.
 * supply = listed harvests that month + off-platform baseline × seasonality
 * demand = processor orders due that month + consumer/market baseline
 */
export function forecast(productId: string, listings: Listing[], demands: Demand[], horizon = 8): MonthPoint[] {
  const p = productById(productId)
  const start = nowKey()
  return Array.from({ length: horizon }, (_, i) => {
    const key = start + i
    const month = key % 12
    const listedSupply = listings
      .filter((l) => l.productId === productId && monthKey(listingDate(l)) === key)
      .reduce((s, l) => s + listingQty(l), 0)
    const listedDemand = demands
      .filter((d) => d.productId === productId && monthKey(d.neededBy) === key)
      .reduce((s, d) => s + d.qty, 0)
    const baseSupply = p.baseDemand * 0.5 * p.season[month]
    const baseDemand = p.baseDemand * 0.5
    return {
      key, month, year: Math.floor(key / 12),
      supply: Math.round(listedSupply + baseSupply),
      demand: Math.round(listedDemand + baseDemand),
      listedSupply, listedDemand,
    }
  })
}

export type Risk = 'oversupply-high' | 'oversupply' | 'balanced' | 'shortage'

export interface Gap extends MonthPoint {
  productId: string
  gap: number // supply - demand
  ratio: number
  risk: Risk
}

/** 2) Gap Analysis — collide forecast supply with forecast demand. */
export function gapAnalysis(listings: Listing[], demands: Demand[], horizon = 8): Gap[] {
  return PRODUCTS.flatMap((p) =>
    forecast(p.id, listings, demands, horizon).map((m) => {
      const ratio = m.demand ? m.supply / m.demand : 0
      const risk: Risk = ratio >= 1.5 ? 'oversupply-high' : ratio >= 1.15 ? 'oversupply' : ratio <= 0.85 ? 'shortage' : 'balanced'
      return { ...m, productId: p.id, gap: m.supply - m.demand, ratio, risk }
    }),
  )
}

export const RISKS: Risk[] = ['oversupply-high', 'oversupply', 'balanced', 'shortage']
export const riskLabel = (r: Risk) =>
  ({
    'oversupply-high': t('เสี่ยงล้นตลาดสูง', 'High oversupply risk'),
    oversupply: t('เสี่ยงล้นตลาด', 'Oversupply risk'),
    balanced: t('สมดุล', 'Balanced'),
    shortage: t('ขาดตลาด', 'Shortage'),
  })[r]

const gradeOk = (l: Listing, d: Demand) => d.grades.includes(listingGrade(l))

/** Matching: market sends demand to farmers. Greedy allocation by score. */
export function matchDemand(d: Demand, listings: Listing[], capacity?: Map<string, number>, today = new Date().toISOString().slice(0, 10)) {
  const candidates = listings
    .filter((l) => l.productId === d.productId && gradeOk(l, d))
    .filter((l) => listingDate(l) <= d.neededBy && listingDate(l) >= today)
    .filter((l) => d.provinces.length === 0 || d.provinces.includes(l.province) || REGION[l.province] === REGION[d.provinces[0]])
    .map((l) => {
      const reasons: string[] = []
      let score = 0
      const price = l.targetPrice
      if (price <= d.maxPrice) { score += 40; reasons.push(t('ราคาอยู่ในงบ', 'Within budget')) }
      else { score += Math.max(0, 40 - ((price - d.maxPrice) / d.maxPrice) * 200); reasons.push(t('ราคาสูงกว่างบเล็กน้อย', 'Slightly over budget')) }
      if (d.provinces.includes(l.province)) { score += 30; reasons.push(t(`อยู่ใน ${prov(l.province)}`, `In ${prov(l.province)}`)) }
      else if (d.provinces.length === 0) { score += 20 }
      else { score += 15; reasons.push(regionName(REGION[l.province])) }
      const slackDays = (new Date(d.neededBy).getTime() - new Date(listingDate(l)).getTime()) / 86_400_000
      score += slackDays >= 3 ? 20 : 10
      reasons.push(t(`พร้อมส่งก่อนกำหนด ${Math.round(slackDays)} วัน`, `Ready ${Math.round(slackDays)} days early`))
      if (l.method !== 'ทั่วไป') { score += 10; reasons.push(methodName(l.method)) }
      if (l.photos?.length) { score += 5; reasons.push(t('มีรูปผลผลิต', 'Has photos')) }
      return { l, score: Math.min(100, Math.round(score)), reasons }
    })
    .sort((a, b) => b.score - a.score)

  let remaining = d.qty
  const matches: Match[] = []
  for (const c of candidates) {
    if (remaining <= 0) break
    const avail = capacity?.get(c.l.id) ?? listingQty(c.l)
    const qty = Math.min(remaining, avail)
    if (qty <= 0) continue
    capacity?.set(c.l.id, avail - qty)
    matches.push({ demandId: d.id, listingId: c.l.id, qty, score: c.score, reasons: c.reasons })
    remaining -= qty
  }
  return { matches, filled: d.qty - remaining, fillRate: (d.qty - remaining) / d.qty }
}

/**
 * Allocate all demands against shared supply so a lot is never sold twice.
 * Earliest deadline first — urgent orders get first pick.
 */
export function matchAll(demands: Demand[], listings: Listing[]) {
  const capacity = new Map(listings.map((l) => [l.id, listingQty(l)]))
  const out = new Map<string, ReturnType<typeof matchDemand>>()
  for (const d of [...demands].sort((a, b) => a.neededBy.localeCompare(b.neededBy))) out.set(d.id, matchDemand(d, listings, capacity))
  return out
}

/** Demands a given listing could serve (farmer view). */
export function demandsForListing(l: Listing, demands: Demand[]) {
  return demands
    .map((d) => ({ d, m: matchDemand(d, [l]).matches[0] }))
    .filter((x) => x.m)
    .sort((a, b) => b.m!.score - a.m!.score)
}

/** Grade routing — where this grade should go, and the processors currently buying it. */
export function routeGrade(productId: string, grade: Grade, demands: Demand[]) {
  const route = GRADE_ROUTES[grade]
  const buyers = demands.filter((d) => d.productId === productId && d.grades.includes(grade))
  const p = productById(productId)
  return { route, buyers, estPrice: Math.round(p.priceA * route.priceFactor) }
}

export interface Recommendation {
  tone: 'warn' | 'good' | 'info'
  productId: string
  title: string
  detail: string
}

/** 3) Production Recommendation for a farmer's province / product mix. */
export function recommend(province: string, listings: Listing[], demands: Demand[]): Recommendation[] {
  const gaps = gapAnalysis(listings, demands, 6)
  const recs: Recommendation[] = []
  const region = REGION[province]
  const mine = new Set(listings.filter((l) => l.province === province).map((l) => l.productId))

  // Oversupply risk on what this area grows
  for (const pid of mine) {
    const worst = gaps.filter((g) => g.productId === pid).sort((a, b) => b.ratio - a.ratio)[0]
    if (worst && worst.risk.startsWith('oversupply')) {
      const p = productById(pid)
      recs.push({
        tone: 'warn',
        productId: pid,
        title: `${pname(p)}: ${riskLabel(worst.risk)} (${monthName(worst)})`,
        detail: t(
          `คาดการณ์ Supply ${qty(worst.supply)} vs Demand ${qty(worst.demand)} — เกิน ${Math.round((worst.ratio - 1) * 100)}%. แนะนำทำสัญญาขายล่วงหน้ากับผู้แปรรูป หรือกระจายเกรด B/C เข้าสายแปรรูปก่อนราคาตก`,
          `Forecast supply ${qty(worst.supply)} vs demand ${qty(worst.demand)} — ${Math.round((worst.ratio - 1) * 100)}% over. Pre-sell to processors or route grade B/C into processing before prices drop.`,
        ),
      })
    }
  }

  // Shortages / processor demand coming in next 3 months nearby
  const soon = demands.filter((d) => {
    const m = monthKey(d.neededBy) - nowKey()
    return m >= 0 && m <= 3 && (d.provinces.length === 0 || d.provinces.some((pv) => REGION[pv] === region))
  })
  const all = matchAll(demands, listings)
  for (const d of soon) {
    const { fillRate } = all.get(d.id)!
    if (fillRate < 1) {
      const p = productById(d.productId)
      recs.push({
        tone: 'good',
        productId: d.productId,
        title: t(
          `ตลาดกำลังต้องการ ${pname(p)} เกรด ${d.grades.join('/')} อีก ${qty(Math.round(d.qty * (1 - fillRate)))}`,
          `Market needs ${qty(Math.round(d.qty * (1 - fillRate)))} more ${pname(p)}, grade ${d.grades.join('/')}`,
        ),
        detail: t(
          `${tx(d.processor, d.en?.processor)} ต้องการภายใน ${fmtDate(d.neededBy)} สำหรับ ${tx(d.use, d.en?.use)} — ยังไม่มีผู้ขายครบ`,
          `${tx(d.processor, d.en?.processor)} needs it by ${fmtDate(d.neededBy)} for ${tx(d.use, d.en?.use)} — not yet fully supplied`,
        ),
      })
    }
  }

  const shortages = gaps.filter((g) => g.risk === 'shortage' && g.key - nowKey() >= 2)
  const best = shortages.sort((a, b) => a.ratio - b.ratio)[0]
  if (best) {
    const p = productById(best.productId)
    recs.push({
      tone: 'info',
      productId: best.productId,
      title: t(`โอกาสปลูก: ${pname(p)} คาดว่าขาดตลาดช่วง ${monthName(best)}`, `Opportunity: ${pname(p)} expected short in ${monthName(best)}`),
      detail: t(
        `Supply คาดการณ์ต่ำกว่าความต้องการ ${Math.round((1 - best.ratio) * 100)}% — พิจารณาวางแผนการผลิตรอบถัดไป`,
        `Forecast supply is ${Math.round((1 - best.ratio) * 100)}% below demand — consider planning your next crop for it.`,
      ),
    })
  }
  return recs
}

const qty = (n: number) => `${fmt(n)} ${ton()}`
const monthName = (m: MonthPoint) => monthYear(m.month, m.year)

/** Consumer trends: products surging or in surplus (= deals that help farmers). */
export function trends(listings: Listing[], demands: Demand[]) {
  const gaps = gapAnalysis(listings, demands, 2)
  return PRODUCTS.map((p) => {
    const g = gaps.find((x) => x.productId === p.id)!
    return { p, ratio: g.ratio, discount: g.ratio > 1.15 ? Math.min(40, Math.round((g.ratio - 1) * 50)) : 0 }
  }).sort((a, b) => b.ratio - a.ratio)
}
