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
- Source เดิม (`client-uam-develop`, path ใต้ `src/app/`): `main/home/home`, `component/system-card`

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

> 💡 หมายเหตุ: ระบุ "actual result" จากสเปก/เอกสารดีไซน์ — ให้ยืนยันกับ source เดิมตอนเริ่มทำ (session ที่ทำต้องมีสิทธิ์อ่าน `client-uam-develop`)
