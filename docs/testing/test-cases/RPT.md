# 📊 Test cases — Report

รูปแบบ: ทุก case ผูกกับ backlog (`items/UAM-*.md`) · ลำดับ phase ดู [PHASES.md](../PHASES.md) · วิธีรัน: manual ได้ทันทีเมื่อ build เสร็จ; automate (E2E) หลัง phase ที่กำหนด

## TC-RPT-001 — Report: เลือกชนิด → System Name → Department/ช่วงวันที่ → Export

| | |
|---|---|
| Backlog | UAM-RPT-01 |
| Priority | P1 |
| Phase ที่เริ่มทดสอบได้ | 4 |
| Role | ADMIN, AUDIT |
| Viewport | desktop, phone |
| ประเภท | E2E |

**Precondition**
- -

| # | ขั้นตอน (Action) | ผลที่คาดหวัง (Expected) | ผลจริง | ผ่าน/ไม่ผ่าน |
|---|---|---|---|---|
| 1 | เปิด `/report` | แท็บชนิดรายงาน; **ไม่มี**ตารางพรีวิว | | ☐ |
| 2 | เลือกชนิด + System Name + Department | Export ใช้ได้ | | ☐ |
| 3 | กดช่วงวันที่ลัด (Last 7 days ฯลฯ) | ช่องวันที่ถูกตั้งค่า (ฝั่งหน้าบ้านล้วน) | | ☐ |
| 4 | กด Export | ดาวน์โหลดไฟล์ Excel (.xlsx) | | ☐ |
| 5 | กด Reset | ล้างค่าที่เลือก | | ☐ |

## TC-RPT-002 — Report: ดาวน์โหลดล้มเหลว แจ้งผู้ใช้

| | |
|---|---|
| Backlog | UAM-RPT-02 |
| Priority | P1 |
| Phase ที่เริ่มทดสอบได้ | 4 |
| Role | ADMIN |
| Viewport | desktop |
| ประเภท | E2E |

**Precondition**
- จำลอง API ล้ม

| # | ขั้นตอน (Action) | ผลที่คาดหวัง (Expected) | ผลจริง | ผ่าน/ไม่ผ่าน |
|---|---|---|---|---|
| 1 | กด Export | แสดง toast ผิดพลาด (ไม่ใช่แค่ console.error) | | ☐ |

## TC-RPT-003 — Report: สิทธิ์ ADMIN/AUDIT/Super admin เท่านั้น

| | |
|---|---|
| Backlog | UAM-SHL-02, UAM-ERR-02 |
| Priority | P0 |
| Phase ที่เริ่มทดสอบได้ | 4 |
| Role | DEVELOPER, USER |
| Viewport | desktop |
| ประเภท | E2E |

**Precondition**
- -

| # | ขั้นตอน (Action) | ผลที่คาดหวัง (Expected) | ผลจริง | ผ่าน/ไม่ผ่าน |
|---|---|---|---|---|
| 1 | เปิด `/report` | หน้า 403 | | ☐ |

## TC-RPT-004 — Report: แท็บชนิดรายงานใช้คีย์บอร์ดได้และผูก tabpanel

| | |
|---|---|
| Backlog | UAM-RPT-03 |
| Priority | P3 |
| Phase ที่เริ่มทดสอบได้ | 4 |
| Role | ADMIN, AUDIT |
| Viewport | desktop |
| ประเภท | E2E / a11y |

**Precondition**
- เปิด `/report`

| # | ขั้นตอน (Action) | ผลที่คาดหวัง (Expected) | ผลจริง | ผ่าน/ไม่ผ่าน |
|---|---|---|---|---|
| 1 | Tab เข้าแถบแท็บ | โฟกัสที่แท็บที่เลือกอยู่ (roving tabindex) | | ☐ |
| 2 | กดลูกศรขวา / ซ้าย | เลื่อนไปแท็บถัดไป/ก่อนหน้า และเปลี่ยนชนิดรายงาน | | ☐ |
| 3 | ตรวจ DOM | แต่ละ `role="tab"` มี `aria-controls` ชี้ `role="tabpanel"` ที่มีอยู่จริง | | ☐ |
| 4 | เทียบสีพื้นของส่วนที่เคยใช้ `#f2f2f2` | ภาพเหมือนเดิม (มาจาก token) | | ☐ |
