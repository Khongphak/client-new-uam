---
title: "[UAM-QA-02] เก็บกวาด inline style และตรวจระยะห่างกับหน้าจอจริง"
labels: ["chore", "qa", "P3", "wave-11"]
---

# ✅ UAM-QA-02 — เก็บกวาด inline style และตรวจระยะห่างกับหน้าจอจริง

| ฟิลด์ | ค่า |
|---|---|
| Code | `UAM-QA-02` |
| ประเภท | 🧹 chore |
| Priority | 🟢 **P3** (score 28) |
| ⭐ Value / 🔓 Unblocks / 💪 Effort | 2 / 1 / 2 pts |
| 🌊 Wave (ลำดับการทำ) | 11 |
| 🌿 Branch | `chore/UAM-QA-02-inline-style-cleanup` (แตกจาก `develop`) |
| ⛓️ Depends on | [UAM-RSP-01](UAM-RSP-01.md) |
| 🚧 Blocks | — |

## 📝 Description
inline style ในไฟล์ดีไซน์เหลือราว 85 จุด (จัดวางอย่างเดียว) ต้องย้ายเป็น class/SCSS และตรวจ spacing กับ artboard

## 🎯 Design reference
- Artboard: ช่องว่าง #4
- Source เดิม (`client-uam-develop`, path ใต้ `src/app/`): ทุกหน้า

## 🐞 Actual result (ปัจจุบัน)
—

## ✅ Expected result
ไม่มี inline style ที่ไม่จำเป็น; spacing ตรง `--sp-*`

## 🛠️ แนวทางการแก้ไข
- -

## ☑️ Acceptance criteria
- ☑️ ตรงกับ artboard ที่อ้างถึง (desktop และ phone ถ้ามี)
- ☑️ ใช้เฉพาะฟิลด์ใน `shared/interfaces/**` ปัจจุบัน
- ☑️ Payload ที่ส่งหลังบ้านไม่เปลี่ยน (ผ่าน UAM-QA-01)
- ☑️ ผ่าน lint/build/test ใน CI

> 💡 หมายเหตุ: ระบุ "actual result" จากสเปก/เอกสารดีไซน์ — ให้ยืนยันกับ source เดิมตอนเริ่มทำ (session ที่ทำต้องมีสิทธิ์อ่าน `client-uam-develop`)
