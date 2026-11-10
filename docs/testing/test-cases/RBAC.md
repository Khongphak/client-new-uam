# 🛡️ Test cases — สิทธิ์ตาม role / เมนู

รูปแบบ: ทุก case ผูกกับ backlog (`items/UAM-*.md`) · ลำดับ phase ดู [PHASES.md](../PHASES.md) · วิธีรัน: manual ได้ทันทีเมื่อ build เสร็จ; automate (E2E) หลัง phase ที่กำหนด

## TC-RBAC-001 — เมนูซ้ายของ ADMIN แสดง: Home, Setting, Report

| | |
|---|---|
| Backlog | UAM-SHL-02 |
| Priority | P0 |
| Phase ที่เริ่มทดสอบได้ | 1 |
| Role | ADMIN |
| Viewport | desktop, phone |
| ประเภท | E2E |

**Precondition**
- ล็อกอินด้วย ADMIN และยอมรับ consent แล้ว

| # | ขั้นตอน (Action) | ผลที่คาดหวัง (Expected) | ผลจริง | ผ่าน/ไม่ผ่าน |
|---|---|---|---|---|
| 1 | เปิด `/home` | sidebar แสดงเฉพาะ Home, Setting, Report; รายการที่เปิดอยู่เป็นไล่สีน้ำเงิน | | ☐ |
| 2 | ตรวจเมนูย่อยของ Setting | DEVELOPER เห็นเฉพาะ System Setting; ADMIN/Super admin เห็น System Setting + User & Permission | | ☐ |
| 3 | ตรวจ topbar | แสดงชื่อ + role ของผู้ใช้ และเมนู Logout | | ☐ |

## TC-RBAC-002 — เมนูซ้ายของ DEVELOPER แสดง: Home, Setting

| | |
|---|---|
| Backlog | UAM-SHL-02 |
| Priority | P0 |
| Phase ที่เริ่มทดสอบได้ | 1 |
| Role | DEVELOPER |
| Viewport | desktop, phone |
| ประเภท | E2E |

**Precondition**
- ล็อกอินด้วย DEVELOPER และยอมรับ consent แล้ว

| # | ขั้นตอน (Action) | ผลที่คาดหวัง (Expected) | ผลจริง | ผ่าน/ไม่ผ่าน |
|---|---|---|---|---|
| 1 | เปิด `/home` | sidebar แสดงเฉพาะ Home, Setting; รายการที่เปิดอยู่เป็นไล่สีน้ำเงิน | | ☐ |
| 2 | ตรวจเมนูย่อยของ Setting | DEVELOPER เห็นเฉพาะ System Setting; ADMIN/Super admin เห็น System Setting + User & Permission | | ☐ |
| 3 | ตรวจ topbar | แสดงชื่อ + role ของผู้ใช้ และเมนู Logout | | ☐ |

## TC-RBAC-003 — เมนูซ้ายของ AUDIT แสดง: Home, Report

| | |
|---|---|
| Backlog | UAM-SHL-02 |
| Priority | P0 |
| Phase ที่เริ่มทดสอบได้ | 1 |
| Role | AUDIT |
| Viewport | desktop, phone |
| ประเภท | E2E |

**Precondition**
- ล็อกอินด้วย AUDIT และยอมรับ consent แล้ว

| # | ขั้นตอน (Action) | ผลที่คาดหวัง (Expected) | ผลจริง | ผ่าน/ไม่ผ่าน |
|---|---|---|---|---|
| 1 | เปิด `/home` | sidebar แสดงเฉพาะ Home, Report; รายการที่เปิดอยู่เป็นไล่สีน้ำเงิน | | ☐ |
| 2 | ตรวจว่าไม่มีเมนู Setting | ไม่เห็นเมนู Setting | | ☐ |
| 3 | ตรวจ topbar | แสดงชื่อ + role ของผู้ใช้ และเมนู Logout | | ☐ |

## TC-RBAC-004 — เมนูซ้ายของ USER แสดง: Home

| | |
|---|---|
| Backlog | UAM-SHL-02 |
| Priority | P0 |
| Phase ที่เริ่มทดสอบได้ | 1 |
| Role | USER |
| Viewport | desktop, phone |
| ประเภท | E2E |

