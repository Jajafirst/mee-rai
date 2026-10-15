import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Camera, Package, ShoppingBag, X } from 'lucide-react'
import { BusinessPicker, bizLabel } from '../components/BusinessPicker'
import { Card, Empty, Field, GradeBadge, ProductIcon, Stat, StatusBadge, useToast } from '../components/ui'
import { GRADES, GRADE_ROUTES, PRODUCTS, fmt, fmtDate, goodsName, goodsPack, pname } from '../lib/catalog'
import { t } from '../lib/i18n'
import { compressPhoto } from '../lib/photo'
import { uid, useStore } from '../lib/store'
import type { Goods as GoodsT, Grade } from '../lib/types'

export default function Goods() {
  const { goods, orders, demands, business, addGoods, removeGoods } = useStore()
  const [toast, show] = useToast()
  const mine = goods.filter((g) => g.maker === business)
  const ids = new Set(mine.map((g) => g.id))
  const sales = orders.flatMap((o) => o.items.filter((i) => i.kind === 'goods' && ids.has(i.refId)).map((i) => ({ o, i })))
  const revenue = sales.reduce((s, { i }) => s + i.qty * i.price, 0)

  return (
    <div className="page">
      <div className="page-h">
        <div>
          <h1><Package size={26} className="ic" /> {t('สินค้าของฉัน', 'My products')}</h1>
          <p className="muted">{t('ขายสินค้าที่แปรรูปจากผลไม้นอกเกรดให้ผู้บริโภคโดยตรง — ปิดวงจร Circular Market', 'Sell products made from off-grade fruit straight to customers — closing the circular market loop')}</p>
        </div>
        <BusinessPicker />
      </div>

      <div className="stats">
        <Stat label={t('สินค้าที่วางขาย', 'Products listed')} value={mine.length} sub={bizLabel(business, demands, goods)} />
        <Stat label={t('ยอดขาย', 'Sales')} value={`${fmt(revenue)} ฿`} sub={t(`${sales.length} รายการ`, `${sales.length} order lines`)} />
        <Stat label={t('ใช้ผลไม้นอกเกรด A', 'Uses non-grade-A fruit')} value={`${mine.filter((g) => g.fromGrade !== 'A').length} / ${mine.length}`} />
      </div>

      <div className="grid-2">
        <Card title={t('เพิ่มสินค้าใหม่', 'Add a product')}>
          <GoodsForm onError={show} onSubmit={(g) => { addGoods({ ...g, maker: business }); show(t('วางขายในตลาดแล้ว', 'Now on sale in the market')) }} />
        </Card>
        <Card title={<><ShoppingBag size={18} className="ic" /> {t('คำสั่งซื้อจากผู้บริโภค', 'Orders from customers')}</>}>
          {sales.length === 0 ? <Empty>{t('ยังไม่มีคำสั่งซื้อ', 'No orders yet')}</Empty> : (
            <table className="tbl">
              <thead><tr><th>{t('วันที่', 'Date')}</th><th>{t('สินค้า', 'Item')}</th><th>{t('จำนวน', 'Qty')}</th><th>{t('ยอด', 'Amount')}</th><th>{t('สถานะ', 'Status')}</th></tr></thead>
              <tbody>
                {sales.map(({ o, i }, k) => {
                  const g = goods.find((x) => x.id === i.refId)!
                  return (
                    <tr key={k}>
                      <td className="nowrap">{fmtDate(o.createdAt)}</td>
                      <td>{goodsName(g)}</td>
                      <td>{fmt(i.qty)}</td>
                      <td>{fmt(i.qty * i.price)} ฿</td>
                      <td><StatusBadge s={o.status} /></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </Card>
      </div>

      <h2 className="sec">{t('สินค้าที่วางขาย', 'On sale')}</h2>
      {mine.length === 0 && <Empty>{t('ยังไม่มีสินค้า — เพิ่มสินค้าแรกด้านบน', 'No products yet — add your first one above')}</Empty>}
      <div className="products">
        {mine.map((g) => (
          <article key={g.id} className="product">
            <div className="product-img">{g.photo ? <img src={g.photo} alt={goodsName(g)} /> : <ProductIcon id={g.productId} size={72} />}</div>
            <div className="product-b">
              <b>{goodsName(g)}</b>
              <div className="muted small">{goodsPack(g)} · {t('จาก', 'from')} {pname(g.productId)} <GradeBadge g={g.fromGrade} /></div>
              <div className="price"><b>{fmt(g.price)} ฿</b></div>
              <div className={`small ${g.stock < 30 ? 'low' : 'muted'}`}>{t('คงเหลือ', 'In stock')} {fmt(g.stock)}</div>
              <button className="link danger" onClick={() => removeGoods(g.id)}>{t('เลิกขาย', 'Remove')}</button>
            </div>
          </article>
        ))}
      </div>
      {toast}
    </div>
  )
}

function GoodsForm({ onSubmit, onError }: { onSubmit: (g: GoodsT) => void; onError: (m: string) => void }) {
  const blank = { name: '', productId: 'mango', fromGrade: 'C' as Grade, pack: '', price: 50, stock: 100 }
  const [f, setF] = useState(blank)
  const [photo, setPhoto] = useState<string>()
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) =>
    setF({ ...f, [k]: typeof f[k] === 'number' ? Number(e.target.value) : e.target.value })

  const pick = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try { setPhoto(await compressPhoto(file)) } catch { onError(t('อ่านไฟล์รูปไม่ได้', "Couldn't read that image")) }
  }
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!f.name.trim()) return
    onSubmit({ id: uid(), maker: '', ...f, pack: f.pack || t('ชิ้น', 'piece'), photo })
    setF(blank)
    setPhoto(undefined)
  }
  return (
    <form className="form" onSubmit={submit}>
      <Field label={t('ชื่อสินค้า', 'Product name')} full><input required value={f.name} onChange={set('name')} placeholder={t('เช่น น้ำมะม่วงสกัดเย็น', 'e.g. Cold-pressed mango juice')} /></Field>
      <Field label={t('ทำจากผลไม้', 'Made from')}><select value={f.productId} onChange={set('productId')}>{PRODUCTS.map((p) => <option key={p.id} value={p.id}>{pname(p)}</option>)}</select></Field>
      <Field label={t('ใช้ผลไม้เกรด', 'Fruit grade used')}><select value={f.fromGrade} onChange={set('fromGrade')}>{GRADES.map((g) => <option key={g} value={g}>{GRADE_ROUTES[g].label} — {GRADE_ROUTES[g].market}</option>)}</select></Field>
      <Field label={t('ขนาดบรรจุ', 'Pack size')}><input value={f.pack} onChange={set('pack')} placeholder={t('เช่น ขวด 250 มล.', 'e.g. 250 ml bottle')} /></Field>
      <Field label={t('ราคา (฿)', 'Price (฿)')}><input type="number" min={1} value={f.price} onChange={set('price')} /></Field>
      <Field label={t('จำนวนในสต็อก', 'Stock')}><input type="number" min={0} value={f.stock} onChange={set('stock')} /></Field>
      <div className="field">
        <span>{t('รูปสินค้า', 'Photo')}</span>
        <div className="uploader">
          {photo ? (
            <div className="thumb"><img src={photo} alt="" /><button type="button" aria-label={t('ลบรูป', 'Remove photo')} onClick={() => setPhoto(undefined)}><X size={14} /></button></div>
          ) : (
            <label className="add-photo"><Camera size={22} /><small>{t('เลือกรูป', 'Choose')}</small><input type="file" accept="image/*" onChange={pick} /></label>
          )}
        </div>
      </div>
      <button className="btn full" disabled={!f.name.trim()}>{t('วางขายในตลาด', 'Put on sale')}</button>
    </form>
  )
}
