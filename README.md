# มีไร่ / MEERAI — Market-led Production Platform

แพลตฟอร์มกลางเชื่อมชาวสวนผลไม้ ผู้แปรรูป และผู้บริโภค พร้อม AI Demand Forecasting และ Circular Market Routing (ต้นแบบ)

```bash
npm install
npm run dev     # http://localhost:5173
npm run build
```

## บทบาท (Roles)
เลือกบทบาทที่หน้าแรก หรือกดชิปบทบาทมุมขวาบนเพื่อสลับ · สลับภาษา TH / EN ได้ที่ปุ่มธง

| บทบาท | เมนู | ทำอะไร |
|---|---|---|
| ชาวสวน (Grower) | สวนของฉัน · AI Forecast · Routing | ลงประกาศผลไม้ + รูป (สูงสุด 4 รูป) · ตอบรับ/ปฏิเสธคำขอซื้อจากผู้ประกอบการ · ดูคำสั่งซื้อจากผู้บริโภค · คำแนะนำการผลิตจาก AI |
| ผู้ประกอบการ (Business) | จัดหาวัตถุดิบ · สินค้าของฉัน · AI Forecast · Routing | ประกาศวัตถุดิบที่ต้องการ · AI Matching · ส่งคำขอซื้อถึงชาวสวน · วางขายสินค้าแปรรูปจากเกรด B/C/Residual |
| ผู้บริโภค (Customer) | ตลาด · คำสั่งซื้อ | ซื้อผลไม้สดและสินค้าแปรรูป · ดีลจากผลไม้ล้นตลาด · ตะกร้า · ติดตามคำสั่งซื้อ |

AI: Demand & Supply Forecast · Gap Analysis · Matching · Production Recommendation · Circular Market Routing (A → ตลาดสด, B → Food service, C → Puree/Juice/Jam, Residual → อาหารสัตว์/ปุ๋ย/วัสดุชีวภาพ)

## โครงสร้าง
- `src/lib/ai.ts` — โมเดลพยากรณ์และจับคู่ (rule-based อธิบายได้) — จุดที่จะเปลี่ยนเป็น ML model จริงในอนาคต
- `src/lib/seed.ts` — ข้อมูลตัวอย่าง (วันที่อิงจากวันปัจจุบัน)
- `src/lib/catalog.ts` — ผลไม้ 8 ชนิด ฤดูกาล จังหวัด เกรด
- `src/lib/photo.ts` — ย่อรูปเป็น JPEG ก่อนบันทึก
- `src/lib/i18n.tsx` — สลับภาษาไทย / อังกฤษ
- ข้อมูลเก็บใน `localStorage` ของเบราว์เซอร์ (กด “รีเซ็ตข้อมูล” เพื่อคืนค่าตัวอย่าง) — ยังไม่มี backend / login
