---
title: "[UAM-ARC-01] ADR-0001: ยืนยัน stack ล่าสุดและสถาปัตยกรรม (Angular 22, PrimeNG 22, Vitest, signals)"
labels: ["design", "arc", "P0", "wave-0"]
---

# 🏛️ UAM-ARC-01 — ADR-0001: ยืนยัน stack ล่าสุดและสถาปัตยกรรม (Angular 22, PrimeNG 22, Vitest, signals)

| ฟิลด์ | ค่า |
|---|---|
| Code | `UAM-ARC-01` |
| ประเภท | 🎨 design |
| Priority | 🔴 **P0** (score 98) |
| ⭐ Value / 🔓 Unblocks / 💪 Effort | 5 / 5 / 2 pts |
| 🌊 Wave (ลำดับการทำ) | 0 |
| 🌿 Branch | `design/UAM-ARC-01-adr-latest-stack` (แตกจาก `develop`) |
| ⛓️ Depends on | — (เริ่มได้เลย) |
| 🚧 Blocks | [UAM-FND-01](UAM-FND-01.md) |

## 📝 Description
ยืนยัน/ปรับร่าง ADR-0001 ที่ PM เขียนไว้ ด้วยการตรวจเวอร์ชันและ API จริง (PrimeNG 22 preset, Signal Forms, state ด้วย signals โดยไม่ใช้ NgRx, zoneless, Vitest) ก่อนเริ่มสร้างแอปใหม่

## 🎯 Design reference
- Artboard: -
- Source เดิม (`client-uam-develop`, path ใต้ `src/app/`): `docs/architecture/ADR-0001-latest-stack.md`

## 🐞 Actual result (ปัจจุบัน)
ADR เป็น Draft ยังไม่ได้ผ่านการตรวจโดย Senior

## ✅ Expected result
ADR สถานะ Accepted (หรือแก้ไขแล้ว) พร้อมรายการเวอร์ชันที่ล็อก และคำถามเปิดที่ต้องให้ผู้ใช้ตัดสิน

## 🛠️ แนวทางการแก้ไข
- Senior อ่าน ADR + ตรวจ peer dependencies/เอกสารจริงของแต่ละ lib
- แก้ ADR ผ่าน PR (PM/Senior), ห้ามเริ่มสร้างแอปก่อนยืนยัน

## ☑️ Acceptance criteria
- ☑️ ADR Accepted
- ☑️ FND-01 เริ่มได้
- ☑️ ตรงกับ artboard ที่อ้างถึง (desktop และ phone ถ้ามี)
- ☑️ ใช้เฉพาะฟิลด์ใน `shared/interfaces/**` ปัจจุบัน
- ☑️ Payload ที่ส่งหลังบ้านไม่เปลี่ยน (ผ่าน UAM-QA-01)
- ☑️ ผ่าน lint/build/test ใน CI

> 💡 หมายเหตุ: ระบุ "actual result" จากสเปก/เอกสารดีไซน์ — ให้ยืนยันกับ source เดิมตอนเริ่มทำ (session ที่ทำต้องมีสิทธิ์อ่าน `client-uam-develop`)
