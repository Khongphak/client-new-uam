---
name: uam-review-pr
description: รีวิวและ merge PR ของ UAM (senior-dev เท่านั้น) — เช็กลิสต์ความถูกต้อง/ขอบเขต/สเปก/ทดสอบ แล้วตัดสิน approve, request changes หรือ squash merge เข้า develop
---
ห้ามรีวิว/merge PR ที่ตัวเองเป็นผู้เขียน
**เช็กลิสต์ (ตอบให้ครบก่อนตัดสินใจ):**
- [ ] ผูก backlog code + `Closes #` ถูกต้อง, base=`develop`, ชื่อ branch ตามกติกา
- [ ] diff อยู่ในขอบเขต item (ไม่มีงานแถม/refactor ที่ไม่เกี่ยว) — `karpathy-guidelines`
- [ ] ตรง acceptance ของ item และ artboard (เปิดไฟล์ `.dc.html` + screenshot ใน PR เทียบ) ใช้ PrimeNG/PrimeIcons/tokens ตามสเปก
- [ ] ใช้เฉพาะฟิลด์ใน `shared/interfaces/**`; **payload ไม่เปลี่ยน**; ไม่มี dependency ใหม่ที่ไม่ได้อนุมัติ
- [ ] มี unit test ของ logic ใหม่ และ test พิสูจน์พฤติกรรมจริง (ไม่ใช่ test เปล่า); ไม่มี skip/disable test
- [ ] a11y พื้นฐาน: ปุ่มไอคอนมี label, ใช้ปุ่ม/ลิงก์จริง, focus เห็นชัด
- [ ] **Clean-room:** ไม่มีร่องรอยการคัดลอก/พอร์ต/เลียนโครงสร้างจากโค้ดเก่า (ชื่อไฟล์/คลาส/แพตเทิร์น) และไม่มีการอ้างถึง `client-uam-develop` ใน `src/`
- [ ] CI เขียว (build + test) — ถ้าแดง ห้าม merge
- [ ] commit สื่อความหมาย
**ตัดสิน:** มีข้อไม่ผ่าน → request changes พร้อมเหตุผลเฉพาะเจาะจง/ตัวอย่างแก้; ผ่านหมด → approve แล้ว **squash merge** เข้า `develop`, เปลี่ยน issue เป็น `status:qa`, ลบ branch
ห้ามแก้โค้ดในนามผู้เขียนเงียบๆ — ให้ผู้เขียนแก้ (ยกเว้นเป็นการ rebase/แก้ conflict เล็กน้อย ให้แจ้งใน PR)
