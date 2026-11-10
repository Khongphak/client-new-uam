# 🪜 Phase การ build และเวลาเริ่มทำ test อัตโนมัติ

หลักการ: **เขียน test case เป็นเอกสารก่อน (ทำแล้ว) → build code เป็น phase → เมื่อ phase จบและรันได้จริง จึงเขียน/ปรับบอท E2E ให้ครอบ phase นั้น** (ไม่เขียนบอทล่วงหน้าโดยไม่มีแอป)

> การแบ่ง phase นี้เป็นข้อเสนอจาก wave ใน [EXECUTION-PLAN](../backlog/EXECUTION-PLAN.md) — ปรับได้

| Phase | เป้าหมาย | Backlog ที่ต้องเสร็จ | Test case | ทำอะไรกับ test |
|---|---|---|---|---|
| **0** | repo/ธีม/คอมโพเนนต์ร่วม/สัญญา payload | ARC-01, FND-01..06, QA-01, API-01* | — | unit/component test + contract test เท่านั้น (ยังไม่มี flow ให้ E2E) |
| **1** | เข้าระบบ + shell + สิทธิ์ + error หลัก | SHL-01/02, AUT-01/02, ERR-01/02/03, HOM-01 | 19 case (AUT, RBAC, ERR-001..004, HOM-001, RSP-001) | ✅ **จบ phase 1 → เริ่มเขียนบอท** (โครง + smoke + RBAC) รัน manual ด้วย test case ก่อน |
| **2** | System Setting + drawer | SYS-01..05, ERR-04/05, HOM-02, SHL-03 | 13 case (SYS, ERR-005/006, HOM-002, RBAC-007) | เพิ่มเคสในบอท |
| **3** | Users & Roles + editors | USR-01..06, ROL-01..04, (ERR-06 ถ้ามีดีไซน์) | 20 case (USR, ROL) | เพิ่มเคสในบอท (drag/drop, stepper) |
| **4** | Report + Responsive + a11y | RPT-01/02, RSP-01/02, A11Y-01, QA-02 | 7 case (RPT, RSP, A11Y) | เพิ่มเคส + regression ทั้งชุด + ทำคู่มือผู้ใช้จากภาพ |

## ลำดับการทำงานกับ test
1. **ตอนเริ่ม story:** อ่าน test case ที่ผูกกับ backlog นั้น ([TRACEABILITY](test-cases/TRACEABILITY.md)) เขียน unit test ก่อนโค้ด (TDD) สำหรับ logic
2. **ตอนจบ story:** รัน test case ด้วยมือ (กรอกคอลัมน์ "ผลจริง/ผ่านไม่ผ่าน") + unit/contract ใน CI
3. **ตอนจบ phase:** รันครบทุก case ของ phase → เปิด issue/backlog ต่อสำหรับที่ไม่ผ่าน → ค่อยเขียนบอท E2E ครอบ case ที่เสถียรแล้ว
4. **บอท:** ใช้ test case เป็นต้นฉบับ (ID เดียวกัน `TC-…`) ไม่คิด case ใหม่ในบอท
