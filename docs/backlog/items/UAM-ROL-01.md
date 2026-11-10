---
title: "[UAM-ROL-01] Role editor: p-steps 3 ขั้น + ขั้น Role info"
labels: ["feature", "rol", "P0", "wave-6"]
---

# UAM-ROL-01 — Role editor: p-steps 3 ขั้น + ขั้น Role info

| ฟิลด์ | ค่า |
|---|---|
| Code | `UAM-ROL-01` |
| ประเภท | feature |
| Priority | **P0** (score 87) |
| Value / Unblocks / Effort | 5 / 4 / 3 pts |
| Wave (ลำดับการทำ) | 6 |
| Branch | `feature/UAM-ROL-01-role-editor-steps` (แตกจาก `develop`) |
| Depends on | [UAM-USR-01](UAM-USR-01.md), [UAM-FND-06](UAM-FND-06.md), [UAM-QA-01](UAM-QA-01.md) |
| Blocks | [UAM-ROL-02](UAM-ROL-02.md) |

## Description
stepper 3 ขั้น (Role info, Menus & groups, Permissions); มือถือเป็น progress bar; ขั้นแรกกรอกข้อมูล role

## Design reference
- Artboard: RoleEditor; note `n-role`
- Source เดิม (`client-uam-develop`, path ใต้ `src/app/`): `setting-action-page/user-roles-action`

## Actual result (ปัจจุบัน)
ฟอร์มเดิม

## Expected result
ตรงกับ artboard 7 ขั้น 1

## แนวทางการแก้ไข
- -

## Acceptance criteria
- ตรงกับ artboard ที่อ้างถึง (desktop และ phone ถ้ามี)
- ใช้เฉพาะฟิลด์ใน `shared/interfaces/**` ปัจจุบัน
- Payload ที่ส่งหลังบ้านไม่เปลี่ยน (ผ่าน UAM-QA-01)
- ผ่าน lint/build/test ใน CI

> หมายเหตุ: ระบุ "actual result" จากสเปก/เอกสารดีไซน์ — ให้ยืนยันกับ source เดิมตอนเริ่มทำ (session ที่ทำต้องมีสิทธิ์อ่าน `client-uam-develop`)
