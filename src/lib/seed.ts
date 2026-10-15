import type { Demand, Goods, Listing, Order, PurchaseRequest } from './types'

const day = 86_400_000
export const addDays = (n: number) => new Date(Date.now() + n * day).toISOString().slice(0, 10)

/** Month offset → a date mid-way through that month, relative to today. */
const inMonth = (offset: number, d = 15) => {
  const t = new Date()
  return new Date(t.getFullYear(), t.getMonth() + offset, d).toISOString().slice(0, 10)
}

export const SEED_LISTINGS: Listing[] = [
  { id: 'L1', type: 'crop', productId: 'mango', farmer: 'สมชาย ใจดี', farmerEn: "Somchai Jaidee", areaRai: 25, qty: 18, harvestDate: addDays(7), grade: 'B', targetPrice: 21000, method: 'GAP', province: 'ฉะเชิงเทรา' },
  { id: 'L2', type: 'crop', productId: 'mango', farmer: 'สวนป้าแดง', farmerEn: "Auntie Daeng's Orchard", areaRai: 12, qty: 9, harvestDate: addDays(10), grade: 'C', targetPrice: 12000, method: 'ทั่วไป', province: 'ฉะเชิงเทรา' },
  { id: 'L3', type: 'crop', productId: 'mango', farmer: 'วิสาหกิจชุมชนบ้านโพธิ์', farmerEn: "Ban Pho Community Enterprise", areaRai: 60, qty: 70, harvestDate: inMonth(5, 5), grade: 'A', targetPrice: 34000, method: 'GAP', province: 'พิษณุโลก' },
  { id: 'L4', type: 'crop', productId: 'mango', farmer: 'ลุงเสริม', farmerEn: "Uncle Serm", areaRai: 40, qty: 55, harvestDate: inMonth(5, 20), grade: 'B', targetPrice: 22000, method: 'ทั่วไป', province: 'พิษณุโลก' },
  { id: 'L5', type: 'crop', productId: 'mango', farmer: 'สวนรุ่งอรุณ', farmerEn: "Rung Arun Orchard", areaRai: 35, qty: 55, harvestDate: inMonth(6, 10), grade: 'B', targetPrice: 20000, method: 'อินทรีย์', province: 'นครสวรรค์' },
  { id: 'L6', type: 'crop', productId: 'durian', farmer: 'สวนทองจันท์', farmerEn: "Thong Chan Orchard", areaRai: 30, qty: 40, harvestDate: inMonth(6), grade: 'A', targetPrice: 115000, method: 'GAP', province: 'จันทบุรี' },
  { id: 'L7', type: 'crop', productId: 'durian', farmer: 'สวนทองจันท์', farmerEn: "Thong Chan Orchard", areaRai: 30, qty: 12, harvestDate: inMonth(6), grade: 'C', targetPrice: 40000, method: 'GAP', province: 'จันทบุรี' },
  { id: 'L8', type: 'crop', productId: 'durian', farmer: 'สวนทองจันท์', farmerEn: "Thong Chan Orchard", areaRai: 30, qty: 6, harvestDate: inMonth(6, 20), grade: 'R', targetPrice: 3000, method: 'GAP', province: 'จันทบุรี' },
  { id: 'L9', type: 'crop', productId: 'mangosteen', farmer: 'สวนลุงชัย', farmerEn: "Uncle Chai's Orchard", areaRai: 20, qty: 25, harvestDate: inMonth(7), grade: 'B', targetPrice: 35000, method: 'GAP', province: 'จันทบุรี' },
  { id: 'L10', type: 'crop', productId: 'rambutan', farmer: 'กลุ่มเงาะโรงเรียนบ้านนาสาร', farmerEn: "Ban Na San Rambutan Group", areaRai: 45, qty: 60, harvestDate: inMonth(8), grade: 'C', targetPrice: 9000, method: 'ทั่วไป', province: 'สุราษฎร์ธานี' },
  { id: 'L11', type: 'crop', productId: 'pineapple', farmer: 'ไร่สามร้อยยอด', farmerEn: "Sam Roi Yot Farm", areaRai: 50, qty: 60, harvestDate: addDays(20), grade: 'C', targetPrice: 5000, method: 'GAP', province: 'ประจวบคีรีขันธ์' },
  { id: 'L12', type: 'crop', productId: 'pineapple', farmer: 'ไร่สามร้อยยอด', farmerEn: "Sam Roi Yot Farm", areaRai: 50, qty: 20, harvestDate: addDays(22), grade: 'R', targetPrice: 800, method: 'GAP', province: 'ประจวบคีรีขันธ์' },
  { id: 'L13', type: 'crop', productId: 'longan', farmer: 'สวนลำไยแม่ทา', farmerEn: "Mae Tha Longan Orchard", areaRai: 20, qty: 15, harvestDate: addDays(5), grade: 'C', targetPrice: 9000, method: 'GAP', province: 'ลำพูน' },
  { id: 'L14', type: 'crop', productId: 'lychee', farmer: 'สวนลิ้นจี่ฮงฮวย', farmerEn: "Hong Huay Lychee Orchard", areaRai: 18, qty: 14, harvestDate: inMonth(7, 5), grade: 'A', targetPrice: 52000, method: 'อินทรีย์', province: 'เชียงราย' },
  { id: 'L15', type: 'crop', productId: 'banana', farmer: 'วิสาหกิจกล้วยหอมทองท่ายาง', farmerEn: "Tha Yang Banana Enterprise", areaRai: 30, qty: 40, harvestDate: addDays(9), grade: 'B', targetPrice: 9500, method: 'GAP', province: 'ราชบุรี' },
  { id: 'L16', type: 'crop', productId: 'banana', farmer: 'วิสาหกิจกล้วยหอมทองท่ายาง', farmerEn: "Tha Yang Banana Enterprise", areaRai: 30, qty: 12, harvestDate: addDays(9), grade: 'C', targetPrice: 5000, method: 'GAP', province: 'ราชบุรี' },
]

