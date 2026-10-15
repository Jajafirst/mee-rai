import { useState } from 'react'
import { ForecastChart } from '../components/ForecastChart'
import { ArrowRight, Bot, TriangleAlert } from 'lucide-react'
import { Card, GradeBadge, ProductIcon, Stat } from '../components/ui'
import { PRODUCTS, fmt, fmtDate, monthShort, pname, productById, ton } from '../lib/catalog'
import { t, tx } from '../lib/i18n'
import { RISKS, forecast, gapAnalysis, matchAll, riskLabel, type Risk } from '../lib/ai'
import { useStore } from '../lib/store'

const RISK_ICON: Record<Risk, string> = { 'oversupply-high': '▲▲', oversupply: '▲', balanced: '●', shortage: '▼' }

export default function Insights() {
  const { listings, demands } = useStore()
  const [pid, setPid] = useState('mango')
  const p = productById(pid)
  const data = forecast(pid, listings, demands, 8)
  const gaps = gapAnalysis(listings, demands, 8)
  const mine = gaps.filter((g) => g.productId === pid)
  const worst = [...mine].sort((a, b) => b.ratio - a.ratio)[0]
  const totS = data.reduce((s, d) => s + d.supply, 0)
  const totD = data.reduce((s, d) => s + d.demand, 0)
  const months = mine
  const all = matchAll(demands, listings)

  return (
    <div className="page">
      <div className="page-h">
        <div>
          <h1><Bot size={26} className="ic" /> AI Demand Forecasting</h1>
          <p className="muted">Market-led Production — {t('“ตลาดนำการผลิต” วิเคราะห์ Demand / Supply ล่วงหน้า 8 เดือน', 'the market leads production · demand / supply analysis 8 months ahead')}</p>
        </div>
      </div>

      <div className="pills">
        {PRODUCTS.map((x) => (
          <button key={x.id} className={`chip ${pid === x.id ? 'on' : ''}`} onClick={() => setPid(x.id)}><ProductIcon id={x.id} size={22} /> {pname(x)}</button>
        ))}
      </div>

      <div className="stats">
        <Stat label={t('Supply คาดการณ์ (8 ด.)', 'Forecast supply (8 mo)')} value={`${fmt(totS)} ${ton()}`} />
        <Stat label={t('Demand คาดการณ์ (8 ด.)', 'Forecast demand (8 mo)')} value={`${fmt(totD)} ${ton()}`} />
        <Stat label={t('ส่วนต่างรวม', 'Net gap')} value={`${totS - totD > 0 ? '+' : ''}${fmt(totS - totD)} ${ton()}`} sub={totS > totD ? t('Supply มากกว่า Demand', 'Supply exceeds demand') : t('Demand มากกว่า Supply', 'Demand exceeds supply')} />
        <Stat label={t('เดือนเสี่ยงที่สุด', 'Riskiest month')} value={worst ? monthShort(worst.month) : '-'} sub={worst ? `${RISK_ICON[worst.risk]} ${riskLabel(worst.risk)} · ${worst.ratio.toFixed(2)}×` : ''} />
      </div>

      <Card title={<>1 · Demand & Supply Forecast — <ProductIcon id={p.id} size={26} /> {pname(p)}</>}>
        <ForecastChart data={data} unit={ton()} />
        {worst && worst.risk.startsWith('oversupply') && (
          <p className="callout warn">
            <TriangleAlert size={16} className="ic" />{' '}
            {t(
              `ช่วง ${monthShort(worst.month)} คาดว่า Demand ${fmt(worst.demand)} ตัน แต่ Supply ${fmt(worst.supply)} ตัน — ${pname(p)}มีความเสี่ยง Oversupply ${fmt(worst.gap)} ตัน ระบบจะแนะนำให้ชาวสวนทำสัญญาขายล่วงหน้า และส่งเกรด B/C เข้าโรงงานแปรรูป`,
              `In ${monthShort(worst.month)}, demand is forecast at ${fmt(worst.demand)} t but supply at ${fmt(worst.supply)} t — ${pname(p)} faces ${fmt(worst.gap)} t of oversupply. Growers will be advised to pre-sell and route grade B/C into processing.`,
            )}
          </p>
        )}
      </Card>

      <Card title={t('2 · Gap Analysis — ความเสี่ยงล้นตลาด / ขาดตลาด ทุกสินค้า', '2 · Gap Analysis — oversupply / shortage risk for every fruit')}>
        <div className="scroll-x">
          <table className="heat">
            <thead>
              <tr><th>{t('สินค้า', 'Fruit')}</th>{months.map((m) => <th key={m.key}>{monthShort(m.month)}</th>)}</tr>
            </thead>
            <tbody>
              {PRODUCTS.map((x) => (
                <tr key={x.id} className={x.id === pid ? 'sel' : ''} onClick={() => setPid(x.id)}>
                  <td><span className="cell-p"><ProductIcon id={x.id} size={22} /> {pname(x)}</span></td>
                  {gaps.filter((g) => g.productId === x.id).map((g) => (
                    <td key={g.key} className={`risk-${g.risk}`} title={`Supply ${fmt(g.supply)} / Demand ${fmt(g.demand)} ${ton()}`}>
                      {RISK_ICON[g.risk]} {g.ratio.toFixed(1)}×
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="legend small">
          {RISKS.map((r) => <span key={r}><i className={`risk-${r}`} />{RISK_ICON[r]} {riskLabel(r)}</span>)}
          <span className="muted">{t('ตัวเลข = Supply ÷ Demand', 'Number = supply ÷ demand')}</span>
        </div>
      </Card>

      <Card title={t('3 · Matching — ตลาดส่งความต้องการไปหาชาวสวน', '3 · Matching — the market sends demand to growers')}>
        <div className="list">
          {demands.map((d) => {
            const r = all.get(d.id)!
            const dp = productById(d.productId)
            return (
              <div key={d.id} className="match-line">
                <ProductIcon id={dp.id} size={28} />
                <span><b>{tx(d.processor, d.en?.processor)}</b> {t('ต้องการ', 'needs')} {fmt(d.qty)} {ton()} {pname(dp)} {d.grades.map((g) => <GradeBadge key={g} g={g} />)} {t('ภายใน', 'by')} {fmtDate(d.neededBy)}</span>
                <ArrowRight size={16} className="arrow" />
                <span className="muted small">{r.matches.length ? t(`จับคู่ ${r.matches.length} ราย`, `${r.matches.length} matched`) : t('ยังไม่มีผู้ขาย', 'No sellers yet')}</span>
                <span className="fill-mini"><span className="bar"><span style={{ width: `${r.fillRate * 100}%` }} /></span>{Math.round(r.fillRate * 100)}%</span>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
