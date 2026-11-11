---
title: "[UAM-FND-02] Design tokens & ธีม: PrimeNG 21 custom preset + SCSS tokens (ตาม uam.css)"
labels: ["feature", "fnd", "P0", "wave-2"]
---

# 🧱 UAM-FND-02 — Design tokens & ธีม: PrimeNG 21 custom preset + SCSS tokens (ตาม uam.css)

| ฟิลด์ | ค่า |
|---|---|
| Code | `UAM-FND-02` |
| ประเภท | ✨ feature |
| Priority | 🔴 **P0** (score 95) |
| ⭐ Value / 🔓 Unblocks / 💪 Effort | 5 / 5 / 5 pts |
| 🌊 Wave (ลำดับการทำ) | 2 |
| 🌿 Branch | `feature/UAM-FND-02-primeng21-preset-tokens` (แตกจาก `develop`) |
| ⛓️ Depends on | [UAM-FND-01](UAM-FND-01.md) |
| 🚧 Blocks | [UAM-FND-03](UAM-FND-03.md), [UAM-FND-04](UAM-FND-04.md), [UAM-SHL-01](UAM-SHL-01.md), [UAM-AUT-01](UAM-AUT-01.md) |

## 📝 Description
PrimeNG 21 ใช้ระบบ preset (`@primeuix/themes` 2) ไม่ใช่ไฟล์ CSS ธีมแบบเดิม จึงต้องสร้าง **custom preset** ด้วย `definePreset(Lara, …)` จาก `@primeuix/themes/lara` (primary `palette('#2854a7')`, surface/radius/focus ring ตามดีไซน์, `darkModeSelector: 'none'` — ตัวอย่างที่ทดลองแล้วใน ADR-0001 (ก)) + ตัวแปร `--uam-*`, สเกลระยะ `--sp-1..6`, font-stack Sukhumvit Set ให้ภาพใกล้ artboard

## 🎯 Design reference
- Artboard: ทุก artboard; `uam.css` (ธีม lara-light-blue ของ PrimeNG 17 + override)
- ที่มาของ requirement (ชื่อ path ของระบบเดิม — **อ้างอิงที่มาเท่านั้น ห้ามอ่าน/คัดลอก/ยึดโครงสร้างตาม** ดู CLAUDE.md §1 ข้อ 2): `src/styles.scss`, `app.config.ts` (`providePrimeNG`)

## 🐞 Actual result (ปัจจุบัน)
ยังไม่มีธีม/token ในแอปใหม่

## ✅ Expected result
token ชุดเดียวใช้ทั้งแอป; PrimeNG 21 แสดงใกล้ artboard (ตรงด้วย token ไม่ต้อง pixel-exact; เทียบ screenshot); ไม่คัดลอก `uam.css` ทั้งไฟล์ (265 KB)

## 🛠️ แนวทางการแก้ไข
- ใช้ API preset ของ `@primeuix/themes` 2 (`definePreset`, `palette`, `providePrimeNG({theme})`) ตาม `.d.ts` ที่ติดตั้ง ไม่เดา; ทุก preset ตั้ง primary เป็น emerald → ต้อง override; มี unit test ยืนยัน `--p-primary-500: #2854a7`
- map ค่าจาก `:root` และบล็อก v32–v40 ของ `uam.css` เป็น preset + `_tokens.scss`
- เทียบภาพหน้า demo กับ artboard (Playwright screenshot) แนบใน PR; ระบุส่วนที่ต่างและเหตุผล
- ห้ามเพิ่มไลบรารี UI/ไอคอนใหม่; ใช้ PrimeIcons 7

## ☑️ Acceptance criteria
- ☑️ สี/ฟอนต์/ระยะตรง token
- ☑️ ภาพเทียบ artboard แนบใน PR
- ☑️ ตรงกับ artboard ที่อ้างถึง (desktop และ phone ถ้ามี)
- ☑️ ใช้เฉพาะฟิลด์ใน `shared/interfaces/**` ปัจจุบัน
- ☑️ Payload ที่ส่งหลังบ้านไม่เปลี่ยน (ผ่าน UAM-QA-01)
- ☑️ ผ่าน lint/build/test ใน CI

> 💡 หมายเหตุ: ช่อง "Actual result" เขียนจากสเปก/พฤติกรรมที่ระบุในเอกสารดีไซน์ ไม่ใช่จากโค้ด — ยืนยันกับแอปใหม่ใน repo นี้และสัญญา API เท่านั้น (**ห้ามเปิดอ่านโค้ดเก่า**) ถ้าไม่ชัดให้ถาม PM
