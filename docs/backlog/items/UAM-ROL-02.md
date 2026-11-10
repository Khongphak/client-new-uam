---
title: "[UAM-ROL-02] Role editor: ขั้น Menus & groups (โครงเมนูเดียว ลากวาง)"
labels: ["feature", "rol", "P1", "wave-7"]
---

# UAM-ROL-02 — Role editor: ขั้น Menus & groups (โครงเมนูเดียว ลากวาง)

| ฟิลด์ | ค่า |
|---|---|
| Code | `UAM-ROL-02` |
| ประเภท | feature |
| Priority | **P1** (score 82) |
| Value / Unblocks / Effort | 5 / 4 / 8 pts |
| Wave (ลำดับการทำ) | 7 |
| Branch | `feature/UAM-ROL-02-role-editor-menu-tree` (แตกจาก `develop`) |
| Depends on | [UAM-ROL-01](UAM-ROL-01.md) |
| Blocks | [UAM-ROL-03](UAM-ROL-03.md) |

## Description
โครงเมนูเดียว ลากวาง + ย้ายขึ้น/ลง + "Move to..."; เมนูใช้ได้ครั้งเดียวต่อ role; วางเมนูระดับบนสุดได้; กลุ่มซ้อนสูงสุด 2 ชั้น; ไอคอนกลุ่ม

## Design reference
- Artboard: RoleEditor (ขั้น 2)
- Source เดิม (`client-uam-develop`, path ใต้ `src/app/`): `shared/component/tree-group-menu`

## Actual result (ปัจจุบัน)
tree เดิม

## Expected result
ตรงกับ artboard 7; เมนูซ้ำไม่ได้; ลึกเกิน 2 ชั้นไม่ได้

## แนวทางการแก้ไข
- ใช้ keyboard ได้ (เมนู ⋯ / Move to) ไม่ต้องพึ่งลากอย่างเดียว
- แปลงโครงสร้างเป็น payload เดิมเท่านั้น

## Acceptance criteria
- ตรงกับ artboard ที่อ้างถึง (desktop และ phone ถ้ามี)
- ใช้เฉพาะฟิลด์ใน `shared/interfaces/**` ปัจจุบัน
- Payload ที่ส่งหลังบ้านไม่เปลี่ยน (ผ่าน UAM-QA-01)
- ผ่าน lint/build/test ใน CI

> หมายเหตุ: ระบุ "actual result" จากสเปก/เอกสารดีไซน์ — ให้ยืนยันกับ source เดิมตอนเริ่มทำ (session ที่ทำต้องมีสิทธิ์อ่าน `client-uam-develop`)
