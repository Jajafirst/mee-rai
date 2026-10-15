import { useState, type ChangeEvent, type FormEvent } from 'react'
import { ArrowRight, Bot, Camera, Check, Inbox, Lightbulb, ShoppingBag, TrendingUp, TriangleAlert, X } from 'lucide-react'
import { Card, Empty, Field, GradeBadge, Photos, ProductIcon, StatusBadge, useToast } from '../components/ui'
import { GRADES, GRADE_ROUTES, PRODUCTS, PROVINCES, fmt, fmtDate, gradeUses, methodName, pname, productById, prov } from '../lib/catalog'
import { t, tx } from '../lib/i18n'
import { demandsForListing, recommend, routeGrade } from '../lib/ai'
import { compressPhoto } from '../lib/photo'
import { addDays } from '../lib/seed'
import { uid, useStore } from '../lib/store'
import type { CropListing, Demand, Grade } from '../lib/types'

const MAX_PHOTOS = 4

export default function Farmer() {
  const { listings, demands, requests, orders, addListing, removeListing, answerRequest } = useStore()
  const [province, setProvince] = useState('ฉะเชิงเทรา')
  const [toast, show] = useToast()
  const recs = recommend(province, listings, demands)
  const mine = listings.filter((l) => l.province === province)
  const mineIds = new Set(mine.map((l) => l.id))
  const incoming = requests.filter((r) => mineIds.has(r.listingId))
  const pending = incoming.filter((r) => r.status === 'pending').length
  const sales = orders.flatMap((o) => o.items.filter((i) => i.kind === 'fruit' && mineIds.has(i.refId)).map((i) => ({ o, i })))

  return (
    <div className="page">
      <div className="page-h">
        <div>
          <h1>{t('ชาวสวน · Farmer Connect', 'Farmer Connect')}</h1>
          <p className="muted">{t('ลงข้อมูลผลไม้พร้อมรูปถ่าย ระบบจะจับคู่กับผู้แปรรูปและผู้ซื้อที่ต้องการทันที', 'List your fruit with photos — we match you with processors and buyers right away')}</p>
        </div>
        <Field label={t('พื้นที่ของฉัน (จังหวัด)', 'My province')}>
          <select value={province} onChange={(e) => setProvince(e.target.value)}>
            {PROVINCES.map((p) => <option key={p} value={p}>{prov(p)}</option>)}
          </select>
        </Field>
      </div>

      <div className="grid-2">
        <Card title={t('ลงประกาศผลไม้', 'List your fruit')}>
          <FruitForm province={province} onError={show} onSubmit={(l) => { addListing(l); show(t('ลงประกาศแล้ว — ระบบกำลังจับคู่ผู้ซื้อ', 'Listed — matching buyers now')) }} />
        </Card>

        <Card title={<><Bot size={18} className="ic" /> AI Production Recommendation <small className="muted">· {prov(province)}</small></>}>
          {recs.length === 0 ? <Empty>{t('ยังไม่มีคำแนะนำสำหรับพื้นที่นี้ ลองลงประกาศผลผลิตก่อน', 'No advice for this area yet — try listing a harvest first')}</Empty> : (
            <ul className="recs">
              {recs.map((r, i) => (
                <li key={i} className={`rec rec-${r.tone}`}>
                  <b className="rec-t">{r.tone === 'warn' ? <TriangleAlert size={16} /> : r.tone === 'good' ? <TrendingUp size={16} /> : <Lightbulb size={16} />}<ProductIcon id={r.productId} size={22} />{r.title}</b>
                  <p>{r.detail}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card title={<><Inbox size={18} className="ic" /> {t('คำขอซื้อจากผู้ประกอบการ', 'Purchase requests from businesses')} {pending > 0 && <span className="count">{pending}</span>}</>}>
        {incoming.length === 0 ? <Empty>{t('ยังไม่มีคำขอซื้อ — เมื่อ AI จับคู่ผลไม้ของคุณ ผู้ประกอบการจะส่งคำขอมาที่นี่', 'No requests yet — when AI matches your fruit, businesses send requests here')}</Empty> : (
          <div className="list">
            {incoming.map((r) => {
              const l = listings.find((x) => x.id === r.listingId)!
              const d = demands.find((x) => x.id === r.demandId)
              return (
                <div key={r.id} className="req">
                  <ProductIcon id={l.productId} size={36} />
                  <div className="req-b">
                    <b>{d ? tx(d.processor, d.en?.processor) : '-'}</b>
                    <div className="small">
                      {t('ขอซื้อ', 'wants')} <b>{fmt(r.qty)} {t('ตัน', 't')} {pname(l.productId)}</b> <GradeBadge g={l.grade} /> · {fmt(r.price)} ฿/{t('ตัน', 't')} · {t('รวม', 'total')} <b>{fmt(r.qty * r.price)} ฿</b>
                    </div>
                    <div className="muted small">{d && <>{tx(d.use, d.en?.use)} · {t('ต้องการภายใน', 'needed by')} {fmtDate(d.neededBy)} · </>}{tx(l.farmer, l.farmerEn)}</div>
                  </div>
                  {r.status === 'pending' ? (
                    <div className="req-act">
                      <button className="btn sm" onClick={() => { answerRequest(r.id, 'accepted'); show(t('ตอบรับแล้ว — ผู้ประกอบการจะได้รับแจ้ง', 'Accepted — the business has been notified')) }}><Check size={14} /> {t('ตอบรับ', 'Accept')}</button>
                      <button className="btn sm ghost" onClick={() => answerRequest(r.id, 'declined')}>{t('ปฏิเสธ', 'Decline')}</button>
                    </div>
                  ) : <StatusBadge s={r.status} />}
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {sales.length > 0 && (
        <Card title={<><ShoppingBag size={18} className="ic" /> {t('คำสั่งซื้อจากผู้บริโภค', 'Orders from customers')}</>}>
          <table className="tbl">
            <thead><tr><th>{t('วันที่', 'Date')}</th><th>{t('สินค้า', 'Item')}</th><th>{t('จำนวน', 'Qty')}</th><th>{t('ยอด', 'Amount')}</th><th>{t('สถานะ', 'Status')}</th></tr></thead>
            <tbody>
              {sales.map(({ o, i }, k) => {
                const l = listings.find((x) => x.id === i.refId)!
                return (
                  <tr key={k}>
                    <td className="nowrap">{fmtDate(o.createdAt)}</td>
                    <td>{pname(l.productId)} <GradeBadge g={l.grade} /></td>
                    <td>{fmt(i.qty)} {t('กก.', 'kg')}</td>
                    <td>{fmt(i.qty * i.price)} ฿</td>
                    <td><StatusBadge s={o.status} /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>
      )}

      <Card title={t(`ผลไม้ในพื้นที่ ${province} (${mine.length})`, `Fruit listed in ${prov(province)} (${mine.length})`)}>
        {mine.length === 0 ? <Empty>{t(`ยังไม่มีประกาศใน ${province}`, `No listings in ${prov(province)} yet`)}</Empty> : (
          <div className="list">
            {mine.map((l) => <ListingRow key={l.id} l={l} demands={demands} onRemove={() => removeListing(l.id)} />)}
          </div>
        )}
      </Card>
      {toast}
    </div>
  )
}

function ListingRow({ l, demands, onRemove }: { l: CropListing; demands: Demand[]; onRemove: () => void }) {
  const p = productById(l.productId)
  const buyers = demandsForListing(l, demands)
  const route = routeGrade(l.productId, l.grade, demands)
  return (
    <article className="row">
      <div className="row-main">
        <div className="row-title">
          <ProductIcon id={p.id} />
          <div>
            <b>{pname(p)}</b> <GradeBadge g={l.grade} />
            <div className="muted small">
              {tx(l.farmer, l.farmerEn)} · {fmt(l.qty)} {t('ตัน', 't')} · {t('เก็บเกี่ยว', 'harvest')} {fmtDate(l.harvestDate)} · {fmt(l.targetPrice)} ฿/{t('ตัน', 't')} · {l.areaRai} {t('ไร่', 'rai')} · {methodName(l.method)}
            </div>
          </div>
        </div>
        {l.photos?.length ? <Photos srcs={l.photos} alt={`${pname(p)} — ${tx(l.farmer, l.farmerEn)}`} /> : null}
        <div className="route-chip"><ArrowRight size={13} /> {route.route.market}</div>
      </div>
      <div className="row-side">
        {buyers.length ? (
          <>
            <div className="small"><b>{t(`จับคู่ได้ ${buyers.length} ผู้ซื้อ`, `${buyers.length} buyer match${buyers.length > 1 ? 'es' : ''}`)}</b></div>
            {buyers.slice(0, 2).map(({ d, m }) => (
              <div key={d.id} className="match">
                <span className="score">{m!.score}</span>
                <span>{tx(d.processor, d.en?.processor)}<br /><small className="muted">{t('ต้องการ', 'needs')} {fmt(d.qty)} {t('ตัน', 't')} · ≤ {fmt(d.maxPrice)} ฿ · {t('ภายใน', 'by')} {fmtDate(d.neededBy)}</small></span>
              </div>
            ))}
          </>
        ) : (
          <div className="small muted">{t('ยังไม่มีผู้ซื้อตรงเงื่อนไข — แนะนำช่องทาง', 'No matching buyer yet — suggested channels')}: {gradeUses(l.grade).join(', ')}</div>
        )}
        <button className="link danger" onClick={onRemove}>{t('ลบ', 'Delete')}</button>
      </div>
    </article>
  )
}

function FruitForm({ province, onSubmit, onError }: { province: string; onSubmit: (l: CropListing) => void; onError: (m: string) => void }) {
  const blank = { productId: 'mango', farmer: '', areaRai: 10, qty: 10, harvestDate: addDays(14), grade: 'B' as Grade, targetPrice: 20000, method: 'GAP' as CropListing['method'] }
  const [f, setF] = useState(blank)
  const [photos, setPhotos] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) =>
    setF({ ...f, [k]: typeof f[k] === 'number' ? Number(e.target.value) : e.target.value })
  const est = routeGrade(f.productId, f.grade, [])

  const addPhotos = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).filter((x) => x.type.startsWith('image/'))
    e.target.value = ''
    const room = MAX_PHOTOS - photos.length
    if (files.length > room) onError(t(`อัปโหลดได้สูงสุด ${MAX_PHOTOS} รูป`, `Up to ${MAX_PHOTOS} photos`))
    setBusy(true)
    try {
      const out = await Promise.all(files.slice(0, room).map((x) => compressPhoto(x)))
      setPhotos((cur) => [...cur, ...out].slice(0, MAX_PHOTOS))
    } catch {
      onError(t('อ่านไฟล์รูปไม่ได้ ลองใช้ไฟล์ JPG หรือ PNG', "Couldn't read that image — try a JPG or PNG"))
    } finally {
      setBusy(false)
    }
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    onSubmit({ id: uid(), type: 'crop', ...f, farmer: f.farmer || t('ชาวสวน (ฉัน)', 'Grower (me)'), province, photos })
    setF(blank)
    setPhotos([])
  }

  return (
    <form className="form" onSubmit={submit}>
      <Field label={t('ผลไม้อะไร', 'Fruit')}><select value={f.productId} onChange={set('productId')}>{PRODUCTS.map((p) => <option key={p.id} value={p.id}>{pname(p)}</option>)}</select></Field>
      <Field label={t('ชื่อชาวสวน / สวน', 'Grower / orchard name')}><input value={f.farmer} onChange={set('farmer')} placeholder={t('เช่น สวนลุงสมชาย', "e.g. Uncle Somchai's Orchard")} /></Field>
      <Field label={t('พื้นที่ (ไร่)', 'Area (rai)')}><input type="number" min={0} value={f.areaRai} onChange={set('areaRai')} /></Field>
      <Field label={t('ปริมาณคาดการณ์ (ตัน)', 'Expected volume (t)')}><input type="number" min={0} step="0.5" value={f.qty} onChange={set('qty')} /></Field>
      <Field label={t('วันเก็บเกี่ยว', 'Harvest date')}><input type="date" value={f.harvestDate} onChange={set('harvestDate')} /></Field>
      <Field label={t('คุณภาพ / เกรด', 'Quality / grade')}>
        <select value={f.grade} onChange={set('grade')}>{GRADES.map((g) => <option key={g} value={g}>{GRADE_ROUTES[g].label} — {GRADE_ROUTES[g].market}</option>)}</select>
      </Field>
      <Field label={t('ราคาเป้าหมาย (฿/ตัน)', 'Target price (฿/t)')}><input type="number" min={0} value={f.targetPrice} onChange={set('targetPrice')} /></Field>
      <Field label={t('วิธีผลิต', 'Farming method')}><select value={f.method} onChange={set('method')}>{(['อินทรีย์', 'GAP', 'ทั่วไป'] as const).map((m) => <option key={m} value={m}>{methodName(m)}</option>)}</select></Field>

      <div className="field full">
        <span>{t('รูปผลผลิต', 'Photos')} ({photos.length}/{MAX_PHOTOS}) — {t('ช่วยให้ผู้ซื้อเห็นคุณภาพจริง', 'help buyers see the real quality')}</span>
        <div className="uploader">
          {photos.map((src, i) => (
            <div key={i} className="thumb">
              <img src={src} alt={t(`รูปที่ ${i + 1}`, `Photo ${i + 1}`)} />
              <button type="button" aria-label={t('ลบรูป', 'Remove photo')} onClick={() => setPhotos(photos.filter((_, j) => j !== i))}><X size={14} /></button>
            </div>
          ))}
          {photos.length < MAX_PHOTOS && (
            <label className={`add-photo ${busy ? 'busy' : ''}`}>
              <Camera size={22} />
              <small>{busy ? t('กำลังโหลด…', 'Loading…') : t('ถ่าย / เลือกรูป', 'Take / choose')}</small>
              <input type="file" accept="image/*" multiple onChange={addPhotos} disabled={busy} />
            </label>
          )}
        </div>
      </div>

      <p className="hint full"><Lightbulb size={15} className="ic" /> {t('ราคาตลาดอ้างอิงเกรดนี้', 'Reference price for this grade')} ≈ {fmt(est.estPrice)} ฿/{t('ตัน', 't')} · {t('ปลายทางที่เหมาะ', 'best channels')}: {gradeUses(f.grade).join(', ')}</p>
      <button className="btn full" disabled={busy}>{t('ลงประกาศ', 'Post listing')} · {prov(province)}</button>
    </form>
  )
}
