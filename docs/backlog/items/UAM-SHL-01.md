---
title: "[UAM-SHL-01] Shell: topbar 70px + sidebar 250px + breakpoint 768px"
labels: ["feature", "shl", "P0", "wave-3"]
---

# UAM-SHL-01 — Shell: topbar 70px + sidebar 250px + breakpoint 768px

| ฟิลด์ | ค่า |
|---|---|
| Code | `UAM-SHL-01` |
| ประเภท | feature |
| Priority | **P0** (score 95) |
| Value / Unblocks / Effort | 5 / 5 / 5 pts |
| Wave (ลำดับการทำ) | 3 |
| Branch | `feature/UAM-SHL-01-shell-topbar-sidebar` (แตกจาก `develop`) |
| Depends on | [UAM-FND-02](UAM-FND-02.md) |
| Blocks | [UAM-SHL-02](UAM-SHL-02.md), [UAM-ERR-02](UAM-ERR-02.md), [UAM-HOM-01](UAM-HOM-01.md), [UAM-SYS-01](UAM-SYS-01.md), [UAM-USR-01](UAM-USR-01.md), [UAM-RPT-01](UAM-RPT-01.md) |

## Description
ปรับ topbar (ปุ่มเมนู, ชื่อ USER ACCESS MANAGEMENT, ชื่อ+role, avatar, เมนู Logout) และ sidebar (โลโก้, Home / Setting / Report, รายการที่เปิดอยู่เป็นไล่สีน้ำเงิน) ซ่อน/แสดงด้วยปุ่มเมนู; ต่ำกว่า 768px เป็น drawer

## Design reference
- Artboard: Main layout ใน Home/Systems/Users ฯลฯ; note `n-layout`
- Source เดิม (`client-uam-develop`, path ใต้ `src/app/`): `layout/**`, `layout/components/app.menu.ts`

## Actual result (ปัจจุบัน)
layout เดิมของแอป

## Expected result
ตรงกับ artboard ทั้ง desktop และ phone (390px)

## แนวทางการแก้ไข
- คง structure ของ layout เดิม เปลี่ยนเฉพาะ presentation
- ทดสอบ resize ข้าม 768px

## Acceptance criteria
- ตรงกับ artboard ที่อ้างถึง (desktop และ phone ถ้ามี)
- ใช้เฉพาะฟิลด์ใน `shared/interfaces/**` ปัจจุบัน
- Payload ที่ส่งหลังบ้านไม่เปลี่ยน (ผ่าน UAM-QA-01)
- ผ่าน lint/build/test ใน CI

> หมายเหตุ: ระบุ "actual result" จากสเปก/เอกสารดีไซน์ — ให้ยืนยันกับ source เดิมตอนเริ่มทำ (session ที่ทำต้องมีสิทธิ์อ่าน `client-uam-develop`)
