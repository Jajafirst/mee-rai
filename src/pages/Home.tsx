import { ArrowRight, Check } from 'lucide-react'
import { Logo, Stat } from '../components/ui'
import { fmt } from '../lib/catalog'
import { t } from '../lib/i18n'
import { gapAnalysis, listingGrade } from '../lib/ai'
import { useStore } from '../lib/store'
import { ROLES, ROLE_PAGES, type Page } from '../App'
import type { Role } from '../lib/types'

const ROLE_CARDS: { role: Role; title: () => string; sub: () => string; does: () => string[] }[] = [
  {
    role: 'farmer',
    title: () => t('ชาวสวน', 'Grower'),
    sub: () => t('เกษตรกร ชาวสวน ผู้ปลูกผลไม้', 'Fruit farmers & orchards'),
    does: () => [
      t('ลงประกาศผลไม้ทุกเกรดพร้อมรูปถ่าย', 'List fruit of every grade, with photos'),
      t('รับคำขอซื้อจากผู้ประกอบการ ตอบรับ / ปฏิเสธ', 'Get purchase requests from businesses — accept or decline'),
      t('ดูคำแนะนำการผลิตจาก AI', 'See AI production advice'),
    ],
  },
  {
    role: 'business',
    title: () => t('ผู้ประกอบการ', 'Business'),
    sub: () => t('ผู้แปรรูป ผู้ผลิตสินค้า ร้านค้า', 'Processors, product makers & retailers'),
    does: () => [
      t('ประกาศวัตถุดิบที่ต้องการ ให้ AI จับคู่กับสวน', 'Post raw-material needs — AI matches orchards'),
      t('ส่งคำขอซื้อตรงถึงชาวสวน', 'Send purchase requests straight to growers'),
      t('ขายสินค้าแปรรูปจากเกรด B / C / Residual', 'Sell products made from grade B / C / Residual'),
    ],
  },
  {
    role: 'consumer',
    title: () => t('ผู้บริโภค', 'Customer'),
    sub: () => t('ผู้ซื้อทั่วไป', 'Shoppers'),
    does: () => [
      t('ซื้อผลไม้สดตรงจากสวน', 'Buy fresh fruit direct from orchards'),
      t('ซื้อสินค้าแปรรูปที่ช่วยลดของเสีย', 'Buy products that rescue surplus fruit'),
      t('รับดีลจากผลไม้ที่ล้นตลาด', 'Get deals on fruit in surplus'),
    ],
  },
]

export default function Home({ go }: { go: (p: Page) => void }) {
  const { listings, demands, goods, role, setRole } = useStore()
  const pick = (r: Role) => {
    setRole(r)
    go(ROLE_PAGES[r][0])
  }
  const risks = gapAnalysis(listings, demands, 6).filter((g) => g.risk === 'oversupply-high').length
  const nonA = listings.filter((l) => listingGrade(l) !== 'A').length

  return (
    <div className="page">
      <section className="hero">
        <div className="hero-brand">
          <Logo size={88} />
          <div>
            <div className="brand-th">มีไร่</div>
            <div className="brand-en">MEERAI</div>
          </div>
        </div>
        <h1>{t('เชื่อมชาวสวนผลไม้สู่ผู้แปรรูปและผู้บริโภค', 'Connecting fruit growers with processors and consumers')}</h1>
        <p className="lead">Sustainable Food Chain Connection · {t('ลดของเสียเพื่ออนาคต', 'Less waste for the future')}<br />
          {t('แพลตฟอร์ม ', 'A ')}<b>Market-led Production</b>{t(' ที่ใช้ AI ให้ “ตลาดนำการผลิต” และเปิดตลาดให้ผลไม้ทุกเกรดมีมูลค่า', ' platform where AI lets the market lead production — and every grade of fruit finds its value.')}</p>
        <h2 className="pick-h">{role ? t('เปลี่ยนบทบาท', 'Switch role') : t('เข้าใช้งานในฐานะ', 'Continue as')}</h2>
        <div className="roles">
          {ROLE_CARDS.map((c) => {
            const Icon = ROLES[c.role].icon
            const on = role === c.role
            return (
              <button key={c.role} className={`role-card ${on ? 'on' : ''}`} onClick={() => pick(c.role)} aria-pressed={on}>
                <span className="tile-i"><Icon size={30} strokeWidth={1.6} /></span>
                <b>{c.title()}</b>
                <small className="muted">{c.sub()}</small>
                <ul>{c.does().map((d) => <li key={d}><Check size={14} />{d}</li>)}</ul>
                <span className="btn sm">{on ? t('กำลังใช้งาน · ไปต่อ', 'Current · continue') : t('เข้าใช้งาน', 'Enter')} <ArrowRight size={14} /></span>
              </button>
            )
          })}
        </div>
      </section>

      <div className="stats">
        <Stat label={t('ประกาศผลผลิต', 'Harvest listings')} value={fmt(listings.length)} sub={t(`${nonA} รายการเป็นเกรด B / C / Residual`, `${nonA} are grade B / C / Residual`)} />
        <Stat label={t('ความต้องการจากผู้ประกอบการ', 'Business demands')} value={fmt(demands.length)} />
        <Stat label={t('สินค้าแปรรูปในตลาด', 'Processed products')} value={fmt(goods.length)} sub={t('สร้างจากผลไม้นอกเกรด', 'made from off-grade fruit')} />
        <Stat label={t('สัญญาณเสี่ยงล้นตลาด (6 ด.)', 'Oversupply alerts (6 mo)')} value={risks}  />
      </div>

      <section className="how">
        <h2 className="sec">{t('ระบบทำงานอย่างไร', 'How it works')}</h2>
        <ol className="steps">
          <li><b>{t('เก็บข้อมูล', 'Collect data')}</b><span>{t('ชาวสวนลงผลไม้ที่ปลูก พื้นที่ ปริมาณ วันเก็บเกี่ยว เกรด พร้อมรูปถ่าย · ผู้แปรรูปลงวัตถุดิบที่ต้องการ', 'Growers list fruit, area, volume, harvest date, grade and photos · processors post what they need')}</span></li>
          <li><b>AI Forecast</b><span>{t('คาดการณ์ Demand & Supply ล่วงหน้ารายเดือน/ฤดูกาล', 'Forecast demand & supply by month and season')}</span></li>
          <li><b>Gap Analysis</b><span>{t('ชน Demand กับ Supply เพื่อรู้ล่วงหน้าว่าสินค้าไหนเสี่ยงล้นตลาด', 'Compare demand with supply to spot oversupply risk early')}</span></li>
          <li><b>Matching & Recommendation</b><span>{t('จับคู่ “โรงงาน A ต้องการมะม่วง 20 ตัน เกรด B ภายใน 14 วัน” กับสวนที่ใช่ และแนะนำการผลิตรอบถัดไป', 'Match “Factory A needs 20 t of grade B mango within 14 days” with the right orchards, and advise the next crop')}</span></li>
          <li><b>Circular Routing</b><span>{t('A → ตลาดสด · B → Food service · C → น้ำผลไม้/แยม · Residual → อาหารสัตว์/ปุ๋ย/วัสดุชีวภาพ', 'A → fresh market · B → food service · C → juice/jam · Residual → feed/compost/biomaterial')}</span></li>
        </ol>
      </section>
    </div>
  )
}
