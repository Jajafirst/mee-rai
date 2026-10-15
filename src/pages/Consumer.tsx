import { useState } from 'react'
import { Flame, Leaf, ShoppingCart, Trash2 } from 'lucide-react'
import { bizLabel } from '../components/BusinessPicker'
import { Card, Empty, GradeBadge, Photos, ProductIcon, Tabs, useToast } from '../components/ui'
import { fmt, fmtDate, goodsName, goodsPack, methodName, pname, productById, prov, retailPerKg } from '../lib/catalog'
import { t, tx } from '../lib/i18n'
import { listingDate, listingGrade, trends } from '../lib/ai'
import { useStore } from '../lib/store'
import type { Page } from '../App'

export default function Consumer({ go }: { go: (p: Page) => void }) {
  const { listings, demands, goods, cart, addToCart, removeFromCart, checkout } = useStore()
  const [toast, show] = useToast()
  const [tab, setTab] = useState<'fruit' | 'goods'>('fruit')
  const [filter, setFilter] = useState<string>('all')
  const tr = trends(listings, demands)
  const discountOf = (pid: string) => tr.find((x) => x.p.id === pid)?.discount ?? 0
  const fruit = listings.filter((l) => listingGrade(l) !== 'R' && (filter === 'all' || l.productId === filter))
  const made = goods.filter((g) => g.stock > 0 && (filter === 'all' || g.productId === filter))
  const total = cart.reduce((s, c) => s + c.qty * c.price, 0)
  const kg = t('กก.', 'kg')

  const itemName = (kind: 'fruit' | 'goods', id: string) => {
    if (kind === 'fruit') {
      const l = listings.find((x) => x.id === id)
      return l ? `${pname(l.productId)} · ${tx(l.farmer, l.farmerEn)}` : '-'
    }
    const g = goods.find((x) => x.id === id)
    return g ? `${goodsName(g)} · ${goodsPack(g)}` : '-'
  }

  return (
    <div className="page">
      <div className="page-h">
        <div>
          <h1>{t('ตลาด · Surplus Market', 'Surplus Market')}</h1>
          <p className="muted">{t('ผลไม้สดตรงจากสวน และสินค้าแปรรูปที่ช่วยลดของเสีย — ผลไม้ทุกเกรดมีคุณค่า', 'Fresh fruit direct from orchards, and products that rescue surplus — every grade has value')}</p>
        </div>
      </div>

      <div className="market">
        <div className="market-main">
          <Card title={<><Flame size={18} className="ic hot" /> {t('เทรนด์ & ดีลช่วยชาวสวน (AI แนะนำ)', 'Trends & grower-support deals (AI picks)')}</>}>
            <div className="trend-row">
              {tr.slice(0, 6).map(({ p, ratio, discount }) => (
                <button key={p.id} className={`trend ${filter === p.id ? 'on' : ''}`} onClick={() => setFilter(filter === p.id ? 'all' : p.id)}>
                  <ProductIcon id={p.id} />
                  <b>{pname(p)}</b>
                  {discount > 0
                    ? <span className="deal">{t(`ลด ${discount}%`, `${discount}% off`)}</span>
                    : <span className="muted small">{ratio < 0.85 ? t('กำลังมาแรง', 'Trending') : t('ราคาปกติ', 'Regular price')}</span>}
                </button>
              ))}
            </div>
            <p className="muted small">{t('ส่วนลดคำนวณจาก Gap Analysis — ผลไม้ที่ Supply สูงกว่า Demand จะได้ราคาพิเศษ เพื่อระบายก่อนเสียหาย', 'Discounts come from Gap Analysis — fruit with supply above demand gets a special price so it sells before it spoils')}</p>
          </Card>

          <div className="market-bar">
            <Tabs value={tab} onChange={setTab} items={[
              { id: 'fruit', label: <>{t('ผลไม้สดจากสวน', 'Fresh fruit')} <small className="muted">({fruit.length})</small></> },
              { id: 'goods', label: <>{t('สินค้าแปรรูป', 'Processed products')} <small className="muted">({made.length})</small></> },
            ]} />
            {filter !== 'all' && <button className="link" onClick={() => setFilter('all')}>{pname(filter)} · {t('ดูทั้งหมด', 'show all')}</button>}
          </div>

          {tab === 'fruit' ? (
            <>
              {fruit.length === 0 && <Empty>{t('ไม่มีสินค้าในหมวดนี้', 'Nothing in this category')}</Empty>}
              <div className="products">
                {fruit.map((l) => {
                  const p = productById(l.productId)
                  const base = retailPerKg(l)
                  const disc = discountOf(l.productId)
                  const price = Math.round(base * (1 - disc / 100))
                  return (
                    <article key={l.id} className="product">
                      <div className="product-img">{l.photos?.length ? <img src={l.photos[0]} alt={`${pname(p)} — ${tx(l.farmer, l.farmerEn)}`} /> : <ProductIcon id={p.id} size={72} />}{disc > 0 && <span className="deal">-{disc}%</span>}</div>
                      <div className="product-b">
                        <b>{pname(p)}</b> <GradeBadge g={listingGrade(l)} />
                        <div className="muted small">{tx(l.farmer, l.farmerEn)} · {prov(l.province)}</div>
                        <div className="muted small">{t('พร้อมส่ง', 'Ships')} {fmtDate(listingDate(l))} · {methodName(l.method)}</div>
                        {l.photos && l.photos.length > 1 && <Photos srcs={l.photos} alt={pname(p)} size={40} />}
                        <div className="price">{disc > 0 && <s className="muted">{fmt(base)}</s>} <b>{fmt(price)} ฿</b><small>/{kg}</small></div>
                        <button className="btn sm" onClick={() => { addToCart({ kind: 'fruit', refId: l.id, qty: 1, price }); show(t(`เพิ่ม ${pname(p)} 1 กก. ลงตะกร้าแล้ว`, `Added 1 kg ${pname(p)} to cart`)) }}>{t('เพิ่มลงตะกร้า', 'Add to cart')}</button>
                      </div>
                    </article>
                  )
                })}
              </div>
            </>
          ) : (
            <>
              {made.length === 0 && <Empty>{t('ไม่มีสินค้าในหมวดนี้', 'Nothing in this category')}</Empty>}
              <div className="products">
                {made.map((g) => (
                  <article key={g.id} className="product">
                    <div className="product-img">{g.photo ? <img src={g.photo} alt={goodsName(g)} /> : <ProductIcon id={g.productId} size={72} />}{g.fromGrade !== 'A' && <span className="rescue"><Leaf size={12} /> {t('ช่วยลดของเสีย', 'Rescues waste')}</span>}</div>
                    <div className="product-b">
                      <b>{goodsName(g)}</b>
                      <div className="muted small">{bizLabel(g.maker, demands, goods)}</div>
                      <div className="muted small">{goodsPack(g)} · {t('จาก', 'from')} {pname(g.productId)} <GradeBadge g={g.fromGrade} /></div>
                      <div className="price"><b>{fmt(g.price)} ฿</b></div>
                      <button className="btn sm" onClick={() => { addToCart({ kind: 'goods', refId: g.id, qty: 1, price: g.price }); show(t(`เพิ่ม ${goodsName(g)} ลงตะกร้าแล้ว`, `Added ${goodsName(g)} to cart`)) }}>{t('เพิ่มลงตะกร้า', 'Add to cart')}</button>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>

        <aside className="cart-panel card">
          <h3><ShoppingCart size={18} className="ic" /> {t('ตะกร้า', 'Cart')} ({cart.length})</h3>
          {cart.length === 0 ? <p className="muted small">{t('ยังไม่มีสินค้าในตะกร้า', 'Your cart is empty')}</p> : (
            <ul className="cart-list">
              {cart.map((c, i) => (
                <li key={i}>
                  <span>{itemName(c.kind, c.refId)}<br /><small className="muted">{fmt(c.qty)} {c.kind === 'fruit' ? kg : t('ชิ้น', 'pcs')} × {fmt(c.price)} ฿</small></span>
                  <b>{fmt(c.qty * c.price)} ฿</b>
                  <button className="icon-btn" aria-label={t('ลบ', 'Remove')} onClick={() => removeFromCart(i)}><Trash2 size={15} /></button>
                </li>
              ))}
            </ul>
          )}
          <div className="cart-total"><span>{t('รวม', 'Total')}</span><b>{fmt(total)} ฿</b></div>
          <button className="btn" disabled={!cart.length} onClick={() => { if (checkout()) { show(t('สั่งซื้อสำเร็จ ขอบคุณที่ช่วยชาวสวนไทย', 'Order placed — thank you for supporting Thai growers')); go('orders') } }}>{t('สั่งซื้อ', 'Place order')}</button>
        </aside>
      </div>
      {toast}
    </div>
  )
}
