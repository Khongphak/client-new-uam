---
title: "[UAM-USR-03] User details (View)"
labels: ["feature", "usr", "P2", "wave-6"]
---

# 👥 UAM-USR-03 — User details (View)

| ฟิลด์ | ค่า |
|---|---|
| Code | `UAM-USR-03` |
| ประเภท | ✨ feature |
| Priority | 🟡 **P2** (score 57) |
| ⭐ Value / 🔓 Unblocks / 💪 Effort | 3 / 3 / 3 pts |
| 🌊 Wave (ลำดับการทำ) | 6 |
| 🌿 Branch | `feature/UAM-USR-03-user-view` (แตกจาก `develop`) |
| ⛓️ Depends on | [UAM-USR-01](UAM-USR-01.md), [UAM-FND-06](UAM-FND-06.md) |
| 🚧 Blocks | [UAM-USR-06](UAM-USR-06.md) |

## 📝 Description
User information สองคอลัมน์, Approvers ลำดับ 1–3 (ชื่ออย่างเดียว), ระบบ+role

## 🎯 Design reference
- Artboard: UserView, UserViewPhone
- Source เดิม (`client-uam-develop`, path ใต้ `src/app/`): `setting-action-page/users-action` (โหมด view)

## 🐞 Actual result (ปัจจุบัน)
หน้าเดิมโหมด view

## ✅ Expected result
ตรงกับ artboard 9

## 🛠️ แนวทางการแก้ไข
- -

## ☑️ Acceptance criteria
- ☑️ ตรงกับ artboard ที่อ้างถึง (desktop และ phone ถ้ามี)
- ☑️ ใช้เฉพาะฟิลด์ใน `shared/interfaces/**` ปัจจุบัน
- ☑️ Payload ที่ส่งหลังบ้านไม่เปลี่ยน (ผ่าน UAM-QA-01)
- ☑️ ผ่าน lint/build/test ใน CI

> 💡 หมายเหตุ: ระบุ "actual result" จากสเปก/เอกสารดีไซน์ — ให้ยืนยันกับ source เดิมตอนเริ่มทำ (session ที่ทำต้องมีสิทธิ์อ่าน `client-uam-develop`)
