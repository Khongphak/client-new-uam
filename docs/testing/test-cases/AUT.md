# 🔐 Test cases — Login & Consent

รูปแบบ: ทุก case ผูกกับ backlog (`items/UAM-*.md`) · ลำดับ phase ดู [PHASES.md](../PHASES.md) · วิธีรัน: manual ได้ทันทีเมื่อ build เสร็จ; automate (E2E) หลัง phase ที่กำหนด

## TC-AUT-001 — Login สำเร็จด้วย AD account

| | |
|---|---|
| Backlog | UAM-AUT-01 |
| Priority | P0 |
| Phase ที่เริ่มทดสอบได้ | 1 |
| Role | ทุก role |
| Viewport | desktop, phone |
| ประเภท | E2E |

**Precondition**
- มีบัญชีทดสอบของ role นั้น
- ยังไม่ล็อกอิน

| # | ขั้นตอน (Action) | ผลที่คาดหวัง (Expected) | ผลจริง | ผ่าน/ไม่ผ่าน |
|---|---|---|---|---|
| 1 | เปิด `/login` | เห็นหน้า Sign in: hero ซ้าย (บนจอ ≤900px เป็นคอลัมน์เดียว) + ฟอร์มขวา, ข้อความ "Use your company (AD) account.", ลิงก์ ITSupport@philliplife.com | | ☐ |
| 2 | กรอก Username และ Password ที่ถูกต้อง แล้วกด Sign in | ปุ่มเข้าสถานะ loading ระหว่างรอ; ไม่มี error | | ☐ |
| 3 | รอผลลัพธ์ | ไปที่ `/pdpaconsent` (ครั้งแรก) หรือ `/home` (เคยยอมรับแล้ว) | | ☐ |

## TC-AUT-002 — Login ผิด แสดงข้อผิดพลาดและไม่เข้าระบบ

| | |
|---|---|
| Backlog | UAM-AUT-01 |
| Priority | P0 |
| Phase ที่เริ่มทดสอบได้ | 1 |
| Role | - |
| Viewport | desktop, phone |
| ประเภท | E2E |

**Precondition**
- ยังไม่ล็อกอิน

| # | ขั้นตอน (Action) | ผลที่คาดหวัง (Expected) | ผลจริง | ผ่าน/ไม่ผ่าน |
|---|---|---|---|---|
| 1 | กรอก Username/Password ที่ไม่ถูกต้อง แล้วกด Sign in | แสดง message ข้อผิดพลาด (role=alert) "Username or password is incorrect. Check them and try again." ช่องกรอกแสดงสถานะ invalid | | ☐ |
| 2 | ตรวจ URL | ยังอยู่ที่ `/login` | | ☐ |
| 3 | ตรวจเนื้อหาหน้า | **ไม่มี**ข้อความเรื่องบัญชีถูกล็อก (ถอดออกจากดีไซน์เพราะไม่มีในโมเดล) | | ☐ |

## TC-AUT-003 — ปุ่มแสดง/ซ่อนรหัสผ่าน

| | |
|---|---|
| Backlog | UAM-AUT-01 |
| Priority | P2 |
| Phase ที่เริ่มทดสอบได้ | 1 |
| Role | - |
| Viewport | desktop, phone |
| ประเภท | E2E |

**Precondition**
- อยู่หน้า `/login`

| # | ขั้นตอน (Action) | ผลที่คาดหวัง (Expected) | ผลจริง | ผ่าน/ไม่ผ่าน |
|---|---|---|---|---|
| 1 | พิมพ์รหัสผ่าน | แสดงเป็นจุด | | ☐ |
| 2 | กดปุ่มแสดงรหัสผ่าน (ไอคอน) | แสดงข้อความจริง; ปุ่มมี label สำหรับ screen reader | | ☐ |
| 3 | กดอีกครั้ง | กลับไปซ่อน | | ☐ |

## TC-AUT-004 — Consent: ต้องติ๊กยอมรับก่อนปุ่ม Agree and continue ใช้ได้

| | |
|---|---|
| Backlog | UAM-AUT-02 |
| Priority | P0 |
| Phase ที่เริ่มทดสอบได้ | 1 |
| Role | ทุก role |
| Viewport | desktop, phone |
| ประเภท | E2E |

**Precondition**
- ล็อกอินแล้วแต่ยังไม่ยอมรับ PDPA

| # | ขั้นตอน (Action) | ผลที่คาดหวัง (Expected) | ผลจริง | ผ่าน/ไม่ผ่าน |
|---|---|---|---|---|
| 1 | เปิด `/pdpaconsent` | เห็นข้อความ PDPA; ปุ่ม Agree and continue **ปิดใช้งาน** | | ☐ |
| 2 | ติ๊กช่องยอมรับ | ปุ่ม Agree and continue ใช้ได้ | | ☐ |
| 3 | เอาติ๊กออก | ปุ่มกลับไปปิด | | ☐ |
| 4 | ติ๊กแล้วกด Agree and continue | ไปที่ `/home` | | ☐ |

