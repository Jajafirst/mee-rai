import { Apple, Banana, Cherry, Citrus, Grape, Nut } from 'lucide-react'
import { lang, locale, t, tx } from './i18n'
import type { Goods, Grade, Listing, Product } from './types'

export const PRODUCTS: Product[] = [
  { id: 'mango', name: 'มะม่วง', en: 'Mango', icon: Apple, tint: '#d9822b', unit: 'ตัน', season: [0.4, 0.9, 1.8, 2.4, 2.2, 1.2, 0.6, 0.4, 0.4, 0.5, 0.6, 0.6], baseDemand: 120, priceA: 35000 },
  { id: 'durian', name: 'ทุเรียน', en: 'Durian', icon: Nut, tint: '#8a9a2c', unit: 'ตัน', season: [0.2, 0.3, 0.8, 1.8, 2.6, 2.4, 1.6, 0.8, 0.5, 0.4, 0.3, 0.3], baseDemand: 90, priceA: 120000 },
  { id: 'longan', name: 'ลำไย', en: 'Longan', icon: Cherry, tint: '#9a6a3a', unit: 'ตัน', season: [0.6, 0.5, 0.4, 0.4, 0.6, 1.0, 2.2, 2.6, 1.8, 0.8, 0.6, 0.5], baseDemand: 100, priceA: 30000 },
  { id: 'pineapple', name: 'สับปะรด', en: 'Pineapple', icon: Citrus, tint: '#c9a227', unit: 'ตัน', season: [0.8, 0.9, 1.2, 1.7, 1.8, 1.4, 1.0, 0.8, 0.7, 0.6, 0.6, 0.5], baseDemand: 150, priceA: 12000 },
  { id: 'mangosteen', name: 'มังคุด', en: 'Mangosteen', icon: Apple, tint: '#7a3a6a', unit: 'ตัน', season: [0.2, 0.2, 0.3, 0.8, 2.2, 2.8, 2.2, 1.2, 0.5, 0.3, 0.2, 0.2], baseDemand: 70, priceA: 60000 },
  { id: 'rambutan', name: 'เงาะ', en: 'Rambutan', icon: Grape, tint: '#c0392b', unit: 'ตัน', season: [0.2, 0.2, 0.3, 0.6, 1.8, 2.4, 2.6, 1.8, 0.8, 0.4, 0.3, 0.2], baseDemand: 80, priceA: 30000 },
  { id: 'lychee', name: 'ลิ้นจี่', en: 'Lychee', icon: Cherry, tint: '#c4566a', unit: 'ตัน', season: [0.1, 0.2, 0.6, 2.4, 3.2, 1.8, 0.4, 0.1, 0.1, 0.1, 0.1, 0.1], baseDemand: 50, priceA: 50000 },
  { id: 'banana', name: 'กล้วยหอม', en: 'Banana (Hom Thong)', icon: Banana, tint: '#b8962a', unit: 'ตัน', season: [1, 1, 1, 1.1, 1.1, 1, 0.9, 0.9, 1, 1, 1, 1], baseDemand: 200, priceA: 15000 },
]

export const productById = (id: string) => PRODUCTS.find((p) => p.id === id)!
export const pname = (p: Product | string) => {
  const x = typeof p === 'string' ? productById(p) : p
  return t(x.name, x.en)
}
/** Display unit for tons. */
export const ton = () => t('ตัน', 't')

export const PROVINCES = [
  'เชียงใหม่', 'เชียงราย', 'ลำพูน', 'น่าน', 'พิษณุโลก', 'นครสวรรค์', 'ขอนแก่น', 'อุดรธานี',
  'นครราชสีมา', 'สุรินทร์', 'อุบลราชธานี', 'ฉะเชิงเทรา', 'ระยอง', 'จันทบุรี', 'ราชบุรี',
  'ประจวบคีรีขันธ์', 'สุพรรณบุรี', 'สระบุรี', 'ชุมพร', 'สุราษฎร์ธานี', 'ตราด',
]

