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
- Source เดิม (`client-uam-develop`, path ใต้ `src/app/`): `main/home/home`

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

> 💡 หมายเหตุ: ระบุ "actual result" จากสเปก/เอกสารดีไซน์ — ให้ยืนยันกับ source เดิมตอนเริ่มทำ (session ที่ทำต้องมีสิทธิ์อ่าน `client-uam-develop`)
