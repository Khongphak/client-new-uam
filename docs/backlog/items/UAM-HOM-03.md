---
title: "[UAM-HOM-03] Home: ค้นหา + ตัวกรองชนิดระบบ + empty-search"
labels: ["feature", "hom", "P2", "wave-6"]
---

# 🏠 UAM-HOM-03 — Home: ค้นหา + ตัวกรองชนิดระบบ + empty-search

| ฟิลด์ | ค่า |
|---|---|
| Code | `UAM-HOM-03` |
| ประเภท | ✨ feature |
| Priority | 🟡 **P2** (score 57) |
| ⭐ Value / 🔓 Unblocks / 💪 Effort | 4 / 2 / 3 pts |
| 🌊 Wave (ลำดับการทำ) | 6 |
| 🌿 Branch | `feature/UAM-HOM-03-home-search-filter` (แตกจาก `develop`) |
| ⛓️ Depends on | [UAM-HOM-01](UAM-HOM-01.md) |
| 🚧 Blocks | — |

## 📝 Description
ช่องค้นหา "Search systems", ตัวกรองชนิด (All/Web/Mobile) และสถานะ "No system matches" ของหน้า Home ตาม artboard — เป็นส่วนที่ UAM-HOM-01 ไม่ได้ทำเพราะ item ระบุเฉพาะการ์ด (พบตอนรีวิวย้อนหลัง PR #88)

## 🎯 Design reference
- Artboard: Home, HomePhone (ส่วน bar ค้นหา/ตัวกรอง และ empty-search)

## 🐞 Actual result (ปัจจุบัน)
หน้า Home มีเฉพาะการ์ด ไม่มีค้นหา/กรอง

## ✅ Expected result
ตรงกับ artboard Home: ค้นหา + ตัวกรองชนิด + "No system matches “<q>”" พร้อมปุ่ม Clear search กรองฝั่งหน้าบ้านจากฟิลด์ของ `IUserSystemItem` เท่านั้น

## 🛠️ แนวทางการแก้ไข
- กรองฝั่งหน้าบ้านด้วย signal (computed) ไม่เรียก API เพิ่ม
- ใช้ `u-sys-grid`/`u-sys-card` เดิม; ปุ่มกรองใช้ `aria-pressed`, ช่องค้นหามี label สำหรับ screen reader
- phone: artboard เป็นรายการแถว (`u-row`) — ตรวจกับ [UAM-RSP-01](UAM-RSP-01.md) ก่อนว่าครอบคลุมหรือไม่ ถ้าใช่ให้ตัดส่วนนี้ออกจาก item นี้
- ไม่อยู่ในขอบเขต: loading/empty/error ของการโหลด ([UAM-HOM-02](UAM-HOM-02.md))
- คำถามค้างถึง PM: ค้นหาครอบคลุมฟิลด์ไหนบ้าง (ชื่อ/คำอธิบาย/เจ้าของ) ตาม artboard

## ☑️ Acceptance criteria
- ☑️ ตรงกับ artboard ที่อ้างถึง (desktop และ phone ถ้ามี)
- ☑️ ใช้เฉพาะฟิลด์ใน `shared/interfaces/**` ปัจจุบัน
- ☑️ Payload ที่ส่งหลังบ้านไม่เปลี่ยน (ผ่าน UAM-QA-01)
- ☑️ ผ่าน lint/build/test ใน CI
- ☑️ มี unit test ของ logic กรอง + `data-testid`

> 💡 หมายเหตุ: ช่อง "Actual result" เขียนจากสเปก/พฤติกรรมที่ระบุในเอกสารดีไซน์ ไม่ใช่จากโค้ด — ยืนยันกับแอปใหม่ใน repo นี้และสัญญา API เท่านั้น (**ห้ามเปิดอ่านโค้ดเก่า**) ถ้าไม่ชัดให้ถาม PM