**Precondition**
- ล็อกอินด้วย USER และยอมรับ consent แล้ว

| # | ขั้นตอน (Action) | ผลที่คาดหวัง (Expected) | ผลจริง | ผ่าน/ไม่ผ่าน |
|---|---|---|---|---|
| 1 | เปิด `/home` | sidebar แสดงเฉพาะ Home; รายการที่เปิดอยู่เป็นไล่สีน้ำเงิน | | ☐ |
| 2 | ตรวจว่าไม่มีเมนู Setting | ไม่เห็นเมนู Setting | | ☐ |
| 3 | ตรวจ topbar | แสดงชื่อ + role ของผู้ใช้ และเมนู Logout | | ☐ |

## TC-RBAC-005 — เมนูซ้ายของ SUPERADMIN แสดง: Home, Setting, Report

| | |
|---|---|
| Backlog | UAM-SHL-02 |
| Priority | P0 |
| Phase ที่เริ่มทดสอบได้ | 1 |
| Role | SUPERADMIN |
| Viewport | desktop, phone |
| ประเภท | E2E |

**Precondition**
- ล็อกอินด้วย SUPERADMIN และยอมรับ consent แล้ว

| # | ขั้นตอน (Action) | ผลที่คาดหวัง (Expected) | ผลจริง | ผ่าน/ไม่ผ่าน |
|---|---|---|---|---|
| 1 | เปิด `/home` | sidebar แสดงเฉพาะ Home, Setting, Report; รายการที่เปิดอยู่เป็นไล่สีน้ำเงิน | | ☐ |
| 2 | ตรวจเมนูย่อยของ Setting | DEVELOPER เห็นเฉพาะ System Setting; ADMIN/Super admin เห็น System Setting + User & Permission | | ☐ |
| 3 | ตรวจ topbar | แสดงชื่อ + role ของผู้ใช้ และเมนู Logout | | ☐ |

## TC-RBAC-006 — ผู้ไม่มีสิทธิ์เข้า route ต้องห้าม → หน้า 403 (ไม่ใช่ 404)

| | |
|---|---|
| Backlog | UAM-ERR-02 |
| Priority | P0 |
| Phase ที่เริ่มทดสอบได้ | 1 |
| Role | DEVELOPER, AUDIT, USER |
| Viewport | desktop |
| ประเภท | E2E |

**Precondition**
- ล็อกอินด้วย role ตามตาราง

| # | ขั้นตอน (Action) | ผลที่คาดหวัง (Expected) | ผลจริง | ผ่าน/ไม่ผ่าน |
|---|---|---|---|---|
| 1 | DEVELOPER เปิด `/setting/users-setting` | แสดงหน้า 403 "No access" (ไม่ใช่ "Looks like you are lost") | | ☐ |
| 2 | AUDIT เปิด `/setting/system-setting` | หน้า 403 | | ☐ |
| 3 | USER เปิด `/report` | หน้า 403 | | ☐ |
| 4 | AUDIT เปิด `/report` | เปิดได้ปกติ | | ☐ |
| 5 | Super admin เปิดทุก route ข้างต้น | เปิดได้ทั้งหมด (`systemAdmin` ผ่านทุก roleGuard) | | ☐ |

> 💡 ตารางสิทธิ์: ดู design-spec หัวข้อ "สิทธิ์ตาม route"

## TC-RBAC-007 — `/setting` เด้งไปหน้าลูกแรกที่มีสิทธิ์

| | |
|---|---|
| Backlog | UAM-SHL-03 |
| Priority | P2 |
| Phase ที่เริ่มทดสอบได้ | 2 |
| Role | ADMIN, DEVELOPER |
| Viewport | desktop |
| ประเภท | E2E |

**Precondition**
- รอผู้ใช้ตัดสินใจกติกา `/setting` (UAM-SHL-03)

| # | ขั้นตอน (Action) | ผลที่คาดหวัง (Expected) | ผลจริง | ผ่าน/ไม่ผ่าน |
|---|---|---|---|---|
| 1 | เปิด `/setting` | redirect ไปหน้า System Setting (กติกาที่แนะนำ) | | ☐ |

> 💡 ⚠️ Blocked ด้วยการตัดสินใจ — แก้ expected เมื่อยืนยัน

