---
title: "[UAM-ROL-03] Role editor: ขั้น Permissions (ตารางเดียว + เลือกทั้งหมด)"
labels: ["feature", "rol", "P0", "wave-8"]
---

# 🛡️ UAM-ROL-03 — Role editor: ขั้น Permissions (ตารางเดียว + เลือกทั้งหมด)

| ฟิลด์ | ค่า |
|---|---|
| Code | `UAM-ROL-03` |
| ประเภท | ✨ feature |
| Priority | 🔴 **P0** (score 85) |
| ⭐ Value / 🔓 Unblocks / 💪 Effort | 5 / 4 / 5 pts |
| 🌊 Wave (ลำดับการทำ) | 8 |
| 🌿 Branch | `feature/UAM-ROL-03-role-editor-permissions` (แตกจาก `develop`) |
| ⛓️ Depends on | [UAM-ROL-02](UAM-ROL-02.md) |
| 🚧 Blocks | [UAM-ROL-04](UAM-ROL-04.md) |

## 📝 Description
ฟังก์ชันสิทธิ์มาจาก DB (กี่ตัวก็ได้ 4–12+) มี "เลือกทั้งหมด" ต่อกลุ่มและที่หัวคอลัมน์; มือถือเป็นปุ่มต่อเมนู

## 🎯 Design reference
- Artboard: RoleEditor (ขั้น 3)
- Source เดิม (`client-uam-develop`, path ใต้ `src/app/`): `shared/component/role-permission`

## 🐞 Actual result (ปัจจุบัน)
ตารางสิทธิ์เดิม

## ✅ Expected result
ตรงกับ artboard 7

## 🛠️ แนวทางการแก้ไข
- -

## ☑️ Acceptance criteria
- ☑️ ตรงกับ artboard ที่อ้างถึง (desktop และ phone ถ้ามี)
- ☑️ ใช้เฉพาะฟิลด์ใน `shared/interfaces/**` ปัจจุบัน
- ☑️ Payload ที่ส่งหลังบ้านไม่เปลี่ยน (ผ่าน UAM-QA-01)
- ☑️ ผ่าน lint/build/test ใน CI

> 💡 หมายเหตุ: ระบุ "actual result" จากสเปก/เอกสารดีไซน์ — ให้ยืนยันกับ source เดิมตอนเริ่มทำ (session ที่ทำต้องมีสิทธิ์อ่าน `client-uam-develop`)
