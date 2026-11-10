---
title: "[UAM-RSP-01] Responsive/phone (390px) ของทุกหน้าหลัก"
labels: ["feature", "rsp", "P2", "wave-10"]
---

# UAM-RSP-01 — Responsive/phone (390px) ของทุกหน้าหลัก

| ฟิลด์ | ค่า |
|---|---|
| Code | `UAM-RSP-01` |
| ประเภท | feature |
| Priority | **P2** (score 65) |
| Value / Unblocks / Effort | 4 / 3 / 5 pts |
| Wave (ลำดับการทำ) | 10 |
| Branch | `feature/UAM-RSP-01-phone-layouts` (แตกจาก `develop`) |
| Depends on | [UAM-AUT-01](UAM-AUT-01.md), [UAM-AUT-02](UAM-AUT-02.md), [UAM-HOM-01](UAM-HOM-01.md), [UAM-SYS-05](UAM-SYS-05.md), [UAM-USR-06](UAM-USR-06.md), [UAM-ROL-04](UAM-ROL-04.md), [UAM-RPT-01](UAM-RPT-01.md) |
| Blocks | [UAM-A11Y-01](UAM-A11Y-01.md), [UAM-QA-02](UAM-QA-02.md) |

## Description
ตรวจและปรับทุกหน้าให้ตรงกับ artboard phone: ตาราง → รายการแตะเปิด, ปุ่มสูง 44px, sidebar เป็น drawer

## Design reference
- Artboard: *Phone.dc.html ทั้งหมด (ปุ่มสูง 44px)
- Source เดิม (`client-uam-develop`, path ใต้ `src/app/`): ทุกหน้า

## Actual result (ปัจจุบัน)
—

## Expected result
ทุกหน้าใช้งานได้ที่ 390px ตรงกับ artboard

## แนวทางการแก้ไข
- ทดสอบด้วย Playwright viewport 390×844

## Acceptance criteria
- ตรงกับ artboard ที่อ้างถึง (desktop และ phone ถ้ามี)
- ใช้เฉพาะฟิลด์ใน `shared/interfaces/**` ปัจจุบัน
- Payload ที่ส่งหลังบ้านไม่เปลี่ยน (ผ่าน UAM-QA-01)
- ผ่าน lint/build/test ใน CI

> หมายเหตุ: ระบุ "actual result" จากสเปก/เอกสารดีไซน์ — ให้ยืนยันกับ source เดิมตอนเริ่มทำ (session ที่ทำต้องมีสิทธิ์อ่าน `client-uam-develop`)
