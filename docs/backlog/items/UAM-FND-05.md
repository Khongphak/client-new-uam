---
title: "[UAM-FND-05] คอมโพเนนต์ร่วมของตาราง: toolbar + Filters panel + footer/paginator"
labels: ["feature", "fnd", "P0", "wave-4"]
---

# UAM-FND-05 — คอมโพเนนต์ร่วมของตาราง: toolbar + Filters panel + footer/paginator

| ฟิลด์ | ค่า |
|---|---|
| Code | `UAM-FND-05` |
| ประเภท | feature |
| Priority | **P0** (score 95) |
| Value / Unblocks / Effort | 5 / 5 / 5 pts |
| Wave (ลำดับการทำ) | 4 |
| Branch | `feature/UAM-FND-05-shared-table-toolbar` (แตกจาก `develop`) |
| Depends on | [UAM-FND-03](UAM-FND-03.md) |
| Blocks | [UAM-ERR-05](UAM-ERR-05.md), [UAM-SYS-01](UAM-SYS-01.md), [UAM-USR-01](UAM-USR-01.md) |

## Description
รูปแบบตารางเดียวทุกหน้า: การ์ด + แถบเครื่องมือ (ค้นหาซ้าย; ปุ่ม Filters พร้อมตัวนับ + Reset ขวา), แผง dropdown มีป้ายชื่อ (`u-filters` + `bar__end`), ท้ายตาราง "Showing 1 to X of Y entries" ซ้าย paginator ขวา (`u-card-foot`), ตัวนับในแท็บ

## Design reference
- Artboard: Systems, Users (Roles/Users tabs)
- Source เดิม (`client-uam-develop`, path ใต้ `src/app/`): `setting-sub-page/setting-system`, `setting-users`, `shared/constants/table/**`

## Actual result (ปัจจุบัน)
ตารางเดิมใช้ฟิลเตอร์/ค้นหาคนละแบบในแต่ละหน้า

## Expected result
คอมโพเนนต์/directive เดียวที่รับ config ของคอลัมน์ + ตัวกรอง; ค้นหา/กรอง/นับทำฝั่งหน้าบ้านจากแถวที่โหลดแล้ว

## แนวทางการแก้ไข
- กรองฝั่ง client เท่านั้น ไม่เพิ่ม query param ใหม่ไปหลังบ้าน
- ใช้ตัวแปรคอลัมน์เดิมใน `users-column.ts`/`setting-system-column.ts` ปรับเฉพาะ presentation
- รองรับ phone เป็นรายการแตะเปิด (ดู UAM-RSP-01)

## Acceptance criteria
- Filters ทำงานเหมือนกันทั้ง System/Menu/S2S/Roles/Users
- ตรงกับ artboard ที่อ้างถึง (desktop และ phone ถ้ามี)
- ใช้เฉพาะฟิลด์ใน `shared/interfaces/**` ปัจจุบัน
- Payload ที่ส่งหลังบ้านไม่เปลี่ยน (ผ่าน UAM-QA-01)
- ผ่าน lint/build/test ใน CI

> หมายเหตุ: ระบุ "actual result" จากสเปก/เอกสารดีไซน์ — ให้ยืนยันกับ source เดิมตอนเริ่มทำ (session ที่ทำต้องมีสิทธิ์อ่าน `client-uam-develop`)
