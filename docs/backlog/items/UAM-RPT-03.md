---
title: "[UAM-RPT-03] Report: เก็บกวาดหลัง RPT-01 (token แทน #f2f2f2, tabpanel/ลูกศรของแท็บ, ยืนยัน dateFrom/dateTo ของ get-departments)"
labels: ["chore", "rpt", "P3", "wave-5"]
---

# 📊 UAM-RPT-03 — Report: เก็บกวาดหลัง RPT-01

| ฟิลด์ | ค่า |
|---|---|
| Code | `UAM-RPT-03` |
| ประเภท | 🧹 chore (+ a11y) |
| Priority | 🟢 **P3** (score 28) |
| ⭐ Value / 🔓 Unblocks / 💪 Effort | 2 / 1 / 2 pts |
| 🌊 Wave (ลำดับการทำ) | 5 |
| 🌿 Branch | `chore/UAM-RPT-03-report-cleanup` (แตกจาก `develop`) |
| ⛓️ Depends on | [UAM-RPT-01](UAM-RPT-01.md) |
| 🚧 Blocks | — |
| 👤 Role | `role:junior` |

## 📝 Description
ข้อสังเกตที่ไม่บล็อกจากการรีวิว PR #96 (UAM-RPT-01)

## 🎯 Design reference
- Artboard ของหน้า Report (ผลลัพธ์ภาพต้องเหมือนเดิม)
- `docs/api-contract/uam-api-contract.md` §2.7 Reports และภาคผนวก E ข้อ 6

## 🐞 Actual result (ปัจจุบัน)
- (ก) `src/app/reporting/report-page/report-page.scss` บรรทัด ~23 ใช้สี hard-code `#f2f2f2`
- (ข) แท็บชนิดรายงานใช้ `role="tablist"`/`role="tab"` แต่ไม่มี `role="tabpanel"` + `aria-controls`/`aria-labelledby` และไม่รองรับลูกศรซ้าย-ขวา (Home/End)
- (ค) `src/app/reporting/report-page/report-page.ts` เรียก `v1/Reports/get-departments` โดยส่ง `dateFrom`/`dateTo` เป็น `new Date().toISOString()` ทั้งคู่ — สัญญาระบุแค่รูป body `{ systemId, dateFrom, dateTo }` **ยังไม่ยืนยัน**ว่า backend คาดค่า/รูปแบบใดสำหรับ endpoint นี้

## ✅ Expected result
- (ก) ใช้ token จาก `src/styles/_tokens.scss` (เพิ่ม token ใหม่ถ้ายังไม่มี โดยค่าสีเท่าเดิม)
- (ข) แท็บตามแพตเทิร์น WAI-ARIA Tabs: มี `tabpanel` ผูกด้วย `aria-controls`/`aria-labelledby`, roving `tabindex`, ลูกศรซ้าย-ขวาเลื่อนแท็บ (Home/End ถ้าทำได้ง่าย)
- (ค) ส่งค่าตามที่**ผู้ใช้/backend ยืนยัน**เท่านั้น

## 🛠️ แนวทางการแก้ไข
- (ก)(ข) ทำได้ทันทีเมื่อ Senior รีวิว item แล้ว
- (ค) ⛔ **ห้ามเดา และห้ามอ้างโค้ดเก่า** — รอคำตอบผู้ใช้ (คำถามอยู่ใน issue นี้) ถ้ายังไม่ได้คำตอบตอนเริ่มงาน ให้ทำ (ก)(ข) แล้วแยก (ค) ออกเป็นงานถัดไป ไม่ต้องรอ; ห้ามเปลี่ยน payload จนกว่าจะยืนยัน
- ไม่อยู่ในขอบเขต: toast ตอนดาวน์โหลดล้ม ([UAM-RPT-02](UAM-RPT-02.md))

## ☑️ Acceptance criteria
- ☑️ ไม่มีสี hard-code ใน `report-page.scss` (ใช้ token) และภาพเหมือนเดิม
- ☑️ unit test: ลูกศรซ้าย-ขวาเปลี่ยนแท็บ/โฟกัส; แต่ละ tab มี `aria-controls` ชี้ `tabpanel` ที่มีอยู่จริง
- ☑️ TC-RPT-004 ผ่าน (desktop)
- ☑️ (ค) ถ้าได้คำตอบแล้ว: payload ของ `get-departments` ตรงสัญญาที่ยืนยัน + มี golden fixture/contract test (UAM-QA-01); ถ้ายังไม่ได้: payload ไม่เปลี่ยน
- ☑️ ผ่าน lint/build/test ใน CI

> 💡 หมายเหตุ: ช่อง "Actual result" มาจากการรีวิว PR #96 บนโค้ดใน repo นี้ (ไม่ใช่โค้ดเก่า) — **ห้ามเปิดอ่านโค้ดเก่า**
