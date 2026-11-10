---
title: "[UAM-SYS-03] Drawer ของ Menu (ดู/เพิ่ม/แก้ไข)"
labels: ["feature", "sys", "P2", "wave-7"]
---

# ⚙️ UAM-SYS-03 — Drawer ของ Menu (ดู/เพิ่ม/แก้ไข)

| ฟิลด์ | ค่า |
|---|---|
| Code | `UAM-SYS-03` |
| ประเภท | ✨ feature |
| Priority | 🟡 **P2** (score 67) |
| ⭐ Value / 🔓 Unblocks / 💪 Effort | 4 / 3 / 3 pts |
| 🌊 Wave (ลำดับการทำ) | 7 |
| 🌿 Branch | `feature/UAM-SYS-03-menu-drawer` (แตกจาก `develop`) |
| ⛓️ Depends on | [UAM-SYS-02](UAM-SYS-02.md) |
| 🚧 Blocks | [UAM-SYS-05](UAM-SYS-05.md) |

## 📝 Description
ย้ายฟอร์ม menu-screen เข้า drawer (`action-menu-screen*`)

## 🎯 Design reference
- Artboard: Systems (แท็บ Menu)
- ที่มาของ requirement (ชื่อ path ของระบบเดิม — **อ้างอิงที่มาเท่านั้น ห้ามอ่าน/คัดลอก/ยึดโครงสร้างตาม** ดู CLAUDE.md §1 ข้อ 2): `setting-action-page/menu-screen-action`

## 🐞 Actual result (ปัจจุบัน)
route แยก

## ✅ Expected result
ใช้ drawer shell เดียวกัน รวม `functional`

## 🛠️ แนวทางการแก้ไข
- -

## ☑️ Acceptance criteria
- ☑️ ตรงกับ artboard ที่อ้างถึง (desktop และ phone ถ้ามี)
- ☑️ ใช้เฉพาะฟิลด์ใน `shared/interfaces/**` ปัจจุบัน
- ☑️ Payload ที่ส่งหลังบ้านไม่เปลี่ยน (ผ่าน UAM-QA-01)
- ☑️ ผ่าน lint/build/test ใน CI

> 💡 หมายเหตุ: ช่อง "Actual result" เขียนจากสเปก/พฤติกรรมที่ระบุในเอกสารดีไซน์ ไม่ใช่จากโค้ด — ยืนยันกับแอปใหม่ใน repo นี้และสัญญา API เท่านั้น (**ห้ามเปิดอ่านโค้ดเก่า**) ถ้าไม่ชัดให้ถาม PM
