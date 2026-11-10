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

