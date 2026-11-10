---
title: "[UAM-ERR-01] หน้า 404 (`/notfound`, `**`)"
labels: ["feature", "err", "P2", "wave-4"]
---

# UAM-ERR-01 — หน้า 404 (`/notfound`, `**`)

| ฟิลด์ | ค่า |
|---|---|
| Code | `UAM-ERR-01` |
| ประเภท | feature |
| Priority | **P2** (score 59) |
| Value / Unblocks / Effort | 3 / 3 / 1 pts |
| Wave (ลำดับการทำ) | 4 |
| Branch | `feature/UAM-ERR-01-404-page` (แตกจาก `develop`) |
| Depends on | [UAM-FND-04](UAM-FND-04.md) |
| Blocks | — |

## Description
ปรับหน้า "Looks like you are lost" ให้เป็น `u-errpage`

## Design reference
- Artboard: Err404
- Source เดิม (`client-uam-develop`, path ใต้ `src/app/`): `main/notfound`

## Actual result (ปัจจุบัน)
หน้า notfound เดิม

## Expected result
ตรงกับ artboard 11 ใช้กับ URL ที่ไม่รู้จักเท่านั้น

## แนวทางการแก้ไข
- ใช้ `u-errpage`

## Acceptance criteria
- ตรงกับ artboard ที่อ้างถึง (desktop และ phone ถ้ามี)
- ใช้เฉพาะฟิลด์ใน `shared/interfaces/**` ปัจจุบัน
- Payload ที่ส่งหลังบ้านไม่เปลี่ยน (ผ่าน UAM-QA-01)
- ผ่าน lint/build/test ใน CI

> หมายเหตุ: ระบุ "actual result" จากสเปก/เอกสารดีไซน์ — ให้ยืนยันกับ source เดิมตอนเริ่มทำ (session ที่ทำต้องมีสิทธิ์อ่าน `client-uam-develop`)
