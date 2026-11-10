---
title: "[UAM-ERR-04] Dialog ยืนยันลบ และลบไม่ได้ (message + statusDescription จาก server)"
labels: ["feature", "err", "P2", "wave-4"]
---

# UAM-ERR-04 — Dialog ยืนยันลบ และลบไม่ได้ (message + statusDescription จาก server)

| ฟิลด์ | ค่า |
|---|---|
| Code | `UAM-ERR-04` |
| ประเภท | feature |
| Priority | **P2** (score 68) |
| Value / Unblocks / Effort | 4 / 3 / 2 pts |
| Wave (ลำดับการทำ) | 4 |
| Branch | `feature/UAM-ERR-04-delete-dialogs` (แตกจาก `develop`) |
| Depends on | [UAM-FND-04](UAM-FND-04.md) |
| Blocks | [UAM-SYS-05](UAM-SYS-05.md) |

## Description
ปรับ dialog ยืนยันลบและกรณีลบถูกปฏิเสธให้ใช้โครง `u-dialog` แสดง `message` + `statusDescription` ของ server

## Design reference
- Artboard: DlgDeleteConfirm, DlgDeleteFail
- Source เดิม (`client-uam-develop`, path ใต้ `src/app/`): `shared/constants/modal.data.ts`, หน้าที่มีปุ่มลบ

## Actual result (ปัจจุบัน)
dialog เดิม

## Expected result
ใช้ข้อความ server จริง (ไม่ใช้ตัวอย่างในดีไซน์)

## แนวทางการแก้ไข
- ใช้ได้ทั้งใน drawer และหน้า editor

## Acceptance criteria
- ตรงกับ artboard ที่อ้างถึง (desktop และ phone ถ้ามี)
- ใช้เฉพาะฟิลด์ใน `shared/interfaces/**` ปัจจุบัน
- Payload ที่ส่งหลังบ้านไม่เปลี่ยน (ผ่าน UAM-QA-01)
- ผ่าน lint/build/test ใน CI

> หมายเหตุ: ระบุ "actual result" จากสเปก/เอกสารดีไซน์ — ให้ยืนยันกับ source เดิมตอนเริ่มทำ (session ที่ทำต้องมีสิทธิ์อ่าน `client-uam-develop`)