## TC-AUT-005 — Consent: Decline ถามยืนยันก่อน sign out

| | |
|---|---|
| Backlog | UAM-AUT-02 |
| Priority | P1 |
| Phase ที่เริ่มทดสอบได้ | 1 |
| Role | - |
| Viewport | desktop, phone |
| ประเภท | E2E |

**Precondition**
- อยู่หน้า `/pdpaconsent`

| # | ขั้นตอน (Action) | ผลที่คาดหวัง (Expected) | ผลจริง | ผ่าน/ไม่ผ่าน |
|---|---|---|---|---|
| 1 | กด Decline | เปิด dialog ยืนยัน (โครง dialog มาตรฐาน) | | ☐ |
| 2 | กดยกเลิกใน dialog | dialog ปิด ยังอยู่หน้า consent | | ☐ |
| 3 | กด Decline อีกครั้งแล้วยืนยัน | sign out และกลับ `/login` | | ☐ |

> 💡 การกด Esc บน dialog Decline (ปัจจุบันไม่ปิด) รอคำตัดสิน — ดู UAM-AUT-03 ข้อ (ค) / issue #91 ยังไม่ใช่เกณฑ์ผ่าน/ไม่ผ่านของ case นี้

## TC-AUT-006 — Guard: ยังไม่ยอมรับ consent เข้า `/home` ไม่ได้

| | |
|---|---|
| Backlog | UAM-AUT-03 |
| Priority | P0 |
| Phase ที่เริ่มทดสอบได้ | 1 |
| Role | ทุก role |
| Viewport | desktop |
| ประเภท | E2E |

**Precondition**
- ล็อกอินแล้วแต่ยังไม่ยอมรับ PDPA

| # | ขั้นตอน (Action) | ผลที่คาดหวัง (Expected) | ผลจริง | ผ่าน/ไม่ผ่าน |
|---|---|---|---|---|
| 1 | เปิด `/home` ตรงๆ | ถูกส่งไป `/pdpaconsent` (consent.guard) | | ☐ |

> 💡 ยืนยันพฤติกรรมของ `consent.guard.ts` ตอน implement

## TC-AUT-007 — Guard: ยังไม่ล็อกอิน เข้าหน้าที่ต้องล็อกอินไม่ได้

| | |
|---|---|
| Backlog | UAM-AUT-01 |
| Priority | P0 |
| Phase ที่เริ่มทดสอบได้ | 1 |
| Role | - |
| Viewport | desktop |
| ประเภท | E2E |

**Precondition**
- ยังไม่ล็อกอิน

| # | ขั้นตอน (Action) | ผลที่คาดหวัง (Expected) | ผลจริง | ผ่าน/ไม่ผ่าน |
|---|---|---|---|---|
| 1 | เปิด `/home`, `/setting/system-setting`, `/report`, `/pdpaconsent` | ถูกส่งไป `/login` ทุกกรณี | | ☐ |
| 2 | เปิด `/login` และ `/notfound` | เปิดได้ (สาธารณะ) | | ☐ |

## TC-AUT-008 — รีโหลดหน้าขณะล็อกอินอยู่ ไม่ได้หน้าโล่ง (พฤติกรรมตามคำตัดสิน PM)

| | |
|---|---|
| Backlog | UAM-AUT-03 |
| Priority | P1 |
| Phase ที่เริ่มทดสอบได้ | 2 |
| Role | ทุก role |
| Viewport | desktop, phone |
| ประเภท | E2E |

**Precondition**
- ล็อกอินแล้วอยู่ที่ `/home`

| # | ขั้นตอน (Action) | ผลที่คาดหวัง (Expected) | ผลจริง | ผ่าน/ไม่ผ่าน |
|---|---|---|---|---|
| 1 | รีโหลดหน้า (F5) | ตามคำตัดสิน PM: ยังเห็นการ์ดของผู้ใช้เดิม หรือถูกส่งไป `/login` พร้อม returnUrl — ต้องไม่เห็นหน้า Home ว่างโดยไม่มี session | | ☐ |
| 2 | เปิด `/home` ใน tab ใหม่โดยไม่มี session | ถูกส่งไป `/login` (ตรงกับ TC-AUT-007) | | ☐ |

## TC-AUT-009 — Login แล้วยังไม่ยอมรับ consent → ไป `/pdpaconsent`

| | |
|---|---|
| Backlog | UAM-AUT-03 |
| Priority | P0 |
| Phase ที่เริ่มทดสอบได้ | 2 |
| Role | ทุก role |
| Viewport | desktop, phone |
| ประเภท | E2E |

**Precondition**
- ผู้ใช้ที่ผล login มี `isConsent = false` (บน demo build ใช้ผู้ใช้สมมติที่ยังไม่ยอมรับ)

