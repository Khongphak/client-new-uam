# 🚨 Test cases — Error / สถานะ / dialog

รูปแบบ: ทุก case ผูกกับ backlog (`items/UAM-*.md`) · ลำดับ phase ดู [PHASES.md](../PHASES.md) · วิธีรัน: manual ได้ทันทีเมื่อ build เสร็จ; automate (E2E) หลัง phase ที่กำหนด

## TC-ERR-001 — URL ไม่รู้จัก → 404 "This page doesn’t exist"

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
| 1 | เปิด `/no-such-page` | แสดงหน้า 404 (โครง `u-errpage`) heading "This page doesn’t exist" พร้อมปุ่ม "Back to Home" (→ `/home`) | | ☐ |
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
- ล็อกอินแล้ว; จำลอง API ตอบ session หมดอายุ (`40102`)
- ทางทดสอบหลักจนกว่า UAM-HOM-02 / UAM-ERR-05 / UAM-ERR-09 เสร็จ: ให้ request ล้มที่ **login** (ผู้เรียกจัดการ error เอง) — การล้มของ resource บนหน้า Home/Report ยังไม่ขึ้น dialog ทันที (BUG-1 → UAM-ERR-09)

| # | ขั้นตอน (Action) | ผลที่คาดหวัง (Expected) | ผลจริง | ผ่าน/ไม่ผ่าน |
|---|---|---|---|---|
| 1 | ทำ action ที่เรียก API (ตามทางทดสอบหลักใน Precondition) | แสดง dialog heading "Your session has expired" ("Log in again to continue. …") มีปุ่มเดียว "Log in again" | | ☐ |
| 2 | กด "Log in again" | clear session และไป `/login` (ไม่เรียก `auth/logout` ซ้ำ); Esc ไม่ปิด dialog | | ☐ |
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
- จำลองเครือข่ายขาด (status 0)
- ทางทดสอบหลัก: ให้ request ล้มที่ login (ดู TC-ERR-002)

| # | ขั้นตอน (Action) | ผลที่คาดหวัง (Expected) | ผลจริง | ผ่าน/ไม่ผ่าน |
|---|---|---|---|---|
| 1 | ทำ action ที่เรียก API (ตามทางทดสอบหลัก) | แสดง dialog heading "Can’t reach the server" ("Check your connection, then try again.") รายละเอียด "Error: Network error" ปุ่ม Close และ Try again | | ☐ |

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
- ทางทดสอบหลัก: ให้ request ล้มที่ login (ดู TC-ERR-002)

| # | ขั้นตอน (Action) | ผลที่คาดหวัง (Expected) | ผลจริง | ผ่าน/ไม่ผ่าน |
|---|---|---|---|---|
| 1 | ทำ action ที่เรียก API (ทีละรหัส ตามทางทดสอบหลัก) | dialog heading "Something went wrong" พร้อมรายละเอียด `<code> · <message จาก server>` (เช่น `50001 · …`) — ข้อความ server จริง ไม่ใช่ข้อความตัวอย่างในดีไซน์; ปุ่ม Close และ Try again | | ☐ |

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

## TC-ERR-007 — Demo build: ค่าจำลอง error ผ่าน interceptor จริง เปิด dialog ของ ERR-03

| | |
|---|---|
| Backlog | UAM-DEMO-03 |
| Priority | P2 |
| Phase ที่เริ่มทดสอบได้ | 1 |
| Role | ADMIN (ผู้ใช้สมมติ) |
| Viewport | desktop |
| ประเภท | E2E (demo build) |

**Precondition**
- `npm run build:demo` แล้วเปิดแอป; ล็อกอินด้วยผู้ใช้สมมติ

| # | ขั้นตอน (Action) | ผลที่คาดหวัง (Expected) | ผลจริง | ผ่าน/ไม่ผ่าน |
|---|---|---|---|---|
| 1 | เปิดหน้าใดๆ ที่เรียก API พร้อม `?demo=50001` | dialog server (DlgServer) พร้อมข้อความ/รหัสจาก response จำลอง | | ☐ |
| 2 | ทำซ้ำด้วย `?demo=session` | dialog session หมดอายุ; กดยืนยัน → logout ไป `/login` | | ☐ |
| 3 | ทำซ้ำด้วยค่าจำลอง network (ชื่อค่าตามคู่มือ demo ของ UAM-DEMO-03) | dialog "Can’t reach the server" | | ☐ |
| 4 | `npm run build` + `npm run check:no-demo` | production ไม่มีโค้ด demo | | ☐ |

## TC-ERR-008 — Try again ของ dialog network/server ส่ง request ซ้ำโดยไม่รีโหลดหน้า (เฉพาะถ้าตัดสินให้ทำ)

| | |
|---|---|
| Backlog | UAM-ERR-08 |
| Priority | P3 |
| Phase ที่เริ่มทดสอบได้ | 1 |
| Role | ADMIN |
| Viewport | desktop, phone |
| ประเภท | E2E |

**Precondition**
- ⛔ ใช้เมื่อผู้ใช้/PM ตัดสินเลือก "replay" ใน UAM-ERR-08 เท่านั้น (ถ้าเลือกคง reload ให้ยกเลิก case นี้)
- อยู่หน้า `/login` กรอก username ค้างไว้; จำลอง network error ครั้งแรก แล้วครั้งถัดไปสำเร็จ

| # | ขั้นตอน (Action) | ผลที่คาดหวัง (Expected) | ผลจริง | ผ่าน/ไม่ผ่าน |
|---|---|---|---|---|
| 1 | กด Sign in (request ล้ม) | dialog network | | ☐ |
| 2 | กด Try again | request ถูกส่งซ้ำ ไม่รีโหลดหน้า; ค่าที่กรอกยังอยู่ | | ☐ |
| 3 | ให้ request ล้มอีกครั้งแล้วกด Try again | dialog ขึ้นอันเดียว (ไม่ซ้อน) | | ☐ |
