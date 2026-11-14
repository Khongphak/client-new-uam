---
title: "[UAM-DEMO-01] โหมด demo: mock API ทั้งหมดในแอป (ข้อมูลสมมติ ไม่ต่อ backend)"
labels: ["feature", "demo", "P2", "wave-3"]
---

# 🎭 UAM-DEMO-01 — โหมด demo: mock API ทั้งหมดในแอป (ข้อมูลสมมติ ไม่ต่อ backend)

| ฟิลด์ | ค่า |
|---|---|
| Code | `UAM-DEMO-01` |
| ประเภท | ✨ feature |
| Priority | 🟡 **P2** (score 65) |
| ⭐ Value / 🔓 Unblocks / 💪 Effort | 4 / 3 / 5 pts |
| 🌊 Wave (ลำดับการทำ) | 3 |
| 🌿 Branch | `feature/UAM-DEMO-01-demo-mock-api` (แตกจาก `develop`) |
| ⛓️ Depends on | [UAM-FND-01](UAM-FND-01.md), [UAM-QA-01](UAM-QA-01.md) |
| 🚧 Blocks | — (ทำให้ [UAM-OPS-01](UAM-OPS-01.md) แสดงหน้าที่ต้องใช้ข้อมูลได้) |

## 📝 Description
ให้แอปทำงานได้ครบโดยไม่ต้องมี backend: เมื่อ build ด้วย configuration `demo` จะมี `HttpInterceptorFn` ที่ตอบทุก endpoint ในสัญญา API (`docs/api-contract/uam-api-contract.md`) จาก fixtures **ข้อมูลสมมติ** และเก็บการเพิ่ม/แก้ไขไว้ใน store ในหน่วยความจำ (รายการเปลี่ยนจริงจนกว่าจะรีโหลด) พร้อม session จำลองสำหรับ login/consent/สิทธิ์ตาม role

## 🎯 Design reference
- Artboard: -
- ที่มาของ requirement (ชื่อ path ของระบบเดิม — **อ้างอิงที่มาเท่านั้น ห้ามอ่าน/คัดลอก/ยึดโครงสร้างตาม** ดู CLAUDE.md §1 ข้อ 2): คำสั่งผู้ใช้ 2026-11-14 (ไม่ต้องมี backend ทำเป็น mock ทั้งหมดก่อน); สัญญา API: `docs/api-contract/`

## 🐞 Actual result (ปัจจุบัน)
ไม่มีชั้น mock; dev API เข้าได้เฉพาะในเครือข่ายบริษัทและ auth ใช้ cookie จึงเรียกจาก Vercel ไม่ได้

## ✅ Expected result
`npm run build:demo` สร้างแอปที่เปิดแล้ว login (รับ username ใดก็ได้ในรายการสมมติ), เห็น Home/ตาราง/หน้า detail/รายงาน, เพิ่ม-แก้ไขแล้วรายการเปลี่ยน, จำลอง error 40301/50001/หมดอายุ session ได้ผ่านค่าที่กำหนด — และ `npm run build` (production) **ไม่มีโค้ด demo เลย**

## 🛠️ แนวทางการแก้ไข
- เพิ่ม build configuration `demo` ใน `angular.json` + สคริปต์ `build:demo`; ใช้ `fileReplacements`/provider ที่แยกชัด เพื่อให้ production build ตัดโค้ด demo ออกทั้งหมด (ห้ามพึ่งแค่ flag runtime)
- `HttpInterceptorFn` จับคู่ method + path ของทุก endpoint ในสัญญา (ดูตารางภาคผนวก; ซองคำตอบ `{ status, statusCode, message, data }`, `statusCode` เป็นสตริง) ตอบจาก fixtures (ย้ายไปที่ที่ ADR กำหนดโดย [UAM-QA-01](UAM-QA-01.md); ห้ามคัดลอกซ้ำ) และ store ในหน่วยความจำ (add/update/Inactive; ไม่มี endpoint ลบ)
- ข้อมูลทั้งหมด**สมมติ** (ชื่อ/อีเมล/GUID/URL ตัวอย่าง เช่น `@example.test`) ห้ามใส่ข้อมูลพนักงานหรือระบบจริง; ไอคอนเป็น SVG สมมติเล็กๆ
- session จำลอง: login รับผู้ใช้สมมติหลาย role (ADMIN/DEVELOPER/AUDIT/USER/Super admin) เพื่อทดสอบการกรองเมนู; `isConsent` ทำให้ผ่านหน้า PDPA ได้
- ปุ่ม/พารามิเตอร์สำหรับจำลองความล้มเหลว (เช่น `?demo=40301`, `?demo=50001`, `?demo=session`) เพื่อดูสถานะ error ตาม spec ของ UAM-DSN-01
- แบนเนอร์ "DEMO — ข้อมูลสมมติ" ที่มองเห็นตลอด
- ไม่เรียก host ภายนอกใดๆ ในโหมด demo (ฟอนต์/รูปต้องมาจากแอป)
- รายงาน Excel: ตอบไฟล์ `.xlsx` ตัวอย่างที่สร้างจากข้อมูลสมมติ (หรือแสดงข้อความ demo ชัดเจน)
- เขียน test ก่อน: interceptor ตอบถูก method/path/รูปซอง, store เปลี่ยนจริง, production config ไม่มีโค้ด demo (ตรวจด้วย grep หา marker ใน `dist/`)

## ☑️ Acceptance criteria
- ☑️ `npm run build:demo` ผ่าน; แอปไม่มี network call ออกนอก origin ของตัวเอง (ตรวจแท็บ Network)
- ☑️ ทุก endpoint ที่หน้าที่มีอยู่ใช้ มีตัวตอบ + test; ซองคำตอบ/ชื่อฟิลด์ตรงสัญญา (ผ่าน helper ของ UAM-QA-01)
- ☑️ production build ไม่มีโค้ด/ข้อมูล demo (CI ตรวจ)
- ☑️ ไม่มีข้อมูลจริง/secret ในไฟล์ใดๆ
- ☑️ ผ่าน lint/build/test ใน CI

> 💡 หมายเหตุ: ขอบเขตโตตามหน้าที่ถูกสร้าง — งานนี้ทำกลไก + ตัวตอบของ endpoint ตามสัญญา; ถ้าหน้าใหม่ต้องการข้อมูลที่ยังไม่มีตัวตอบ ให้เพิ่มในงานของหน้านั้น (ระบุไว้ใน acceptance ของ story นั้น) ความเสี่ยง: mock ตามสัญญาที่ยังไม่ยืนยันกับ backend (🟡/❓ ดูภาคผนวก C–H) จึงแสดง "สิ่งที่คาดว่าจะเกิด" ไม่ใช่พฤติกรรมจริง
