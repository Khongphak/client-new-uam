---
title: "[UAM-ERR-02] หน้า 403 แยก + roleGuard ส่งไป 403"
labels: ["feature", "err", "P0", "wave-4"]
---

# UAM-ERR-02 — หน้า 403 แยก + roleGuard ส่งไป 403

| ฟิลด์ | ค่า |
|---|---|
| Code | `UAM-ERR-02` |
| ประเภท | feature |
| Priority | **P0** (score 88) |
| Value / Unblocks / Effort | 5 / 4 / 2 pts |
| Wave (ลำดับการทำ) | 4 |
| Branch | `feature/UAM-ERR-02-403-page-roleguard` (แตกจาก `develop`) |
| Depends on | [UAM-FND-04](UAM-FND-04.md), [UAM-SHL-01](UAM-SHL-01.md) |
| Blocks | [UAM-RSP-02](UAM-RSP-02.md) |

## Description
สร้างหน้า 403 "No access" และให้ `roleGuard` ส่งผู้ไม่มีสิทธิ์ไปหน้านี้แทน `/notfound`

## Design reference
- Artboard: Err403; การตัดสินใจ #3
- Source เดิม (`client-uam-develop`, path ใต้ `src/app/`): `shared/service/auth-guard/role.guard.ts`, `main/notfound`

## Actual result (ปัจจุบัน)
ผู้ไม่มีสิทธิ์ถูกส่งไป `/notfound` (404)

## Expected result
ผู้ไม่มีสิทธิ์เห็น 403; URL ที่ไม่รู้จักยังเป็น 404; super admin ผ่านทุก guard ตามเดิม

## แนวทางการแก้ไข
- เพิ่ม route `/forbidden` (สาธารณะ แต่ต้องล็อกอิน)
- แก้ `roleGuard` redirect
- unit test guard ทุก role

## Acceptance criteria
- ตรงกับ artboard ที่อ้างถึง (desktop และ phone ถ้ามี)
- ใช้เฉพาะฟิลด์ใน `shared/interfaces/**` ปัจจุบัน
- Payload ที่ส่งหลังบ้านไม่เปลี่ยน (ผ่าน UAM-QA-01)
- ผ่าน lint/build/test ใน CI

> หมายเหตุ: ระบุ "actual result" จากสเปก/เอกสารดีไซน์ — ให้ยืนยันกับ source เดิมตอนเริ่มทำ (session ที่ทำต้องมีสิทธิ์อ่าน `client-uam-develop`)
