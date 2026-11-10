---
title: "[UAM-SHL-01] Shell: topbar 70px + sidebar 250px + breakpoint 768px"
labels: ["feature", "shl", "P0", "wave-3"]
---

# 🧭 UAM-SHL-01 — Shell: topbar 70px + sidebar 250px + breakpoint 768px

| ฟิลด์ | ค่า |
|---|---|
| Code | `UAM-SHL-01` |
| ประเภท | ✨ feature |
| Priority | 🔴 **P0** (score 95) |
| ⭐ Value / 🔓 Unblocks / 💪 Effort | 5 / 5 / 5 pts |
| 🌊 Wave (ลำดับการทำ) | 3 |
| 🌿 Branch | `feature/UAM-SHL-01-shell-topbar-sidebar` (แตกจาก `develop`) |
| ⛓️ Depends on | [UAM-FND-02](UAM-FND-02.md) |
| 🚧 Blocks | [UAM-SHL-02](UAM-SHL-02.md), [UAM-ERR-02](UAM-ERR-02.md), [UAM-HOM-01](UAM-HOM-01.md), [UAM-SYS-01](UAM-SYS-01.md), [UAM-USR-01](UAM-USR-01.md), [UAM-RPT-01](UAM-RPT-01.md) |

## 📝 Description
ปรับ topbar (ปุ่มเมนู, ชื่อ USER ACCESS MANAGEMENT, ชื่อ+role, avatar, เมนู Logout) และ sidebar (โลโก้, Home / Setting / Report, รายการที่เปิดอยู่เป็นไล่สีน้ำเงิน) ซ่อน/แสดงด้วยปุ่มเมนู; ต่ำกว่า 768px เป็น drawer

## 🎯 Design reference
- Artboard: Main layout ใน Home/Systems/Users ฯลฯ; note `n-layout`
- ที่มาของ requirement (ชื่อ path ของระบบเดิม — **อ้างอิงที่มาเท่านั้น ห้ามอ่าน/คัดลอก/ยึดโครงสร้างตาม** ดู CLAUDE.md §1 ข้อ 2): `layout/**`, `layout/components/app.menu.ts`

## 🐞 Actual result (ปัจจุบัน)
layout เดิมของแอป

## ✅ Expected result
ตรงกับ artboard ทั้ง desktop และ phone (390px)

## 🛠️ แนวทางการแก้ไข
- คง structure ของ layout เดิม เปลี่ยนเฉพาะ presentation
- ทดสอบ resize ข้าม 768px

## ☑️ Acceptance criteria
- ☑️ ตรงกับ artboard ที่อ้างถึง (desktop และ phone ถ้ามี)
- ☑️ ใช้เฉพาะฟิลด์ใน `shared/interfaces/**` ปัจจุบัน
- ☑️ Payload ที่ส่งหลังบ้านไม่เปลี่ยน (ผ่าน UAM-QA-01)
- ☑️ ผ่าน lint/build/test ใน CI

> 💡 หมายเหตุ: ช่อง "Actual result" เขียนจากสเปก/พฤติกรรมที่ระบุในเอกสารดีไซน์ ไม่ใช่จากโค้ด — ยืนยันกับแอปใหม่ใน repo นี้และสัญญา API เท่านั้น (**ห้ามเปิดอ่านโค้ดเก่า**) ถ้าไม่ชัดให้ถาม PM
