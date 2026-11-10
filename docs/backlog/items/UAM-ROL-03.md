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
- ที่มาของ requirement (ชื่อ path ของระบบเดิม — **อ้างอิงที่มาเท่านั้น ห้ามอ่าน/คัดลอก/ยึดโครงสร้างตาม** ดู CLAUDE.md §1 ข้อ 2): `shared/component/role-permission`

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

> 💡 หมายเหตุ: ช่อง "Actual result" เขียนจากสเปก/พฤติกรรมที่ระบุในเอกสารดีไซน์ ไม่ใช่จากโค้ด — ยืนยันกับแอปใหม่ใน repo นี้และสัญญา API เท่านั้น (**ห้ามเปิดอ่านโค้ดเก่า**) ถ้าไม่ชัดให้ถาม PM
