---
name: uam-pick-backlog
description: เริ่มงาน backlog UAM อย่างถูกต้อง — ตรวจสถานะ/dependency, ยืนยัน actual result, แตก branch ใหม่ตามรหัส backlog (ใช้โดย junior-dev และ senior-dev ก่อนเขียนโค้ดทุกครั้ง)
---
1. อ่าน `docs/backlog/items/<CODE>.md` และ GitHub issue: ต้องเป็น `status:ready` + role ตรงกับตัวเอง
2. ตรวจ **Depends on**: ทุกตัวต้อง `status:done` (ดู `docs/backlog/status.json` หรือ label ของ issue) — ไม่ครบ = หยุด รายงาน Senior
3. อ่านสเปกที่อ้างถึง (artboard ใน `docs/design-spec/project/<Name>.dc.html`, note ใน `canvas.json`) และ test case ที่ผูก (`docs/testing/test-cases/TRACEABILITY.md`)
4. **ยืนยัน Actual result**: ช่อง "Actual result" ในไฟล์ item เขียนจากสเปก ตรวจกับโค้ดปัจจุบันของ repo นี้; ไม่ตรง → คอมเมนต์ใน issue และแจ้ง PM
5. `git fetch origin develop && git checkout -B <type>/<CODE>-<slug> origin/develop` (ชื่อ branch อยู่ใน item)
6. ติด `status:in-progress` และคอมเมนต์สั้นๆ ว่าเริ่มแล้ว
7. สรุปแผนเป็นขั้นสั้นๆ พร้อมวิธีตรวจแต่ละขั้น (ตาม `karpathy-guidelines`) แล้วเริ่ม TDD
