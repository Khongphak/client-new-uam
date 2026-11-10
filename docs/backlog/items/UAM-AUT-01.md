---
title: "[UAM-AUT-01] หน้า Login"
labels: ["feature", "aut", "P1", "wave-4"]
---

# UAM-AUT-01 — หน้า Login

| ฟิลด์ | ค่า |
|---|---|
| Code | `UAM-AUT-01` |
| ประเภท | feature |
| Priority | **P1** (score 77) |
| Value / Unblocks / Effort | 4 / 4 / 3 pts |
| Wave (ลำดับการทำ) | 4 |
| Branch | `feature/UAM-AUT-01-login` (แตกจาก `develop`) |
| Depends on | [UAM-FND-02](UAM-FND-02.md), [UAM-FND-03](UAM-FND-03.md) |
| Blocks | [UAM-RSP-01](UAM-RSP-01.md) |

## Description
Hero ซ้าย + ฟอร์มขวา, ปุ่มแสดง/ซ่อนรหัสผ่าน, สถานะ default/error/loading, ลิงก์ ITSupport@philliplife.com; ต่ำกว่า 900px เป็นคอลัมน์เดียว

## Design reference
- Artboard: Main, MainPhone; note `n-login`
- Source เดิม (`client-uam-develop`, path ใต้ `src/app/`): `auth/auth-login`

## Actual result (ปัจจุบัน)
หน้า login เดิม

## Expected result
ตรงกับ artboard 1; ไม่มีข้อความล็อกบัญชี (ถอดแล้วเพราะไม่มีในโมเดล)

## แนวทางการแก้ไข
- ไม่เปลี่ยน payload login
- รองรับ autocomplete username/password

## Acceptance criteria
- ตรงกับ artboard ที่อ้างถึง (desktop และ phone ถ้ามี)
- ใช้เฉพาะฟิลด์ใน `shared/interfaces/**` ปัจจุบัน
- Payload ที่ส่งหลังบ้านไม่เปลี่ยน (ผ่าน UAM-QA-01)
- ผ่าน lint/build/test ใน CI

> หมายเหตุ: ระบุ "actual result" จากสเปก/เอกสารดีไซน์ — ให้ยืนยันกับ source เดิมตอนเริ่มทำ (session ที่ทำต้องมีสิทธิ์อ่าน `client-uam-develop`)
