---
title: "[UAM-ERR-06] ข้อผิดพลาดชื่อซ้ำ 40301 (ALREADY_EXISTED) ใน System drawer และ Role editor"
labels: ["feature", "err", "P3", "wave-10"]
---

# 🚨 UAM-ERR-06 — ข้อผิดพลาดชื่อซ้ำ 40301 (ALREADY_EXISTED) ใน System drawer และ Role editor

| ฟิลด์ | ค่า |
|---|---|
| Code | `UAM-ERR-06` |
| ประเภท | ✨ feature |
| Priority | 🟢 **P3** (score 48) |
| ⭐ Value / 🔓 Unblocks / 💪 Effort | 3 / 2 / 2 pts |
| 🌊 Wave (ลำดับการทำ) | 10 |
| 🌿 Branch | `feature/UAM-ERR-06-duplicate-name-40301` (แตกจาก `develop`) |
| ⛓️ Depends on | [UAM-DSN-01](UAM-DSN-01.md), [UAM-SYS-02](UAM-SYS-02.md), [UAM-ROL-04](UAM-ROL-04.md) |
| 🚧 Blocks | — |

## 📝 Description
แสดง inline error ที่ช่องชื่อเมื่อได้ 40301

## 🎯 Design reference
- Artboard: (รอดีไซน์ DSN-01)
- ที่มาของ requirement (ชื่อ path ของระบบเดิม — **อ้างอิงที่มาเท่านั้น ห้ามอ่าน/คัดลอก/ยึดโครงสร้างตาม** ดู CLAUDE.md §1 ข้อ 2): `http.data.ts`

## 🐞 Actual result (ปัจจุบัน)
ยังไม่มีการจัดการเฉพาะ

## ✅ Expected result
ตรงดีไซน์ที่ได้จาก DSN-01

## 🛠️ แนวทางการแก้ไข
- -

## ☑️ Acceptance criteria
- ☑️ ตรงกับ artboard ที่อ้างถึง (desktop และ phone ถ้ามี)
- ☑️ ใช้เฉพาะฟิลด์ใน `shared/interfaces/**` ปัจจุบัน
- ☑️ Payload ที่ส่งหลังบ้านไม่เปลี่ยน (ผ่าน UAM-QA-01)
- ☑️ ผ่าน lint/build/test ใน CI

> 💡 หมายเหตุ: ช่อง "Actual result" เขียนจากสเปก/พฤติกรรมที่ระบุในเอกสารดีไซน์ ไม่ใช่จากโค้ด — ยืนยันกับแอปใหม่ใน repo นี้และสัญญา API เท่านั้น (**ห้ามเปิดอ่านโค้ดเก่า**) ถ้าไม่ชัดให้ถาม PM
