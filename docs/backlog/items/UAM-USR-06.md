---
title: "[UAM-USR-06] ปุ่มกลับจาก User/Role details และ Edit กลับแท็บเดิมผ่าน fragment"
labels: ["feature", "usr", "P3", "wave-7"]
---

# UAM-USR-06 — ปุ่มกลับจาก User/Role details และ Edit กลับแท็บเดิมผ่าน fragment

| ฟิลด์ | ค่า |
|---|---|
| Code | `UAM-USR-06` |
| ประเภท | feature |
| Priority | **P3** (score 49) |
| Value / Unblocks / Effort | 3 / 2 / 1 pts |
| Wave (ลำดับการทำ) | 7 |
| Branch | `feature/UAM-USR-06-back-fragment-nav` (แตกจาก `develop`) |
| Depends on | [UAM-USR-02](UAM-USR-02.md), [UAM-USR-03](UAM-USR-03.md), [UAM-USR-04](UAM-USR-04.md) |
| Blocks | [UAM-RSP-01](UAM-RSP-01.md) |

## Description
กลับไป `#users` (user) หรือ `#roles` (role) ตาม tabMenu จริง

## Design reference
- Artboard: การตัดสินใจ #2
- Source เดิม (`client-uam-develop`, path ใต้ `src/app/`): routing ของ `setting/users-setting`

## Actual result (ปัจจุบัน)
กลับไปแท็บแรก/หน้าเดิมโดยไม่คง fragment

## Expected result
กลับถูกแท็บทุกกรณี (view/edit/save สำเร็จ)

## แนวทางการแก้ไข
- -

## Acceptance criteria
- ตรงกับ artboard ที่อ้างถึง (desktop และ phone ถ้ามี)
- ใช้เฉพาะฟิลด์ใน `shared/interfaces/**` ปัจจุบัน
- Payload ที่ส่งหลังบ้านไม่เปลี่ยน (ผ่าน UAM-QA-01)
- ผ่าน lint/build/test ใน CI

> หมายเหตุ: ระบุ "actual result" จากสเปก/เอกสารดีไซน์ — ให้ยืนยันกับ source เดิมตอนเริ่มทำ (session ที่ทำต้องมีสิทธิ์อ่าน `client-uam-develop`)
