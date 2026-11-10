# 🚨 Test cases — Error / สถานะ / dialog

รูปแบบ: ทุก case ผูกกับ backlog (`items/UAM-*.md`) · ลำดับ phase ดู [PHASES.md](../PHASES.md) · วิธีรัน: manual ได้ทันทีเมื่อ build เสร็จ; automate (E2E) หลัง phase ที่กำหนด

## TC-ERR-001 — URL ไม่รู้จัก → 404 "Looks like you are lost"

| | |
|---|---|
| Backlog | UAM-ERR-01 |
| Priority | P1 |
| Phase ที่เริ่มทดสอบได้ | 1 |
| Role | - |
| Viewport | desktop |
| ประเภท | E2E |

**Precondition**
- -

| # | ขั้นตอน (Action) | ผลที่คาดหวัง (Expected) | ผลจริง | ผ่าน/ไม่ผ่าน |
|---|---|---|---|---|
| 1 | เปิด `/no-such-page` | แสดงหน้า 404 (โครง `u-errpage`) พร้อมทางกลับ | | ☐ |
| 2 | เปิด `/notfound` | แสดงหน้าเดียวกัน | | ☐ |

## TC-ERR-002 — Session หมดอายุ → dialog → logout ไป Login

| | |
|---|---|
| Backlog | UAM-ERR-03 |
| Priority | P0 |
| Phase ที่เริ่มทดสอบได้ | 1 |
| Role | ADMIN |
| Viewport | desktop |
| ประเภท | E2E |

**Precondition**
- ล็อกอินแล้ว; จำลอง API ตอบ session หมดอายุ

| # | ขั้นตอน (Action) | ผลที่คาดหวัง (Expected) | ผลจริง | ผ่าน/ไม่ผ่าน |
|---|---|---|---|---|
| 1 | ทำ action ที่เรียก API | แสดง dialog "Your session has expired. Please log in again to continue." | | ☐ |
| 2 | กดยืนยัน | logout และไป `/login` | | ☐ |
| 3 | เมื่อมีหลาย request ล้มพร้อมกัน | dialog ขึ้นเพียงอันเดียว | | ☐ |

## TC-ERR-003 — Network error (status 0)

| | |
|---|---|
| Backlog | UAM-ERR-03 |
| Priority | P1 |
| Phase ที่เริ่มทดสอบได้ | 1 |
| Role | ADMIN |
| Viewport | desktop |
| ประเภท | E2E |

**Precondition**
- จำลองเครือข่ายขาด

| # | ขั้นตอน (Action) | ผลที่คาดหวัง (Expected) | ผลจริง | ผ่าน/ไม่ผ่าน |
|---|---|---|---|---|
| 1 | ทำ action ที่เรียก API | แสดง dialog "Network Error!!!" ด้วยโครง dialog มาตรฐาน | | ☐ |

## TC-ERR-004 — Server error RESULT_CODE 50000 / 50001 / 50002

| | |
|---|---|
| Backlog | UAM-ERR-03 |
| Priority | P1 |
| Phase ที่เริ่มทดสอบได้ | 1 |
| Role | ADMIN |
| Viewport | desktop |
| ประเภท | E2E |

**Precondition**
- จำลอง response ทั้ง 3 รหัส

| # | ขั้นตอน (Action) | ผลที่คาดหวัง (Expected) | ผลจริง | ผ่าน/ไม่ผ่าน |
|---|---|---|---|---|
| 1 | ทำ action ที่เรียก API (ทีละรหัส) | dialog แสดง**ข้อความที่ server ส่งมา** (ไม่ใช่ข้อความตัวอย่างในดีไซน์) พร้อมรหัส | | ☐ |

## TC-ERR-005 — ลบไม่ได้: แสดง message + statusDescription จาก server

| | |
|---|---|
| Backlog | UAM-ERR-04 |
| Priority | P1 |
| Phase ที่เริ่มทดสอบได้ | 2 |
| Role | ADMIN |
| Viewport | desktop |
| ประเภท | E2E |

**Precondition**
- มีรายการที่ server ปฏิเสธการลบ

| # | ขั้นตอน (Action) | ผลที่คาดหวัง (Expected) | ผลจริง | ผ่าน/ไม่ผ่าน |
|---|---|---|---|---|
| 1 | กดลบรายการ | dialog ยืนยันลบ | | ☐ |
| 2 | ยืนยัน | dialog "ลบไม่ได้" แสดง message + statusDescription จาก server | | ☐ |
| 3 | ปิด dialog | รายการยังอยู่ ไม่มีการเปลี่ยนแปลง | | ☐ |

## TC-ERR-006 — ตารางมี 3 สถานะ: loading / error (retry) / empty

| | |
|---|---|
| Backlog | UAM-ERR-05 |
| Priority | P1 |
| Phase ที่เริ่มทดสอบได้ | 2 |
| Role | ADMIN |
| Viewport | desktop |
| ประเภท | E2E |

**Precondition**
- จำลอง API ช้า / ล้ม / ว่าง

| # | ขั้นตอน (Action) | ผลที่คาดหวัง (Expected) | ผลจริง | ผ่าน/ไม่ผ่าน |
|---|---|---|---|---|
| 1 | เปิดหน้ารายการขณะ API ช้า | แสดง skeleton | | ☐ |
| 2 | API ล้ม | แสดง error + ปุ่ม retry; กด retry เรียก API เดิมซ้ำ | | ☐ |
| 3 | API ตอบว่าง | แสดง "No Data Available" | | ☐ |

> 💡 ทดสอบทั้ง System/Menu/S2S/Roles/Users

