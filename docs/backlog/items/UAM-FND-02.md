---
title: "[UAM-FND-02] Design tokens & ธีม (uam.css → SCSS)"
labels: ["feature", "fnd", "P0", "wave-2"]
---

# 🧱 UAM-FND-02 — Design tokens & ธีม (uam.css → SCSS)

| ฟิลด์ | ค่า |
|---|---|
| Code | `UAM-FND-02` |
| ประเภท | ✨ feature |
| Priority | 🔴 **P0** (score 97) |
| ⭐ Value / 🔓 Unblocks / 💪 Effort | 5 / 5 / 3 pts |
| 🌊 Wave (ลำดับการทำ) | 2 |
| 🌿 Branch | `feature/UAM-FND-02-design-tokens-theme` (แตกจาก `develop`) |
| ⛓️ Depends on | [UAM-FND-01](UAM-FND-01.md) |
| 🚧 Blocks | [UAM-FND-03](UAM-FND-03.md), [UAM-FND-04](UAM-FND-04.md), [UAM-SHL-01](UAM-SHL-01.md), [UAM-AUT-01](UAM-AUT-01.md) |

## 📝 Description
แปลงตัวแปรและธีมจาก `uam.css` เป็น SCSS ของแอป: ตัวแปร `--uam-*` (สีหลัก `#00194b` / `#2854a7`, gradient, muted, line), สเกลระยะ `--sp-1..6`, ฟอนต์ Sukhumvit Set, focus ring `#2854a7`, override ของ PrimeNG (tabmenu แบบเส้นใต้, input, button, message)

## 🎯 Design reference
- Artboard: ทุก artboard; `uam.css` (ธีม lara-light-blue + override)
- Source เดิม (`client-uam-develop`, path ใต้ `src/app/`): `src/styles.scss`, theme ของ PrimeNG

## 🐞 Actual result (ปัจจุบัน)
ธีมเดิมของแอป ไม่มี token ชุดใหม่ ระยะห่างใช้ค่าตายตัว/inline

## ✅ Expected result
มี token ชุดเดียวใช้ทั้งแอป; PrimeNG แสดงตาม artboard; ไม่คัดลอก `uam.css` ทั้งไฟล์ (265 KB) แต่แยกเป็น partial: tokens / primeng-overrides / components

## 🛠️ แนวทางการแก้ไข
- แยกเฉพาะส่วนที่ใช้จริงจาก `uam.css` (เน้นบล็อก `v32`–`v40` ท้ายไฟล์ + :root)
- สร้าง `styles/_tokens.scss`, `_primeng-overrides.scss`
- ใช้ PrimeNG component และ PrimeIcons เท่านั้น ห้ามเพิ่มไลบรารีไอคอน
- ตรวจว่าไม่ทำให้หน้าเดิมที่ยังไม่ได้ redesign พัง (scope ด้วย class ราก หรือ feature flag ชั่วคราว)

## ☑️ Acceptance criteria
- ☑️ สี/ฟอนต์/ระยะตรงกับ `uam.css`
- ☑️ ไม่มี regression ภาพในหน้าที่ยังไม่ได้ทำ
- ☑️ ตรงกับ artboard ที่อ้างถึง (desktop และ phone ถ้ามี)
- ☑️ ใช้เฉพาะฟิลด์ใน `shared/interfaces/**` ปัจจุบัน
- ☑️ Payload ที่ส่งหลังบ้านไม่เปลี่ยน (ผ่าน UAM-QA-01)
- ☑️ ผ่าน lint/build/test ใน CI

> 💡 หมายเหตุ: ระบุ "actual result" จากสเปก/เอกสารดีไซน์ — ให้ยืนยันกับ source เดิมตอนเริ่มทำ (session ที่ทำต้องมีสิทธิ์อ่าน `client-uam-develop`)
