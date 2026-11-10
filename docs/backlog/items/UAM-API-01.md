---
title: "[UAM-API-01] โมเดลและ service ของ API (interfaces ใช้ฟิลด์เดิม) — รอผู้ใช้ตัดสินแหล่งความจริง"
labels: ["feature", "api", "P0", "wave-2"]
---

# 🔌 UAM-API-01 — โมเดลและ service ของ API (interfaces ใช้ฟิลด์เดิม) — รอผู้ใช้ตัดสินแหล่งความจริง

| ฟิลด์ | ค่า |
|---|---|
| Code | `UAM-API-01` |
| ประเภท | ✨ feature |
| Priority | 🔴 **P0** (score 85) |
| ⭐ Value / 🔓 Unblocks / 💪 Effort | 5 / 4 / 5 pts |
| 🌊 Wave (ลำดับการทำ) | 2 |
| 🌿 Branch | `feature/UAM-API-01-api-models-services` (แตกจาก `develop`) |
| ⛓️ Depends on | [UAM-FND-01](UAM-FND-01.md) |
| 🚧 Blocks | — |

## 📝 Description
สร้าง interfaces ของ Model Response/Payload และ HTTP service/mapper ที่ story ฝั่ง SYS/USR/ROL/RPT ต้องใช้ โดยฟิลด์ต้องตรงกับ backend จริงทุกฟิลด์

## 🎯 Design reference
- Artboard: ข้อจำกัด "ห้ามแก้หลังบ้าน"
- ที่มาของ requirement (ชื่อ path ของระบบเดิม — **อ้างอิงที่มาเท่านั้น ห้ามอ่าน/คัดลอก/ยึดโครงสร้างตาม** ดู CLAUDE.md §1 ข้อ 2): `src/app/shared/interfaces/**`, `src/app/*/infrastructure/**`

## 🐞 Actual result (ปัจจุบัน)
ยังไม่มี interfaces/services ในแอปใหม่ และ ADR ยังไม่ได้ข้อสรุปว่าอ่านจากแหล่งไหน (Swagger/HAR/โค้ดเก่าอ้างอิงอย่างเดียว)

## ✅ Expected result
interfaces + services + mapper พร้อม contract test จาก fixture จริง

## 🛠️ แนวทางการแก้ไข
- **ต้องให้ผู้ใช้ตัดสินแหล่งความจริงก่อนเริ่ม** (status:blocked)
- แยกเป็น context ตาม ADR-0001
- payload ต้องเหมือนของ backend เดิม ตรวจด้วย UAM-QA-01

## ☑️ Acceptance criteria
- ☑️ ผู้ใช้ยืนยันแหล่งความจริง
- ☑️ contract test ผ่าน
- ☑️ ตรงกับ artboard ที่อ้างถึง (desktop และ phone ถ้ามี)
- ☑️ ใช้เฉพาะฟิลด์ใน `shared/interfaces/**` ปัจจุบัน
- ☑️ Payload ที่ส่งหลังบ้านไม่เปลี่ยน (ผ่าน UAM-QA-01)
- ☑️ ผ่าน lint/build/test ใน CI

> 💡 หมายเหตุ: ช่อง "Actual result" เขียนจากสเปก/พฤติกรรมที่ระบุในเอกสารดีไซน์ ไม่ใช่จากโค้ด — ยืนยันกับแอปใหม่ใน repo นี้และสัญญา API เท่านั้น (**ห้ามเปิดอ่านโค้ดเก่า**) ถ้าไม่ชัดให้ถาม PM
