---
name: uam-frontend-implement
description: implement งาน frontend ของ UAM ให้ตรง artboard — ใช้ร่วมกับ frontend-design หรือ superdesign skill เสมอ; ครอบคลุม tokens, PrimeNG, responsive, a11y, หลักฐาน screenshot
---
**ต้องเรียก `frontend-design:frontend-design` หรือ `superdesign:superdesign` ก่อนเริ่ม** แล้วใช้คำแนะนำด้านดีไซน์ภายใต้กรอบนี้ (สเปกที่ผู้ใช้ยืนยันแล้วชนะเสมอ ห้ามออกแบบทับ):
1. เปิด artboard ที่เกี่ยวข้อง `docs/design-spec/project/<Name>.dc.html` (+ `*Phone`) และ note ใน `canvas.json`; ดู class `u-*` ที่ใช้จาก `uam.css`
2. ใช้ tokens `--uam-*`, สเกลระยะ `--sp-1..6`, ฟอนต์ Sukhumvit Set, สี `#00194b` / `#2854a7` — ผ่านชิ้นส่วนร่วม (`UAM-FND-02..06`) ถ้ายังไม่มีให้แจ้ง Senior อย่าคัดลอก CSS ซ้ำ
3. ใช้คอมโพเนนต์ **PrimeNG** และไอคอน **PrimeIcons** เท่านั้น ห้ามเพิ่มไลบรารี UI/ไอคอนใหม่
4. แสดงเฉพาะข้อมูลที่ model มี (ดูรายการ "ฟิลด์จริง" ใน design-spec) — ห้ามเพิ่มจำนวนเมนู/ผู้ใช้/สถานะ Maintenance ฯลฯ ที่ถูกถอดออก
5. Responsive: desktop 1440, phone 390 (sidebar เป็น drawer <768px, ปุ่มสูง ≥44px บนมือถือ)
6. a11y: ปุ่ม/ลิงก์จริง, `aria-label` บนปุ่มไอคอน, focus ring `#2854a7`, ใช้คีย์บอร์ดได้
7. ใส่ `data-testid` ให้ element ที่ test case/บอทต้องใช้ (ชื่อ kebab-case เช่น `login-submit`)
8. หลักฐาน: screenshot desktop+phone (Playwright/Chromium ที่ติดตั้งแล้ว) แนบใน PR; ถ้าต่างจาก artboard ให้ระบุเหตุผล
