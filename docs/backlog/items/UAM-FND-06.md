---
title: "[UAM-FND-06] คอมโพเนนต์ร่วมของหน้า detail (facts, stats, approvers, accordion, group-head, perm-row, sys-grid/card, meta-ico)"
labels: ["feature", "fnd", "P1", "wave-4"]
---

# 🧱 UAM-FND-06 — คอมโพเนนต์ร่วมของหน้า detail (facts, stats, approvers, accordion, group-head, perm-row, sys-grid/card, meta-ico)

| ฟิลด์ | ค่า |
|---|---|
| Code | `UAM-FND-06` |
| ประเภท | ✨ feature |
| Priority | 🟠 **P1** (score 75) |
| ⭐ Value / 🔓 Unblocks / 💪 Effort | 4 / 4 / 5 pts |
| 🌊 Wave (ลำดับการทำ) | 4 |
| 🌿 Branch | `feature/UAM-FND-06-shared-detail-components` (แตกจาก `develop`) |
| ⛓️ Depends on | [UAM-FND-03](UAM-FND-03.md) |
| 🚧 Blocks | [UAM-HOM-01](UAM-HOM-01.md), [UAM-USR-02](UAM-USR-02.md), [UAM-USR-03](UAM-USR-03.md), [UAM-USR-04](UAM-USR-04.md), [UAM-ROL-01](UAM-ROL-01.md) |

## 📝 Description
ทำ `u-facts` (+`is-cols`,`is-prose`), `u-stats` (Menus/Groups/Top level), `u-approvers` (ลำดับ 1–3 ชื่ออย่างเดียว อ่านอย่างเดียว), `u-meta-ico`, `u-accordion`, `u-group-head`, `u-perm-row`, `u-sys-grid` + `u-sys-card`

## 🎯 Design reference
- Artboard: UserView, RoleView, RoleEditor, Home
- ที่มาของ requirement (ชื่อ path ของระบบเดิม — **อ้างอิงที่มาเท่านั้น ห้ามอ่าน/คัดลอก/ยึดโครงสร้างตาม** ดู CLAUDE.md §1 ข้อ 2): `shared/component/table-preview`, `tree-group-menu`, `role-permission`, `component/system-card`

## 🐞 Actual result (ปัจจุบัน)
หน้า detail เดิมใช้ฟอร์ม disabled เป็นหลัก

## ✅ Expected result
ชิ้นส่วนใช้ซ้ำสำหรับ View/Editor/Home โดยแสดงเฉพาะฟิลด์ที่ model มี

## 🛠️ แนวทางการแก้ไข
- Approvers ใช้ `managers[].name` เท่านั้น
- stats คำนวณจากโครงเมนูที่โหลดมาแล้ว (หน้าบ้าน)

## ☑️ Acceptance criteria
- ☑️ ตรงกับ artboard ที่อ้างถึง (desktop และ phone ถ้ามี)
- ☑️ ใช้เฉพาะฟิลด์ใน `shared/interfaces/**` ปัจจุบัน
- ☑️ Payload ที่ส่งหลังบ้านไม่เปลี่ยน (ผ่าน UAM-QA-01)
- ☑️ ผ่าน lint/build/test ใน CI

> 💡 หมายเหตุ: ช่อง "Actual result" เขียนจากสเปก/พฤติกรรมที่ระบุในเอกสารดีไซน์ ไม่ใช่จากโค้ด — ยืนยันกับแอปใหม่ใน repo นี้และสัญญา API เท่านั้น (**ห้ามเปิดอ่านโค้ดเก่า**) ถ้าไม่ชัดให้ถาม PM
