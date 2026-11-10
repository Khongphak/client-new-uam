# 👥 Test cases — Users & Roles (list/view/edit user)

รูปแบบ: ทุก case ผูกกับ backlog (`items/UAM-*.md`) · ลำดับ phase ดู [PHASES.md](../PHASES.md) · วิธีรัน: manual ได้ทันทีเมื่อ build เสร็จ; automate (E2E) หลัง phase ที่กำหนด

## TC-USR-001 — Roles ก่อน Users; คอลัมน์ตรงกับโมเดล

| | |
|---|---|
| Backlog | UAM-USR-01 |
| Priority | P0 |
| Phase ที่เริ่มทดสอบได้ | 3 |
| Role | ADMIN |
| Viewport | desktop, phone |
| ประเภท | E2E |

**Precondition**
- มีข้อมูลทดสอบ

| # | ขั้นตอน (Action) | ผลที่คาดหวัง (Expected) | ผลจริง | ผ่าน/ไม่ผ่าน |
|---|---|---|---|---|
| 1 | เปิด `/setting/users-setting` | แท็บแรกคือ Roles ตามด้วย Users | | ☐ |
| 2 | ดูตาราง Roles | คอลัมน์: Role Name, System Name, Description, Status, Updated Date, Updated By — **ไม่มี**จำนวนเมนู/ผู้ใช้ | | ☐ |
| 3 | ดูตาราง Users | Username, Name, Surname, Email, Ext. Number, Department, UAM role, Status, Updated — **ไม่มี**จำนวนระบบ/Last login | | ☐ |
| 4 | ดูสถานะ | แสดงเป็นจุดสี+ข้อความ ไม่ใช่ chip สี | | ☐ |

## TC-USR-002 — กรอง Users ตาม Department / UAM role / Status

| | |
|---|---|
| Backlog | UAM-USR-01 |
| Priority | P1 |
| Phase ที่เริ่มทดสอบได้ | 3 |
| Role | ADMIN |
| Viewport | desktop |
| ประเภท | E2E |

**Precondition**
- -

| # | ขั้นตอน (Action) | ผลที่คาดหวัง (Expected) | ผลจริง | ผ่าน/ไม่ผ่าน |
|---|---|---|---|---|
| 1 | เปิดแท็บ Users กด Filters เลือกตัวกรอง | ตารางแคบลง ตัวนับอัปเดต; Reset ล้างทั้งหมด | | ☐ |

## TC-USR-003 — แท็บคงอยู่ผ่าน fragment

| | |
|---|---|
| Backlog | UAM-USR-01 |
| Priority | P1 |
| Phase ที่เริ่มทดสอบได้ | 3 |
| Role | ADMIN |
| Viewport | desktop |
| ประเภท | E2E |

**Precondition**
- -

| # | ขั้นตอน (Action) | ผลที่คาดหวัง (Expected) | ผลจริง | ผ่าน/ไม่ผ่าน |
|---|---|---|---|---|
| 1 | คลิกแท็บ Users | URL มี `#users` | | ☐ |
| 2 | รีเฟรช | ยังอยู่แท็บ Users | | ☐ |
| 3 | เปิด `...#roles` | เปิดแท็บ Roles | | ☐ |

## TC-USR-004 — Role details (View)

| | |
|---|---|
| Backlog | UAM-USR-02 |
| Priority | P1 |
| Phase ที่เริ่มทดสอบได้ | 3 |
| Role | ADMIN |
| Viewport | desktop, phone |
| ประเภท | E2E |

**Precondition**
- มี Role ≥1

| # | ขั้นตอน (Action) | ผลที่คาดหวัง (Expected) | ผลจริง | ผ่าน/ไม่ผ่าน |
|---|---|---|---|---|
| 1 | คลิกชื่อ Role | หน้า View: แถบสถิติ Menus / Groups / Top level + รายการข้อมูลมีไอคอน + โครงเมนู/สิทธิ์แบบอ่านอย่างเดียว | | ☐ |
| 2 | ตรวจตัวเลขสถิติ | ตรงกับโครงเมนูของ role | | ☐ |

## TC-USR-005 — User details (View) + Approvers อ่านอย่างเดียว

| | |
|---|---|
| Backlog | UAM-USR-03 |
| Priority | P1 |
| Phase ที่เริ่มทดสอบได้ | 3 |
| Role | ADMIN |
| Viewport | desktop, phone |
| ประเภท | E2E |

**Precondition**
- ผู้ใช้ที่ AD มี manager

| # | ขั้นตอน (Action) | ผลที่คาดหวัง (Expected) | ผลจริง | ผ่าน/ไม่ผ่าน |
|---|---|---|---|---|
| 1 | คลิกชื่อผู้ใช้ | หน้า View: ข้อมูลสองคอลัมน์ + ระบบ/role | | ☐ |
| 2 | ดู Approvers | รายการลำดับ 1–3 แสดงเฉพาะชื่อ ไม่มีช่องกรอก | | ☐ |

## TC-USR-006 — ปุ่มกลับกลับถูกแท็บ (#users / #roles)

| | |
|---|---|
| Backlog | UAM-USR-06 |
| Priority | P1 |
| Phase ที่เริ่มทดสอบได้ | 3 |
| Role | ADMIN |
| Viewport | desktop |
| ประเภท | E2E |

**Precondition**
- -

| # | ขั้นตอน (Action) | ผลที่คาดหวัง (Expected) | ผลจริง | ผ่าน/ไม่ผ่าน |
|---|---|---|---|---|
| 1 | User details → กดปุ่มกลับ (ไอคอนบนบรรทัดชื่อ) | กลับ Users ที่ `#users` | | ☐ |
| 2 | Edit user → บันทึกสำเร็จ/กดกลับ | กลับ `#users` | | ☐ |
| 3 | Role details / Role editor → กลับ | กลับ `#roles` | | ☐ |

