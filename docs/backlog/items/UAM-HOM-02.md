---
title: "[UAM-HOM-02] Home: สถานะ loading / empty ("Data not found") / error"
labels: ["feature", "hom", "P3", "wave-6"]
---

# 🏠 UAM-HOM-02 — Home: สถานะ loading / empty ("Data not found") / error

| ฟิลด์ | ค่า |
|---|---|
| Code | `UAM-HOM-02` |
| ประเภท | ✨ feature |
| Priority | 🟢 **P3** (score 48) |
| ⭐ Value / 🔓 Unblocks / 💪 Effort | 3 / 2 / 2 pts |
| 🌊 Wave (ลำดับการทำ) | 6 |
| 🌿 Branch | `feature/UAM-HOM-02-home-states` (แตกจาก `develop`) |
| ⛓️ Depends on | [UAM-HOM-01](UAM-HOM-01.md), [UAM-FND-04](UAM-FND-04.md) |
| 🚧 Blocks | [UAM-RSP-02](UAM-RSP-02.md) |

## 📝 Description
แทน spinner เดิมด้วย skeleton, empty และ error + retry

## 🎯 Design reference
- Artboard: HomeLoading, HomeEmpty, HomeError
- ที่มาของ requirement (ชื่อ path ของระบบเดิม — **อ้างอิงที่มาเท่านั้น ห้ามอ่าน/คัดลอก/ยึดโครงสร้างตาม** ดู CLAUDE.md §1 ข้อ 2): `main/home/home`

## 🐞 Actual result (ปัจจุบัน)
spinner + "Data not found"

## ✅ Expected result
ตรงกับ artboard 19–21

## 🛠️ แนวทางการแก้ไข
- -

## ☑️ Acceptance criteria
- ☑️ ตรงกับ artboard ที่อ้างถึง (desktop และ phone ถ้ามี)
- ☑️ ใช้เฉพาะฟิลด์ใน `shared/interfaces/**` ปัจจุบัน
- ☑️ Payload ที่ส่งหลังบ้านไม่เปลี่ยน (ผ่าน UAM-QA-01)
- ☑️ ผ่าน lint/build/test ใน CI

> 💡 หมายเหตุ: ช่อง "Actual result" เขียนจากสเปก/พฤติกรรมที่ระบุในเอกสารดีไซน์ ไม่ใช่จากโค้ด — ยืนยันกับแอปใหม่ใน repo นี้และสัญญา API เท่านั้น (**ห้ามเปิดอ่านโค้ดเก่า**) ถ้าไม่ชัดให้ถาม PM
