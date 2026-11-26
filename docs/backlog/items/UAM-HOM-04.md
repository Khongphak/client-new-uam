---
title: "[UAM-HOM-04] Home: บันทึก access history ตอนคลิกการ์ดระบบ"
labels: ["feature", "hom", "P2", "wave-6"]
---

# 🏠 UAM-HOM-04 — Home: บันทึก access history ตอนคลิกการ์ดระบบ

| ฟิลด์ | ค่า |
|---|---|
| Code | `UAM-HOM-04` |
| ประเภท | ✨ feature |
| Priority | 🟡 **P2** (score 59) |
| ⭐ Value / 🔓 Unblocks / 💪 Effort | 4 / 2 / 1 pts |
| 🌊 Wave (ลำดับการทำ) | 6 |
| 🌿 Branch | `feature/UAM-HOM-04-access-history` (แตกจาก `develop`) |
| ⛓️ Depends on | [UAM-HOM-01](UAM-HOM-01.md) |
| 🚧 Blocks | — |

## 📝 Description
เรียก `HomeApi.addAccessHistory` เมื่อผู้ใช้คลิกการ์ดระบบ โดยไม่บล็อกการเปิดลิงก์ (พบตอนรีวิวย้อนหลัง PR #88: HOM-01 ไม่ได้เรียก และไม่มี item ไหนระบุ)

## 🎯 Design reference
- ไม่มี artboard (พฤติกรรมเบื้องหลัง)

## 🐞 Actual result (ปัจจุบัน)
คลิกการ์ดเปิดระบบปลายทางอย่างเดียว ไม่มีการบันทึก access history

## ✅ Expected result
ตามสัญญา backend: คลิกการ์ดแล้วบันทึก access history ด้วย payload เดิมของ `addAccessHistory`

## 🛠️ แนวทางการแก้ไข
- ⚠️ **ต้องให้ PM ยืนยันก่อนเริ่ม (CLAUDE.md §1 ข้อ 7):** ต้องบันทึกจริงหรือไม่ตามสัญญา/สเปก, payload เดิมของ `addAccessHistory` ครบหรือไม่ (ห้ามเพิ่มฟิลด์), และถ้าเรียกล้มเหลวให้เปิดลิงก์ต่อหรือแจ้งผู้ใช้ — ถ้าไม่ต้อง ปิด issue ด้วยเหตุผล
- เรียกแบบ fire-and-forget; ความล้มเหลวต้องไม่ทำให้หน้า Home พังหรือหยุดการเปิดลิงก์

## ☑️ Acceptance criteria
- ☑️ ตรงกับ artboard ที่อ้างถึง (desktop และ phone ถ้ามี)
- ☑️ ใช้เฉพาะฟิลด์ใน `shared/interfaces/**` ปัจจุบัน
- ☑️ Payload ที่ส่งหลังบ้านไม่เปลี่ยน (ผ่าน UAM-QA-01)
- ☑️ ผ่าน lint/build/test ใน CI
- ☑️ มี unit test: คลิกแล้วเรียก API ด้วยค่าถูกต้อง และความล้มเหลวไม่กระทบหน้า

> 💡 หมายเหตุ: ช่อง "Actual result" เขียนจากสเปก/พฤติกรรมที่ระบุในเอกสารดีไซน์ ไม่ใช่จากโค้ด — ยืนยันกับแอปใหม่ใน repo นี้และสัญญา API เท่านั้น (**ห้ามเปิดอ่านโค้ดเก่า**) ถ้าไม่ชัดให้ถาม PM
