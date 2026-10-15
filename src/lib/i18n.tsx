import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type Lang = 'th' | 'en'
const KEY = 'meerai-lang'

function initial(): Lang {
  try {
    const v = localStorage.getItem(KEY)
    if (v === 'th' || v === 'en') return v
  } catch { /* storage unavailable */ }
  return 'th'
}

/**
 * Current language, readable from plain functions (catalog, AI engine) as well as components.
 * The provider re-mounts the tree on change, so every `t()` call re-runs.
 */
let current: Lang = initial()

/** Pick the string for the current language. */
export const t = (th: string, en: string) => (current === 'en' ? en : th)
/** User/seed data that may carry an English version. */
export const tx = (th: string, en?: string) => (current === 'en' && en ? en : th)
export const lang = () => current
export const locale = () => (current === 'en' ? 'en-GB' : 'th-TH')

const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void }>(null!)

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(current)
  current = lang
  useEffect(() => {
    document.documentElement.lang = lang
    try { localStorage.setItem(KEY, lang) } catch { /* ignore */ }
  }, [lang])
  return (
    <Ctx.Provider value={{ lang, setLang }}>
      <div key={lang} style={{ display: 'contents' }}>{children}</div>
    </Ctx.Provider>
  )
}

export const useLang = () => useContext(Ctx)
