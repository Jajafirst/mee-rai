import { useEffect, useState } from 'react'
import { ChartColumn, ClipboardList, Factory, House, Package, Recycle, ShoppingBasket, Tractor, type LucideIcon } from 'lucide-react'
import { LangSwitch, Logo } from './components/ui'
import { t } from './lib/i18n'
import { useStore } from './lib/store'
import type { Role } from './lib/types'
import Consumer from './pages/Consumer'
import Farmer from './pages/Farmer'
import Goods from './pages/Goods'
import Home from './pages/Home'
import Insights from './pages/Insights'
import Orders from './pages/Orders'
import Processor from './pages/Processor'
import Routing from './pages/Routing'

export type Page = 'home' | 'farmer' | 'processor' | 'goods' | 'consumer' | 'orders' | 'insights' | 'routing'

const PAGES: Record<Page, { icon: LucideIcon; label: () => string }> = {
  home: { icon: House, label: () => t('หน้าแรก', 'Home') },
  farmer: { icon: Tractor, label: () => t('สวนของฉัน', 'My orchard') },
  processor: { icon: Factory, label: () => t('จัดหาวัตถุดิบ', 'Sourcing') },
  goods: { icon: Package, label: () => t('สินค้าของฉัน', 'My products') },
  consumer: { icon: ShoppingBasket, label: () => t('ตลาด', 'Market') },
  orders: { icon: ClipboardList, label: () => t('คำสั่งซื้อ', 'My orders') },
  insights: { icon: ChartColumn, label: () => 'AI Forecast' },
  routing: { icon: Recycle, label: () => 'Routing' },
}

/** Menu per role — each role only sees the screens it works with. */
export const ROLE_PAGES: Record<Role, Page[]> = {
  farmer: ['farmer', 'insights', 'routing'],
  business: ['processor', 'goods', 'insights', 'routing'],
  consumer: ['consumer', 'orders'],
}

export const ROLES: Record<Role, { icon: LucideIcon; label: () => string }> = {
  farmer: { icon: Tractor, label: () => t('ชาวสวน', 'Grower') },
  business: { icon: Factory, label: () => t('ผู้ประกอบการ', 'Business') },
  consumer: { icon: ShoppingBasket, label: () => t('ผู้บริโภค', 'Customer') },
}

const fromHash = (): Page => {
  const h = location.hash.slice(1)
  return h in PAGES ? (h as Page) : 'home'
}

export default function App() {
  const [hashPage, setPage] = useState<Page>(fromHash)
  const { role, reset, storageFull } = useStore()
  useEffect(() => {
    const on = () => { setPage(fromHash()); scrollTo(0, 0) }
    addEventListener('hashchange', on)
    return () => removeEventListener('hashchange', on)
  }, [])
  const go = (p: Page) => {
    location.hash = p
  }

  const menu: Page[] = role ? ['home', ...ROLE_PAGES[role]] : ['home']
  // a page outside the current role's menu falls back to home (role picker)
  const page = menu.includes(hashPage) ? hashPage : 'home'
  const R = role ? ROLES[role] : null

  return (
    <>
      <header className="top">
        <button className="brand" onClick={() => go('home')}>
          <Logo />
          <span><b>มีไร่</b> MEERAI</span>
        </button>
        <nav className="nav">
          {menu.map((id) => {
            const P = PAGES[id]
            return (
              <button key={id} className={page === id ? 'on' : ''} onClick={() => go(id)}>
                <P.icon size={18} strokeWidth={1.9} />{P.label()}
              </button>
            )
          })}
        </nav>
        {R && (
          <button className="role-chip" title={t('เปลี่ยนบทบาท', 'Switch role')} onClick={() => go('home')}>
            <R.icon size={16} /> {R.label()}
          </button>
        )}
        <LangSwitch />
      </header>
      <main>
        {storageFull && <div className="banner">{t('พื้นที่เก็บข้อมูลในเบราว์เซอร์เต็ม (รูปถ่ายเยอะเกินไป) — ข้อมูลล่าสุดจะหายเมื่อรีเฟรช ลองลบประกาศที่มีรูปบางรายการ', 'Browser storage is full (too many photos) — recent changes will be lost on refresh. Try deleting some listings with photos.')}</div>}
        {page === 'home' && <Home go={go} />}
        {page === 'farmer' && <Farmer />}
        {page === 'processor' && <Processor />}
        {page === 'goods' && <Goods />}
        {page === 'consumer' && <Consumer go={go} />}
        {page === 'orders' && <Orders go={go} />}
        {page === 'insights' && <Insights />}
        {page === 'routing' && <Routing />}
      </main>
      <footer className="foot muted small">
        มีไร่ / MEERAI · Sustainable Food Chain Connection · {t('ต้นแบบ', 'Prototype')} ·{' '}
        <button className="link" onClick={reset}>{t('รีเซ็ตข้อมูลตัวอย่าง', 'Reset demo data')}</button>
      </footer>
    </>
  )
}
