---
title: "[UAM-AUT-03] auth guard + คง session ข้ามการรีโหลด (เริ่มที่ /home)"
labels: ["feature", "aut", "P1", "wave-6"]
---

# 🏠 UAM-AUT-03 — auth guard + คง session ข้ามการรีโหลด (เริ่มที่ /home)

| ฟิลด์ | ค่า |
|---|---|
| Code | `UAM-AUT-03` |
| ประเภท | ✨ feature |
| Priority | 🟠 **P1** (score 75) |
| ⭐ Value / 🔓 Unblocks / 💪 Effort | 5 / 3 / 5 pts |
| 🌊 Wave (ลำดับการทำ) | 6 |
| 🌿 Branch | `feature/UAM-AUT-03-auth-guard-session` (แตกจาก `develop`) |
| ⛓️ Depends on | [UAM-AUT-01](UAM-AUT-01.md), [UAM-HOM-01](UAM-HOM-01.md) |
| 🚧 Blocks | — |

## 📝 Description
route ใต้ shell ต้องไม่เปิดได้เมื่อยังไม่ล็อกอิน และ session ต้องไม่หายเมื่อรีโหลดหน้าขณะล็อกอินอยู่ (พบตอนรีวิวย้อนหลัง PR #88 บน demo build)

## 🎯 Design reference
- ไม่มี artboard (พฤติกรรม routing/session)
- test case เดิมที่ครอบคลุมส่วน guard: TC-AUT-007 (ไม่ล็อกอินเข้า `/home` → `/login`) — ถ้าสาเหตุคือ AUT-01 ที่ merge ไปไม่ครบ PM อาจจัดเป็น `qa:failed` ของ AUT-01 แทน

## 🐞 Actual result (ปัจจุบัน)
เปิด `/home` ตรงๆ หรือรีโหลดหน้า → URL คงเป็น `/home` แต่ไม่มีการ์ดและไม่ถูกส่งไป `/login` (session อยู่ในหน่วยความจำเท่านั้น และไม่มี guard ล็อกอิน มีแต่ `role-guard`)

## ✅ Expected result
ยังไม่ล็อกอิน → `/login` (TC-AUT-007); รีโหลดขณะล็อกอินอยู่ → ตามคำตัดสินของ PM (คง session หรือกลับ `/login` พร้อม returnUrl) โดยไม่มีหน้าโล่ง

## 🛠️ แนวทางการแก้ไข
- ⚠️ **ต้องให้ PM/ผู้ใช้ตัดสินก่อนเริ่ม:** พฤติกรรมหลังรีโหลด และที่เก็บ/อายุ session ตามสัญญา backend/ADR; ถ้าต้องใช้ endpoint/ฟิลด์ที่ไม่มีอยู่ ให้หยุดและแจ้ง PM (ห้ามแก้หลังบ้าน)
- functional guard บน route ใต้ shell; ไม่ชนกับ roleGuard (UAM-ERR-07 #81)
- `role:senior` เพราะแตะ routing/session ทั้งแอป

## ☑️ Acceptance criteria
- ☑️ ตรงกับ artboard ที่อ้างถึง (desktop และ phone ถ้ามี)
- ☑️ ใช้เฉพาะฟิลด์ใน `shared/interfaces/**` ปัจจุบัน
- ☑️ Payload ที่ส่งหลังบ้านไม่เปลี่ยน (ผ่าน UAM-QA-01)
- ☑️ ผ่าน lint/build/test ใน CI
- ☑️ unit test ของ guard และการกู้ session; ตรวจบน demo build ทั้ง desktop และ phone

> 💡 หมายเหตุ: ช่อง "Actual result" เขียนจากสเปก/พฤติกรรมที่ระบุในเอกสารดีไซน์ ไม่ใช่จากโค้ด — ยืนยันกับแอปใหม่ใน repo นี้และสัญญา API เท่านั้น (**ห้ามเปิดอ่านโค้ดเก่า**) ถ้าไม่ชัดให้ถาม PM
