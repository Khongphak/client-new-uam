---
title: "[UAM-AUT-02] หน้า PDPA Consent (+ Decline ถามยืนยัน)"
labels: ["feature", "aut", "P2", "wave-4"]
---

# 🔐 UAM-AUT-02 — หน้า PDPA Consent (+ Decline ถามยืนยัน)

| ฟิลด์ | ค่า |
|---|---|
| Code | `UAM-AUT-02` |
| ประเภท | ✨ feature |
| Priority | 🟡 **P2** (score 67) |
| ⭐ Value / 🔓 Unblocks / 💪 Effort | 4 / 3 / 3 pts |
| 🌊 Wave (ลำดับการทำ) | 4 |
| 🌿 Branch | `feature/UAM-AUT-02-pdpa-consent` (แตกจาก `develop`) |
| ⛓️ Depends on | [UAM-FND-03](UAM-FND-03.md), [UAM-FND-04](UAM-FND-04.md) |
| 🚧 Blocks | [UAM-RSP-01](UAM-RSP-01.md) |

## 📝 Description
ติ๊กยอมรับก่อนปุ่ม Agree and continue ใช้ได้; Decline ถามยืนยันก่อน sign out

## 🎯 Design reference
- Artboard: Consent, ConsentPhone
- ที่มาของ requirement (ชื่อ path ของระบบเดิม — **อ้างอิงที่มาเท่านั้น ห้ามอ่าน/คัดลอก/ยึดโครงสร้างตาม** ดู CLAUDE.md §1 ข้อ 2): `consent/consent-form`, `shared/service/auth-guard/consent.guard.ts`

## 🐞 Actual result (ปัจจุบัน)
หน้า consent เดิม

## ✅ Expected result
ตรงกับ artboard 2 และ guard เดิมยังทำงาน

## 🛠️ แนวทางการแก้ไข
- ไม่เปลี่ยน logic consent.guard

## ☑️ Acceptance criteria
- ☑️ ตรงกับ artboard ที่อ้างถึง (desktop และ phone ถ้ามี)
- ☑️ ใช้เฉพาะฟิลด์ใน `shared/interfaces/**` ปัจจุบัน
- ☑️ Payload ที่ส่งหลังบ้านไม่เปลี่ยน (ผ่าน UAM-QA-01)
- ☑️ ผ่าน lint/build/test ใน CI

> 💡 หมายเหตุ: ช่อง "Actual result" เขียนจากสเปก/พฤติกรรมที่ระบุในเอกสารดีไซน์ ไม่ใช่จากโค้ด — ยืนยันกับแอปใหม่ใน repo นี้และสัญญา API เท่านั้น (**ห้ามเปิดอ่านโค้ดเก่า**) ถ้าไม่ชัดให้ถาม PM
