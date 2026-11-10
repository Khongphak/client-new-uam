---
title: "[UAM-QA-01] ชุดทดสอบ contract: payload/response ต้องไม่เปลี่ยน"
labels: ["test", "qa", "P0", "wave-2"]
---

# ✅ UAM-QA-01 — ชุดทดสอบ contract: payload/response ต้องไม่เปลี่ยน

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
สร้าง snapshot/contract test ของ payload ที่ส่งหลังบ้านและ interface ของ response ก่อนเริ่ม redesign เพื่อใช้ตรวจรับทุก story ตามเกณฑ์ "payload เดิมไม่เปลี่ยน"

## 🎯 Design reference
- Artboard: กติกา "ไม่แก้หลังบ้าน"
- Source เดิม (`client-uam-develop`, path ใต้ `src/app/`): `shared/interfaces/**`, services ที่เรียก API

## 🐞 Actual result (ปัจจุบัน)
ไม่มีการทดสอบที่ยืนยันว่า payload คงเดิม

## ✅ Expected result
ทุก PR ที่แตะ service/form รันชุด contract test อัตโนมัติ; ถ้า payload เปลี่ยนจะ fail

## 🛠️ แนวทางการแก้ไข
- เก็บ payload จริงของ create/update System, Menu, S2S, Role, User, Report export
- เทียบ JSON snapshot ใน unit test (HttpTestingController)
- เพิ่มเป็นขั้นตอน CI

## ☑️ Acceptance criteria
- ☑️ CI fail เมื่อ payload เปลี่ยน
- ☑️ ตรงกับ artboard ที่อ้างถึง (desktop และ phone ถ้ามี)
- ☑️ ใช้เฉพาะฟิลด์ใน `shared/interfaces/**` ปัจจุบัน
- ☑️ Payload ที่ส่งหลังบ้านไม่เปลี่ยน (ผ่าน UAM-QA-01)
- ☑️ ผ่าน lint/build/test ใน CI

> 💡 หมายเหตุ: ระบุ "actual result" จากสเปก/เอกสารดีไซน์ — ให้ยืนยันกับ source เดิมตอนเริ่มทำ (session ที่ทำต้องมีสิทธิ์อ่าน `client-uam-develop`)
