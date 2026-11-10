---
title: "[UAM-ERR-05] สถานะ loading / empty / error ของตารางและรายการ ("No Data Available")"
labels: ["feature", "err", "P2", "wave-5"]
---

# 🚨 UAM-ERR-05 — สถานะ loading / empty / error ของตารางและรายการ ("No Data Available")

| ฟิลด์ | ค่า |
|---|---|
| Code | `UAM-ERR-05` |
| ประเภท | ✨ feature |
| Priority | 🟡 **P2** (score 67) |
| ⭐ Value / 🔓 Unblocks / 💪 Effort | 4 / 3 / 3 pts |
| 🌊 Wave (ลำดับการทำ) | 5 |
| 🌿 Branch | `feature/UAM-ERR-05-list-states` (แตกจาก `develop`) |
| ⛓️ Depends on | [UAM-FND-04](UAM-FND-04.md), [UAM-FND-05](UAM-FND-05.md) |
| 🚧 Blocks | [UAM-RSP-02](UAM-RSP-02.md) |

## 📝 Description
ตาราง System/Menu/S2S/Roles/Users แสดง skeleton, error พร้อมปุ่ม retry, empty "No Data Available" ด้วย `u-state`

## 🎯 Design reference
- Artboard: UsersLoading, UsersError, UsersEmpty
- ที่มาของ requirement (ชื่อ path ของระบบเดิม — **อ้างอิงที่มาเท่านั้น ห้ามอ่าน/คัดลอก/ยึดโครงสร้างตาม** ดู CLAUDE.md §1 ข้อ 2): `setting-sub-page/**`

## 🐞 Actual result (ปัจจุบัน)
spinner/ข้อความเดิม

## ✅ Expected result
ตรงกับ artboard 23–25 (desktop; phone ดู UAM-RSP-02)

## 🛠️ แนวทางการแก้ไข
- retry เรียก API เดิมซ้ำ ไม่เพิ่ม endpoint

## ☑️ Acceptance criteria
- ☑️ ตรงกับ artboard ที่อ้างถึง (desktop และ phone ถ้ามี)
- ☑️ ใช้เฉพาะฟิลด์ใน `shared/interfaces/**` ปัจจุบัน
- ☑️ Payload ที่ส่งหลังบ้านไม่เปลี่ยน (ผ่าน UAM-QA-01)
- ☑️ ผ่าน lint/build/test ใน CI

> 💡 หมายเหตุ: ช่อง "Actual result" เขียนจากสเปก/พฤติกรรมที่ระบุในเอกสารดีไซน์ ไม่ใช่จากโค้ด — ยืนยันกับแอปใหม่ใน repo นี้และสัญญา API เท่านั้น (**ห้ามเปิดอ่านโค้ดเก่า**) ถ้าไม่ชัดให้ถาม PM
