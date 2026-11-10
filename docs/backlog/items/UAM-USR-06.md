---
title: "[UAM-USR-06] ปุ่มกลับจาก User/Role details และ Edit กลับแท็บเดิมผ่าน fragment"
labels: ["feature", "usr", "P3", "wave-7"]
---

# 👥 UAM-USR-06 — ปุ่มกลับจาก User/Role details และ Edit กลับแท็บเดิมผ่าน fragment

| ฟิลด์ | ค่า |
|---|---|
| Code | `UAM-USR-06` |
| ประเภท | ✨ feature |
| Priority | 🟢 **P3** (score 49) |
| ⭐ Value / 🔓 Unblocks / 💪 Effort | 3 / 2 / 1 pts |
| 🌊 Wave (ลำดับการทำ) | 7 |
| 🌿 Branch | `feature/UAM-USR-06-back-fragment-nav` (แตกจาก `develop`) |
| ⛓️ Depends on | [UAM-USR-02](UAM-USR-02.md), [UAM-USR-03](UAM-USR-03.md), [UAM-USR-04](UAM-USR-04.md) |
| 🚧 Blocks | [UAM-RSP-01](UAM-RSP-01.md) |

## 📝 Description
กลับไป `#users` (user) หรือ `#roles` (role) ตาม tabMenu จริง

## 🎯 Design reference
- Artboard: การตัดสินใจ #2
- ที่มาของ requirement (ชื่อ path ของระบบเดิม — **อ้างอิงที่มาเท่านั้น ห้ามอ่าน/คัดลอก/ยึดโครงสร้างตาม** ดู CLAUDE.md §1 ข้อ 2): routing ของ `setting/users-setting`

## 🐞 Actual result (ปัจจุบัน)
กลับไปแท็บแรก/หน้าเดิมโดยไม่คง fragment

## ✅ Expected result
กลับถูกแท็บทุกกรณี (view/edit/save สำเร็จ)

## 🛠️ แนวทางการแก้ไข
- -

## ☑️ Acceptance criteria
- ☑️ ตรงกับ artboard ที่อ้างถึง (desktop และ phone ถ้ามี)
- ☑️ ใช้เฉพาะฟิลด์ใน `shared/interfaces/**` ปัจจุบัน
- ☑️ Payload ที่ส่งหลังบ้านไม่เปลี่ยน (ผ่าน UAM-QA-01)
- ☑️ ผ่าน lint/build/test ใน CI

> 💡 หมายเหตุ: ช่อง "Actual result" เขียนจากสเปก/พฤติกรรมที่ระบุในเอกสารดีไซน์ ไม่ใช่จากโค้ด — ยืนยันกับแอปใหม่ใน repo นี้และสัญญา API เท่านั้น (**ห้ามเปิดอ่านโค้ดเก่า**) ถ้าไม่ชัดให้ถาม PM
