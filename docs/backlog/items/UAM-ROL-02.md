---
title: "[UAM-ROL-02] Role editor: ขั้น Menus & groups (โครงเมนูเดียว ลากวาง)"
labels: ["feature", "rol", "P1", "wave-7"]
---

# 🛡️ UAM-ROL-02 — Role editor: ขั้น Menus & groups (โครงเมนูเดียว ลากวาง)

| ฟิลด์ | ค่า |
|---|---|
| Code | `UAM-ROL-02` |
| ประเภท | ✨ feature |
| Priority | 🟠 **P1** (score 82) |
| ⭐ Value / 🔓 Unblocks / 💪 Effort | 5 / 4 / 8 pts |
| 🌊 Wave (ลำดับการทำ) | 7 |
| 🌿 Branch | `feature/UAM-ROL-02-role-editor-menu-tree` (แตกจาก `develop`) |
| ⛓️ Depends on | [UAM-ROL-01](UAM-ROL-01.md) |
| 🚧 Blocks | [UAM-ROL-03](UAM-ROL-03.md) |

## 📝 Description
โครงเมนูเดียว ลากวาง + ย้ายขึ้น/ลง + "Move to..."; เมนูใช้ได้ครั้งเดียวต่อ role; วางเมนูระดับบนสุดได้; กลุ่มซ้อนสูงสุด 2 ชั้น; ไอคอนกลุ่ม

## 🎯 Design reference
- Artboard: RoleEditor (ขั้น 2)
- ที่มาของ requirement (ชื่อ path ของระบบเดิม — **อ้างอิงที่มาเท่านั้น ห้ามอ่าน/คัดลอก/ยึดโครงสร้างตาม** ดู CLAUDE.md §1 ข้อ 2): `shared/component/tree-group-menu`

## 🐞 Actual result (ปัจจุบัน)
tree เดิม

## ✅ Expected result
ตรงกับ artboard 7; เมนูซ้ำไม่ได้; ลึกเกิน 2 ชั้นไม่ได้

## 🛠️ แนวทางการแก้ไข
- ใช้ keyboard ได้ (เมนู ⋯ / Move to) ไม่ต้องพึ่งลากอย่างเดียว
- แปลงโครงสร้างเป็น payload เดิมเท่านั้น

## ☑️ Acceptance criteria
- ☑️ ตรงกับ artboard ที่อ้างถึง (desktop และ phone ถ้ามี)
- ☑️ ใช้เฉพาะฟิลด์ใน `shared/interfaces/**` ปัจจุบัน
- ☑️ Payload ที่ส่งหลังบ้านไม่เปลี่ยน (ผ่าน UAM-QA-01)
- ☑️ ผ่าน lint/build/test ใน CI

> 💡 หมายเหตุ: ช่อง "Actual result" เขียนจากสเปก/พฤติกรรมที่ระบุในเอกสารดีไซน์ ไม่ใช่จากโค้ด — ยืนยันกับแอปใหม่ใน repo นี้และสัญญา API เท่านั้น (**ห้ามเปิดอ่านโค้ดเก่า**) ถ้าไม่ชัดให้ถาม PM
