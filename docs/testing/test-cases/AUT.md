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

## TC-AUT-006 — Guard: ยังไม่ยอมรับ consent เข้า `/home` ไม่ได้

| | |
|---|---|
| Backlog | UAM-AUT-02 |
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

