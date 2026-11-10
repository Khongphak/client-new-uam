# ⚙️ Test cases — System Setting

รูปแบบ: ทุก case ผูกกับ backlog (`items/UAM-*.md`) · ลำดับ phase ดู [PHASES.md](../PHASES.md) · วิธีรัน: manual ได้ทันทีเมื่อ build เสร็จ; automate (E2E) หลัง phase ที่กำหนด

## TC-SYS-001 — System Setting: 3 แท็บและตัวนับ

| | |
|---|---|
| Backlog | UAM-SYS-01 |
| Priority | P0 |
| Phase ที่เริ่มทดสอบได้ | 2 |
| Role | ADMIN, DEVELOPER |
| Viewport | desktop, phone |
| ประเภท | E2E |

**Precondition**
- มีข้อมูลทดสอบ

| # | ขั้นตอน (Action) | ผลที่คาดหวัง (Expected) | ผลจริง | ผ่าน/ไม่ผ่าน |
|---|---|---|---|---|
| 1 | เปิด `/setting/system-setting` | มีแท็บ System / Menu / System to System พร้อมตัวนับในแท็บ (นับจากแถวที่โหลด) | | ☐ |
| 2 | สลับแต่ละแท็บ | ตารางเปลี่ยน: Menu มีคอลัมน์ functional, S2S มี accessTokenTime | | ☐ |
| 3 | ตรวจท้ายตาราง | "Showing 1 to X of Y entries" ซ้าย + paginator ขวา | | ☐ |

## TC-SYS-002 — ค้นหา กรอง และ Reset (ฝั่งหน้าบ้าน)

| | |
|---|---|
| Backlog | UAM-SYS-01 |
| Priority | P0 |
| Phase ที่เริ่มทดสอบได้ | 2 |
| Role | ADMIN |
| Viewport | desktop |
| ประเภท | E2E |

**Precondition**
- ข้อมูลทดสอบหลากหลาย Owner/Type/Status

| # | ขั้นตอน (Action) | ผลที่คาดหวัง (Expected) | ผลจริง | ผ่าน/ไม่ผ่าน |
|---|---|---|---|---|
| 1 | พิมพ์ชื่อในช่องค้นหา | รายการเหลือเฉพาะชื่อที่ตรง; ตัวนับ/Showing อัปเดต | | ☐ |
| 2 | กด Filters | เปิดแผง dropdown มีป้ายชื่อ (Owner, Type, Status…); ปุ่มแสดงจำนวนตัวกรองที่ใช้ | | ☐ |
| 3 | เลือกตัวกรอง 2 หมวด | แคบลงตามทุกเงื่อนไข | | ☐ |
| 4 | กด Reset | ล้างค้นหา+ตัวกรอง; ตัวนับกลับ 0 | | ☐ |
| 5 | ตรวจ network | **ไม่มี** request ใหม่ไป backend ตอนค้นหา/กรอง | | ☐ |

## TC-SYS-003 — เปิด drawer ดูรายละเอียด + deep link

| | |
|---|---|
| Backlog | UAM-SYS-02 |
| Priority | P0 |
| Phase ที่เริ่มทดสอบได้ | 2 |
| Role | ADMIN |
| Viewport | desktop |
| ประเภท | E2E |

**Precondition**
- มี System ≥1

| # | ขั้นตอน (Action) | ผลที่คาดหวัง (Expected) | ผลจริง | ผ่าน/ไม่ผ่าน |
|---|---|---|---|---|
| 1 | คลิกชื่อ/ปุ่มดูของแถวแรก | drawer เปิดด้านขวา (p-sidebar); URL มี query ของ drawer | | ☐ |
| 2 | รีเฟรชหน้า | drawer ยังเปิดสถานะเดิม | | ☐ |
| 3 | กด Back ของเบราว์เซอร์ | drawer ปิด กลับตาราง | | ☐ |
| 4 | เปิด URL deep link ในแท็บใหม่ | เปิดถึง drawer เดิม | | ☐ |

## TC-SYS-004 — เพิ่ม System ใน drawer

| | |
|---|---|
| Backlog | UAM-SYS-02, UAM-QA-01 |
| Priority | P0 |
| Phase ที่เริ่มทดสอบได้ | 2 |
| Role | ADMIN |
| Viewport | desktop |
| ประเภท | E2E |

**Precondition**
- -

| # | ขั้นตอน (Action) | ผลที่คาดหวัง (Expected) | ผลจริง | ผ่าน/ไม่ผ่าน |
|---|---|---|---|---|
| 1 | กด Add แล้วกรอกข้อมูลที่จำเป็น | drawer โหมดเพิ่ม | | ☐ |
| 2 | กด Save | toast สำเร็จ; drawer ปิด; แถวใหม่อยู่ในตาราง; ตัวนับ +1 | | ☐ |
| 3 | ตรวจ payload | เหมือน payload เดิมของ API (contract test) | | ☐ |

