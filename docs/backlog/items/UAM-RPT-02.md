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
- ที่มาของ requirement (ชื่อ path ของระบบเดิม — **อ้างอิงที่มาเท่านั้น ห้ามอ่าน/คัดลอก/ยึดโครงสร้างตาม** ดู CLAUDE.md §1 ข้อ 2): `main/report-page/report`

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

> 💡 หมายเหตุ: ช่อง "Actual result" เขียนจากสเปก/พฤติกรรมที่ระบุในเอกสารดีไซน์ ไม่ใช่จากโค้ด — ยืนยันกับแอปใหม่ใน repo นี้และสัญญา API เท่านั้น (**ห้ามเปิดอ่านโค้ดเก่า**) ถ้าไม่ชัดให้ถาม PM
