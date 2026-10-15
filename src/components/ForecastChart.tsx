import { useState } from 'react'
import { fmt, monthYear } from '../lib/catalog'
import { t } from '../lib/i18n'
import type { MonthPoint } from '../lib/ai'

const H = 220
const PAD = { t: 16, r: 8, b: 28, l: 52 }

/** Grouped bars: forecast supply vs demand per month, with hover tooltip + table view. */
export function ForecastChart({ data, unit }: { data: MonthPoint[]; unit: string }) {
  const [hover, setHover] = useState<number | null>(null)
  const [table, setTable] = useState(false)
  const W = 640
  const max = Math.max(1, ...data.flatMap((d) => [d.supply, d.demand])) * 1.1
  const iw = W - PAD.l - PAD.r
  const ih = H - PAD.t - PAD.b
  const band = iw / data.length
  const bw = Math.min(22, (band - 14) / 2)
  const y = (v: number) => PAD.t + ih - (v / max) * ih
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(max * f))

  const label = (d: MonthPoint) => monthYear(d.month, d.year)

  return (
    <div className="chart">
      <div className="chart-top">
        <div className="legend">
          <span><i style={{ background: 'var(--supply)' }} /> {t('Supply คาดการณ์', 'Forecast supply')}</span>
          <span><i style={{ background: 'var(--demand)' }} /> {t('Demand คาดการณ์', 'Forecast demand')}</span>
        </div>
        <button className="link" onClick={() => setTable(!table)}>{table ? t('ดูกราฟ', 'Show chart') : t('ดูตาราง', 'Show table')}</button>
      </div>
      {table ? (
        <table className="tbl">
          <thead><tr><th>{t('เดือน', 'Month')}</th><th>Supply ({unit})</th><th>Demand ({unit})</th><th>{t('ส่วนต่าง', 'Gap')}</th></tr></thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.key}><td>{label(d)}</td><td>{fmt(d.supply)}</td><td>{fmt(d.demand)}</td><td className={d.supply - d.demand > 0 ? 'neg' : 'pos'}>{d.supply - d.demand > 0 ? '+' : ''}{fmt(d.supply - d.demand)}</td></tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="chart-wrap">
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t('กราฟคาดการณ์ supply และ demand รายเดือน', 'Monthly forecast of supply and demand')}>
            {ticks.map((t) => (
              <g key={t}>
                <line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} className="grid" />
                <text x={PAD.l - 8} y={y(t) + 4} className="axis" textAnchor="end">{fmt(t)}</text>
              </g>
            ))}
            {data.map((d, i) => {
              const x0 = PAD.l + i * band + (band - bw * 2 - 2) / 2
              return (
                <g key={d.key} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
                  <rect x={PAD.l + i * band} y={PAD.t} width={band} height={ih} fill={hover === i ? 'var(--hover)' : 'transparent'} />
                  <Bar x={x0} w={bw} y={y(d.supply)} h={y(0) - y(d.supply)} fill="var(--supply)" />
                  <Bar x={x0 + bw + 2} w={bw} y={y(d.demand)} h={y(0) - y(d.demand)} fill="var(--demand)" />
                  <text x={PAD.l + i * band + band / 2} y={H - 8} className="axis" textAnchor="middle">{label(d)}</text>
                </g>
              )
            })}
            <line x1={PAD.l} x2={W - PAD.r} y1={y(0)} y2={y(0)} className="baseline" />
          </svg>
          {hover !== null && (
            <div className="tip" style={{ left: `${((PAD.l + hover * band + band / 2) / W) * 100}%` }}>
              <b>{label(data[hover])}</b>
              <div><i style={{ background: 'var(--supply)' }} />Supply {fmt(data[hover].supply)} {unit}</div>
              <div><i style={{ background: 'var(--demand)' }} />Demand {fmt(data[hover].demand)} {unit}</div>
              <div className="muted">{t('ประกาศในระบบ', 'On platform')}: {t('ขาย', 'sell')} {fmt(data[hover].listedSupply)} · {t('ซื้อ', 'buy')} {fmt(data[hover].listedDemand)}</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/** Bar with 4px rounded top, square at the baseline. */
function Bar({ x, y, w, h, fill }: { x: number; y: number; w: number; h: number; fill: string }) {
  if (h <= 0) return null
  const r = Math.min(4, h, w / 2)
  return <path d={`M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`} fill={fill} />
}