| # | ขั้นตอน (Action) | ผลที่คาดหวัง (Expected) | ผลจริง | ผ่าน/ไม่ผ่าน |
|---|---|---|---|---|
| 1 | login สำเร็จ | ถูกส่งไป `/pdpaconsent` (ไม่ใช่ `/home`) | | ☐ |
| 2 | ล็อกอินด้วยผู้ใช้ที่ `isConsent = true` | ไป `/home` | | ☐ |
| 3 | ยังไม่ล็อกอิน เปิด `/pdpaconsent` ตรงๆ | ถูกส่งไป `/login` โดย guard (ไม่ใช่ effect ในหน้า) | | ☐ |

> 💡 ส่งต่อจากรีวิว PR #95 (UAM-AUT-02) — เรื่อง Esc บน dialog Decline รอคำตัดสิน ดู UAM-AUT-03 ข้อ (ค)

## TC-AUT-010 — Logout: ล้าง session จริง แล้วเปิดหน้าที่ต้องล็อกอินไม่ได้

| | |
|---|---|
| Backlog | UAM-AUT-04 |
| Priority | P0 |
| Phase ที่เริ่มทดสอบได้ | 2 |
| Role | ทุก role |
| Viewport | desktop, phone |
| ประเภท | E2E |

**Precondition**
- ล็อกอินแล้ว (consent ยอมรับแล้ว) อยู่ใต้ shell เช่น `/home`; ทดสอบทั้ง demo build และ production build + จำลอง API (demo ไม่เห็น request เพราะ interceptor ตอบในโปรเซส — ข้อ 2/3 ตรวจบน production+mock)

| # | ขั้นตอน (Action) | ผลที่คาดหวัง (Expected) | ผลจริง | ผ่าน/ไม่ผ่าน |
|---|---|---|---|---|
| 1 | กด Logout ใน shell | ไป `/login`; `sessionStorage` ไม่มี `uam.session` (`localStorage` เหลือได้เฉพาะ `uam.rememberedUsername` ของฟีเจอร์ Remember — ไม่ใช่ความลับ) | | ☐ |
| 2 | ดู network ตอนกด Logout (production+mock) | มี `POST v1/auth/logout` 1 ครั้ง body `{Username, ClientId}` (payload เดิม) | | ☐ |
| 3 | กด Logout ขณะ request logout ล้ม (abort หรือ `RESULT_CODE` 50001) | ยังล้าง session และไป `/login` เหมือนปกติ | | ☐ |
| 4 | หลัง Logout เปิดตรง `/home`, `/setting/system-setting`, `/setting/users-setting`, `/report` | ถูกส่งไป `/login?returnUrl=…` ทุกหน้า และไม่มี request ไป data endpoint | | ☐ |
| 5 | หลัง Logout กด Back / reload | ยังอยู่หน้า login ไม่เข้าแอปได้ | | ☐ |
| 6 | Login ใหม่ | เข้า `/home` ได้ปกติ | | ☐ |

> 💡 ที่มา: BUG-2 (QA รอบ 2) / issue #114 · Decline ที่หน้า consent ใช้ `SignOut` ตัวเดียวกัน (ครอบด้วย TC-AUT-005)

## TC-AUT-011 — เปิด `/login` ขณะล็อกอินอยู่ ⏳ รอผู้ใช้ตัดสิน

| | |
|---|---|
| Backlog | UAM-AUT-01 (ถ้าตัดสินให้ redirect จะเปิด item ใหม่) |
| Priority | P2 |
| Phase ที่เริ่มทดสอบได้ | 2 |
| Role | ทุก role |
| Viewport | desktop, phone |
| ประเภท | E2E |

**สถานะ: รอตัดสิน** — สเปกยังไม่ระบุว่าผู้ที่ล็อกอินอยู่แล้วเปิด `/login` ควรเห็นฟอร์มหรือถูกส่งไป `/home` (หรือ `/pdpaconsent` ถ้ายังไม่ยอมรับ consent) **ห้ามนับเป็น fail/pass จนกว่าผู้ใช้ตัดสิน** (QA NOTE-5)

**พฤติกรรมปัจจุบัน (ตรวจจาก `src/app/app.routes.ts`):** route `login` ไม่มี guard จึงเปิดได้เสมอและเห็นฟอร์ม

**Precondition**
- ล็อกอินแล้ว อยู่ที่ `/home`

| # | ขั้นตอน (Action) | ผลที่คาดหวัง (Expected) | ผลจริง | ผ่าน/ไม่ผ่าน |
|---|---|---|---|---|
| 1 | พิมพ์ `/login` ใน URL (หรือ Back ไปหน้า login) | **รอตัดสิน** — ทางเลือก (ก) คงเห็นฟอร์ม (ปัจจุบัน) · (ข) redirect ไป `/home` | | ⏳ |
| 2 | (ถ้าเลือก ข) ล็อกอินแล้วแต่ยังไม่ยอมรับ consent เปิด `/login` | ไป `/pdpaconsent` | | ⏳ |
