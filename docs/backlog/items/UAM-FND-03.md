---
title: "[UAM-FND-03] คอมโพเนนต์ร่วมชุดพื้นฐาน (status, role, num, chips, count, tile, row, switch-row, back, section-title)"
labels: ["feature", "fnd", "P0", "wave-3"]
---

# 🧱 UAM-FND-03 — คอมโพเนนต์ร่วมชุดพื้นฐาน (status, role, num, chips, count, tile, row, switch-row, back, section-title)

| ฟิลด์ | ค่า |
|---|---|
| Code | `UAM-FND-03` |
| ประเภท | ✨ feature |
| Priority | 🔴 **P0** (score 95) |
| ⭐ Value / 🔓 Unblocks / 💪 Effort | 5 / 5 / 5 pts |
| 🌊 Wave (ลำดับการทำ) | 3 |
| 🌿 Branch | `feature/UAM-FND-03-shared-ui-basic` (แตกจาก `develop`) |
| ⛓️ Depends on | [UAM-FND-02](UAM-FND-02.md) |
| 🚧 Blocks | [UAM-FND-05](UAM-FND-05.md), [UAM-FND-06](UAM-FND-06.md), [UAM-AUT-01](UAM-AUT-01.md), [UAM-AUT-02](UAM-AUT-02.md), [UAM-USR-04](UAM-USR-04.md), [UAM-RPT-01](UAM-RPT-01.md) |

## 📝 Description
ทำ `u-status` (จุดสี+ข้อความ ไม่ใช้ chip สี), `u-role`, `u-num`, `u-section-title`, `u-subtitle`, `u-tile`, `u-row` (+`is-stack`,`is-cols`), `u-chip(s)`, `u-count`, `u-switch-row`, `u-back` เป็น Angular standalone component/directive ที่ใช้ซ้ำ

## 🎯 Design reference
- Artboard: Users, Systems, UserView, RoleView, UserEditor
- ที่มาของ requirement (ชื่อ path ของระบบเดิม — **อ้างอิงที่มาเท่านั้น ห้ามอ่าน/คัดลอก/ยึดโครงสร้างตาม** ดู CLAUDE.md §1 ข้อ 2): `shared/component/**` (สร้างใหม่ใต้ `shared/ui/`)

## 🐞 Actual result (ปัจจุบัน)
แต่ละหน้าเขียน markup/สไตล์ของตัวเอง (status เป็น chip/tag สี)

## ✅ Expected result
คอมโพเนนต์ร่วมพร้อม Input ชัดเจน ใช้ใน story ถัดไปได้โดยไม่ต้องคัดลอก CSS; มี Storybook หรือหน้า demo ภายใน (ถ้าทีมมี) / unit test ขั้นต่ำ

## 🛠️ แนวทางการแก้ไข
- ออกแบบ API ตาม artboard เช่น `<u-status [value]="'active'">`
- ปุ่ม/ลิงก์ใช้ element จริง มี `aria-label` สำหรับปุ่มไอคอน
- ทดสอบ render + a11y พื้นฐาน

## ☑️ Acceptance criteria
- ☑️ สถานะแสดงเป็นจุดสี + ข้อความทุกที่
- ☑️ ตรงกับ artboard ที่อ้างถึง (desktop และ phone ถ้ามี)
- ☑️ ใช้เฉพาะฟิลด์ใน `shared/interfaces/**` ปัจจุบัน
- ☑️ Payload ที่ส่งหลังบ้านไม่เปลี่ยน (ผ่าน UAM-QA-01)
- ☑️ ผ่าน lint/build/test ใน CI

> 💡 หมายเหตุ: ช่อง "Actual result" เขียนจากสเปก/พฤติกรรมที่ระบุในเอกสารดีไซน์ ไม่ใช่จากโค้ด — ยืนยันกับแอปใหม่ใน repo นี้และสัญญา API เท่านั้น (**ห้ามเปิดอ่านโค้ดเก่า**) ถ้าไม่ชัดให้ถาม PM
