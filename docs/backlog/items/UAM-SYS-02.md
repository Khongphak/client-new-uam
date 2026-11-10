---
title: "[UAM-SYS-02] Drawer ของ System (ดู/เพิ่ม/แก้ไข/setup) + รูปแบบ URL สำหรับ deep link"
labels: ["feature", "sys", "P0", "wave-6"]
---

# ⚙️ UAM-SYS-02 — Drawer ของ System (ดู/เพิ่ม/แก้ไข/setup) + รูปแบบ URL สำหรับ deep link

| ฟิลด์ | ค่า |
|---|---|
| Code | `UAM-SYS-02` |
| ประเภท | ✨ feature |
| Priority | 🔴 **P0** (score 95) |
| ⭐ Value / 🔓 Unblocks / 💪 Effort | 5 / 5 / 5 pts |
| 🌊 Wave (ลำดับการทำ) | 6 |
| 🌿 Branch | `feature/UAM-SYS-02-system-drawer-deeplink` (แตกจาก `develop`) |
| ⛓️ Depends on | [UAM-SYS-01](UAM-SYS-01.md), [UAM-ERR-03](UAM-ERR-03.md), [UAM-QA-01](UAM-QA-01.md) |
| 🚧 Blocks | [UAM-SYS-03](UAM-SYS-03.md), [UAM-SYS-04](UAM-SYS-04.md), [UAM-SYS-05](UAM-SYS-05.md), [UAM-ERR-06](UAM-ERR-06.md) |

## 📝 Description
ใช้ `p-sidebar` ด้านขวาแทน route `action-system`, `-edit`, `-view`, `-setup` และกำหนด URL แบบ query/fragment เช่น `/setting/system-setting?drawer=system&mode=view&id=…#system` เพื่อให้ deep link และแท็บ fragment ยังใช้ได้

## 🎯 Design reference
- Artboard: Systems (drawer); การตัดสินใจ #1
- ที่มาของ requirement (ชื่อ path ของระบบเดิม — **อ้างอิงที่มาเท่านั้น ห้ามอ่าน/คัดลอก/ยึดโครงสร้างตาม** ดู CLAUDE.md §1 ข้อ 2): `setting-action-page/system-action` (route `action-system*`)

## 🐞 Actual result (ปัจจุบัน)
แต่ละการกระทำเป็น route แยก

## ✅ Expected result
เปิด/ปิด drawer ผ่าน URL; refresh แล้วคืนสถานะ; ปิดแล้วกลับตาราง

## 🛠️ แนวทางการแก้ไข
- สร้าง drawer shell ที่ SYS-03/04 ใช้ร่วม
- รักษา payload create/update เดิม (ตรวจด้วย QA-01)
- ยังไม่รวม error ของ drawer (รอ DSN-01) แต่ต้องมีจุดเสียบ

## ☑️ Acceptance criteria
- ☑️ deep link ทำงาน
- ☑️ ปุ่ม Back ของเบราว์เซอร์ปิด drawer
- ☑️ ตรงกับ artboard ที่อ้างถึง (desktop และ phone ถ้ามี)
- ☑️ ใช้เฉพาะฟิลด์ใน `shared/interfaces/**` ปัจจุบัน
- ☑️ Payload ที่ส่งหลังบ้านไม่เปลี่ยน (ผ่าน UAM-QA-01)
- ☑️ ผ่าน lint/build/test ใน CI

> 💡 หมายเหตุ: ช่อง "Actual result" เขียนจากสเปก/พฤติกรรมที่ระบุในเอกสารดีไซน์ ไม่ใช่จากโค้ด — ยืนยันกับแอปใหม่ใน repo นี้และสัญญา API เท่านั้น (**ห้ามเปิดอ่านโค้ดเก่า**) ถ้าไม่ชัดให้ถาม PM