## TC-SYS-005 — แก้ไข System ใน drawer

| | |
|---|---|
| Backlog | UAM-SYS-02 |
| Priority | P1 |
| Phase ที่เริ่มทดสอบได้ | 2 |
| Role | ADMIN |
| Viewport | desktop |
| ประเภท | E2E |

**Precondition**
- มี System ≥1

| # | ขั้นตอน (Action) | ผลที่คาดหวัง (Expected) | ผลจริง | ผ่าน/ไม่ผ่าน |
|---|---|---|---|---|
| 1 | เปิด drawer โหมดแก้ไข แก้ค่าแล้ว Save | บันทึกสำเร็จ ตารางแสดงค่าใหม่ + Updated Date/By เปลี่ยน | | ☐ |
| 2 | ปิด drawer โดยมีการแก้ที่ยังไม่บันทึก | (ตามพฤติกรรมที่ตกลง — ยืนยันตอน implement) | | ☐ |

## TC-SYS-006 — Menu drawer (ดู/เพิ่ม/แก้ไข) รวมฟิลด์ functional

| | |
|---|---|
| Backlog | UAM-SYS-03 |
| Priority | P1 |
| Phase ที่เริ่มทดสอบได้ | 2 |
| Role | ADMIN |
| Viewport | desktop |
| ประเภท | E2E |

**Precondition**
- -

| # | ขั้นตอน (Action) | ผลที่คาดหวัง (Expected) | ผลจริง | ผ่าน/ไม่ผ่าน |
|---|---|---|---|---|
| 1 | แท็บ Menu → เพิ่ม/ดู/แก้ไข | ใช้ drawer เดียวกับ System; ฟิลด์ functional แสดง/บันทึกถูก | | ☐ |

## TC-SYS-007 — System to System drawer รวม accessTokenTime

| | |
|---|---|
| Backlog | UAM-SYS-04 |
| Priority | P1 |
| Phase ที่เริ่มทดสอบได้ | 2 |
| Role | ADMIN |
| Viewport | desktop |
| ประเภท | E2E |

**Precondition**
- -

| # | ขั้นตอน (Action) | ผลที่คาดหวัง (Expected) | ผลจริง | ผ่าน/ไม่ผ่าน |
|---|---|---|---|---|
| 1 | แท็บ System to System → เพิ่ม/ดู/แก้ไข | drawer แสดง/บันทึก accessTokenTime ถูก | | ☐ |

## TC-SYS-008 — ลิงก์ route เก่า (10 route) ถูก redirect

| | |
|---|---|
| Backlog | UAM-SYS-05 |
| Priority | P2 |
| Phase ที่เริ่มทดสอบได้ | 2 |
| Role | ADMIN |
| Viewport | desktop |
| ประเภท | E2E |

**Precondition**
- -

| # | ขั้นตอน (Action) | ผลที่คาดหวัง (Expected) | ผลจริง | ผ่าน/ไม่ผ่าน |
|---|---|---|---|---|
| 1 | เปิด `action-system`, `-edit`, `-view`, `-setup`, `action-menu-screen*`, `action-system-to-system*` | redirect ไปรูปแบบ drawer ที่ตรงกัน ไม่มีหน้า 404 | | ☐ |

## TC-SYS-009 — DEVELOPER ใช้ System Setting ได้ครบ แต่ไม่มี User & Permission

| | |
|---|---|
| Backlog | UAM-SYS-01, UAM-SHL-02 |
| Priority | P1 |
| Phase ที่เริ่มทดสอบได้ | 2 |
| Role | DEVELOPER |
| Viewport | desktop |
| ประเภท | E2E |

**Precondition**
- -

| # | ขั้นตอน (Action) | ผลที่คาดหวัง (Expected) | ผลจริง | ผ่าน/ไม่ผ่าน |
|---|---|---|---|---|
| 1 | เปิด System Setting แล้วเพิ่ม/แก้ไข | ทำได้ | | ☐ |
| 2 | เปิด `/setting/users-setting` | หน้า 403 | | ☐ |

## TC-SYS-010 — ชื่อซ้ำ 40301 (ALREADY_EXISTED) ในฟอร์ม System

| | |
|---|---|
| Backlog | UAM-ERR-06 |
| Priority | P2 |
| Phase ที่เริ่มทดสอบได้ | 3 |
| Role | ADMIN |
| Viewport | desktop |
| ประเภท | E2E |

**Precondition**
- รอดีไซน์ UAM-DSN-01

| # | ขั้นตอน (Action) | ผลที่คาดหวัง (Expected) | ผลจริง | ผ่าน/ไม่ผ่าน |
|---|---|---|---|---|
| 1 | เพิ่ม System ชื่อที่มีอยู่แล้ว | แสดง inline error ที่ช่องชื่อ (ตามดีไซน์ที่จะได้) | | ☐ |

> 💡 ⚠️ Blocked ด้วยดีไซน์

