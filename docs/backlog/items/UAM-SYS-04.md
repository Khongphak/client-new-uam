---
title: "[UAM-SYS-04] Drawer ของ System to System (ดู/เพิ่ม/แก้ไข)"
labels: ["feature", "sys", "P2", "wave-7"]
---

# UAM-SYS-04 — Drawer ของ System to System (ดู/เพิ่ม/แก้ไข)

| ฟิลด์ | ค่า |
|---|---|
| Code | `UAM-SYS-04` |
| ประเภท | feature |
| Priority | **P2** (score 67) |
| Value / Unblocks / Effort | 4 / 3 / 3 pts |
| Wave (ลำดับการทำ) | 7 |
| Branch | `feature/UAM-SYS-04-s2s-drawer` (แตกจาก `develop`) |
| Depends on | [UAM-SYS-02](UAM-SYS-02.md) |
| Blocks | [UAM-SYS-05](UAM-SYS-05.md) |

## Description
ย้ายฟอร์ม S2S เข้า drawer (`action-system-to-system*`) รวม `accessTokenTime`

## Design reference
- Artboard: Systems (แท็บ System to System)
- Source เดิม (`client-uam-develop`, path ใต้ `src/app/`): `setting-action-page/system-to-system-action-page`

## Actual result (ปัจจุบัน)
route แยก

## Expected result
ตรงกับ artboard 4

## แนวทางการแก้ไข
- -

## Acceptance criteria
- ตรงกับ artboard ที่อ้างถึง (desktop และ phone ถ้ามี)
- ใช้เฉพาะฟิลด์ใน `shared/interfaces/**` ปัจจุบัน
- Payload ที่ส่งหลังบ้านไม่เปลี่ยน (ผ่าน UAM-QA-01)
- ผ่าน lint/build/test ใน CI

> หมายเหตุ: ระบุ "actual result" จากสเปก/เอกสารดีไซน์ — ให้ยืนยันกับ source เดิมตอนเริ่มทำ (session ที่ทำต้องมีสิทธิ์อ่าน `client-uam-develop`)
