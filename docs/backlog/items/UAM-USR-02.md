---
title: "[UAM-USR-02] Role details (View)"
labels: ["feature", "usr", "P2", "wave-6"]
---

# 👥 UAM-USR-02 — Role details (View)

| ฟิลด์ | ค่า |
|---|---|
| Code | `UAM-USR-02` |
| ประเภท | ✨ feature |
| Priority | 🟡 **P2** (score 57) |
| ⭐ Value / 🔓 Unblocks / 💪 Effort | 3 / 3 / 3 pts |
| 🌊 Wave (ลำดับการทำ) | 6 |
| 🌿 Branch | `feature/UAM-USR-02-role-view` (แตกจาก `develop`) |
| ⛓️ Depends on | [UAM-USR-01](UAM-USR-01.md), [UAM-FND-06](UAM-FND-06.md) |
| 🚧 Blocks | [UAM-USR-06](UAM-USR-06.md) |

## 📝 Description
Role information = แถบสถิติ (Menus, Groups, Top level) + รายการข้อมูลมีไอคอน และโครงเมนู/สิทธิ์แบบอ่านอย่างเดียว

## 🎯 Design reference
- Artboard: RoleView, RoleViewPhone
- Source เดิม (`client-uam-develop`, path ใต้ `src/app/`): `setting-action-page/user-roles-action` (โหมด view)

## 🐞 Actual result (ปัจจุบัน)
หน้าเดิมโหมด view

## ✅ Expected result
ตรงกับ artboard 10

## 🛠️ แนวทางการแก้ไข
- -

## ☑️ Acceptance criteria
- ☑️ ตรงกับ artboard ที่อ้างถึง (desktop และ phone ถ้ามี)
- ☑️ ใช้เฉพาะฟิลด์ใน `shared/interfaces/**` ปัจจุบัน
- ☑️ Payload ที่ส่งหลังบ้านไม่เปลี่ยน (ผ่าน UAM-QA-01)
- ☑️ ผ่าน lint/build/test ใน CI

> 💡 หมายเหตุ: ระบุ "actual result" จากสเปก/เอกสารดีไซน์ — ให้ยืนยันกับ source เดิมตอนเริ่มทำ (session ที่ทำต้องมีสิทธิ์อ่าน `client-uam-develop`)
