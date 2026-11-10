---
title: "[UAM-SHL-02] กรองเมนูซ้ายตาม role (ADMIN/DEVELOPER/AUDIT/USER/Super admin)"
labels: ["feature", "shl", "P0", "wave-4"]
---

# 🧭 UAM-SHL-02 — กรองเมนูซ้ายตาม role (ADMIN/DEVELOPER/AUDIT/USER/Super admin)

| ฟิลด์ | ค่า |
|---|---|
| Code | `UAM-SHL-02` |
| ประเภท | ✨ feature |
| Priority | 🔴 **P0** (score 87) |
| ⭐ Value / 🔓 Unblocks / 💪 Effort | 5 / 4 / 3 pts |
| 🌊 Wave (ลำดับการทำ) | 4 |
| 🌿 Branch | `feature/UAM-SHL-02-role-based-menu` (แตกจาก `develop`) |
| ⛓️ Depends on | [UAM-SHL-01](UAM-SHL-01.md) |
| 🚧 Blocks | [UAM-SHL-03](UAM-SHL-03.md) |

## 📝 Description
เมนูซ้ายต้องกรองตาม role: ADMIN/super admin = Home, Setting, Report; DEVELOPER = Home, Setting; AUDIT = Home, Report; USER = Home; เมนูย่อยของ Setting (System Setting / User & Permission) กรองตามสิทธิ์ route

## 🎯 Design reference
- Artboard: ตารางสิทธิ์ใน README (ต้นแบบแสดงมุมมอง ADMIN อย่างเดียว)
- ที่มาของ requirement (ชื่อ path ของระบบเดิม — **อ้างอิงที่มาเท่านั้น ห้ามอ่าน/คัดลอก/ยึดโครงสร้างตาม** ดู CLAUDE.md §1 ข้อ 2): `layout/components/app.menu.ts`, `shared/service/auth-guard/role.guard.ts`

## 🐞 Actual result (ปัจจุบัน)
ต้นแบบดีไซน์แสดงเมนูของ ADMIN อย่างเดียว

## ✅ Expected result
เมนูตรงกับตารางสิทธิ์; DEVELOPER ไม่เห็น User & Permission; super admin (`systemAdmin`) เห็นทั้งหมด

## 🛠️ แนวทางการแก้ไข
- ใช้ logic เดียวกับ `roleGuard` (`allowedRoles.includes(uamRole) || systemAdmin`) แยกเป็น helper ใช้ร่วมกัน
- unit test ครบ 5 กลุ่มผู้ใช้

## ☑️ Acceptance criteria
- ☑️ ตรงกับ artboard ที่อ้างถึง (desktop และ phone ถ้ามี)
- ☑️ ใช้เฉพาะฟิลด์ใน `shared/interfaces/**` ปัจจุบัน
- ☑️ Payload ที่ส่งหลังบ้านไม่เปลี่ยน (ผ่าน UAM-QA-01)
- ☑️ ผ่าน lint/build/test ใน CI

> 💡 หมายเหตุ: ช่อง "Actual result" เขียนจากสเปก/พฤติกรรมที่ระบุในเอกสารดีไซน์ ไม่ใช่จากโค้ด — ยืนยันกับแอปใหม่ใน repo นี้และสัญญา API เท่านั้น (**ห้ามเปิดอ่านโค้ดเก่า**) ถ้าไม่ชัดให้ถาม PM
