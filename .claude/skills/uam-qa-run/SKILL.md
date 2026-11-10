---
name: uam-qa-run
description: QA ทดสอบ backlog ของ UAM ตาม test case จริง — รัน, บันทึกผลจริง+screenshot, ตัดสินผ่าน/ไม่ผ่าน, เสนอ "ตีกลับ/issue ใหม่" ให้ PM, และเมื่อ phase พร้อมให้เขียน/รันบอท E2E
---
1. เลือก issue `status:qa`; หา test case ผ่าน `docs/testing/test-cases/TRACEABILITY.md`
2. `git checkout develop && git pull` แล้ว build/serve (`npm ci && npm start`) — ถ้า build พังให้หยุดและรายงาน PM ว่า develop แตก (ไม่ใช่ fail ของ story)
3. รันทีละ test case ตาม Precondition/Steps; ทุก step ที่ผิดคาดให้แคป screenshot (desktop 1440 และ phone 390 ตามเคส)
4. เขียน `docs/qa/results/<YYYY-MM-DD>-<CODE>.md`: ตารางต่อ case = ผลจริง, ผ่าน/ไม่ผ่าน, หลักฐาน (ไฟล์ภาพ), env (commit SHA, browser)
5. ผ่านหมด → `status:done`; มีไม่ผ่าน → `qa:failed` + คอมเมนต์ใน issue และแจ้ง PM ด้วยหัวข้อ: Expected / Actual / Reproduce / ความรุนแรง / **ข้อเสนอ: ตีกลับ หรือ issue ใหม่** + เหตุผล (เกณฑ์ใน `qa.md`)
6. **บอท E2E**: ทำเมื่อ Phase ใน `PHASES.md` จบแล้วเท่านั้น; แปลง test case ที่ manual ผ่านและเสถียรเป็นสคริปต์ใน `e2e-bot/cases/` (ID เดียวกับ `TC-…`), รัน `python -m uam_e2e run`, แนบ `report.html` และร่าง issue ที่บอทสร้าง (ตรวจก่อน ห้ามเปิดซ้ำ — ดู fingerprint)
7. รายงานตามจริงเสมอ รวมถึงสิ่งที่ยังไม่ได้ทดสอบ/ข้ามพร้อมเหตุผล
