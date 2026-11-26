# 🏠 Test cases — Home

รูปแบบ: ทุก case ผูกกับ backlog (`items/UAM-*.md`) · ลำดับ phase ดู [PHASES.md](../PHASES.md) · วิธีรัน: manual ได้ทันทีเมื่อ build เสร็จ; automate (E2E) หลัง phase ที่กำหนด

## TC-HOM-001 — Home แสดงการ์ดระบบด้วยฟิลด์ที่มีเท่านั้น

| | |
|---|---|
| Backlog | UAM-HOM-01 |
| Priority | P1 |
| Phase ที่เริ่มทดสอบได้ | 1 |
| Role | ทุก role |
| Viewport | desktop, phone |
| ประเภท | E2E |

**Precondition**
- ผู้ใช้มีสิทธิ์ใช้ระบบ ≥1

| # | ขั้นตอน (Action) | ผลที่คาดหวัง (Expected) | ผลจริง | ผ่าน/ไม่ผ่าน |
|---|---|---|---|---|
| 1 | เปิด `/home` | แสดงการ์ด: ชื่อ รูป คำอธิบาย ชนิด เจ้าของ | | ☐ |
| 2 | ตรวจการ์ด | **ไม่มี** role และ**ไม่มี**สถานะ Maintenance | | ☐ |
| 3 | คลิกการ์ด | เปิดระบบปลายทางตามพฤติกรรมเดิม | | ☐ |

## TC-HOM-002 — Home: loading / empty / error

| | |
|---|---|
| Backlog | UAM-HOM-02 |
| Priority | P2 |
| Phase ที่เริ่มทดสอบได้ | 2 |
| Role | ทุก role |
| Viewport | desktop |
| ประเภท | E2E |

**Precondition**
- จำลอง API

| # | ขั้นตอน (Action) | ผลที่คาดหวัง (Expected) | ผลจริง | ผ่าน/ไม่ผ่าน |
|---|---|---|---|---|
| 1 | API ช้า | skeleton | | ☐ |
| 2 | ไม่มีระบบ | "Data not found" (หรือ message จาก server) | | ☐ |
| 3 | API ล้ม | error + retry | | ☐ |

## TC-HOM-003 — Home: ค้นหาและกรองชนิดระบบ

| | |
|---|---|
| Backlog | UAM-HOM-03 |
| Priority | P2 |
| Phase ที่เริ่มทดสอบได้ | 2 |
| Role | ทุก role |
| Viewport | desktop, phone |
| ประเภท | E2E |

**Precondition**
- ผู้ใช้มีระบบหลายชนิด (Web/Mobile) ≥3

| # | ขั้นตอน (Action) | ผลที่คาดหวัง (Expected) | ผลจริง | ผ่าน/ไม่ผ่าน |
|---|---|---|---|---|
| 1 | พิมพ์ชื่อระบบในช่อง "Search systems" | แสดงเฉพาะการ์ดที่ตรง (ฟิลด์ที่ค้นหาตามที่ PM ยืนยัน) | | ☐ |
| 2 | เลือกตัวกรอง Web/Mobile | แสดงเฉพาะชนิดนั้น; ปุ่มที่เลือกมี `aria-pressed=true` | | ☐ |
| 3 | ค้นหาคำที่ไม่ตรงระบบใด | แสดง "No system matches “<q>”" + ปุ่ม Clear search | | ☐ |
| 4 | กด Clear search | กลับมาแสดงทุกการ์ด | | ☐ |

## TC-HOM-004 — Home: คลิกการ์ดบันทึก access history (รอ PM ยืนยัน)

| | |
|---|---|
| Backlog | UAM-HOM-04 |
| Priority | P2 |
| Phase ที่เริ่มทดสอบได้ | 2 |
| Role | ทุก role |
| Viewport | desktop |
| ประเภท | E2E |

**Precondition**
- ผู้ใช้มีระบบ ≥1; ดัก request ได้

| # | ขั้นตอน (Action) | ผลที่คาดหวัง (Expected) | ผลจริง | ผ่าน/ไม่ผ่าน |
|---|---|---|---|---|
| 1 | คลิกการ์ดระบบ | เปิดระบบปลายทางในแท็บใหม่ และมี request `addAccessHistory` ด้วย payload เดิม | | ☐ |
| 2 | จำลอง `addAccessHistory` ล้ม แล้วคลิกการ์ด | ยังเปิดระบบปลายทางได้ หน้า Home ไม่พัง | | ☐ |
