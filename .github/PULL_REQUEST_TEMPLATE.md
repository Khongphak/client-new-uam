## 🔗 Backlog
<!-- ต้องมี code และ issue; base ต้องเป็น develop -->
- Code: `UAM-XXX-nn`
- Closes #
- ผู้เขียน (role): junior-dev / senior-dev

## 📝 สรุปการเปลี่ยนแปลง
<!-- ทำอะไร และทำไม (1–3 ข้อ) ไม่ใส่งานนอกขอบเขต -->

## ✅ ผลทดสอบจริง
<!-- วางผลที่รันจริง ห้ามเขียนว่าผ่านถ้าไม่ได้รัน -->
- [ ] `npm test -- --watch=false --browsers=ChromeHeadlessNoSandbox` → ผล:
- [ ] `npm run build` → ผล:
- [ ] Test case ที่เกี่ยวข้อง (TC-…): 

## 🎯 เกณฑ์ตรวจรับ
- [ ] ตรง artboard (desktop และ phone ถ้ามี) — แนบ screenshot
- [ ] ใช้เฉพาะฟิลด์ใน `shared/interfaces/**` เดิม
- [ ] Payload ที่ส่งหลังบ้านไม่เปลี่ยน
- [ ] มี unit test ของ logic ใหม่ (เขียนก่อนโค้ด)
- [ ] ใช้ `karpathy-guidelines` (diff เล็ก ตรงเรื่อง)
- [ ] งาน frontend: ใช้ `frontend-design` / `superdesign` ภายใต้สเปก + ใส่ `data-testid`
- [ ] ไม่มี dependency ใหม่ที่ไม่ได้รับอนุมัติ / ไม่มี secret

## 📸 Screenshot (UI)
| Desktop 1440 | Phone 390 |
|---|---|
| | |

## ⚠️ ความเสี่ยง / สิ่งที่ผู้รีวิวควรดู


## 🧑‍⚖️ สำหรับ Senior (ผู้รีวิว ≠ ผู้เขียน)
- [ ] ผ่านเช็กลิสต์ `uam-review-pr` · [ ] CI เขียว · [ ] พร้อม squash merge → `develop` · [ ] ตั้ง `status:qa`
