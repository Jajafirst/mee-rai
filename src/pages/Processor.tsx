import { useState, type FormEvent } from 'react'
import { BusinessPicker } from '../components/BusinessPicker'
import { Card, Empty, Field, GradeBadge, Photos, ProductIcon, StatusBadge, useToast } from '../components/ui'
import { GRADES, GRADE_ROUTES, PRODUCTS, PROVINCES, fmt, fmtDate, pname, productById, prov, ton } from '../lib/catalog'
import { t, tx } from '../lib/i18n'
import { listingDate, listingGrade, matchAll } from '../lib/ai'
import { addDays } from '../lib/seed'
import { uid, useStore } from '../lib/store'
import type { Demand, Grade } from '../lib/types'

export default function Processor() {
  const { listings, demands, requests, business, addDemand, removeDemand, sendRequest } = useStore()
  const mine = demands.filter((d) => d.processor === business)
  const [toast, show] = useToast()
  const all = matchAll(demands, listings)

  return (
    <div className="page">
      <div className="page-h">
        <div>
          <h1>{t('จัดหาวัตถุดิบ · Sourcing', 'Sourcing')}</h1>
          <p className="muted">{t('ส่งความต้องการวัตถุดิบไปหาชาวสวนโดยตรง รับเกรด B / C / Residual เพื่อสร้างมูลค่าใหม่', 'Send raw-material needs straight to growers — take grade B / C / Residual and create new value')}</p>
        </div>
        <BusinessPicker />
      </div>

      <Card title={t('ประกาศความต้องการวัตถุดิบ', 'Post a raw-material request')}>
        <DemandForm business={business} onSubmit={(d) => {
          addDemand(d)
          const r = matchAll([d, ...demands], listings).get(d.id)!
          show(t(`ส่งความต้องการแล้ว — พบผู้ขาย ${r.matches.length} ราย (${Math.round(r.fillRate * 100)}%)`, `Request sent — ${r.matches.length} sellers found (${Math.round(r.fillRate * 100)}%)`))
        }} />
      </Card>

      <h2 className="sec">{t('คำสั่งซื้อวัตถุดิบ & ผลการจับคู่ (AI Matching)', 'Requests & AI matching results')}</h2>
      {mine.length === 0 && <Empty>{t('ธุรกิจนี้ยังไม่มีประกาศ — ลองประกาศความต้องการวัตถุดิบด้านบน', 'This business has no requests yet — post one above')}</Empty>}
      <div className="list">
        {mine.map((d) => {
          const p = productById(d.productId)
          const r = all.get(d.id)!
          return (
            <Card key={d.id} className="demand">
              <div className="demand-h">
                <div className="row-title">
                  <ProductIcon id={p.id} />
                  <div>
                    <b>{tx(d.processor, d.en?.processor)}</b>
                    <div className="small">
                      {t('ต้องการ', 'Needs')} <b>{fmt(d.qty)} {ton()} {pname(p)}</b> {d.grades.map((g) => <GradeBadge key={g} g={g} />)} {t('ภายใน', 'by')} <b>{fmtDate(d.neededBy)}</b>
                    </div>
                    <div className="muted small">
                      {tx(d.use, d.en?.use)} · spec: {tx(d.spec, d.en?.spec)} · ≤ {fmt(d.maxPrice)} ฿/{ton()} · {t('รับจาก', 'from')} {d.provinces.length ? d.provinces.map(prov).join(', ') : t('ทุกจังหวัด', 'any province')} · {tx(d.areaType, d.en?.areaType)}
                    </div>
                  </div>
                </div>
                <div className="fill">
                  <div className="fill-n">{Math.round(r.fillRate * 100)}%</div>
                  <div className="bar"><span style={{ width: `${r.fillRate * 100}%` }} /></div>
                  <div className="muted small">{fmt(r.filled)} / {fmt(d.qty)} {ton()}</div>
                </div>
              </div>
              {r.matches.length ? (
                <table className="tbl">
                  <thead><tr><th>{t('คะแนน', 'Score')}</th><th>{t('ผู้ขาย', 'Seller')}</th><th>{t('จังหวัด', 'Province')}</th><th>{t('เกรด', 'Grade')}</th><th>{t('จัดสรร', 'Allocated')}</th><th>{t('ราคา', 'Price')}</th><th>{t('พร้อม', 'Ready')}</th><th>{t('รูป', 'Photos')}</th><th>{t('เหตุผล', 'Why')}</th><th></th></tr></thead>
                  <tbody>
                    {r.matches.map((m) => {
                      const l = listings.find((x) => x.id === m.listingId)!
                      return (
                        <tr key={m.listingId}>
                          <td><span className="score">{m.score}</span></td>
                          <td>{tx(l.farmer, l.farmerEn)}</td>
                          <td>{prov(l.province)}</td>
                          <td><GradeBadge g={listingGrade(l)} /></td>
                          <td>{fmt(m.qty)} {ton()}</td>
                          <td>{fmt(l.targetPrice)}</td>
                          <td className="nowrap">{fmtDate(listingDate(l))}</td>
                          <td>{l.photos?.length ? <Photos srcs={l.photos} alt={l.farmer} size={36} /> : <span className="muted small">-</span>}</td>
                          <td className="muted small">{m.reasons.join(' · ')}</td>
                          <td>
                            {(() => {
                              const req = requests.find((x) => x.demandId === d.id && x.listingId === l.id)
                              if (req && req.status !== 'declined') return <StatusBadge s={req.status} />
                              return (
                                <button className="btn sm" onClick={() => {
                                  sendRequest({ id: uid(), demandId: d.id, listingId: l.id, qty: m.qty, price: Math.min(l.targetPrice, d.maxPrice), status: 'pending', createdAt: addDays(0) })
                                  show(t(`ส่งคำขอซื้อถึง ${l.farmer} แล้ว`, `Purchase request sent to ${tx(l.farmer, l.farmerEn)}`))
                                }}>{req ? t('ขอใหม่', 'Ask again') : t('ขอซื้อ', 'Request')}</button>
                              )
                            })()}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              ) : (
                <Empty>{t('ยังไม่มีผู้ขายตรงเงื่อนไข — ระบบจะแจ้งชาวสวนในพื้นที่ให้วางแผนผลิตเพื่อตอบความต้องการนี้', 'No matching sellers yet — growers in the area will be alerted to plan for this demand')}</Empty>
              )}
              <div className="right"><button className="link danger" onClick={() => removeDemand(d.id)}>{t('ลบคำสั่งซื้อ', 'Delete request')}</button></div>
            </Card>
          )
        })}
      </div>
      {toast}
    </div>
  )
}

function DemandForm({ business, onSubmit }: { business: string; onSubmit: (d: Demand) => void }) {
  const [f, setF] = useState({ productId: 'mango', qty: 20, spec: '', maxPrice: 22000, neededBy: addDays(14), areaType: '', use: '' })
  const [grades, setGrades] = useState<Grade[]>(['B'])
  const [provinces, setProvinces] = useState<string[]>([])
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) =>
    setF({ ...f, [k]: typeof f[k] === 'number' ? Number(e.target.value) : e.target.value })
  const toggle = <T,>(arr: T[], v: T) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v])
  const unit = ton()

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!grades.length) return
    onSubmit({ id: uid(), ...f, processor: business, spec: f.spec || '-', use: f.use || t('แปรรูป', 'Processing'), areaType: f.areaType || '-', grades, provinces })
  }
  return (
    <form className="form" onSubmit={submit}>
      <Field label={t('ต้องการผลไม้อะไร', 'Fruit needed')}><select value={f.productId} onChange={set('productId')}>{PRODUCTS.map((p) => <option key={p.id} value={p.id}>{pname(p)}</option>)}</select></Field>
      <Field label={t(`จำนวน (${unit})`, `Quantity (${unit})`)}><input type="number" min={1} value={f.qty} onChange={set('qty')} /></Field>
      <Field label={t(`ราคาสูงสุด (฿/${unit})`, `Max price (฿/${unit})`)}><input type="number" min={0} value={f.maxPrice} onChange={set('maxPrice')} /></Field>
      <Field label={t('ต้องการเมื่อไหร่', 'Needed by')}><input type="date" value={f.neededBy} onChange={set('neededBy')} /></Field>
      <Field label={t('นำไปทำอะไร', 'End use')}><input value={f.use} onChange={set('use')} placeholder={t('เช่น น้ำผลไม้, ผง, อาหารสัตว์', 'e.g. juice, powder, animal feed')} /></Field>
      <Field label="Specification" full><input value={f.spec} onChange={set('spec')} placeholder={t('เช่น สุก 80%, Brix ≥ 12', 'e.g. 80% ripe, Brix ≥ 12')} /></Field>
      <div className="field full">
        <span>{t('เกรดที่รับ', 'Accepted grades')}</span>
        <div className="chips">
          {GRADES.map((g) => (
            <button type="button" key={g} className={`chip ${grades.includes(g) ? 'on' : ''}`} onClick={() => setGrades(toggle(grades, g))}>
              {GRADE_ROUTES[g].label} <small>{GRADE_ROUTES[g].market}</small>
            </button>
          ))}
        </div>
      </div>
      <div className="field full">
        <span>{t('รับจากจังหวัด (ไม่เลือก = ทุกจังหวัด)', 'Source provinces (none = anywhere)')}</span>
        <div className="chips">
          {PROVINCES.map((p) => (
            <button type="button" key={p} className={`chip ${provinces.includes(p) ? 'on' : ''}`} onClick={() => setProvinces(toggle(provinces, p))}>{prov(p)}</button>
          ))}
        </div>
      </div>
      <Field label={t('ลักษณะพื้นที่ที่มองหา', 'Preferred area type')} full><input value={f.areaType} onChange={set('areaType')} placeholder={t('เช่น สวนผลไม้ภาคตะวันออก, แปลงใหญ่', 'e.g. eastern orchards, large plots')} /></Field>
      <button className="btn full" disabled={!grades.length}>{t('ส่งความต้องการไปหาชาวสวน', 'Send request to growers')}</button>
    </form>
  )
}
