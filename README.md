# 🔐 client-new-uam

New UI สำหรับ **User Access Management (UAM)** — ออกแบบหน้าจอใหม่ของระบบจัดการสิทธิ์ผู้ใช้ โดย **ไม่แก้หลังบ้าน** (ไม่เปลี่ยน Model Response / Payload)

## 🎯 ภาพรวม

| หัวข้อ | รายละเอียด |
|---|---|
| เป้าหมาย | Redesign UI ของ UAM ให้เป็นรูปแบบเดียวกันทั้งแอป รองรับ desktop และ phone (390px) |
| ข้อจำกัดแข็ง | Backend ไม่เปลี่ยน ใช้เฉพาะฟิลด์ใน `shared/interfaces/**` เดิม |
| Stack | Angular 22 (zoneless), PrimeNG 22, PrimeIcons 8, PrimeFlex 4, Vitest (ไม่ใช้ NgRx) — ล่าสุด ณ 2026-11-10 ตาม [ADR-0001](docs/architecture/ADR-0001-latest-stack.md) |
| ฟอนต์ / สี | Sukhumvit Set; `#00194b` / `#2854a7` |
| โค้ดเดิม | **ไม่ใช้เลย (clean-room)** — แอปนี้สร้างใหม่ทั้งหมดบน stack ล่าสุด ห้ามอ่าน/อิงโค้ดเก่า ดู [CLAUDE.md](CLAUDE.md) §1 ข้อ 2 |

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
| [CLAUDE.md](CLAUDE.md) · [docs/workflow/WORKFLOW.md](docs/workflow/WORKFLOW.md) | กติกา agent และ workflow PM/Senior/Junior/QA |
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
> ⚠️ แอปใน repo ตอนนี้ยังเป็น Angular 17 ชั่วคราว กำลังสร้างใหม่บน Angular 22 (issue UAM-FND-01) — คำสั่งด้านล่างคือเป้าหมายหลังย้ายเสร็จ

```bash
npm ci
npm start                      # http://localhost:4200
npm run test:ci
npm run build
```

## 🤖 ทำงานกับ agent
อ่าน [`CLAUDE.md`](CLAUDE.md) และ [docs/workflow/WORKFLOW.md](docs/workflow/WORKFLOW.md) — บทบาท PM / Senior Dev / Junior Dev / QA อยู่ที่ `.claude/agents/`, skill ของ workflow ที่ `.claude/skills/`, template ที่ `.github/`

## 🗂️ โครงสร้าง repo (ปัจจุบัน)
```text
src/ angular.json package.json   แอป Angular
CLAUDE.md  .claude/{agents,skills}   กติกา/บทบาท/skill ของ agent
.github/   PR/issue template, CI
docs/
  design-spec/   สเปก + ไฟล์ดีไซน์ (.dc.html, uam.css, canvas.json)
  backlog/       BACKLOG, EXECUTION-PLAN, items/
  testing/       TESTING.md, PHASES.md, test-cases/
e2e-bot/        บอท E2E (Python/Playwright) + case YAML
```
