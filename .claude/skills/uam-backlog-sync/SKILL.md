---
name: uam-backlog-sync
description: PM ซิงก์ backlog กับความจริง — เปิด/อัปเดต GitHub issue จาก items, อัปเดต status.json, EXECUTION-PLAN, TRACEABILITY, README เมื่อมี requirement ใหม่หรือสถานะเปลี่ยน
---
1. **Requirement ใหม่** → สรุป → ร่าง ADR ใน `docs/architecture/` (ถ้ามีการตัดสินใจเชิงโครงสร้าง) → เพิ่ม/แก้ test case ก่อน → สร้าง `docs/backlog/items/UAM-<EPIC>-<nn>.md` (ใช้ฟิลด์เดียวกับไฟล์เดิม: description, design reference, actual, expected, approach, acceptance, depends/blocks, priority score, wave, branch) → ให้ `senior-dev` รีวิว
2. **เปิด issue**: ใช้ `.github/ISSUE_TEMPLATE/backlog-item.yml`; title/labels จาก front matter ของ item; ใส่ลิงก์ dependency เป็น `#issue`; ตรวจซ้ำก่อนสร้าง (ค้นด้วย code) — ห้ามสร้างซ้ำ
3. **อัปเดตสถานะ**: เมื่อ issue เปลี่ยน → แก้ `docs/backlog/status.json` (`todo|doing|done`), คำนวณ wave/พร้อมเริ่มใหม่ใน `EXECUTION-PLAN.md`
4. **ตรวจความสอดคล้อง**: ทุก item มี test case ใน `TRACEABILITY.md`; dependency ไม่วนลูป; priority/wave ถูกต้อง
5. เอกสารเปลี่ยน → ผ่าน branch `docs/<slug>` + PR (Senior merge) ไม่ commit ตรงเข้า `develop`
