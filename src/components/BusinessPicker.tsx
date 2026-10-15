import { useState } from 'react'
import { Field } from './ui'
import { t, tx } from '../lib/i18n'
import { useStore } from '../lib/store'
import type { Demand, Goods } from '../lib/types'

/** All known businesses: anyone who posted a demand or sells products. */
export function businesses(demands: Demand[], goods: Goods[]) {
  const en = new Map<string, string | undefined>()
  for (const d of demands) en.set(d.processor, d.en?.processor ?? en.get(d.processor))
  for (const g of goods) en.set(g.maker, g.makerEn ?? en.get(g.maker))
  return [...en.entries()].map(([name, nameEn]) => ({ name, label: tx(name, nameEn) }))
}

export function bizLabel(name: string, demands: Demand[], goods: Goods[]) {
  return businesses(demands, goods).find((b) => b.name === name)?.label ?? name
}

/** "Acting as" selector for the business role — pick an existing business or start a new one. */
export function BusinessPicker() {
  const { business, setBusiness, demands, goods } = useStore()
  const list = businesses(demands, goods)
  if (!list.some((b) => b.name === business)) list.unshift({ name: business, label: business })
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')

  if (adding) {
    return (
      <form className="biz-new" onSubmit={(e) => { e.preventDefault(); if (name.trim()) { setBusiness(name.trim()); setAdding(false); setName('') } }}>
        <Field label={t('ชื่อธุรกิจใหม่', 'New business name')}>
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder={t('เช่น ร้านน้ำผลไม้บ้านสวน', 'e.g. Orchard Juice Bar')} />
        </Field>
        <button className="btn sm" disabled={!name.trim()}>{t('ใช้ชื่อนี้', 'Use')}</button>
        <button type="button" className="link" onClick={() => setAdding(false)}>{t('ยกเลิก', 'Cancel')}</button>
      </form>
    )
  }
  return (
    <Field label={t('ธุรกิจของฉัน', 'My business')}>
      <select value={business} onChange={(e) => (e.target.value === '__new' ? setAdding(true) : setBusiness(e.target.value))}>
        {list.map((b) => <option key={b.name} value={b.name}>{b.label}</option>)}
        <option value="__new">{t('+ เพิ่มธุรกิจใหม่…', '+ Add a new business…')}</option>
      </select>
    </Field>
  )
}
