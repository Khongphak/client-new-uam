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
- ที่มาของ requirement (ชื่อ path ของระบบเดิม — **อ้างอิงที่มาเท่านั้น ห้ามอ่าน/คัดลอก/ยึดโครงสร้างตาม** ดู CLAUDE.md §1 ข้อ 2): ทุกหน้า

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

> 💡 หมายเหตุ: ช่อง "Actual result" เขียนจากสเปก/พฤติกรรมที่ระบุในเอกสารดีไซน์ ไม่ใช่จากโค้ด — ยืนยันกับแอปใหม่ใน repo นี้และสัญญา API เท่านั้น (**ห้ามเปิดอ่านโค้ดเก่า**) ถ้าไม่ชัดให้ถาม PM
