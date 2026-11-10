---
title: "[UAM-RSP-02] Phone ของหน้าสถานะ (loading/empty/error/403/404/dialog)"
labels: ["feature", "rsp", "P3", "wave-7"]
---

# 📱 UAM-RSP-02 — Phone ของหน้าสถานะ (loading/empty/error/403/404/dialog)

| ฟิลด์ | ค่า |
|---|---|
| Code | `UAM-RSP-02` |
| ประเภท | ✨ feature |
| Priority | 🟢 **P3** (score 48) |
| ⭐ Value / 🔓 Unblocks / 💪 Effort | 3 / 2 / 2 pts |
| 🌊 Wave (ลำดับการทำ) | 7 |
| 🌿 Branch | `feature/UAM-RSP-02-phone-states` (แตกจาก `develop`) |
| ⛓️ Depends on | [UAM-DSN-01](UAM-DSN-01.md), [UAM-ERR-05](UAM-ERR-05.md), [UAM-HOM-02](UAM-HOM-02.md), [UAM-ERR-02](UAM-ERR-02.md) |
| 🚧 Blocks | — |

## 📝 Description
implement หน้าสถานะที่ phone ตามดีไซน์ใหม่

## 🎯 Design reference
- Artboard: (ตามดีไซน์ DSN-01)
- Source เดิม (`client-uam-develop`, path ใต้ `src/app/`): —

## 🐞 Actual result (ปัจจุบัน)
—

## ✅ Expected result
ตรงดีไซน์

## 🛠️ แนวทางการแก้ไข
- -

## ☑️ Acceptance criteria
- ☑️ ตรงกับ artboard ที่อ้างถึง (desktop และ phone ถ้ามี)
- ☑️ ใช้เฉพาะฟิลด์ใน `shared/interfaces/**` ปัจจุบัน
- ☑️ Payload ที่ส่งหลังบ้านไม่เปลี่ยน (ผ่าน UAM-QA-01)
- ☑️ ผ่าน lint/build/test ใน CI

> 💡 หมายเหตุ: ระบุ "actual result" จากสเปก/เอกสารดีไซน์ — ให้ยืนยันกับ source เดิมตอนเริ่มทำ (session ที่ทำต้องมีสิทธิ์อ่าน `client-uam-develop`)