const PROVINCE_EN: Record<string, string> = {
  เชียงใหม่: 'Chiang Mai', เชียงราย: 'Chiang Rai', ลำพูน: 'Lamphun', น่าน: 'Nan', พิษณุโลก: 'Phitsanulok', นครสวรรค์: 'Nakhon Sawan',
  ขอนแก่น: 'Khon Kaen', อุดรธานี: 'Udon Thani', นครราชสีมา: 'Nakhon Ratchasima', สุรินทร์: 'Surin', อุบลราชธานี: 'Ubon Ratchathani',
  ฉะเชิงเทรา: 'Chachoengsao', ระยอง: 'Rayong', จันทบุรี: 'Chanthaburi', ราชบุรี: 'Ratchaburi', ประจวบคีรีขันธ์: 'Prachuap Khiri Khan',
  สุพรรณบุรี: 'Suphan Buri', สระบุรี: 'Saraburi', ชุมพร: 'Chumphon', สุราษฎร์ธานี: 'Surat Thani', ตราด: 'Trat',
}
export const prov = (p: string) => t(p, PROVINCE_EN[p] ?? p)
const REGION_EN: Record<string, string> = { เหนือ: 'North', กลาง: 'Central', อีสาน: 'Northeast', ตะวันออก: 'East', ใต้: 'South' }
export const regionName = (r: string) => t(`ภาค${r}`, `${REGION_EN[r]} region`)

/** Province → region, used for proximity scoring */
export const REGION: Record<string, string> = {
  เชียงใหม่: 'เหนือ', เชียงราย: 'เหนือ', ลำพูน: 'เหนือ', น่าน: 'เหนือ', พิษณุโลก: 'เหนือ',
  นครสวรรค์: 'กลาง', สุพรรณบุรี: 'กลาง', สระบุรี: 'กลาง', ราชบุรี: 'กลาง',
  ขอนแก่น: 'อีสาน', อุดรธานี: 'อีสาน', นครราชสีมา: 'อีสาน', สุรินทร์: 'อีสาน', อุบลราชธานี: 'อีสาน',
  ฉะเชิงเทรา: 'ตะวันออก', ระยอง: 'ตะวันออก', จันทบุรี: 'ตะวันออก', ตราด: 'ตะวันออก',
  ประจวบคีรีขันธ์: 'ใต้', ชุมพร: 'ใต้', สุราษฎร์ธานี: 'ใต้',
}

/** Circular Market Routing */
export const GRADE_ROUTES: Record<Grade, { label: string; market: string; uses: string[]; usesEn: string[]; priceFactor: number }> = {
  A: { label: 'Grade A', market: 'Fresh market / Premium retail', uses: ['ซูเปอร์มาร์เก็ต', 'ส่งออกผลสด', 'ร้านพรีเมียม'], usesEn: ['Supermarkets', 'Fresh export', 'Premium stores'], priceFactor: 1 },
  B: { label: 'Grade B', market: 'Food service / Processing', uses: ['ร้านอาหาร/โรงแรม', 'ตัดแต่งพร้อมปรุง', 'อบแห้ง'], usesEn: ['Restaurants / hotels', 'Fresh-cut', 'Dried fruit'], priceFactor: 0.65 },
  C: { label: 'Grade C', market: 'Puree / Juice / Jam', uses: ['น้ำผลไม้', 'เพียวเร่', 'แยม', 'ผงผลไม้'], usesEn: ['Juice', 'Puree', 'Jam', 'Fruit powder'], priceFactor: 0.4 },
  R: { label: 'Residual', market: 'Animal feed / Compost / Biomaterial', uses: ['อาหารสัตว์', 'ปุ๋ยหมัก', 'วัสดุชีวภาพ', 'ไบโอแก๊ส'], usesEn: ['Animal feed', 'Compost', 'Biomaterial', 'Biogas'], priceFactor: 0.12 },
}

export const gradeUses = (g: Grade) => (lang() === 'en' ? GRADE_ROUTES[g].usesEn : GRADE_ROUTES[g].uses)
export const GRADES: Grade[] = ['A', 'B', 'C', 'R']

const METHOD_EN: Record<string, string> = { อินทรีย์: 'Organic', GAP: 'GAP', ทั่วไป: 'Conventional' }
export const methodName = (m: string) => t(m, METHOD_EN[m] ?? m)

const MONTHS_TH = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
export const monthShort = (m: number) => t(MONTHS_TH[m], MONTHS_EN[m])
/** "ต.ค. 69" (Buddhist year) or "Oct 26" */
export const monthYear = (m: number, year: number) => `${monthShort(m)} ${String((year + (lang() === 'th' ? 543 : 0)) % 100).padStart(2, '0')}`

export const fmt = (n: number) => n.toLocaleString(locale(), { maximumFractionDigits: 0 })
export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString(locale(), { day: 'numeric', month: 'short', year: '2-digit' })

export const goodsName = (g: Goods) => tx(g.name, g.nameEn)
export const goodsPack = (g: Goods) => tx(g.pack, g.packEn)
/** Consumer price per kg for fresh fruit (farm-gate ฿/ton + delivery margin). */
export const retailPerKg = (l: Listing) => (l.targetPrice / 1000) * 1.25
