---
title: "[UAM-FND-02] Design tokens & ธีม: PrimeNG 22 custom preset + SCSS tokens (ตาม uam.css)"
labels: ["feature", "fnd", "P0", "wave-2"]
---

# 🧱 UAM-FND-02 — Design tokens & ธีม: PrimeNG 22 custom preset + SCSS tokens (ตาม uam.css)

| ฟิลด์ | ค่า |
|---|---|
| Code | `UAM-FND-02` |
| ประเภท | ✨ feature |
| Priority | 🔴 **P0** (score 95) |
| ⭐ Value / 🔓 Unblocks / 💪 Effort | 5 / 5 / 5 pts |
| 🌊 Wave (ลำดับการทำ) | 2 |
| 🌿 Branch | `feature/UAM-FND-02-primeng22-preset-tokens` (แตกจาก `develop`) |
| ⛓️ Depends on | [UAM-FND-01](UAM-FND-01.md) |
| 🚧 Blocks | [UAM-FND-03](UAM-FND-03.md), [UAM-FND-04](UAM-FND-04.md), [UAM-SHL-01](UAM-SHL-01.md), [UAM-AUT-01](UAM-AUT-01.md) |

## 📝 Description
PrimeNG 22 ใช้ระบบ preset (`@primeuix/themes`) ไม่ใช่ไฟล์ CSS ธีมแบบเดิม จึงต้องสร้าง **custom preset** (ฐาน Lara, primary `#2854a7`, surface/radius/focus ring ตามดีไซน์) + ตัวแปร `--uam-*`, สเกลระยะ `--sp-1..6`, font-stack Sukhumvit Set ให้ภาพใกล้ artboard

## 🎯 Design reference
- Artboard: ทุก artboard; `uam.css` (ธีม lara-light-blue ของ PrimeNG 17 + override)
- Source เดิม (`client-uam-develop`, path ใต้ `src/app/`): `src/styles.scss`, `app.config.ts` (`providePrimeNG`)

## 🐞 Actual result (ปัจจุบัน)
ยังไม่มีธีม/token ในแอปใหม่

## ✅ Expected result
token ชุดเดียวใช้ทั้งแอป; PrimeNG 22 แสดงใกล้ artboard (เทียบ screenshot); ไม่คัดลอก `uam.css` ทั้งไฟล์ (265 KB)

## 🛠️ แนวทางการแก้ไข
- ศึกษา API preset ของ PrimeNG 22 (`definePreset`, `providePrimeNG({theme})`) จากเอกสาร/โค้ดที่ติดตั้ง ไม่เดา
- map ค่าจาก `:root` และบล็อก v32–v40 ของ `uam.css` เป็น preset + `_tokens.scss`
- เทียบภาพหน้า demo กับ artboard (Playwright screenshot) แนบใน PR; ระบุส่วนที่ต่างและเหตุผล
- ห้ามเพิ่มไลบรารี UI/ไอคอนใหม่; ใช้ PrimeIcons 8

## ☑️ Acceptance criteria
- ☑️ สี/ฟอนต์/ระยะตรง token
- ☑️ ภาพเทียบ artboard แนบใน PR
- ☑️ ตรงกับ artboard ที่อ้างถึง (desktop และ phone ถ้ามี)
- ☑️ ใช้เฉพาะฟิลด์ใน `shared/interfaces/**` ปัจจุบัน
- ☑️ Payload ที่ส่งหลังบ้านไม่เปลี่ยน (ผ่าน UAM-QA-01)
- ☑️ ผ่าน lint/build/test ใน CI

> 💡 หมายเหตุ: ระบุ "actual result" จากสเปก/เอกสารดีไซน์ — ให้ยืนยันกับ source เดิมตอนเริ่มทำ (session ที่ทำต้องมีสิทธิ์อ่าน `client-uam-develop`)
