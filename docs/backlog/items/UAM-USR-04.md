---
title: "[UAM-USR-04] Edit user: 3 แท็บ (Profile & access / Systems & roles / Permission preview)"
labels: ["feature", "usr", "P1", "wave-6"]
---

# UAM-USR-04 — Edit user: 3 แท็บ (Profile & access / Systems & roles / Permission preview)

| ฟิลด์ | ค่า |
|---|---|
| Code | `UAM-USR-04` |
| ประเภท | feature |
| Priority | **P1** (score 82) |
| Value / Unblocks / Effort | 5 / 4 / 8 pts |
| Wave (ลำดับการทำ) | 6 |
| Branch | `feature/UAM-USR-04-user-editor-tabs` (แตกจาก `develop`) |
| Depends on | [UAM-USR-01](UAM-USR-01.md), [UAM-FND-03](UAM-FND-03.md), [UAM-FND-06](UAM-FND-06.md), [UAM-QA-01](UAM-QA-01.md) |
| Blocks | [UAM-USR-05](UAM-USR-05.md), [UAM-USR-06](UAM-USR-06.md) |

## Description
AD lookup เติมช่องแบบอ่านอย่างเดียว (Manager 1–3 แก้ไม่ได้); UAM role เป็นการ์ดเลือก; สวิตช์ System Admin (`isSuperAdmin`) และ Active; แถวระบบ+role; Save changes กดได้เมื่อมีการแก้ไขและบอกจำนวนที่ยังไม่บันทึก

## Design reference
- Artboard: UserEditor, UserEditorPhone; note `n-edit`
- Source เดิม (`client-uam-develop`, path ใต้ `src/app/`): `setting-action-page/users-action`, `component/system-role-form`, `shared/component/table-preview`

## Actual result (ปัจจุบัน)
ฟอร์มหน้าเดียว

## Expected result
ตรงกับ artboard 6; payload เดิม

## แนวทางการแก้ไข
- ใช้ reactive form เดิม ปรับ layout/แท็บ
- รักษา logic AD lookup เดิม

## Acceptance criteria
- ตรงกับ artboard ที่อ้างถึง (desktop และ phone ถ้ามี)
- ใช้เฉพาะฟิลด์ใน `shared/interfaces/**` ปัจจุบัน
- Payload ที่ส่งหลังบ้านไม่เปลี่ยน (ผ่าน UAM-QA-01)
- ผ่าน lint/build/test ใน CI

> หมายเหตุ: ระบุ "actual result" จากสเปก/เอกสารดีไซน์ — ให้ยืนยันกับ source เดิมตอนเริ่มทำ (session ที่ทำต้องมีสิทธิ์อ่าน `client-uam-develop`)
