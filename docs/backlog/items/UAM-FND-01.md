---
title: "[UAM-FND-01] สร้างแอปใหม่บน stack ล่าสุด (Angular 22) + baseline CI/test — ทำใหม่"
labels: ["chore", "fnd", "P0", "wave-1"]
---

# 🧱 UAM-FND-01 — สร้างแอปใหม่บน stack ล่าสุด (Angular 22) + baseline CI/test — ทำใหม่

| ฟิลด์ | ค่า |
|---|---|
| Code | `UAM-FND-01` |
| ประเภท | 🧹 chore |
| Priority | 🔴 **P0** (score 97) |
| ⭐ Value / 🔓 Unblocks / 💪 Effort | 5 / 5 / 3 pts |
| 🌊 Wave (ลำดับการทำ) | 1 |
| 🌿 Branch | `chore/UAM-FND-01-bootstrap-angular22` (แตกจาก `develop`) |
| ⛓️ Depends on | [UAM-ARC-01](UAM-ARC-01.md) |
| 🚧 Blocks | [UAM-FND-02](UAM-FND-02.md), [UAM-QA-01](UAM-QA-01.md), [UAM-API-01](UAM-API-01.md) |

## 📝 Description
สร้างแอปด้วย `ng new` ตัวล่าสุด (Angular 22.2, TypeScript ~6.0, zoneless, standalone, Vitest+jsdom) + PrimeNG 22, @primeuix/themes, PrimeIcons 8, PrimeFlex 4 (ไม่ใช้ NgRx) ตาม ADR-0001; เปลี่ยน CI เป็น Node 22; กำหนดสคริปต์ `npm test`, `npm run test:ci`, `npm run build`

## 🎯 Design reference
- Artboard: -
- ที่มาของ requirement (ชื่อ path ของระบบเดิม — **อ้างอิงที่มาเท่านั้น ห้ามอ่าน/คัดลอก/ยึดโครงสร้างตาม** ดู CLAUDE.md §1 ข้อ 2): repo นี้ (แทนที่แอป Angular 17 เดิมทั้งหมด; ไม่ใช้โค้ด `client-uam-develop`)

## 🐞 Actual result (ปัจจุบัน)
แอปปัจจุบันเป็น Angular 17.2 / PrimeNG 17.18 / Karma (ล้าสมัย) — issue #2 เดิมถูกปิดว่าเสร็จ แต่ต้องเปิดใหม่

## ✅ Expected result
`npm ci && npm run test:ci && npm run build` ผ่านบน Node 22; ไม่มี Karma/zone.js ตกค้าง; CI เขียว; CLAUDE.md/README ตรงกับคำสั่งจริง

## 🛠️ แนวทางการแก้ไข
- ลบ Angular 17 เดิมออกทั้งหมด (`angular.json`, `karma.conf.js`, `package.json`, `src/`) แล้วสร้างใหม่ใน repo นี้ — ห้ามผสมสองเวอร์ชัน
- ใช้เวอร์ชันที่ `ng new` เลือก (TS ~6.0; ห้ามขึ้น TS 7 จน Angular รองรับ)
- ตรวจว่า PrimeNG 22 ต้องการ animation/provider อะไรบ้าง และตั้ง `providePrimeNG` พื้นฐาน
- สร้างโครงโฟลเดอร์ DDD-lite ตาม ADR-0001 (ว่างเปล่า + README สั้น ๆ ต่อโฟลเดอร์ ถ้าจำเป็น)
- อัปเดต `.github/workflows/ci.yml` (Node 22, `npm run test:ci`, `npm run build`) — ชื่อ job ต้องยังเป็น `build-test` (ruleset บังคับ)
- อัปเดตคำสั่งใน CLAUDE.md / README / PR template / skill ให้ตรง (PM จะแก้เอกสารล่วงหน้าเป็น placeholder `test:ci`)
- ฟอนต์ Sukhumvit Set และรูปโลโก้ยังไม่มีไฟล์จริง → ใช้ font-stack ชั่วคราว
- เพิ่ม CI step กันโค้ดเก่า: fail ถ้าพบ `client-uam-develop` หรือ path เดิม (เช่น `setting-sub-page`, `modal.data.ts`) ใน `src/` — ใช้สคริปต์ grep ง่ายๆ

## ☑️ Acceptance criteria
- ☑️ Node 22 + Angular 22 build/test ผ่าน
- ☑️ CI `build-test` เขียวบน PR
- ☑️ ไม่เหลือ dependency Angular 17
- ☑️ ตรงกับ artboard ที่อ้างถึง (desktop และ phone ถ้ามี)
- ☑️ ใช้เฉพาะฟิลด์ใน `shared/interfaces/**` ปัจจุบัน
- ☑️ Payload ที่ส่งหลังบ้านไม่เปลี่ยน (ผ่าน UAM-QA-01)
- ☑️ ผ่าน lint/build/test ใน CI

> 💡 หมายเหตุ: ช่อง "Actual result" เขียนจากสเปก/พฤติกรรมที่ระบุในเอกสารดีไซน์ ไม่ใช่จากโค้ด — ยืนยันกับแอปใหม่ใน repo นี้และสัญญา API เท่านั้น (**ห้ามเปิดอ่านโค้ดเก่า**) ถ้าไม่ชัดให้ถาม PM
