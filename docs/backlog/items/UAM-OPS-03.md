---
title: "[UAM-OPS-03] ng test ไม่ออกหลังรันเสร็จเมื่อคอมโพเนนต์มี styles (CI build-test ค้าง)"
labels: ["chore", "ops", "P2", "wave-0"]
---

# 🧹 UAM-OPS-03 — `ng test` ไม่ออกหลังรันเสร็จเมื่อคอมโพเนนต์มี `styles`

| ฟิลด์ | ค่า |
|---|---|
| Code | `UAM-OPS-03` |
| ประเภท | 🧹 chore |
| Priority | 🟡 **P2** (score 57) |
| ⭐ Value / 🔓 Unblocks / 💪 Effort | 3 / 3 / 3 pts |
| 🌊 Wave (ลำดับการทำ) | 0 (ไม่มี dependency) |
| 🌿 Branch | `chore/UAM-OPS-03-ng-test-hang` (แตกจาก `develop`) |
| ⛓️ Depends on | — |
| 🚧 Blocks | — |
| 🔗 Issue | #103 (ชื่อเดิม `UAM-OPS-??`) |
| 🧪 Test case | — (งาน infra) |

## 📝 Description
บางสถานการณ์ `ng test` (Vitest) รันเสร็จและพิมพ์ผลผ่านครบ แต่ process ไม่ออกเอง ทำให้ `npm run test:ci` และ CI `build-test` ค้าง (ตัวอย่าง PR #101 head `e583c67`, run 45800350211 ค้างเกิน 48 นาที ขณะที่ run อื่นจบ ~40 วินาที)

## 🎯 Design reference
- Artboard: -

## 🐞 Actual result (ปัจจุบัน)
ตัวกระตุ้นใน PR #101 คือบล็อก `styles` ของคอมโพเนนต์ใน `src/app/shared/ui/status-dialogs.ts` (เอาออกแล้วใน commit `4164f85`) ทดลองซ้ำได้: develop ล้วนจบ ~7 วินาที; คอมโพเนนต์ที่มี `styles` (ทุกแบบที่ลอง) ค้าง; ไฟล์อื่นใน `shared/detail/*` ที่มี `styles` ไม่ค้าง — ต้นเหตุจริงยังไม่รู้ (อาจเกี่ยวกับ `styles` ร่วมกับ `p-dialog`/`p-button`, unit-test builder หรือ handle ค้างของ worker) รายงานจากการรันรอบ QA 2026-11-26 บน develop `eafa0d8`: `test:ci` จบเอง ~11 วินาที (ไม่เกิด)

## ✅ Expected result
รู้ต้นเหตุที่แน่ชัดและมีข้อสรุปว่าเป็นข้อจำกัดของเครื่องมือ (มี workaround/กฎให้ dev) หรือบั๊กที่แก้ได้ เพื่อไม่ให้ PR อื่นติด CI ค้างโดยไม่รู้สาเหตุ

## 🛠️ แนวทางการแก้ไข
- reproduce: เพิ่ม `styles` ธรรมดาใน `UInactiveConfirm`/`UInactiveFail` (ดู commit `e583c67`) แล้วรัน `timeout 60 npx ng test --watch=false`
- ตรวจ handle ที่ค้าง และว่าเกิดเฉพาะเมื่อมี `p-dialog` ในคอมโพเนนต์เดียวกันหรือไม่ (`pool`/`teardownTimeout` ใน config ของ `@angular/build:unit-test`)
- ถ้าเป็นข้อจำกัด: บันทึกกฎใน `src/app/shared/README.md`/`CLAUDE.md` (ผ่าน Senior) และพิจารณา `timeout-minutes` ของ step ใน CI
- **ห้ามแก้ test ให้ผ่านแบบหลอก / ห้ามข้าม test**

## ☑️ Acceptance criteria
- ☑️ มีคำอธิบายต้นเหตุพร้อมหลักฐานที่ทำซ้ำได้
- ☑️ มีทางแก้หรือกฎที่ป้องกันซ้ำ (หรือบันทึกเป็นข้อจำกัดพร้อม workaround)
- ☑️ `npm run test:ci` จบเองใน CI และเครื่อง dev ทุกกรณีที่ครอบคลุม
- ☑️ ไม่เปลี่ยน payload/ฟิลด์ใดๆ
