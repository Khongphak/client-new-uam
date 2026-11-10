---
name: uam-open-pr
description: ปิดงาน backlog UAM เป็น PR — รัน test/build, ตรวจ checklist, commit สื่อความหมาย, กรอก PR template, ส่งรีวิว (ใช้โดย junior-dev และ senior-dev)
---
1. ก่อนเปิด PR รันทั้งหมดและแนบผลจริง:
   ```bash
   export CHROME_BIN=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome
   npm test -- --watch=false --browsers=ChromeHeadlessNoSandbox
   npm run build
   ```
2. ตรวจ diff ด้วยตัวเอง: เล็ก ตรงเรื่อง ไม่มีไฟล์เกินขอบเขต ไม่มี secret ไม่มี `console.log`/`fdescribe`/`xit`
3. ตรวจเกณฑ์ **ห้ามเปลี่ยน payload / ใช้เฉพาะฟิลด์เดิม** (ถ้าแตะ service/form: ยืนยันว่า contract test ผ่าน)
4. Commit: `feat|fix|test|chore|docs(<CODE>): <สิ่งที่ทำ>` ภาษาอังกฤษสั้นๆ เหตุผลใน body ถ้าจำเป็น ลงท้ายตามกติกา attribution ของ session
5. `git push -u origin <branch>` แล้วเปิด PR base=`develop` ใช้ `.github/PULL_REQUEST_TEMPLATE.md` กรอกครบ (backlog code, สรุป, ผล test จริง, screenshot desktop+phone ถ้าเป็น UI, ความเสี่ยง) + `Closes #<issue>`
6. เปลี่ยน label เป็น `status:in-review` และเรียก Senior (ที่ไม่ใช่ตัวเอง) รีวิว