## TC-USR-007 — Edit user: 3 แท็บ + Save เปิดเมื่อมีการแก้ไขเท่านั้น

| | |
|---|---|
| Backlog | UAM-USR-04 |
| Priority | P0 |
| Phase ที่เริ่มทดสอบได้ | 3 |
| Role | ADMIN |
| Viewport | desktop |
| ประเภท | E2E |

**Precondition**
- มีผู้ใช้ทดสอบ

| # | ขั้นตอน (Action) | ผลที่คาดหวัง (Expected) | ผลจริง | ผ่าน/ไม่ผ่าน |
|---|---|---|---|---|
| 1 | เปิด Edit user | 3 แท็บ: Profile & access / Systems & roles / Permission preview; ปุ่ม Save changes ปิด | | ☐ |
| 2 | สลับสวิตช์ Active | Save changes เปิด และแสดงจำนวนที่ยังไม่บันทึก | | ☐ |
| 3 | แก้กลับเป็นค่าเดิม | ตัวนับกลับเป็น 0 / Save ปิด (ตามพฤติกรรมที่ตกลง) | | ☐ |
| 4 | เปิดแท็บ Permission preview | แสดงตารางพรีวิวสิทธิ์จาก role ที่เลือก | | ☐ |

## TC-USR-008 — Edit user: AD lookup เติมช่องแบบอ่านอย่างเดียว

| | |
|---|---|
| Backlog | UAM-USR-04 |
| Priority | P0 |
| Phase ที่เริ่มทดสอบได้ | 3 |
| Role | ADMIN |
| Viewport | desktop |
| ประเภท | E2E |

**Precondition**
- Username ที่มีใน AD

| # | ขั้นตอน (Action) | ผลที่คาดหวัง (Expected) | ผลจริง | ผ่าน/ไม่ผ่าน |
|---|---|---|---|---|
| 1 | กรอก Username แล้ว lookup | ช่องจาก AD (ชื่อ, อีเมล, Manager 1–3) ถูกเติมและแก้ไม่ได้ | | ☐ |
| 2 | เลือก UAM role (การ์ด) และสวิตช์ System Admin | เลือกได้; ค่า System Admin ผูกกับ `isSuperAdmin` | | ☐ |

## TC-USR-009 — Edit user: AD ไม่พบ/ข้อมูลไม่ครบ

| | |
|---|---|
| Backlog | UAM-USR-05 |
| Priority | P1 |
| Phase ที่เริ่มทดสอบได้ | 3 |
| Role | ADMIN |
| Viewport | desktop |
| ประเภท | E2E |

**Precondition**
- จำลอง MSG_INVALID_USER_AD

| # | ขั้นตอน (Action) | ผลที่คาดหวัง (Expected) | ผลจริง | ผ่าน/ไม่ผ่าน |
|---|---|---|---|---|
| 1 | lookup Username ที่ไม่มีใน AD | แสดงข้อผิดพลาด MSG_INVALID_USER_AD และล้างช่องที่เติม | | ☐ |
| 2 | ตรวจปุ่ม Save | ปิด | | ☐ |

## TC-USR-010 — Edit user: ระบบซ้ำ

| | |
|---|---|
| Backlog | UAM-USR-05 |
| Priority | P1 |
| Phase ที่เริ่มทดสอบได้ | 3 |
| Role | ADMIN |
| Viewport | desktop |
| ประเภท | E2E |

**Precondition**
- -

| # | ขั้นตอน (Action) | ผลที่คาดหวัง (Expected) | ผลจริง | ผ่าน/ไม่ผ่าน |
|---|---|---|---|---|
| 1 | เพิ่มแถวระบบที่ซ้ำกัน | แสดงข้อผิดพลาด MSG_INVALID_DUPLICATED_SYSTEM ที่แถว + สรุปด้านบน; Save ปิด | | ☐ |
| 2 | แก้ให้ไม่ซ้ำ | ข้อผิดพลาดหาย Save เปิด | | ☐ |

## TC-USR-011 — Edit user: ข้อมูลไม่ครบ และ 422

| | |
|---|---|
| Backlog | UAM-USR-05 |
| Priority | P1 |
| Phase ที่เริ่มทดสอบได้ | 3 |
| Role | ADMIN |
| Viewport | desktop |
| ประเภท | E2E |

**Precondition**
- จำลอง 422

| # | ขั้นตอน (Action) | ผลที่คาดหวัง (Expected) | ผลจริง | ผ่าน/ไม่ผ่าน |
|---|---|---|---|---|
| 1 | ปล่อยฟิลด์จำเป็นว่าง | MSG_REQUIRED ที่ฟิลด์; Save ปิด | | ☐ |
| 2 | server ตอบ 422 | แสดงรายการ ModelState ทุกข้อ | | ☐ |

## TC-USR-012 — Payload create/update User ไม่เปลี่ยน

| | |
|---|---|
| Backlog | UAM-QA-01, UAM-USR-04 |
| Priority | P0 |
| Phase ที่เริ่มทดสอบได้ | 3 |
| Role | ADMIN |
| Viewport | desktop |
| ประเภท | Contract |

**Precondition**
- -

| # | ขั้นตอน (Action) | ผลที่คาดหวัง (Expected) | ผลจริง | ผ่าน/ไม่ผ่าน |
|---|---|---|---|---|
| 1 | บันทึกผู้ใช้ใหม่/แก้ไข | body ที่ส่งตรงกับ fixture เดิมทุกฟิลด์ | | ☐ |

