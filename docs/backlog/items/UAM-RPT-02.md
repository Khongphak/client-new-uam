---
title: "[UAM-RPT-02] Report: แจ้งผู้ใช้เมื่อดาวน์โหลดไม่สำเร็จ (toast)"
labels: ["feature", "rpt", "P3", "wave-5"]
---

# 📊 UAM-RPT-02 — Report: แจ้งผู้ใช้เมื่อดาวน์โหลดไม่สำเร็จ (toast)

| ฟิลด์ | ค่า |
|---|---|
| Code | `UAM-RPT-02` |
| ประเภท | ✨ feature |
| Priority | 🟢 **P3** (score 49) |
| ⭐ Value / 🔓 Unblocks / 💪 Effort | 3 / 2 / 1 pts |
| 🌊 Wave (ลำดับการทำ) | 5 |
| 🌿 Branch | `feature/UAM-RPT-02-report-download-toast` (แตกจาก `develop`) |
| ⛓️ Depends on | [UAM-RPT-01](UAM-RPT-01.md), [UAM-FND-04](UAM-FND-04.md) |
| 🚧 Blocks | — |

## 📝 Description
เมื่อดาวน์โหลดล้มเหลว

## 🎯 Design reference
- Artboard: ReportFail
- Source เดิม (`client-uam-develop`, path ใต้ `src/app/`): `main/report-page/report`

## 🐞 Actual result (ปัจจุบัน)
แค่ `console.error` ผู้ใช้ไม่ทราบ

## ✅ Expected result
แสดง toast ตาม artboard 22 (หน้าบ้านอย่างเดียว)

## 🛠️ แนวทางการแก้ไข
- -

## ☑️ Acceptance criteria
- ☑️ ตรงกับ artboard ที่อ้างถึง (desktop และ phone ถ้ามี)
- ☑️ ใช้เฉพาะฟิลด์ใน `shared/interfaces/**` ปัจจุบัน
- ☑️ Payload ที่ส่งหลังบ้านไม่เปลี่ยน (ผ่าน UAM-QA-01)
- ☑️ ผ่าน lint/build/test ใน CI

> 💡 หมายเหตุ: ระบุ "actual result" จากสเปก/เอกสารดีไซน์ — ให้ยืนยันกับ source เดิมตอนเริ่มทำ (session ที่ทำต้องมีสิทธิ์อ่าน `client-uam-develop`)
