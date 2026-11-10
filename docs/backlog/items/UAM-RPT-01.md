---
title: "[UAM-RPT-01] หน้า Report"
labels: ["feature", "rpt", "P2", "wave-4"]
---

# 📊 UAM-RPT-01 — หน้า Report

| ฟิลด์ | ค่า |
|---|---|
| Code | `UAM-RPT-01` |
| ประเภท | ✨ feature |
| Priority | 🟡 **P2** (score 67) |
| ⭐ Value / 🔓 Unblocks / 💪 Effort | 4 / 3 / 3 pts |
| 🌊 Wave (ลำดับการทำ) | 4 |
| 🌿 Branch | `feature/UAM-RPT-01-report-page` (แตกจาก `develop`) |
| ⛓️ Depends on | [UAM-SHL-01](UAM-SHL-01.md), [UAM-FND-03](UAM-FND-03.md) |
| 🚧 Blocks | [UAM-RPT-02](UAM-RPT-02.md), [UAM-RSP-01](UAM-RSP-01.md) |

## 📝 Description
เลือกชนิดรายงาน (แท็บ) → System Name → Department หรือช่วงวันที่ → Reset / Export (ดาวน์โหลด Excel); ช่วงวันที่ลัด (Last 7 days ฯลฯ) ตั้งค่าวันที่ฝั่งหน้าบ้าน; exportbar sticky; ไม่มีตารางพรีวิว

## 🎯 Design reference
- Artboard: Report, ReportPhone; note `n-report`
- Source เดิม (`client-uam-develop`, path ใต้ `src/app/`): `main/report-page/report`

## 🐞 Actual result (ปัจจุบัน)
ฟอร์มเดิม

## ✅ Expected result
ตรงกับ artboard 8; payload export เดิม

## 🛠️ แนวทางการแก้ไข
- ห้ามเพิ่มตารางพรีวิว (API ไม่ส่งข้อมูล)

## ☑️ Acceptance criteria
- ☑️ ตรงกับ artboard ที่อ้างถึง (desktop และ phone ถ้ามี)
- ☑️ ใช้เฉพาะฟิลด์ใน `shared/interfaces/**` ปัจจุบัน
- ☑️ Payload ที่ส่งหลังบ้านไม่เปลี่ยน (ผ่าน UAM-QA-01)
- ☑️ ผ่าน lint/build/test ใน CI

> 💡 หมายเหตุ: ระบุ "actual result" จากสเปก/เอกสารดีไซน์ — ให้ยืนยันกับ source เดิมตอนเริ่มทำ (session ที่ทำต้องมีสิทธิ์อ่าน `client-uam-develop`)
