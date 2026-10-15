import { ClipboardList, Leaf } from 'lucide-react'
import { bizLabel } from '../components/BusinessPicker'
import { Card, Empty, ProductIcon, Stat, StatusBadge } from '../components/ui'
import { fmt, fmtDate, goodsName, pname } from '../lib/catalog'
import { t, tx } from '../lib/i18n'
import { useStore } from '../lib/store'
import type { Page } from '../App'

export default function Orders({ go }: { go: (p: Page) => void }) {
  const { orders, listings, goods, demands } = useStore()
  const spent = orders.reduce((s, o) => s + o.total, 0)
  // fruit kept out of the waste stream: fresh kg + ~0.5 kg fruit per processed item from non-A grades
  const rescuedKg = orders.flatMap((o) => o.items).reduce((s, i) => {
    if (i.kind === 'fruit') return s + (listings.find((l) => l.id === i.refId)?.grade !== 'A' ? i.qty : 0)
    return s + (goods.find((g) => g.id === i.refId)?.fromGrade !== 'A' ? i.qty * 0.5 : 0)
  }, 0)

  return (
    <div className="page">
      <div className="page-h">
        <div>
          <h1><ClipboardList size={26} className="ic" /> {t('คำสั่งซื้อของฉัน', 'My orders')}</h1>
          <p className="muted">{t('ติดตามคำสั่งซื้อ และดูว่าคุณช่วยลดของเสียไปเท่าไร', 'Track your orders and see how much waste you helped prevent')}</p>
        </div>
      </div>

      <div className="stats">
        <Stat label={t('คำสั่งซื้อทั้งหมด', 'Orders')} value={orders.length} />
        <Stat label={t('ยอดซื้อรวม', 'Total spent')} value={`${fmt(spent)} ฿`} />
        <Stat label={t('ผลไม้นอกเกรดที่ช่วยไว้', 'Off-grade fruit rescued')} value={<><Leaf size={20} className="ic" /> {fmt(rescuedKg)} {t('กก.', 'kg')}</>} />
      </div>

      {orders.length === 0 ? (
        <Empty>{t('ยังไม่มีคำสั่งซื้อ', 'No orders yet')} · <button className="link" onClick={() => go('consumer')}>{t('ไปที่ตลาด', 'Go to market')}</button></Empty>
      ) : (
        <div className="list">
          {orders.map((o) => (
            <Card key={o.id} title={<>#{o.id.toUpperCase()} · {fmtDate(o.createdAt)}</>} action={<StatusBadge s={o.status} />}>
              <ul className="order-items">
                {o.items.map((i, k) => {
                  const l = i.kind === 'fruit' ? listings.find((x) => x.id === i.refId) : undefined
                  const g = i.kind === 'goods' ? goods.find((x) => x.id === i.refId) : undefined
                  const pid = l?.productId ?? g?.productId
                  return (
                    <li key={k}>
                      {pid && <ProductIcon id={pid} size={32} />}
                      <span>
                        <b>{l ? pname(l.productId) : g ? goodsName(g) : '-'}</b>
                        <br /><small className="muted">{l ? tx(l.farmer, l.farmerEn) : g ? bizLabel(g.maker, demands, goods) : ''}</small>
                      </span>
                      <span className="muted">{fmt(i.qty)} {i.kind === 'fruit' ? t('กก.', 'kg') : t('ชิ้น', 'pcs')} × {fmt(i.price)} ฿</span>
                      <b>{fmt(i.qty * i.price)} ฿</b>
                    </li>
                  )
                })}
              </ul>
              <div className="cart-total"><span>{t('รวม', 'Total')}</span><b>{fmt(o.total)} ฿</b></div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
