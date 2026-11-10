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
- ที่มาของ requirement (ชื่อ path ของระบบเดิม — **อ้างอิงที่มาเท่านั้น ห้ามอ่าน/คัดลอก/ยึดโครงสร้างตาม** ดู CLAUDE.md §1 ข้อ 2): ทุกหน้า

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

> 💡 หมายเหตุ: ช่อง "Actual result" เขียนจากสเปก/พฤติกรรมที่ระบุในเอกสารดีไซน์ ไม่ใช่จากโค้ด — ยืนยันกับแอปใหม่ใน repo นี้และสัญญา API เท่านั้น (**ห้ามเปิดอ่านโค้ดเก่า**) ถ้าไม่ชัดให้ถาม PM
