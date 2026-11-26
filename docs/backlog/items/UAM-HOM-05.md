---
title: "[UAM-HOM-05] Home: เก็บกวาดเล็กน้อยหลัง HOM-01"
labels: ["chore", "hom", "P3", "wave-6"]
---

# 🏠 UAM-HOM-05 — Home: เก็บกวาดเล็กน้อยหลัง HOM-01

| ฟิลด์ | ค่า |
|---|---|
| Code | `UAM-HOM-05` |
| ประเภท | 🧹 chore |
| Priority | 🟢 **P3** (score 29) |
| ⭐ Value / 🔓 Unblocks / 💪 Effort | 1 / 2 / 1 pts |
| 🌊 Wave (ลำดับการทำ) | 6 |
| 🌿 Branch | `chore/UAM-HOM-05-home-cleanup` (แตกจาก `develop`) |
| ⛓️ Depends on | [UAM-HOM-01](UAM-HOM-01.md) |
| 🚧 Blocks | — |

## 📝 Description
เก็บกวาดข้อเล็กที่ไม่บล็อกจากการรีวิวย้อนหลัง PR #88

## 🎯 Design reference
- ไม่มี artboard ใหม่ (ผลลัพธ์ภาพต้องเหมือนเดิม)

## 🐞 Actual result (ปัจจุบัน)
การ์ดไม่มี `data-testid` ต่อใบ, `.phead` ใช้ `#fff` ตรงๆ, test ของ route ตรวจแค่ config, screenshot 2 ไฟล์ (~420 KB) commit อยู่ใน `docs/qa/screenshots/`

## ✅ Expected result
การ์ดมี `data-testid` ต่อใบ, ใช้ token แทน `#fff`, test navigate ผ่าน router จริง, ไม่มี screenshot ค้างใน repo

## 🛠️ แนวทางการแก้ไข
- `data-testid` เช่น `home-card-<systemId>` ใน `src/app/home/home-page/home-page.html`
- token พื้นขาวจาก `src/styles/_tokens.scss` (ถ้ายังไม่มี ถาม Senior ว่าจะเพิ่มหรือคง `#fff`)
- test route ด้วย `RouterTestingHarness`
- ลบ `docs/qa/screenshots/UAM-HOM-01-*.png` (แนะนำให้ลบ)
- ไม่อยู่ในขอบเขต: ฟีเจอร์ใหม่ (HOM-03/04, AUT-03)

## ☑️ Acceptance criteria
- ☑️ ตรงกับ artboard ที่อ้างถึง (desktop และ phone ถ้ามี)
- ☑️ ใช้เฉพาะฟิลด์ใน `shared/interfaces/**` ปัจจุบัน
- ☑️ Payload ที่ส่งหลังบ้านไม่เปลี่ยน (ผ่าน UAM-QA-01)
- ☑️ ผ่าน lint/build/test ใน CI

> 💡 หมายเหตุ: ช่อง "Actual result" เขียนจากสเปก/พฤติกรรมที่ระบุในเอกสารดีไซน์ ไม่ใช่จากโค้ด — ยืนยันกับแอปใหม่ใน repo นี้และสัญญา API เท่านั้น (**ห้ามเปิดอ่านโค้ดเก่า**) ถ้าไม่ชัดให้ถาม PM
