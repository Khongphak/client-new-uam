---
title: "[UAM-A11Y-01] Accessibility audit บน Angular จริง (WCAG 2.1 AA)"
labels: ["test", "a11y", "P2", "wave-11"]
---

# ♿ UAM-A11Y-01 — Accessibility audit บน Angular จริง (WCAG 2.1 AA)

| ฟิลด์ | ค่า |
|---|---|
| Code | `UAM-A11Y-01` |
| ประเภท | 🧪 test |
| Priority | 🟡 **P2** (score 57) |
| ⭐ Value / 🔓 Unblocks / 💪 Effort | 4 / 2 / 3 pts |
| 🌊 Wave (ลำดับการทำ) | 11 |
| 🌿 Branch | `test/UAM-A11Y-01-a11y-audit` (แตกจาก `develop`) |
| ⛓️ Depends on | [UAM-RSP-01](UAM-RSP-01.md) |
| 🚧 Blocks | — |

## 📝 Description
ตรวจ label ปุ่มไอคอน, focus ring `#2854a7`, ลำดับ tab, contrast, คีย์บอร์ดสำหรับ DnD/stepper/drawer

## 🎯 Design reference
- Artboard: ช่องว่าง #5
- Source เดิม (`client-uam-develop`, path ใต้ `src/app/`): ทุกหน้า

## 🐞 Actual result (ปัจจุบัน)
ยังไม่เคย audit

## ✅ Expected result
ผ่านเช็กลิสต์ WCAG 2.1 AA; แก้ปัญหาที่พบ

## 🛠️ แนวทางการแก้ไข
- ใช้ axe + ตรวจมือ

## ☑️ Acceptance criteria
- ☑️ ตรงกับ artboard ที่อ้างถึง (desktop และ phone ถ้ามี)
- ☑️ ใช้เฉพาะฟิลด์ใน `shared/interfaces/**` ปัจจุบัน
- ☑️ Payload ที่ส่งหลังบ้านไม่เปลี่ยน (ผ่าน UAM-QA-01)
- ☑️ ผ่าน lint/build/test ใน CI

> 💡 หมายเหตุ: ระบุ "actual result" จากสเปก/เอกสารดีไซน์ — ให้ยืนยันกับ source เดิมตอนเริ่มทำ (session ที่ทำต้องมีสิทธิ์อ่าน `client-uam-develop`)
