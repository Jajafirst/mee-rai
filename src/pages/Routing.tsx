import { useState } from 'react'
import { ArrowRight, Recycle } from 'lucide-react'
import { Card, ProductIcon, Stat } from '../components/ui'
import { GRADES, GRADE_ROUTES, PRODUCTS, fmt, gradeUses, pname, productById, ton } from '../lib/catalog'
import { t, tx } from '../lib/i18n'
import { listingGrade, listingQty, routeGrade } from '../lib/ai'
import { useStore } from '../lib/store'

export default function Routing() {
  const { listings, demands } = useStore()
  const [pid, setPid] = useState('mango')
  const p = productById(pid)
  const lanes = GRADES.map((g) => {
    const vol = listings.filter((l) => l.productId === pid && listingGrade(l) === g).reduce((s, l) => s + listingQty(l), 0)
    return { g, vol, ...routeGrade(pid, g, demands) }
  })

  // Value rescued: B/C/Residual volume that would otherwise be wasted, valued at its routed price.
  const rescued = listings
    .filter((l) => listingGrade(l) !== 'A')
    .reduce((s, l) => s + listingQty(l), 0)
  const rescuedValue = listings
    .filter((l) => listingGrade(l) !== 'A')
    .reduce((s, l) => s + listingQty(l) * productById(l.productId).priceA * GRADE_ROUTES[listingGrade(l)].priceFactor, 0)

  return (
    <div className="page">
      <div className="page-h">
        <div>
          <h1><Recycle size={26} className="ic" /> Circular Market Routing</h1>
          <p className="muted">{t('ผลผลิตเดียวกัน ควรไปอยู่ตลาดไหน — ทุกเกรดมีผู้ซื้อที่พร้อมเปลี่ยนให้เป็นมูลค่า', 'Which market should each grade go to — every grade has a buyer ready to turn it into value')}</p>
        </div>
      </div>

      <div className="stats">
        <Stat label={t('ผลผลิตนอกเกรด A บนแพลตฟอร์ม', 'Non-grade-A fruit on platform')} value={`${fmt(rescued)} ${ton()}`} sub={t('ที่เดิมเสี่ยงถูกทิ้ง', 'that would risk being wasted')} />
        <Stat label={t('มูลค่าที่สร้างกลับคืน (ประมาณ)', 'Value recovered (est.)')} value={t(`${fmt(rescuedValue / 1e6)} ล้าน ฿`, `฿${fmt(rescuedValue / 1e6)}M`)} />
        <Stat label={t('ผู้แปรรูปที่รับเกรด B/C/R', 'Processors taking grade B/C/R')} value={demands.filter((d) => d.grades.some((g) => g !== 'A')).length} />
      </div>

      <div className="pills">
        {PRODUCTS.map((x) => (
          <button key={x.id} className={`chip ${pid === x.id ? 'on' : ''}`} onClick={() => setPid(x.id)}><ProductIcon id={x.id} size={22} /> {pname(x)}</button>
        ))}
      </div>

      <Card title={<><ProductIcon id={p.id} size={28} /> {pname(p)} — {t('เส้นทางตามเกรด', 'routes by grade')}</>}>
        <div className="lanes">
          {lanes.map(({ g, vol, route, buyers, estPrice }) => (
            <div key={g} className={`lane lane-${g}`}>
              <div className="lane-h">
                <span className={`grade grade-${g}`}>{route.label}</span>
                <b>{route.market}</b>
              </div>
              <div className="lane-flow">
                <div><small className="muted">{t('ปริมาณในระบบ', 'On platform')}</small><b>{fmt(vol)} {ton()}</b></div>
                <ArrowRight size={16} className="arrow" />
                <div><small className="muted">{t('ราคาอ้างอิง', 'Ref. price')}</small><b>≈ {fmt(estPrice)} ฿/{ton()}</b></div>
              </div>
              <div className="uses">{gradeUses(g).map((u) => <span key={u} className="tag">{u}</span>)}</div>
              <div className="small">
                {buyers.length
                  ? <>{t('ผู้ซื้อตอนนี้', 'Current buyers')}: {buyers.map((b) => tx(b.processor, b.en?.processor)).join(', ')}</>
                  : <span className="muted">{t('ยังไม่มีผู้ซื้อประกาศ — เปิดรับผู้แปรรูปรายใหม่', 'No buyers yet — open to new processors')}</span>}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
