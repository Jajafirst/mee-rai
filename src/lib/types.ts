import type { LucideIcon } from 'lucide-react'

export type Grade = 'A' | 'B' | 'C' | 'R'
/** farmer = ชาวสวน · business = ผู้ประกอบการ (processor / retailer) · consumer = ผู้บริโภค */
export type Role = 'farmer' | 'business' | 'consumer'

export interface Product {
  id: string
  name: string
  en: string
  icon: LucideIcon
  tint: string
  unit: 'ตัน'
  /** relative supply by month (Jan..Dec), 1 = average */
  season: number[]
  /** baseline market demand per month, in unit */
  baseDemand: number
  /** reference price per unit (THB) for grade A */
  priceA: number
}

export interface CropListing {
  id: string
  type: 'crop'
  productId: string
  farmer: string
  farmerEn?: string
  areaRai: number
  qty: number
  harvestDate: string // ISO date
  grade: Grade
  targetPrice: number
  method: 'อินทรีย์' | 'GAP' | 'ทั่วไป'
  province: string
  /** compressed JPEG data URLs uploaded by the farmer */
  photos?: string[]
}

export type Listing = CropListing

export interface Demand {
  id: string
  processor: string
  /** optional English versions of free-text fields */
  en?: { processor?: string; spec?: string; areaType?: string; use?: string }
  productId: string
  qty: number
  spec: string
  grades: Grade[]
  maxPrice: number
  neededBy: string
  provinces: string[] // empty = anywhere
  areaType: string
  use: string
}

export interface Match {
  demandId: string
  listingId: string
  qty: number
  score: number
  reasons: string[]
}

/** A product a business makes from fruit and sells to consumers. */
export interface Goods {
  id: string
  maker: string
  makerEn?: string
  name: string
  nameEn?: string
  productId: string // fruit it is made from
  fromGrade: Grade // grade of fruit it rescues
  price: number // ฿ per pack
  pack: string // e.g. ขวด 250 มล.
  packEn?: string
  stock: number
  photo?: string
}

export type RequestStatus = 'pending' | 'accepted' | 'declined'

/** Business → grower purchase request, created from an AI match. */
export interface PurchaseRequest {
  id: string
  demandId: string
  listingId: string
  qty: number
  price: number // offered ฿/ton
  status: RequestStatus
  createdAt: string
}

export interface CartItem {
  kind: 'fruit' | 'goods'
  refId: string // listing id or goods id
  qty: number
  price: number // ฿ per unit at time of adding
}

export interface Order {
  id: string
  items: CartItem[]
  total: number
  createdAt: string
  status: 'placed' | 'shipped' | 'delivered'
}