export const SEED_DEMANDS: Demand[] = [
  { id: 'D1', en: { processor: 'Factory A (Thai Fruit Puree)', spec: '80%+ ripe, no rot, any size', areaType: 'Eastern fruit orchards', use: 'Puree / mango juice' }, processor: 'โรงงาน A (Thai Fruit Puree)', productId: 'mango', qty: 20, spec: 'สุก 80% ขึ้นไป ไม่เน่า ขนาดไม่จำกัด', grades: ['B', 'C'], maxPrice: 22000, neededBy: addDays(14), provinces: ['ฉะเชิงเทรา', 'ระยอง', 'จันทบุรี'], areaType: 'สวนผลไม้ภาคตะวันออก', use: 'เพียวเร่ / น้ำมะม่วง' },
  { id: 'D2', en: { processor: 'Siam Dried Fruit Co.', spec: 'Nam Dok Mai, firm flesh', areaType: 'Lower North', use: 'Dried mango' }, processor: 'บจก. ผลไม้อบแห้งสยาม', productId: 'mango', qty: 60, spec: 'น้ำดอกไม้ เนื้อแน่น', grades: ['A', 'B'], maxPrice: 24000, neededBy: inMonth(5, 28), provinces: [], areaType: 'ภาคเหนือตอนล่าง', use: 'มะม่วงอบแห้ง' },
  { id: 'D3', en: { spec: 'Monthong, 85% mature', areaType: 'Durian orchards', use: 'Freeze-dried durian / powder' }, processor: 'Siam Durian Freeze-Dry', productId: 'durian', qty: 15, spec: 'หมอนทอง แก่ 85%', grades: ['B', 'C'], maxPrice: 45000, neededBy: inMonth(6, 28), provinces: ['จันทบุรี', 'ระยอง', 'ชุมพร'], areaType: 'สวนทุเรียน', use: 'ทุเรียนฟรีซดราย / ผง' },
  { id: 'D4', en: { spec: 'Fresh durian husk, no mould', areaType: 'Eastern durian orchards', use: 'Vegan leather from durian husk' }, processor: 'GreenLeather Biomaterial', productId: 'durian', qty: 10, spec: 'เปลือกทุเรียนสด ไม่ขึ้นรา', grades: ['R'], maxPrice: 3500, neededBy: inMonth(7), provinces: [], areaType: 'สวนทุเรียนภาคตะวันออก', use: 'หนังเทียมจากเปลือกทุเรียน' },
  { id: 'D5', en: { areaType: 'Pineapple farms', use: 'Pineapple juice / jam' }, processor: 'Tropical Juice Lab', productId: 'pineapple', qty: 40, spec: 'Brix ≥ 12', grades: ['C'], maxPrice: 5500, neededBy: addDays(28), provinces: ['ประจวบคีรีขันธ์', 'ราชบุรี', 'ชุมพร'], areaType: 'ไร่สับปะรด', use: 'น้ำสับปะรด / แยม' },
  { id: 'D6', en: { processor: 'Nakhon Thai Animal Feed Farm', spec: 'Pineapple peel and core', areaType: 'Pineapple farms', use: 'Fermented animal feed' }, processor: 'ฟาร์มอาหารสัตว์นครไทย', productId: 'pineapple', qty: 30, spec: 'เปลือกและแกนสับปะรด', grades: ['R'], maxPrice: 1000, neededBy: addDays(30), provinces: [], areaType: 'ไร่สับปะรด', use: 'อาหารสัตว์หมัก' },
  { id: 'D7', en: { spec: 'Dropped / small fruit', areaType: 'Northern longan orchards', use: 'Dried longan / longan juice' }, processor: 'Longan Honey & Co.', productId: 'longan', qty: 25, spec: 'ผลร่วง/ขนาดเล็ก', grades: ['C'], maxPrice: 10000, neededBy: addDays(21), provinces: ['ลำพูน', 'เชียงใหม่'], areaType: 'สวนลำไยภาคเหนือ', use: 'ลำไยอบแห้ง / น้ำลำไย' },
  { id: 'D8', en: { processor: 'Chanthaburi Export Mangosteen', spec: 'Glossy skin, no translucent flesh', areaType: 'Mangosteen orchards', use: 'Fresh mangosteen / juice' }, processor: 'มังคุดคัดเกรดส่งออก จันท์', productId: 'mangosteen', qty: 40, spec: 'ผิวมัน ไม่มีเนื้อแก้ว', grades: ['A', 'B'], maxPrice: 40000, neededBy: inMonth(7, 25), provinces: ['จันทบุรี', 'ตราด'], areaType: 'สวนมังคุด', use: 'มังคุดสด / น้ำมังคุด' },
  { id: 'D9', en: { spec: 'Rong Rian rambutan, small fruit OK', areaType: 'Southern rambutan orchards', use: 'Rambutan in syrup (canned)' }, processor: 'Rambutan Canning Co.', productId: 'rambutan', qty: 50, spec: 'เงาะโรงเรียน ผลเล็กได้', grades: ['B', 'C'], maxPrice: 10000, neededBy: inMonth(8, 25), provinces: ['สุราษฎร์ธานี', 'ชุมพร'], areaType: 'สวนเงาะภาคใต้', use: 'เงาะกระป๋องในน้ำเชื่อม' },
  { id: 'D10', en: { spec: 'Raw to half-ripe, blemished skin OK', areaType: 'Central banana farms', use: 'Banana chips / banana flour' }, processor: 'Banana Chips Factory', productId: 'banana', qty: 30, spec: 'ผลดิบ-ห่าม ผิวลายได้', grades: ['B', 'C'], maxPrice: 10000, neededBy: addDays(18), provinces: [], areaType: 'สวนกล้วยภาคกลาง', use: 'กล้วยอบกรอบ / แป้งกล้วย' },
]

