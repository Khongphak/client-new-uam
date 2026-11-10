---
title: "[UAM-ERR-03] ข้อความ/dialog จาก HTTP interceptor (session หมดอายุ, network, server 50000–50002)"
labels: ["feature", "err", "P1", "wave-4"]
---

# UAM-ERR-03 — ข้อความ/dialog จาก HTTP interceptor (session หมดอายุ, network, server 50000–50002)

| ฟิลด์ | ค่า |
|---|---|
| Code | `UAM-ERR-03` |
| ประเภท | feature |
| Priority | **P1** (score 77) |
| Value / Unblocks / Effort | 4 / 4 / 3 pts |
| Wave (ลำดับการทำ) | 4 |
| Branch | `feature/UAM-ERR-03-interceptor-dialogs` (แตกจาก `develop`) |
| Depends on | [UAM-FND-04](UAM-FND-04.md) |
| Blocks | [UAM-SYS-02](UAM-SYS-02.md), [UAM-USR-05](UAM-USR-05.md) |

## Description
แสดง dialog ตามชนิดข้อผิดพลาด: session หมดอายุ ("Your session has expired. Please log in again to continue." → logout ไป Login), Network status 0 ("Network Error!!!"), Server error RESULT_CODE 50000/50001/50002 แสดงข้อความที่ server ส่ง

## Design reference
- Artboard: DlgSession, DlgNetwork, DlgServer
- Source เดิม (`client-uam-develop`, path ใต้ `src/app/`): `shared/service/webapi.interceptor.ts`, `interceptor/http-error-handler.service.ts`, `shared/constants/http/http.data.ts`, `modal.data.ts`

## Actual result (ปัจจุบัน)
ข้อความ/รูปแบบเดิมคนละแบบ

## Expected result
ทุกกรณีใช้ `u-dialog` เดียวกัน logic ตัดสินใจใน interceptor ไม่เปลี่ยน

## แนวทางการแก้ไข
- เปลี่ยนเฉพาะ UI ไม่เปลี่ยน logic การ retry/logout
- ป้องกัน dialog ซ้อนเมื่อ request หลายตัว fail พร้อมกัน

## Acceptance criteria
- ตรงกับ artboard ที่อ้างถึง (desktop และ phone ถ้ามี)
- ใช้เฉพาะฟิลด์ใน `shared/interfaces/**` ปัจจุบัน
- Payload ที่ส่งหลังบ้านไม่เปลี่ยน (ผ่าน UAM-QA-01)
- ผ่าน lint/build/test ใน CI

> หมายเหตุ: ระบุ "actual result" จากสเปก/เอกสารดีไซน์ — ให้ยืนยันกับ source เดิมตอนเริ่มทำ (session ที่ทำต้องมีสิทธิ์อ่าน `client-uam-develop`)
