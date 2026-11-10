---
name: uam-daily-standup
description: PM stand-up ตอนผู้ใช้เริ่ม session (ผู้ใช้เรียกเอง ไม่มี schedule) — อะไรเสร็จแล้ว ค้างอะไร ควรทำอะไรต่อ เริ่มได้เลยไหม ต้องการการตัดสินใจอะไร
---
1. `git fetch origin` และอ่านสถานะจริง: PR ที่ merge/เปิดอยู่ใน 24 ชม. (`mcp__github__list_pull_requests`/`list_commits`), issue ตาม label `status:*`, `qa:failed`, CI ล่าสุด, `docs/qa/results/` ล่าสุด, `docs/backlog/status.json`, `EXECUTION-PLAN.md`
2. เขียน `docs/reports/daily/<YYYY-MM-DD>.md` ด้วยหัวข้อ:
   - **✅ เสร็จแล้ว** (issue/PR + ผล QA)
   - **🔄 กำลังทำ / รอรีวิว / รอ QA**
   - **❌ QA ไม่ผ่าน** — แต่ละเรื่อง: ข้อเสนอ ตีกลับ/issue ใหม่ + เหตุผล (รอผู้ใช้ตัดสิน)
   - **🚧 ติดขัด/ความเสี่ยง** (blocked, dependency, CI แดง, ช่องว่างสเปก)
   - **🎯 ควรทำต่อ** — รายการเรียงตามความสำคัญ จาก wave/dependency ที่พร้อมเริ่มจริง (dependency ครบ) และมอบหมาย role
   - **❓ ขอการตัดสินใจ** — คำถามที่ต้องการคำตอบสั้นๆ (ตอบ ใช่/ไม่ ได้) เช่น "เริ่ม UAM-xx ได้เลยไหม"
3. ข้อมูลต้องมาจากแหล่งจริงเท่านั้น ถ้าอ่านไม่ได้ให้เขียนว่า "ตรวจไม่ได้" อย่าเดา
4. commit รายงานบน `develop` (docs เท่านั้น ผ่าน branch `docs/daily-<YYYY-MM-DD>` + PR ให้ Senior merge) แล้วสรุปสั้นๆ ให้ผู้ใช้ในแชต/แจ้งเตือน ห้ามเริ่มงานใหม่เองจนกว่าผู้ใช้ตอบ "เริ่มได้"