export const SEED_GOODS: Goods[] = [
  { id: 'G1', maker: 'โรงงาน A (Thai Fruit Puree)', makerEn: 'Factory A (Thai Fruit Puree)', name: 'น้ำมะม่วง 100%', nameEn: '100% Mango Juice', productId: 'mango', fromGrade: 'C', price: 45, pack: 'ขวด 250 มล.', packEn: '250 ml bottle', stock: 320 },
  { id: 'G2', maker: 'โรงงาน A (Thai Fruit Puree)', makerEn: 'Factory A (Thai Fruit Puree)', name: 'เพียวเร่มะม่วงแช่แข็ง', nameEn: 'Frozen Mango Puree', productId: 'mango', fromGrade: 'B', price: 120, pack: 'ถุง 1 กก.', packEn: '1 kg pouch', stock: 80 },
  { id: 'G3', maker: 'บจก. ผลไม้อบแห้งสยาม', makerEn: 'Siam Dried Fruit Co.', name: 'มะม่วงอบแห้ง', nameEn: 'Dried Mango', productId: 'mango', fromGrade: 'B', price: 89, pack: 'ถุง 200 ก.', packEn: '200 g bag', stock: 150 },
  { id: 'G4', maker: 'Siam Durian Freeze-Dry', name: 'ทุเรียนฟรีซดราย', nameEn: 'Freeze-dried Durian', productId: 'durian', fromGrade: 'C', price: 259, pack: 'ถุง 100 ก.', packEn: '100 g bag', stock: 60 },
  { id: 'G5', maker: 'GreenLeather Biomaterial', name: 'กระเป๋าสตางค์หนังเปลือกทุเรียน', nameEn: 'Durian-husk Leather Wallet', productId: 'durian', fromGrade: 'R', price: 890, pack: 'ชิ้น', packEn: 'piece', stock: 25 },
  { id: 'G6', maker: 'Tropical Juice Lab', name: 'แยมสับปะรด', nameEn: 'Pineapple Jam', productId: 'pineapple', fromGrade: 'C', price: 75, pack: 'กระปุก 220 ก.', packEn: '220 g jar', stock: 140 },
  { id: 'G7', maker: 'Banana Chips Factory', name: 'กล้วยหอมอบกรอบ', nameEn: 'Crispy Banana Chips', productId: 'banana', fromGrade: 'C', price: 39, pack: 'ถุง 80 ก.', packEn: '80 g bag', stock: 400 },
  { id: 'G8', maker: 'Longan Honey & Co.', name: 'ลำไยอบแห้งสีทอง', nameEn: 'Golden Dried Longan', productId: 'longan', fromGrade: 'C', price: 110, pack: 'ถุง 250 ก.', packEn: '250 g bag', stock: 90 },
]

export const SEED_REQUESTS: PurchaseRequest[] = [
  { id: 'R1', demandId: 'D1', listingId: 'L1', qty: 18, price: 21000, status: 'pending', createdAt: addDays(-1) },
  { id: 'R2', demandId: 'D1', listingId: 'L2', qty: 2, price: 12000, status: 'pending', createdAt: addDays(0) },
]

export const SEED_ORDERS: Order[] = [
  { id: 'O1', items: [{ kind: 'fruit', refId: 'L1', qty: 5, price: 26 }, { kind: 'goods', refId: 'G1', qty: 6, price: 45 }], total: 400, createdAt: addDays(-2), status: 'shipped' },
]
