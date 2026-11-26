---
title: "[UAM-ROL-05] Role editor: โหมดแก้ไข (route roles/:id/edit + ปุ่ม Edit role ที่หน้า Role details)"
labels: ["feature", "rol", "P2", "wave-9"]
---

# 🛡️ UAM-ROL-05 — Role editor: โหมดแก้ไข (route roles/:id/edit + ปุ่ม Edit role)

| ฟิลด์ | ค่า |
|---|---|
| Code | `UAM-ROL-05` |
| ประเภท | ✨ feature |
| Priority | 🟡 **P2** (score 62) |
| ⭐ Value / 🔓 Unblocks / 💪 Effort | 4 / 2 / 5 pts |
| 🌊 Wave (ลำดับการทำ) | 9 |
| 🌿 Branch | `feature/UAM-ROL-05-role-editor-edit-mode` (แตกจาก `develop`) |
| ⛓️ Depends on | [UAM-ROL-03](UAM-ROL-03.md), [UAM-USR-02](UAM-USR-02.md) |
| 🚧 Blocks | — (เคส "แก้" ของ [UAM-ROL-04](UAM-ROL-04.md) / TC-ROL-006 ทดสอบได้หลังงานนี้) |
| 🔗 Issue | #116 |
| 🧪 Test case | TC-ROL-008 |

## 📝 Description
ช่องว่างที่พบหลัง UAM-ROL-01 และ UAM-USR-02: editor มีเฉพาะโหมดเพิ่ม (`setting/users-setting/roles/new`) ไม่มี route แก้ไข และหน้า Role details ไม่มีปุ่ม Edit role ทั้งที่ artboard `RoleView` มี (ตรวจแล้ว ROL-02/03/04 ไม่ครอบคลุม: ROL-02/03 = ขั้น Menus/Permissions, ROL-04 = ทดสอบ payload)

## 🎯 Design reference
- Artboard: RoleView (ปุ่ม Edit role), RoleEditor / RoleEditorPhone (โหมดแก้ไข ใช้โครง 3 ขั้นเดิม)
- ที่มาของ requirement (**อ้างอิงที่มาเท่านั้น ห้ามอ่าน/คัดลอก/ยึดโครงสร้างตาม** ดู CLAUDE.md §1 ข้อ 2): `setting-action-page/user-roles-action` (โหมด edit)

## 🐞 Actual result (ปัจจุบัน)
เปิด role เพื่อแก้ไขไม่ได้: ไม่มี route `roles/:id/edit` และไม่มีปุ่ม Edit role ที่ Role details

## ✅ Expected result
กด Edit role → editor โหมดแก้ไขโหลดข้อมูล role + เมนู/สิทธิ์เดิม → บันทึกด้วย `update-role`

## 🛠️ แนวทางการแก้ไข
- เพิ่ม route `roles/:id/edit` (guard เดียวกับ `roles/new`) ใช้ `RoleEditorPage` เดิมแบบ add/edit
- โหลดด้วย `RoleApi.getById` + `getRoleMenus` แล้วแมปเข้า store ของ editor; บันทึกด้วย `RoleApi.update` (`UpdateRoleRequest` เดิม)
- ปุ่ม Edit role ที่หน้า Role details ตาม artboard
- ห้ามเปลี่ยน payload/ฟิลด์; ไม่ต้องการ endpoint ใหม่

## ☑️ Acceptance criteria
- ☑️ ตรงกับ artboard ที่อ้างถึง (desktop และ phone ถ้ามี)
- ☑️ ใช้เฉพาะฟิลด์ใน `shared/interfaces/**` ปัจจุบัน
- ☑️ Payload ที่ส่งหลังบ้านไม่เปลี่ยน (ผ่าน UAM-QA-01)
- ☑️ unit test ของ logic โหลด/แมป/บันทึก
- ☑️ ผ่าน lint/build/test ใน CI

> 💡 หมายเหตุ: ช่อง "Actual result" เขียนจากสเปก/พฤติกรรมที่ระบุในเอกสารดีไซน์ ไม่ใช่จากโค้ดเก่า — ห้ามเปิดอ่านโค้ดเก่า ถ้าไม่ชัดให้ถาม PM
