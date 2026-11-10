---
title: "[UAM-ERR-01] หน้า 404 (`/notfound`, `**`)"
labels: ["feature", "err", "P2", "wave-4"]
---

# 🚨 UAM-ERR-01 — หน้า 404 (`/notfound`, `**`)

| ฟิลด์ | ค่า |
|---|---|
| Code | `UAM-ERR-01` |
| ประเภท | ✨ feature |
| Priority | 🟡 **P2** (score 59) |
| ⭐ Value / 🔓 Unblocks / 💪 Effort | 3 / 3 / 1 pts |
| 🌊 Wave (ลำดับการทำ) | 4 |
| 🌿 Branch | `feature/UAM-ERR-01-404-page` (แตกจาก `develop`) |
| ⛓️ Depends on | [UAM-FND-04](UAM-FND-04.md) |
| 🚧 Blocks | — |

## 📝 Description
ปรับหน้า "Looks like you are lost" ให้เป็น `u-errpage`

## 🎯 Design reference
- Artboard: Err404
- ที่มาของ requirement (ชื่อ path ของระบบเดิม — **อ้างอิงที่มาเท่านั้น ห้ามอ่าน/คัดลอก/ยึดโครงสร้างตาม** ดู CLAUDE.md §1 ข้อ 2): `main/notfound`

## 🐞 Actual result (ปัจจุบัน)
หน้า notfound เดิม

## ✅ Expected result
ตรงกับ artboard 11 ใช้กับ URL ที่ไม่รู้จักเท่านั้น

## 🛠️ แนวทางการแก้ไข
- ใช้ `u-errpage`

## ☑️ Acceptance criteria
- ☑️ ตรงกับ artboard ที่อ้างถึง (desktop และ phone ถ้ามี)
- ☑️ ใช้เฉพาะฟิลด์ใน `shared/interfaces/**` ปัจจุบัน
- ☑️ Payload ที่ส่งหลังบ้านไม่เปลี่ยน (ผ่าน UAM-QA-01)
- ☑️ ผ่าน lint/build/test ใน CI

> 💡 หมายเหตุ: ช่อง "Actual result" เขียนจากสเปก/พฤติกรรมที่ระบุในเอกสารดีไซน์ ไม่ใช่จากโค้ด — ยืนยันกับแอปใหม่ใน repo นี้และสัญญา API เท่านั้น (**ห้ามเปิดอ่านโค้ดเก่า**) ถ้าไม่ชัดให้ถาม PM
