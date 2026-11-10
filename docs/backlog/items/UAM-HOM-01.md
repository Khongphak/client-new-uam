---
title: "[UAM-HOM-01] Home: การ์ดระบบ (`u-sys-grid`/`u-sys-card`)"
labels: ["feature", "hom", "P2", "wave-5"]
---

# 🏠 UAM-HOM-01 — Home: การ์ดระบบ (`u-sys-grid`/`u-sys-card`)

| ฟิลด์ | ค่า |
|---|---|
| Code | `UAM-HOM-01` |
| ประเภท | ✨ feature |
| Priority | 🟡 **P2** (score 67) |
| ⭐ Value / 🔓 Unblocks / 💪 Effort | 4 / 3 / 3 pts |
| 🌊 Wave (ลำดับการทำ) | 5 |
| 🌿 Branch | `feature/UAM-HOM-01-home-cards` (แตกจาก `develop`) |
| ⛓️ Depends on | [UAM-SHL-01](UAM-SHL-01.md), [UAM-FND-06](UAM-FND-06.md) |
| 🚧 Blocks | [UAM-HOM-02](UAM-HOM-02.md), [UAM-RSP-01](UAM-RSP-01.md) |

## 📝 Description
การ์ดแสดง ชื่อ รูป คำอธิบาย ชนิด เจ้าของ (`IUserSystemItem`) ไม่มี role และไม่มีสถานะ Maintenance

## 🎯 Design reference
- Artboard: Home, HomePhone
- ที่มาของ requirement (ชื่อ path ของระบบเดิม — **อ้างอิงที่มาเท่านั้น ห้ามอ่าน/คัดลอก/ยึดโครงสร้างตาม** ดู CLAUDE.md §1 ข้อ 2): `main/home/home`, `component/system-card`

## 🐞 Actual result (ปัจจุบัน)
การ์ดเดิม

## ✅ Expected result
ตรงกับ artboard 3 ใช้เฉพาะฟิลด์ที่มี

## 🛠️ แนวทางการแก้ไข
- ค้นหาการ์ดทำฝั่งหน้าบ้าน (ถ้าดีไซน์มี)

## ☑️ Acceptance criteria
- ☑️ ตรงกับ artboard ที่อ้างถึง (desktop และ phone ถ้ามี)
- ☑️ ใช้เฉพาะฟิลด์ใน `shared/interfaces/**` ปัจจุบัน
- ☑️ Payload ที่ส่งหลังบ้านไม่เปลี่ยน (ผ่าน UAM-QA-01)
- ☑️ ผ่าน lint/build/test ใน CI

> 💡 หมายเหตุ: ช่อง "Actual result" เขียนจากสเปก/พฤติกรรมที่ระบุในเอกสารดีไซน์ ไม่ใช่จากโค้ด — ยืนยันกับแอปใหม่ใน repo นี้และสัญญา API เท่านั้น (**ห้ามเปิดอ่านโค้ดเก่า**) ถ้าไม่ชัดให้ถาม PM
