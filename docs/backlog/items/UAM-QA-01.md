---
title: "[UAM-QA-01] ชุดทดสอบ contract: golden fixtures + helper (payload/response ต้องไม่เปลี่ยน)"
labels: ["test", "qa", "P0", "wave-2"]
---

# ✅ UAM-QA-01 — ชุดทดสอบ contract: golden fixtures + helper (payload/response ต้องไม่เปลี่ยน)

| ฟิลด์ | ค่า |
|---|---|
| Code | `UAM-QA-01` |
| ประเภท | 🧪 test |
| Priority | 🔴 **P0** (score 87) |
| ⭐ Value / 🔓 Unblocks / 💪 Effort | 5 / 4 / 3 pts |
| 🌊 Wave (ลำดับการทำ) | 2 |
| 🌿 Branch | `test/UAM-QA-01-payload-contract-tests` (แตกจาก `develop`) |
| ⛓️ Depends on | [UAM-FND-01](UAM-FND-01.md) |
| 🚧 Blocks | [UAM-SYS-02](UAM-SYS-02.md), [UAM-USR-04](UAM-USR-04.md), [UAM-ROL-01](UAM-ROL-01.md), [UAM-ROL-04](UAM-ROL-04.md) |

## 📝 Description
สร้างโครง contract test: helper บน `HttpTestingController` + golden JSON fixtures + รูปแบบ snapshot ที่แต่ละ story ที่สร้าง service ใช้เขียน contract test ของตัวเอง (SYS-02, USR-04, ROL-04, RPT-01) ไม่สร้าง service/interface เองในงานนี้

## 🎯 Design reference
- Artboard: กติกา "ไม่แก้หลังบ้าน"
- ที่มาของ requirement (ชื่อ path ของระบบเดิม — **อ้างอิงที่มาเท่านั้น ห้ามอ่าน/คัดลอก/ยึดโครงสร้างตาม** ดู CLAUDE.md §1 ข้อ 2): `src/testing/**` (ใหม่)

## 🐞 Actual result (ปัจจุบัน)
ไม่มีการทดสอบที่ยืนยันว่า payload คงเดิม

## ✅ Expected result
มี helper + ตัวอย่าง contract test + กฎใน CI (รันผ่าน `test:ci` อยู่แล้ว) ที่ story อื่นนำไปใช้ได้

## 🛠️ แนวทางการแก้ไข
- ขอบเขตแคบลงตามข้อเสนอของ Senior (issue #5): fixtures + helper เท่านั้น
- แหล่งความจริงของ payload ยังรอผู้ใช้ตัดสินใจ (ดู UAM-API-01) — ถ้ายังไม่ได้ ใช้ fixture สมมติที่ติดป้าย `TODO(source)` อย่างชัดเจน
- ตัดเกณฑ์ artboard ออก (ไม่เกี่ยวกับงานนี้)

## ☑️ Acceptance criteria
- ☑️ CI fail เมื่อ payload เปลี่ยน (เมื่อมี service จริง)
- ☑️ ตรงกับ artboard ที่อ้างถึง (desktop และ phone ถ้ามี)
- ☑️ ใช้เฉพาะฟิลด์ใน `shared/interfaces/**` ปัจจุบัน
- ☑️ Payload ที่ส่งหลังบ้านไม่เปลี่ยน (ผ่าน UAM-QA-01)
- ☑️ ผ่าน lint/build/test ใน CI

> 💡 หมายเหตุ: ช่อง "Actual result" เขียนจากสเปก/พฤติกรรมที่ระบุในเอกสารดีไซน์ ไม่ใช่จากโค้ด — ยืนยันกับแอปใหม่ใน repo นี้และสัญญา API เท่านั้น (**ห้ามเปิดอ่านโค้ดเก่า**) ถ้าไม่ชัดให้ถาม PM
