---
title: "[UAM-FND-05] คอมโพเนนต์ร่วมของตาราง: toolbar + Filters panel + footer/paginator"
labels: ["feature", "fnd", "P0", "wave-4"]
---

# 🧱 UAM-FND-05 — คอมโพเนนต์ร่วมของตาราง: toolbar + Filters panel + footer/paginator

| ฟิลด์ | ค่า |
|---|---|
| Code | `UAM-FND-05` |
| ประเภท | ✨ feature |
| Priority | 🔴 **P0** (score 95) |
| ⭐ Value / 🔓 Unblocks / 💪 Effort | 5 / 5 / 5 pts |
| 🌊 Wave (ลำดับการทำ) | 4 |
| 🌿 Branch | `feature/UAM-FND-05-shared-table-toolbar` (แตกจาก `develop`) |
| ⛓️ Depends on | [UAM-FND-03](UAM-FND-03.md) |
| 🚧 Blocks | [UAM-ERR-05](UAM-ERR-05.md), [UAM-SYS-01](UAM-SYS-01.md), [UAM-USR-01](UAM-USR-01.md) |

## 📝 Description
รูปแบบตารางเดียวทุกหน้า: การ์ด + แถบเครื่องมือ (ค้นหาซ้าย; ปุ่ม Filters พร้อมตัวนับ + Reset ขวา), แผง dropdown มีป้ายชื่อ (`u-filters` + `bar__end`), ท้ายตาราง "Showing 1 to X of Y entries" ซ้าย paginator ขวา (`u-card-foot`), ตัวนับในแท็บ

## 🎯 Design reference
- Artboard: Systems, Users (Roles/Users tabs)
- ที่มาของ requirement (ชื่อ path ของระบบเดิม — **อ้างอิงที่มาเท่านั้น ห้ามอ่าน/คัดลอก/ยึดโครงสร้างตาม** ดู CLAUDE.md §1 ข้อ 2): `setting-sub-page/setting-system`, `setting-users`, `shared/constants/table/**`

## 🐞 Actual result (ปัจจุบัน)
ตารางเดิมใช้ฟิลเตอร์/ค้นหาคนละแบบในแต่ละหน้า

## ✅ Expected result
คอมโพเนนต์/directive เดียวที่รับ config ของคอลัมน์ + ตัวกรอง; ค้นหา/กรอง/นับทำฝั่งหน้าบ้านจากแถวที่โหลดแล้ว

## 🛠️ แนวทางการแก้ไข
- กรองฝั่ง client เท่านั้น ไม่เพิ่ม query param ใหม่ไปหลังบ้าน
- ใช้ตัวแปรคอลัมน์เดิมใน `users-column.ts`/`setting-system-column.ts` ปรับเฉพาะ presentation
- รองรับ phone เป็นรายการแตะเปิด (ดู UAM-RSP-01)

## ☑️ Acceptance criteria
- ☑️ Filters ทำงานเหมือนกันทั้ง System/Menu/S2S/Roles/Users
- ☑️ ตรงกับ artboard ที่อ้างถึง (desktop และ phone ถ้ามี)
- ☑️ ใช้เฉพาะฟิลด์ใน `shared/interfaces/**` ปัจจุบัน
- ☑️ Payload ที่ส่งหลังบ้านไม่เปลี่ยน (ผ่าน UAM-QA-01)
- ☑️ ผ่าน lint/build/test ใน CI

> 💡 หมายเหตุ: ช่อง "Actual result" เขียนจากสเปก/พฤติกรรมที่ระบุในเอกสารดีไซน์ ไม่ใช่จากโค้ด — ยืนยันกับแอปใหม่ใน repo นี้และสัญญา API เท่านั้น (**ห้ามเปิดอ่านโค้ดเก่า**) ถ้าไม่ชัดให้ถาม PM
