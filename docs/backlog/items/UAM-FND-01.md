---
title: "[UAM-FND-01] เตรียม codebase ใน repo นี้ (นำ source เดิมเข้ามา + baseline)"
labels: ["chore", "fnd", "P0", "wave-1"]
---

# 🧱 UAM-FND-01 — เตรียม codebase ใน repo นี้ (นำ source เดิมเข้ามา + baseline)

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
repo `client-new-uam` ตอนนี้มีเฉพาะ `docs/` ยังไม่มีโค้ด Angular ต้องนำ source เดิม (Angular 17.2, PrimeNG 17.18, PrimeFlex 3.3, PrimeIcons 7, NgRx) เข้ามาเป็น baseline ก่อนทำ story อื่น

## 🎯 Design reference
- Artboard: -
- Source เดิม (`client-uam-develop`, path ใต้ `src/app/`): repo `client-uam-develop` (อ่านอย่างเดียว) → ปลายทาง repo นี้

## 🐞 Actual result (ปัจจุบัน)
ไม่มี `package.json`, `angular.json`, `src/app/` ใน repo; ไม่มี CI

## ✅ Expected result
ติดตั้งและ `ng build` / `ng serve` ผ่านบน `develop`; โครงสร้าง `src/app/**` เหมือน repo เดิม; มี CI (build + lint + test) และ README อธิบายวิธีรัน

## 🛠️ แนวทางการแก้ไข
- คัดลอก/ย้าย source จาก `client-uam-develop` (ไม่เอา history ก็ได้ แต่ต้องระบุ commit ต้นทางใน README)
- ล็อกเวอร์ชันตามสเปก (Angular 17.2, PrimeNG 17.18, PrimeFlex 3.3, PrimeIcons 7, NgRx)
- นำ assets จริง (`assets/images`, `assets/svg`, ฟอนต์ Sukhumvit Set ใน `src/styles.scss`) มาด้วย เพราะ `/_blob/<id>` ในไฟล์ดีไซน์ใช้ไม่ได้
- เพิ่ม GitHub Actions: install, lint, build, test
- ตั้ง branch protection ให้ `develop` ต้องผ่าน CI

## ☑️ Acceptance criteria
- ☑️ `npm ci && ng build` ผ่านบน `develop`
- ☑️ CI รันอัตโนมัติบน PR
- ☑️ ตรงกับ artboard ที่อ้างถึง (desktop และ phone ถ้ามี)
- ☑️ ใช้เฉพาะฟิลด์ใน `shared/interfaces/**` ปัจจุบัน
- ☑️ Payload ที่ส่งหลังบ้านไม่เปลี่ยน (ผ่าน UAM-QA-01)
- ☑️ ผ่าน lint/build/test ใน CI

> 💡 หมายเหตุ: ระบุ "actual result" จากสเปก/เอกสารดีไซน์ — ให้ยืนยันกับ source เดิมตอนเริ่มทำ (session ที่ทำต้องมีสิทธิ์อ่าน `client-uam-develop`)
