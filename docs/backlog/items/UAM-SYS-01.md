---
title: "[UAM-SYS-01] System Setting: ตาราง 3 แท็บ (System / Menu / System to System) + ตัวกรอง"
labels: ["feature", "sys", "P0", "wave-5"]
---

# ⚙️ UAM-SYS-01 — System Setting: ตาราง 3 แท็บ (System / Menu / System to System) + ตัวกรอง

| ฟิลด์ | ค่า |
|---|---|
| Code | `UAM-SYS-01` |
| ประเภท | ✨ feature |
| Priority | 🔴 **P0** (score 85) |
| ⭐ Value / 🔓 Unblocks / 💪 Effort | 5 / 4 / 5 pts |
| 🌊 Wave (ลำดับการทำ) | 5 |
| 🌿 Branch | `feature/UAM-SYS-01-system-setting-tables` (แตกจาก `develop`) |
| ⛓️ Depends on | [UAM-SHL-01](UAM-SHL-01.md), [UAM-FND-05](UAM-FND-05.md) |
| 🚧 Blocks | [UAM-SYS-02](UAM-SYS-02.md) |

## 📝 Description
ตารางตามรูปแบบมาตรฐาน มีตัวนับในแท็บ ค้นหา และ Filters (Owner, Type, Status ฯลฯ) ฝั่งหน้าบ้าน; Menu มีคอลัมน์ `functional`, S2S มี `accessTokenTime`

## 🎯 Design reference
- Artboard: Systems, SystemsPhone; note `n-list`
- ที่มาของ requirement (ชื่อ path ของระบบเดิม — **อ้างอิงที่มาเท่านั้น ห้ามอ่าน/คัดลอก/ยึดโครงสร้างตาม** ดู CLAUDE.md §1 ข้อ 2): `setting-sub-page/setting-system`, `shared/constants/table/setting-menu/setting-system-column.ts`

## 🐞 Actual result (ปัจจุบัน)
ตารางเดิมนำไปหน้า action แยก

## ✅ Expected result
ตรงกับ artboard 4 ปุ่มเพิ่ม/ดู/แก้ไขเปิด drawer (ทำใน SYS-02..04)

## 🛠️ แนวทางการแก้ไข
- ตัวกรองคำนวณจากแถวที่โหลดแล้ว

## ☑️ Acceptance criteria
- ☑️ ตรงกับ artboard ที่อ้างถึง (desktop และ phone ถ้ามี)
- ☑️ ใช้เฉพาะฟิลด์ใน `shared/interfaces/**` ปัจจุบัน
- ☑️ Payload ที่ส่งหลังบ้านไม่เปลี่ยน (ผ่าน UAM-QA-01)
- ☑️ ผ่าน lint/build/test ใน CI

> 💡 หมายเหตุ: ช่อง "Actual result" เขียนจากสเปก/พฤติกรรมที่ระบุในเอกสารดีไซน์ ไม่ใช่จากโค้ด — ยืนยันกับแอปใหม่ใน repo นี้และสัญญา API เท่านั้น (**ห้ามเปิดอ่านโค้ดเก่า**) ถ้าไม่ชัดให้ถาม PM
