---
title: "[UAM-SYS-05] ถอด route action ของ System Setting ทั้ง 10 ตัว + redirect ลิงก์เก่า"
labels: ["chore", "sys", "P3", "wave-8"]
---

# ⚙️ UAM-SYS-05 — ถอด route action ของ System Setting ทั้ง 10 ตัว + redirect ลิงก์เก่า

| ฟิลด์ | ค่า |
|---|---|
| Code | `UAM-SYS-05` |
| ประเภท | 🧹 chore |
| Priority | 🟢 **P3** (score 48) |
| ⭐ Value / 🔓 Unblocks / 💪 Effort | 3 / 2 / 2 pts |
| 🌊 Wave (ลำดับการทำ) | 8 |
| 🌿 Branch | `chore/UAM-SYS-05-remove-legacy-routes` (แตกจาก `develop`) |
| ⛓️ Depends on | [UAM-SYS-02](UAM-SYS-02.md), [UAM-SYS-03](UAM-SYS-03.md), [UAM-SYS-04](UAM-SYS-04.md), [UAM-ERR-04](UAM-ERR-04.md) |
| 🚧 Blocks | [UAM-RSP-01](UAM-RSP-01.md) |

## 📝 Description
ลบ 10 route: `action-system`,`-edit`,`-view`,`-setup`,`action-menu-screen`,`-edit`,`-view`,`action-system-to-system`,`-view`,`-edit` และ redirect ลิงก์เก่าไปรูปแบบ drawer

## 🎯 Design reference
- Artboard: การตัดสินใจ #1
- ที่มาของ requirement (ชื่อ path ของระบบเดิม — **อ้างอิงที่มาเท่านั้น ห้ามอ่าน/คัดลอก/ยึดโครงสร้างตาม** ดู CLAUDE.md §1 ข้อ 2): routing ของ `/setting`

## 🐞 Actual result (ปัจจุบัน)
10 route ยังอยู่

## ✅ Expected result
ไม่มี route เก่า, ลิงก์เก่า (bookmark) ยังเปิดได้ผ่าน redirect

## 🛠️ แนวทางการแก้ไข
- ลบ component ที่ไม่ใช้แล้ว

## ☑️ Acceptance criteria
- ☑️ ตรงกับ artboard ที่อ้างถึง (desktop และ phone ถ้ามี)
- ☑️ ใช้เฉพาะฟิลด์ใน `shared/interfaces/**` ปัจจุบัน
- ☑️ Payload ที่ส่งหลังบ้านไม่เปลี่ยน (ผ่าน UAM-QA-01)
- ☑️ ผ่าน lint/build/test ใน CI

> 💡 หมายเหตุ: ช่อง "Actual result" เขียนจากสเปก/พฤติกรรมที่ระบุในเอกสารดีไซน์ ไม่ใช่จากโค้ด — ยืนยันกับแอปใหม่ใน repo นี้และสัญญา API เท่านั้น (**ห้ามเปิดอ่านโค้ดเก่า**) ถ้าไม่ชัดให้ถาม PM
