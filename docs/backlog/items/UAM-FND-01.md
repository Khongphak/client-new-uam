---
title: "[UAM-FND-01] เริ่มแอปใหม่ด้วย ng new + baseline CI/test (เสร็จแล้ว)"
labels: ["chore", "fnd", "P0", "wave-1"]
---

# 🧱 UAM-FND-01 — เริ่มแอปใหม่ด้วย ng new + baseline CI/test (เสร็จแล้ว)

| ฟิลด์ | ค่า |
|---|---|
| Code | `UAM-FND-01` |
| ประเภท | 🧹 chore |
| Priority | 🔴 **P0** (score 97) |
| ⭐ Value / 🔓 Unblocks / 💪 Effort | 5 / 5 / 3 pts |
| 🌊 Wave (ลำดับการทำ) | 1 |
| 🌿 Branch | `chore/UAM-FND-01-bootstrap-codebase` (แตกจาก `develop`) |
| ⛓️ Depends on | — (เริ่มได้เลย) |
| 🚧 Blocks | [UAM-FND-02](UAM-FND-02.md), [UAM-QA-01](UAM-QA-01.md) |

## 📝 Description
เริ่มแอป Angular 17.2 ใหม่ด้วย `ng new` (standalone, SCSS, routing) + PrimeNG 17.18, PrimeFlex 3.3, PrimeIcons 7, NgRx 17; ตั้ง Karma headless (`ChromeHeadlessNoSandbox`) และ CI (test + build) **สถานะ: ทำเสร็จแล้ว** ใน commit เริ่มต้นของ phase 0

## 🎯 Design reference
- Artboard: -
- Source เดิม (`client-uam-develop`, path ใต้ `src/app/`): repo นี้ (ไม่ใช้โค้ด `client-uam-develop`)

## 🐞 Actual result (ปัจจุบัน)
ก่อนทำ: repo มีแต่ `docs/`

## ✅ Expected result
`npm ci && npm test -- --watch=false --browsers=ChromeHeadlessNoSandbox && npm run build` ผ่านบน `develop`; มี CI; มี CLAUDE.md และ template

## 🛠️ แนวทางการแก้ไข
- ยังเหลือ: ตั้ง branch protection ของ `develop`/`main` บน GitHub (ต้องทำโดยเจ้าของ repo)
- เพิ่ม ESLint เป็นงานแยกถ้าต้องการ (ยังไม่อยู่ใน CI)
- ฟอนต์ Sukhumvit Set และรูป/ไอคอนต้องหาไฟล์จริงมาใส่ใน `src/assets` (ไฟล์ดีไซน์อ้าง `/_blob/<id>` ใช้ไม่ได้)

## ☑️ Acceptance criteria
- ☑️ `npm ci && ng build` ผ่านบน `develop`
- ☑️ CI รันอัตโนมัติบน PR
- ☑️ ตรงกับ artboard ที่อ้างถึง (desktop และ phone ถ้ามี)
- ☑️ ใช้เฉพาะฟิลด์ใน `shared/interfaces/**` ปัจจุบัน
- ☑️ Payload ที่ส่งหลังบ้านไม่เปลี่ยน (ผ่าน UAM-QA-01)
- ☑️ ผ่าน lint/build/test ใน CI

> 💡 หมายเหตุ: ระบุ "actual result" จากสเปก/เอกสารดีไซน์ — ให้ยืนยันกับ source เดิมตอนเริ่มทำ (session ที่ทำต้องมีสิทธิ์อ่าน `client-uam-develop`)
