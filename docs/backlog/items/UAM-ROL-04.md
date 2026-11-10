---
title: "[UAM-ROL-04] Role editor: บันทึก/แมป payload + ตรวจ regression"
labels: ["test", "rol", "P1", "wave-9"]
---

# 🛡️ UAM-ROL-04 — Role editor: บันทึก/แมป payload + ตรวจ regression

| ฟิลด์ | ค่า |
|---|---|
| Code | `UAM-ROL-04` |
| ประเภท | 🧪 test |
| Priority | 🟠 **P1** (score 77) |
| ⭐ Value / 🔓 Unblocks / 💪 Effort | 5 / 3 / 3 pts |
| 🌊 Wave (ลำดับการทำ) | 9 |
| 🌿 Branch | `test/UAM-ROL-04-role-editor-payload` (แตกจาก `develop`) |
| ⛓️ Depends on | [UAM-ROL-03](UAM-ROL-03.md), [UAM-QA-01](UAM-QA-01.md) |
| 🚧 Blocks | [UAM-ERR-06](UAM-ERR-06.md), [UAM-RSP-01](UAM-RSP-01.md) |

## 📝 Description
ยืนยันว่าโครงใหม่ผลิต payload เหมือนเดิมทุกกรณี (เพิ่ม/แก้ไข/ย้ายกลุ่ม/ลบ)

## 🎯 Design reference
- Artboard: RoleEditor
- ที่มาของ requirement (ชื่อ path ของระบบเดิม — **อ้างอิงที่มาเท่านั้น ห้ามอ่าน/คัดลอก/ยึดโครงสร้างตาม** ดู CLAUDE.md §1 ข้อ 2): `user-roles-action`, services ของ role

## 🐞 Actual result (ปัจจุบัน)
—

## ✅ Expected result
contract test ผ่านทุกกรณี

## 🛠️ แนวทางการแก้ไข
- -

## ☑️ Acceptance criteria
- ☑️ ตรงกับ artboard ที่อ้างถึง (desktop และ phone ถ้ามี)
- ☑️ ใช้เฉพาะฟิลด์ใน `shared/interfaces/**` ปัจจุบัน
- ☑️ Payload ที่ส่งหลังบ้านไม่เปลี่ยน (ผ่าน UAM-QA-01)
- ☑️ ผ่าน lint/build/test ใน CI

> 💡 หมายเหตุ: ช่อง "Actual result" เขียนจากสเปก/พฤติกรรมที่ระบุในเอกสารดีไซน์ ไม่ใช่จากโค้ด — ยืนยันกับแอปใหม่ใน repo นี้และสัญญา API เท่านั้น (**ห้ามเปิดอ่านโค้ดเก่า**) ถ้าไม่ชัดให้ถาม PM
