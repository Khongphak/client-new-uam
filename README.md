# 🔐 client-new-uam

New UI สำหรับ **User Access Management (UAM)** — ออกแบบหน้าจอใหม่ของระบบจัดการสิทธิ์ผู้ใช้ โดย **ไม่แก้หลังบ้าน** (ไม่เปลี่ยน Model Response / Payload)

## 🎯 ภาพรวม

| หัวข้อ | รายละเอียด |
|---|---|
| เป้าหมาย | Redesign UI ของ UAM ให้เป็นรูปแบบเดียวกันทั้งแอป รองรับ desktop และ phone (390px) |
| ข้อจำกัดแข็ง | Backend ไม่เปลี่ยน ใช้เฉพาะฟิลด์ใน `shared/interfaces/**` เดิม |
| Stack (ตามแอปเดิม) | Angular 17.2, PrimeNG 17.18, PrimeFlex 3.3, PrimeIcons 7, NgRx |
| ฟอนต์ / สี | Sukhumvit Set; `#00194b` / `#2854a7` |
| Source เดิม | repo `client-uam-develop` (อ่านอย่างเดียว) — ต้องนำเข้ามาก่อนตาม `UAM-FND-01` |

### 🧩 ขอบเขตหน้าจอ
Login · PDPA Consent · Home · System Setting (System / Menu / System to System + drawer) · Roles & Users (list / view / edit) · Role editor 3 ขั้น · Report · หน้า 403/404 · dialog และสถานะ loading/empty/error

### 👥 สิทธิ์
ADMIN · DEVELOPER · AUDIT · USER · Super admin (`systemAdmin`) — ตารางสิทธิ์ตาม route อยู่ใน [design spec](docs/design-spec/README.md)

## 📚 เอกสาร

| เอกสาร | คืออะไร |
|---|---|
| [docs/design-spec/README.md](docs/design-spec/README.md) | สเปกดีไซน์สุดท้าย, การตัดสินใจ, ช่องว่างที่ยังเปิด |
| [docs/backlog/BACKLOG.md](docs/backlog/BACKLOG.md) | Backlog 42 รายการ (code `UAM-<EPIC>-<nn>`) |
| [docs/backlog/EXECUTION-PLAN.md](docs/backlog/EXECUTION-PLAN.md) | ลำดับ/คู่ขนานของงาน |
| [docs/testing/TESTING.md](docs/testing/TESTING.md) | กลยุทธ์และขั้นตอน unit test, E2E, TDD/DDD |
| [docs/testing/test-cases/README.md](docs/testing/test-cases/README.md) | 📋 Test case จริง 59 รายการ (.md) + traceability กับ backlog |
| [docs/testing/PHASES.md](docs/testing/PHASES.md) | 🪜 Phase การ build และเวลาที่เริ่มเขียนบอท E2E |
| [e2e-bot/README.md](e2e-bot/README.md) | 🤖 บอท E2E (Python) — ⏸️ ร่างโครง รอ build Phase 1 |

## 🌿 วิธีทำงาน (Git flow)

```text
main ← develop ← <type>/<CODE>-<slug>   เช่น feature/UAM-SYS-02-system-drawer-deeplink
```

1. เลือก backlog จาก `EXECUTION-PLAN.md` (ดู dependency ให้ครบ)
2. แตก branch ใหม่จาก `develop` ตามรหัส backlog ทุกครั้ง
3. เขียน test ก่อน/คู่กับโค้ด (ดู TESTING.md) → PR เข้า `develop` ใส่ `Closes #<issue>`
4. เกณฑ์ตรวจรับ: ตรง artboard · ใช้เฉพาะฟิลด์เดิม · payload ไม่เปลี่ยน · CI ผ่าน

## 🚀 เริ่มต้น
โค้ดแอปยังไม่อยู่ใน repo นี้ — เริ่มที่ [`UAM-FND-01`](docs/backlog/items/UAM-FND-01.md) หลังเสร็จจะมีคำสั่งรัน (`npm ci`, `ng serve`, `ng test`, `npx playwright test`) ที่นี่

## 🗂️ โครงสร้าง repo (ปัจจุบัน)
```text
docs/
  design-spec/   สเปก + ไฟล์ดีไซน์ (.dc.html, uam.css, canvas.json)
  backlog/       BACKLOG, EXECUTION-PLAN, items/
  testing/       TESTING.md, PHASES.md, test-cases/
e2e-bot/        บอท E2E (Python/Playwright) + case YAML
```
