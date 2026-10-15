import { useState, type ReactNode } from 'react'
import { GRADE_ROUTES, productById } from '../lib/catalog'
import { t, useLang, type Lang } from '../lib/i18n'
import type { Grade } from '../lib/types'

export function Logo({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <defs>
        <linearGradient id="lg-teal" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#2a8f8a" />
          <stop offset="1" stopColor="#1f6f6a" />
        </linearGradient>
        <linearGradient id="lg-leaf" x1="0" x2="1" y1="1" y2="0">
          <stop offset="0" stopColor="#b9a24a" />
          <stop offset="1" stopColor="#4c9a3b" />
        </linearGradient>
      </defs>
      <path d="M8 34c0-12 8-20 15-20 9 0 13 12 9 22-4 10-12 16-18 12-4-3-6-8-6-14z" fill="none" stroke="url(#lg-teal)" strokeWidth="7" strokeLinecap="round" />
      <path d="M30 40C34 22 44 10 60 6c-2 16-10 30-24 36-3 1-6 0-6-2z" fill="url(#lg-leaf)" />
      <path d="M36 50c6 0 12-6 14-16" fill="none" stroke="#b9a24a" strokeWidth="5" strokeLinecap="round" />
    </svg>
  )
}

/** Product icon on a soft tile tinted with the product's color. */
export function ProductIcon({ id, size = 40 }: { id: string; size?: number }) {
  const p = productById(id)
  const Icon = p.icon
  return (
    <span className="picon" style={{ width: size, height: size, color: p.tint, background: `color-mix(in srgb, ${p.tint} 14%, white)` }}>
      <Icon size={Math.round(size * 0.55)} strokeWidth={1.75} />
    </span>
  )
}

/** Thumbnail strip; click opens a full-size viewer. */
export function Photos({ srcs, alt, size = 64 }: { srcs: string[]; alt: string; size?: number }) {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <>
      <div className="photos">
        {srcs.map((src, i) => (
          <button key={i} type="button" className="photo" style={{ width: size, height: size }} onClick={() => setOpen(i)}>
            <img src={src} alt={`${alt} ${i + 1}`} loading="lazy" />
          </button>
        ))}
      </div>
      {open !== null && (
        <div className="lightbox" role="dialog" aria-label={alt} onClick={() => setOpen(null)}>
          <img src={srcs[open]} alt={alt} onClick={(e) => { e.stopPropagation(); setOpen((open + 1) % srcs.length) }} />
          <span className="lightbox-n">{open + 1} / {srcs.length} · {t('แตะรูปเพื่อดูรูปถัดไป · แตะพื้นหลังเพื่อปิด', 'Tap photo for next · tap background to close')}</span>
        </div>
      )}
    </>
  )
}

function FlagTH() {
  return (
    <svg viewBox="0 0 30 20" aria-hidden>
      <rect width="30" height="20" fill="#A51931" />
      <rect y="3.33" width="30" height="13.33" fill="#F4F5F8" />
      <rect y="6.67" width="30" height="6.67" fill="#2D2A4A" />
    </svg>
  )
}

function FlagGB() {
  return (
    <svg viewBox="0 0 60 30" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <clipPath id="gb-t"><path d="M30,15h30v15zv15h-30zh-30v-15zv-15h30z" /></clipPath>
      <rect width="60" height="30" fill="#012169" />
      <path d="M0,0L60,30M60,0L0,30" stroke="#fff" strokeWidth="6" />
      <path d="M0,0L60,30M60,0L0,30" clipPath="url(#gb-t)" stroke="#C8102E" strokeWidth="4" />
      <path d="M30,0v30M0,15h60" stroke="#fff" strokeWidth="10" />
      <path d="M30,0v30M0,15h60" stroke="#C8102E" strokeWidth="6" />
    </svg>
  )
}

const LANGS: { id: Lang; flag: () => JSX.Element; label: string; name: string }[] = [
  { id: 'th', flag: FlagTH, label: 'TH', name: 'ภาษาไทย' },
  { id: 'en', flag: FlagGB, label: 'EN', name: 'English' },
]

/** TH / EN segmented switch with flag icons. */
export function LangSwitch() {
  const { lang, setLang } = useLang()
  return (
    <div className="lang" role="group" aria-label="Language / ภาษา">
      {LANGS.map((l) => (
        <button key={l.id} type="button" className={lang === l.id ? 'on' : ''} aria-pressed={lang === l.id} title={l.name} onClick={() => setLang(l.id)}>
          <span className="flag"><l.flag /></span>
          {l.label}
        </button>
      ))}
    </div>
  )
}

const STATUS: Record<string, { th: string; en: string; tone: string }> = {
  pending: { th: 'รอตอบรับ', en: 'Pending', tone: 'warn' },
  accepted: { th: 'ตอบรับแล้ว', en: 'Accepted', tone: 'good' },
  declined: { th: 'ปฏิเสธ', en: 'Declined', tone: 'bad' },
  placed: { th: 'รอจัดส่ง', en: 'Placed', tone: 'warn' },
  shipped: { th: 'กำลังจัดส่ง', en: 'Shipped', tone: 'info' },
  delivered: { th: 'ส่งแล้ว', en: 'Delivered', tone: 'good' },
}

export function StatusBadge({ s }: { s: string }) {
  const x = STATUS[s]
  return <span className={`status status-${x.tone}`}>{t(x.th, x.en)}</span>
}

export function GradeBadge({ g }: { g: Grade }) {
  return <span className={`grade grade-${g}`} title={GRADE_ROUTES[g].market}>{g === 'R' ? 'Residual' : t(`เกรด ${g}`, `Grade ${g}`)}</span>
}

export function Card({ title, action, children, className = '' }: { title?: ReactNode; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`card ${className}`}>
      {(title || action) && (
        <header className="card-h">
          {title && <h3>{title}</h3>}
          {action}
        </header>
      )}
      {children}
    </section>
  )
}

export function Stat({ label, value, sub }: { label: string; value: ReactNode; sub?: ReactNode }) {
  return (
    <div className="stat">
      <div className="stat-l">{label}</div>
      <div className="stat-v">{value}</div>
      {sub && <div className="stat-s">{sub}</div>}
    </div>
  )
}

export function Field({ label, children, full }: { label: string; children: ReactNode; full?: boolean }) {
  return (
    <label className={`field ${full ? 'full' : ''}`}>
      <span>{label}</span>
      {children}
    </label>
  )
}

export function Tabs<T extends string>({ value, onChange, items }: { value: T; onChange: (v: T) => void; items: { id: T; label: ReactNode }[] }) {
  return (
    <div className="tabs" role="tablist">
      {items.map((i) => (
        <button key={i.id} role="tab" aria-selected={value === i.id} className={value === i.id ? 'on' : ''} onClick={() => onChange(i.id)}>
          {i.label}
        </button>
      ))}
    </div>
  )
}

export function useToast() {
  const [msg, setMsg] = useState<string | null>(null)
  const show = (m: string) => {
    setMsg(m)
    setTimeout(() => setMsg(null), 2600)
  }
  const node = msg ? <div className="toast" role="status">{msg}</div> : null
  return [node, show] as const
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="empty">{children}</div>
}
