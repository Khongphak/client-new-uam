---
title: "[UAM-USR-05] Edit user: การตรวจสอบและ error (AD ไม่ครบ, ระบบซ้ำ, ข้อมูลไม่ครบ, 422)"
labels: ["feature", "usr", "P2", "wave-7"]
---

# 👥 UAM-USR-05 — Edit user: การตรวจสอบและ error (AD ไม่ครบ, ระบบซ้ำ, ข้อมูลไม่ครบ, 422)

| ฟิลด์ | ค่า |
|---|---|
| Code | `UAM-USR-05` |
| ประเภท | ✨ feature |
| Priority | 🟡 **P2** (score 67) |
| ⭐ Value / 🔓 Unblocks / 💪 Effort | 4 / 3 / 3 pts |
| 🌊 Wave (ลำดับการทำ) | 7 |
| 🌿 Branch | `feature/UAM-USR-05-user-editor-errors` (แตกจาก `develop`) |
| ⛓️ Depends on | [UAM-USR-04](UAM-USR-04.md), [UAM-ERR-03](UAM-ERR-03.md) |
| 🚧 Blocks | — |

## 📝 Description
MSG_INVALID_USER_AD (แล้วล้างช่อง), MSG_INVALID_DUPLICATED_SYSTEM, MSG_REQUIRED, 422 แสดงรายการ ModelState; ข้อผิดพลาดแสดงที่แถว + สรุปด้านบน; ปุ่ม Save ปิดเมื่อยังมีข้อผิดพลาด

## 🎯 Design reference
- Artboard: EditAdMissing, EditDuplicate, EditInvalid; note `n-err4`
- Source เดิม (`client-uam-develop`, path ใต้ `src/app/`): `users-action`, `http.data.ts`

## 🐞 Actual result (ปัจจุบัน)
alert/ข้อความเดิม

## ✅ Expected result
ตรงกับ artboard 26–28

## 🛠️ แนวทางการแก้ไข
- -

## ☑️ Acceptance criteria
- ☑️ ตรงกับ artboard ที่อ้างถึง (desktop และ phone ถ้ามี)
- ☑️ ใช้เฉพาะฟิลด์ใน `shared/interfaces/**` ปัจจุบัน
- ☑️ Payload ที่ส่งหลังบ้านไม่เปลี่ยน (ผ่าน UAM-QA-01)
- ☑️ ผ่าน lint/build/test ใน CI

> 💡 หมายเหตุ: ระบุ "actual result" จากสเปก/เอกสารดีไซน์ — ให้ยืนยันกับ source เดิมตอนเริ่มทำ (session ที่ทำต้องมีสิทธิ์อ่าน `client-uam-develop`)
