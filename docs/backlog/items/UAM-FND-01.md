---
title: "[UAM-FND-01] สร้างแอปใหม่บน Angular 21 LTS + PrimeNG 21 + baseline CI/test — ทำใหม่"
labels: ["chore", "fnd", "P0", "wave-1"]
---

# 🧱 UAM-FND-01 — สร้างแอปใหม่บน Angular 21 LTS + PrimeNG 21 + baseline CI/test — ทำใหม่

| ฟิลด์ | ค่า |
|---|---|
| Code | `UAM-FND-01` |
| ประเภท | 🧹 chore |
| Priority | 🔴 **P0** (score 97) |
| ⭐ Value / 🔓 Unblocks / 💪 Effort | 5 / 5 / 3 pts |
| 🌊 Wave (ลำดับการทำ) | 1 |
| 🌿 Branch | `chore/UAM-FND-01-bootstrap-angular21` (แตกจาก `develop`) |
| ⛓️ Depends on | [UAM-ARC-01](UAM-ARC-01.md) |
| 🚧 Blocks | [UAM-FND-02](UAM-FND-02.md), [UAM-QA-01](UAM-QA-01.md), [UAM-API-01](UAM-API-01.md) |

## 📝 Description
สร้างแอปด้วย `npx @angular/cli@21 new` (Angular 21.2 LTS, TypeScript ~5.9, zoneless, standalone, Vitest 4 + jsdom) + `primeng@21.1.10`, `@primeuix/themes@~2.0.3`, `primeicons@7.0.0`, `primeflex@4`, `@angular/cdk@21`, `@vitest/coverage-v8@4` (ไม่ใช้ NgRx, ไม่ใช้ `@angular/animations`) ตามเวอร์ชันที่ล็อกใน ADR-0001; เปลี่ยน CI เป็น Node 22; กำหนดสคริปต์ `npm test`, `npm run test:ci`, `npm run check:licenses`, `npm run build`

## 🎯 Design reference
- Artboard: -
- ที่มาของ requirement (ชื่อ path ของระบบเดิม — **อ้างอิงที่มาเท่านั้น ห้ามอ่าน/คัดลอก/ยึดโครงสร้างตาม** ดู CLAUDE.md §1 ข้อ 2): repo นี้ (แทนที่แอป Angular 17 เดิมทั้งหมด; ไม่ใช้โค้ด `client-uam-develop`)

## 🐞 Actual result (ปัจจุบัน)
แอปปัจจุบันเป็น Angular 17.2 / PrimeNG 17.18 / Karma (ล้าสมัย) — issue #2 เดิมถูกปิดว่าเสร็จ แต่ต้องเปิดใหม่

## ✅ Expected result
`npm ci && npm run test:ci && npm run build` ผ่านบน Node 22; ไม่มี Karma/zone.js ตกค้าง; CI เขียว; CLAUDE.md/README ตรงกับคำสั่งจริง

## 🛠️ แนวทางการแก้ไข
- ลบ Angular 17 เดิมออกทั้งหมด (`angular.json`, `karma.conf.js`, `package.json`, `src/`) แล้วสร้างใหม่ใน repo นี้ — ห้ามผสมสองเวอร์ชัน
- ใช้เวอร์ชันที่ `ng new` v21 เลือก (TS ~5.9; ห้ามขึ้น TS 6) และ pin สาย PrimeNG ตาม ADR-0001 (`primeng`/`primeicons` ตรงตัว, `@primeuix/themes` `~2.0.3`) — ห้ามใช้ PrimeNG 22+/`-lts`
- ติดตั้ง/สร้าง lockfile ด้วย `npx npm@11 install …` (npm 10 ล้มด้วย `edgesOut` ตอนสร้าง tree ใหม่ ดู ADR-0001 (ช)); **ห้าม `--legacy-peer-deps`**; CI ใช้ `npm ci` ปกติ
- ตั้ง `providePrimeNG({ theme: { preset: Lara, options: { darkModeSelector: 'none' } } })` พื้นฐาน (preset สี UAM ทำใน FND-02); ไม่ต้อง `provideAnimations*()`
- ตั้ง `angular.json` › `schematics` ให้ component เป็น `changeDetection: OnPush` (v21 ยังไม่เป็นค่าเริ่มต้น); styles โหลด `primeflex.min.css` + `primeicons.css`
- budget initial: warning 1.5 MB / error 2 MB (ค่าเริ่มต้น 500 kB/1 MB ไม่พอ) + lazy-load ทุก feature route
- สคริปต์ `check:licenses` (Node ล้วน อ่าน `package-lock.json`): fail ถ้า `primeng` major > 21, `@primeuix/themes` major > 2, `primeicons` major > 7 หรือมี `-lts` — รันใน CI ก่อน test
- สร้างโครงโฟลเดอร์ DDD-lite ตาม ADR-0001 (ว่างเปล่า + README สั้น ๆ ต่อโฟลเดอร์ ถ้าจำเป็น)
- อัปเดต `.github/workflows/ci.yml` (Node 22, `npm ci`, `npm run check:licenses`, `npm run test:ci`, `npm run build`) — ชื่อ job ต้องยังเป็น `build-test` (ruleset บังคับ)
- อัปเดตคำสั่งใน CLAUDE.md / README / PR template / skill ให้ตรง (PM จะแก้เอกสารล่วงหน้าเป็น placeholder `test:ci`)
- ฟอนต์ Sukhumvit Set และรูปโลโก้ยังไม่มีไฟล์จริง → ใช้ font-stack ชั่วคราว
- เพิ่ม CI step กันโค้ดเก่า: fail ถ้าพบ `client-uam-develop` หรือ path เดิม (เช่น `setting-sub-page`, `modal.data.ts`) ใน `src/` — ใช้สคริปต์ grep ง่ายๆ

## ☑️ Acceptance criteria
- ☑️ Node 22 + Angular 21 build/test ผ่าน (`npm ci && npm run test:ci && npm run build`) ภายใน budget ที่ตั้ง
- ☑️ เวอร์ชันใน `package-lock.json` ตรงกับตาราง ADR-0001; `npm run check:licenses` ผ่าน และ fail จริงเมื่อจำลอง primeng 22
- ☑️ CI `build-test` เขียวบน PR
- ☑️ ไม่เหลือ dependency Angular 17
- ☑️ ตรงกับ artboard ที่อ้างถึง (desktop และ phone ถ้ามี)
- ☑️ ใช้เฉพาะฟิลด์ใน `shared/interfaces/**` ปัจจุบัน
- ☑️ Payload ที่ส่งหลังบ้านไม่เปลี่ยน (ผ่าน UAM-QA-01)
- ☑️ ผ่าน lint/build/test ใน CI

> 💡 หมายเหตุ: ช่อง "Actual result" เขียนจากสเปก/พฤติกรรมที่ระบุในเอกสารดีไซน์ ไม่ใช่จากโค้ด — ยืนยันกับแอปใหม่ใน repo นี้และสัญญา API เท่านั้น (**ห้ามเปิดอ่านโค้ดเก่า**) ถ้าไม่ชัดให้ถาม PM
