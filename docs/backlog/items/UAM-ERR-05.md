---
title: "[UAM-ERR-05] สถานะ loading / empty / error ของตารางและรายการ ("No Data Available")"
labels: ["feature", "err", "P2", "wave-5"]
---

# UAM-ERR-05 — สถานะ loading / empty / error ของตารางและรายการ ("No Data Available")

| ฟิลด์ | ค่า |
|---|---|
| Code | `UAM-ERR-05` |
| ประเภท | feature |
| Priority | **P2** (score 67) |
| Value / Unblocks / Effort | 4 / 3 / 3 pts |
| Wave (ลำดับการทำ) | 5 |
| Branch | `feature/UAM-ERR-05-list-states` (แตกจาก `develop`) |
| Depends on | [UAM-FND-04](UAM-FND-04.md), [UAM-FND-05](UAM-FND-05.md) |
| Blocks | [UAM-RSP-02](UAM-RSP-02.md) |

## Description
ตาราง System/Menu/S2S/Roles/Users แสดง skeleton, error พร้อมปุ่ม retry, empty "No Data Available" ด้วย `u-state`

## Design reference
- Artboard: UsersLoading, UsersError, UsersEmpty
- Source เดิม (`client-uam-develop`, path ใต้ `src/app/`): `setting-sub-page/**`

## Actual result (ปัจจุบัน)
spinner/ข้อความเดิม

## Expected result
ตรงกับ artboard 23–25 (desktop; phone ดู UAM-RSP-02)

## แนวทางการแก้ไข
- retry เรียก API เดิมซ้ำ ไม่เพิ่ม endpoint

## Acceptance criteria
- ตรงกับ artboard ที่อ้างถึง (desktop และ phone ถ้ามี)
- ใช้เฉพาะฟิลด์ใน `shared/interfaces/**` ปัจจุบัน
- Payload ที่ส่งหลังบ้านไม่เปลี่ยน (ผ่าน UAM-QA-01)
- ผ่าน lint/build/test ใน CI

> หมายเหตุ: ระบุ "actual result" จากสเปก/เอกสารดีไซน์ — ให้ยืนยันกับ source เดิมตอนเริ่มทำ (session ที่ทำต้องมีสิทธิ์อ่าน `client-uam-develop`)
