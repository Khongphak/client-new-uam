---
title: "[UAM-USR-01] User & Permission: ตาราง Roles/Users (แท็บ Roles ก่อน Users, fragment `#roles`/`#users`)"
labels: ["feature", "usr", "P0", "wave-5"]
---

# 👥 UAM-USR-01 — User & Permission: ตาราง Roles/Users (แท็บ Roles ก่อน Users, fragment `#roles`/`#users`)

| ฟิลด์ | ค่า |
|---|---|
| Code | `UAM-USR-01` |
| ประเภท | ✨ feature |
| Priority | 🔴 **P0** (score 95) |
| ⭐ Value / 🔓 Unblocks / 💪 Effort | 5 / 5 / 5 pts |
| 🌊 Wave (ลำดับการทำ) | 5 |
| 🌿 Branch | `feature/UAM-USR-01-roles-users-lists` (แตกจาก `develop`) |
| ⛓️ Depends on | [UAM-SHL-01](UAM-SHL-01.md), [UAM-FND-05](UAM-FND-05.md) |
| 🚧 Blocks | [UAM-USR-02](UAM-USR-02.md), [UAM-USR-03](UAM-USR-03.md), [UAM-USR-04](UAM-USR-04.md), [UAM-ROL-01](UAM-ROL-01.md) |

## 📝 Description
แท็บ Roles: Role Name, System Name, Description, Status, Updated Date/By. แท็บ Users: Username, Name, Surname, Email, Ext., Department, UAM role, Status, Updated. ชื่อเป็นลิงก์ไปหน้า View; ตัวกรอง Department/UAM role/Status ฝั่งหน้าบ้าน; ไม่มีจำนวนเมนู/ผู้ใช้/ระบบ

## 🎯 Design reference
- Artboard: Users, UsersPhone; note `n-list`
- ที่มาของ requirement (ชื่อ path ของระบบเดิม — **อ้างอิงที่มาเท่านั้น ห้ามอ่าน/คัดลอก/ยึดโครงสร้างตาม** ดู CLAUDE.md §1 ข้อ 2): `setting-sub-page/setting-users`, `users-column.ts`

## 🐞 Actual result (ปัจจุบัน)
ตารางเดิม

## ✅ Expected result
ตรงกับ artboard 5; tabMenu ใช้ fragment

## 🛠️ แนวทางการแก้ไข
- ไม่แสดงฟิลด์ที่ model ไม่มี

## ☑️ Acceptance criteria
- ☑️ ตรงกับ artboard ที่อ้างถึง (desktop และ phone ถ้ามี)
- ☑️ ใช้เฉพาะฟิลด์ใน `shared/interfaces/**` ปัจจุบัน
- ☑️ Payload ที่ส่งหลังบ้านไม่เปลี่ยน (ผ่าน UAM-QA-01)
- ☑️ ผ่าน lint/build/test ใน CI

> 💡 หมายเหตุ: ช่อง "Actual result" เขียนจากสเปก/พฤติกรรมที่ระบุในเอกสารดีไซน์ ไม่ใช่จากโค้ด — ยืนยันกับแอปใหม่ใน repo นี้และสัญญา API เท่านั้น (**ห้ามเปิดอ่านโค้ดเก่า**) ถ้าไม่ชัดให้ถาม PM
