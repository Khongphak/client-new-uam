# 📱 Test cases — Responsive (phone)

รูปแบบ: ทุก case ผูกกับ backlog (`items/UAM-*.md`) · ลำดับ phase ดู [PHASES.md](../PHASES.md) · วิธีรัน: manual ได้ทันทีเมื่อ build เสร็จ; automate (E2E) หลัง phase ที่กำหนด

## TC-RSP-001 — Sidebar เป็น drawer ต่ำกว่า 768px

| | |
|---|---|
| Backlog | UAM-SHL-01 |
| Priority | P1 |
| Phase ที่เริ่มทดสอบได้ | 1 |
| Role | ทุก role |
| Viewport | phone |
| ประเภท | E2E |

**Precondition**
- -

| # | ขั้นตอน (Action) | ผลที่คาดหวัง (Expected) | ผลจริง | ผ่าน/ไม่ผ่าน |
|---|---|---|---|---|
| 1 | เปิด `/home` ที่ 390px | sidebar ซ่อน; ปุ่มเมนูเปิด drawer | | ☐ |
| 2 | ปรับเป็น ≥768px | sidebar 250px แสดงถาวร; topbar สูง 70px | | ☐ |

## TC-RSP-002 — ตารางบนมือถือเป็นรายการแตะเปิด

| | |
|---|---|
| Backlog | UAM-RSP-01 |
| Priority | P1 |
| Phase ที่เริ่มทดสอบได้ | 4 |
| Role | ADMIN |
| Viewport | phone |
| ประเภท | E2E |

**Precondition**
- -

| # | ขั้นตอน (Action) | ผลที่คาดหวัง (Expected) | ผลจริง | ผ่าน/ไม่ผ่าน |
|---|---|---|---|---|
| 1 | เปิด System Setting / Users / Roles | แสดงเป็นรายการ แตะเพื่อเปิดรายละเอียด | | ☐ |
| 2 | ตรวจปุ่ม | ความสูงขั้นต่ำ 44px | | ☐ |

## TC-RSP-003 — ทุกหน้าหลักไม่มี horizontal scroll ที่ 390px

| | |
|---|---|
| Backlog | UAM-RSP-01 |
| Priority | P1 |
| Phase ที่เริ่มทดสอบได้ | 4 |
| Role | ADMIN |
| Viewport | phone |
| ประเภท | E2E |

**Precondition**
- -

| # | ขั้นตอน (Action) | ผลที่คาดหวัง (Expected) | ผลจริง | ผ่าน/ไม่ผ่าน |
|---|---|---|---|---|
| 1 | เปิดทุกหน้าหลัก | ไม่มีแถบเลื่อนแนวนอนของหน้า; เนื้อหาไม่ถูกตัด | | ☐ |

