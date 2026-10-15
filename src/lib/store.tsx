import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { SEED_DEMANDS, SEED_GOODS, SEED_LISTINGS, SEED_ORDERS, SEED_REQUESTS } from './seed'
import type { CartItem, Demand, Goods, Listing, Order, PurchaseRequest, RequestStatus, Role } from './types'

interface Data {
  role: Role | null
  /** which business the "business" role is acting as */
  business: string
  listings: Listing[]
  demands: Demand[]
  goods: Goods[]
  requests: PurchaseRequest[]
  cart: CartItem[]
  orders: Order[]
}

interface Store extends Data {
  /** true when the last save failed, e.g. browser storage full of photos */
  storageFull: boolean
  setRole: (r: Role | null) => void
  setBusiness: (name: string) => void
  addListing: (l: Listing) => void
  removeListing: (id: string) => void
  addDemand: (d: Demand) => void
  removeDemand: (id: string) => void
  addGoods: (g: Goods) => void
  removeGoods: (id: string) => void
  sendRequest: (r: PurchaseRequest) => void
  answerRequest: (id: string, status: RequestStatus) => void
  addToCart: (i: CartItem) => void
  removeFromCart: (index: number) => void
  checkout: () => Order | null
  reset: () => void
}

const KEY = 'meerai-v6'
const Ctx = createContext<Store>(null!)

const seed = (role: Role | null = null): Data => ({
  role,
  business: SEED_DEMANDS[0].processor,
  listings: SEED_LISTINGS,
  demands: SEED_DEMANDS,
  goods: SEED_GOODS,
  requests: SEED_REQUESTS,
  cart: [],
  orders: SEED_ORDERS,
})

function load(): Data {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...seed(), ...(JSON.parse(raw) as Partial<Data>) }
  } catch { /* storage unavailable */ }
  return seed()
}

export const uid = () => Math.random().toString(36).slice(2, 9)
const today = () => new Date().toISOString().slice(0, 10)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [s, set] = useState(load)
  const [storageFull, setStorageFull] = useState(false)
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(s))
      setStorageFull(false)
    } catch {
      setStorageFull(true)
    }
  }, [s])

  const store: Store = {
    ...s,
    storageFull,
    setRole: (role) => set((x) => ({ ...x, role })),
    setBusiness: (business) => set((x) => ({ ...x, business })),
    addListing: (l) => set((x) => ({ ...x, listings: [l, ...x.listings] })),
    removeListing: (id) => set((x) => ({ ...x, listings: x.listings.filter((l) => l.id !== id), requests: x.requests.filter((r) => r.listingId !== id) })),
    addDemand: (d) => set((x) => ({ ...x, demands: [d, ...x.demands] })),
    removeDemand: (id) => set((x) => ({ ...x, demands: x.demands.filter((d) => d.id !== id), requests: x.requests.filter((r) => r.demandId !== id) })),
    addGoods: (g) => set((x) => ({ ...x, goods: [g, ...x.goods] })),
    removeGoods: (id) => set((x) => ({ ...x, goods: x.goods.filter((g) => g.id !== id) })),
    sendRequest: (r) => set((x) => ({ ...x, requests: [r, ...x.requests.filter((o) => !(o.demandId === r.demandId && o.listingId === r.listingId))] })),
    answerRequest: (id, status) => set((x) => ({ ...x, requests: x.requests.map((r) => (r.id === id ? { ...r, status } : r)) })),
    addToCart: (i) =>
      set((x) => {
        const at = x.cart.findIndex((c) => c.kind === i.kind && c.refId === i.refId)
        if (at < 0) return { ...x, cart: [...x.cart, i] }
        return { ...x, cart: x.cart.map((c, j) => (j === at ? { ...c, qty: c.qty + i.qty } : c)) }
      }),
    removeFromCart: (index) => set((x) => ({ ...x, cart: x.cart.filter((_, j) => j !== index) })),
    checkout: () => {
      if (!s.cart.length) return null
      const order: Order = { id: uid(), items: s.cart, total: s.cart.reduce((a, c) => a + c.qty * c.price, 0), createdAt: today(), status: 'placed' }
      set((x) => ({
        ...x,
        cart: [],
        orders: [order, ...x.orders],
        goods: x.goods.map((g) => {
          const bought = order.items.filter((i) => i.kind === 'goods' && i.refId === g.id).reduce((a, i) => a + i.qty, 0)
          return bought ? { ...g, stock: Math.max(0, g.stock - bought) } : g
        }),
      }))
      return order
    },
    reset: () => set((x) => seed(x.role)),
  }
  return <Ctx.Provider value={store}>{children}</Ctx.Provider>
}

export const useStore = () => useContext(Ctx)
