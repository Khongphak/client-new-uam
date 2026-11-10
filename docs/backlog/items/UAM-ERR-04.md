---
title: "[UAM-ERR-04] Dialog ยืนยันลบ และลบไม่ได้ (message + statusDescription จาก server)"
labels: ["feature", "err", "P2", "wave-4"]
---

# 🚨 UAM-ERR-04 — Dialog ยืนยันลบ และลบไม่ได้ (message + statusDescription จาก server)

| ฟิลด์ | ค่า |
|---|---|
| Code | `UAM-ERR-04` |
| ประเภท | ✨ feature |
| Priority | 🟡 **P2** (score 68) |
| ⭐ Value / 🔓 Unblocks / 💪 Effort | 4 / 3 / 2 pts |
| 🌊 Wave (ลำดับการทำ) | 4 |
| 🌿 Branch | `feature/UAM-ERR-04-delete-dialogs` (แตกจาก `develop`) |
| ⛓️ Depends on | [UAM-FND-04](UAM-FND-04.md) |
| 🚧 Blocks | [UAM-SYS-05](UAM-SYS-05.md) |

## 📝 Description
ปรับ dialog ยืนยันลบและกรณีลบถูกปฏิเสธให้ใช้โครง `u-dialog` แสดง `message` + `statusDescription` ของ server

## 🎯 Design reference
- Artboard: DlgDeleteConfirm, DlgDeleteFail
- ที่มาของ requirement (ชื่อ path ของระบบเดิม — **อ้างอิงที่มาเท่านั้น ห้ามอ่าน/คัดลอก/ยึดโครงสร้างตาม** ดู CLAUDE.md §1 ข้อ 2): `shared/constants/modal.data.ts`, หน้าที่มีปุ่มลบ

## 🐞 Actual result (ปัจจุบัน)
dialog เดิม

## ✅ Expected result
ใช้ข้อความ server จริง (ไม่ใช้ตัวอย่างในดีไซน์)

## 🛠️ แนวทางการแก้ไข
- ใช้ได้ทั้งใน drawer และหน้า editor

## ☑️ Acceptance criteria
- ☑️ ตรงกับ artboard ที่อ้างถึง (desktop และ phone ถ้ามี)
- ☑️ ใช้เฉพาะฟิลด์ใน `shared/interfaces/**` ปัจจุบัน
- ☑️ Payload ที่ส่งหลังบ้านไม่เปลี่ยน (ผ่าน UAM-QA-01)
- ☑️ ผ่าน lint/build/test ใน CI

> 💡 หมายเหตุ: ช่อง "Actual result" เขียนจากสเปก/พฤติกรรมที่ระบุในเอกสารดีไซน์ ไม่ใช่จากโค้ด — ยืนยันกับแอปใหม่ใน repo นี้และสัญญา API เท่านั้น (**ห้ามเปิดอ่านโค้ดเก่า**) ถ้าไม่ชัดให้ถาม PM
