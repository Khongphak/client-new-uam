# 🗺️ ลำดับการทำงาน (Execution plan)

คำนวณจาก dependency ใน `items/*.md` — งานใน wave เดียวกันทำ**คู่ขนาน**ได้ทั้งหมด (ไม่ขึ้นต่อกัน); wave ถัดไปเริ่มได้เมื่อ dependency ที่ระบุเสร็จ (ไม่จำเป็นต้องรอทั้ง wave) ภายใน wave เรียงตาม priority

## 🌊 Wave 1

| Code | งาน | Pts | Priority | ต้องเสร็จก่อน |
|---|---|---|---|---|
| [UAM-FND-01](items/UAM-FND-01.md) | เริ่มแอปใหม่ด้วย ng new + baseline CI/test (เสร็จแล้ว) | 3 | 🔴 P0 | — |
| [UAM-DSN-01](items/UAM-DSN-01.md) | ปิดช่องว่างของดีไซน์: phone ของหน้าสถานะ, error ของ drawer, ชื่อซ้ำ 40301 | 3 | 🟡 P2 | — |

## 🌊 Wave 2

| Code | งาน | Pts | Priority | ต้องเสร็จก่อน |
|---|---|---|---|---|
| [UAM-FND-02](items/UAM-FND-02.md) | Design tokens & ธีม (uam.css → SCSS) | 3 | 🔴 P0 | UAM-FND-01 |
| [UAM-QA-01](items/UAM-QA-01.md) | ชุดทดสอบ contract: payload/response ต้องไม่เปลี่ยน | 3 | 🔴 P0 | UAM-FND-01 |

## 🌊 Wave 3

| Code | งาน | Pts | Priority | ต้องเสร็จก่อน |
|---|---|---|---|---|
| [UAM-FND-03](items/UAM-FND-03.md) | คอมโพเนนต์ร่วมชุดพื้นฐาน (status, role, num, chips, count, tile, row, switch-row, back, section-title) | 5 | 🔴 P0 | UAM-FND-02 |
| [UAM-FND-04](items/UAM-FND-04.md) | คอมโพเนนต์ร่วมชุดสถานะ/ข้อความ (dialog, state, skeleton, toast, errpage) | 5 | 🔴 P0 | UAM-FND-02 |
| [UAM-SHL-01](items/UAM-SHL-01.md) | Shell: topbar 70px + sidebar 250px + breakpoint 768px | 5 | 🔴 P0 | UAM-FND-02 |

## 🌊 Wave 4

| Code | งาน | Pts | Priority | ต้องเสร็จก่อน |
|---|---|---|---|---|
| [UAM-FND-05](items/UAM-FND-05.md) | คอมโพเนนต์ร่วมของตาราง: toolbar + Filters panel + footer/paginator | 5 | 🔴 P0 | UAM-FND-03 |
| [UAM-ERR-02](items/UAM-ERR-02.md) | หน้า 403 แยก + roleGuard ส่งไป 403 | 2 | 🔴 P0 | UAM-FND-04, UAM-SHL-01 |
| [UAM-SHL-02](items/UAM-SHL-02.md) | กรองเมนูซ้ายตาม role (ADMIN/DEVELOPER/AUDIT/USER/Super admin) | 3 | 🔴 P0 | UAM-SHL-01 |
| [UAM-ERR-03](items/UAM-ERR-03.md) | ข้อความ/dialog จาก HTTP interceptor (session หมดอายุ, network, server 50000–50002) | 3 | 🟠 P1 | UAM-FND-04 |
| [UAM-AUT-01](items/UAM-AUT-01.md) | หน้า Login | 3 | 🟠 P1 | UAM-FND-02, UAM-FND-03 |
| [UAM-FND-06](items/UAM-FND-06.md) | คอมโพเนนต์ร่วมของหน้า detail (facts, stats, approvers, accordion, group-head, perm-row, sys-grid/card, meta-ico) | 5 | 🟠 P1 | UAM-FND-03 |
| [UAM-ERR-04](items/UAM-ERR-04.md) | Dialog ยืนยันลบ และลบไม่ได้ (message + statusDescription จาก server) | 2 | 🟡 P2 | UAM-FND-04 |
| [UAM-AUT-02](items/UAM-AUT-02.md) | หน้า PDPA Consent (+ Decline ถามยืนยัน) | 3 | 🟡 P2 | UAM-FND-03, UAM-FND-04 |
| [UAM-RPT-01](items/UAM-RPT-01.md) | หน้า Report | 3 | 🟡 P2 | UAM-SHL-01, UAM-FND-03 |
| [UAM-ERR-01](items/UAM-ERR-01.md) | หน้า 404 (`/notfound`, `**`) | 1 | 🟡 P2 | UAM-FND-04 |

## 🌊 Wave 5

| Code | งาน | Pts | Priority | ต้องเสร็จก่อน |
|---|---|---|---|---|
| [UAM-USR-01](items/UAM-USR-01.md) | User & Permission: ตาราง Roles/Users (แท็บ Roles ก่อน Users, fragment `#roles`/`#users`) | 5 | 🔴 P0 | UAM-SHL-01, UAM-FND-05 |
| [UAM-SYS-01](items/UAM-SYS-01.md) | System Setting: ตาราง 3 แท็บ (System / Menu / System to System) + ตัวกรอง | 5 | 🔴 P0 | UAM-SHL-01, UAM-FND-05 |
| [UAM-ERR-05](items/UAM-ERR-05.md) | สถานะ loading / empty / error ของตารางและรายการ ("No Data Available") | 3 | 🟡 P2 | UAM-FND-04, UAM-FND-05 |
| [UAM-HOM-01](items/UAM-HOM-01.md) | Home: การ์ดระบบ (`u-sys-grid`/`u-sys-card`) | 3 | 🟡 P2 | UAM-SHL-01, UAM-FND-06 |
| [UAM-SHL-03](items/UAM-SHL-03.md) | กติกาของ route `/setting` (เด้งไปหน้าลูกแรกที่มีสิทธิ์) | 2 | 🟡 P2 | UAM-SHL-02 |
| [UAM-RPT-02](items/UAM-RPT-02.md) | Report: แจ้งผู้ใช้เมื่อดาวน์โหลดไม่สำเร็จ (toast) | 1 | 🟢 P3 | UAM-RPT-01, UAM-FND-04 |

## 🌊 Wave 6

| Code | งาน | Pts | Priority | ต้องเสร็จก่อน |
|---|---|---|---|---|
| [UAM-SYS-02](items/UAM-SYS-02.md) | Drawer ของ System (ดู/เพิ่ม/แก้ไข/setup) + รูปแบบ URL สำหรับ deep link | 5 | 🔴 P0 | UAM-SYS-01, UAM-ERR-03, UAM-QA-01 |
| [UAM-ROL-01](items/UAM-ROL-01.md) | Role editor: p-steps 3 ขั้น + ขั้น Role info | 3 | 🔴 P0 | UAM-USR-01, UAM-FND-06, UAM-QA-01 |
| [UAM-USR-04](items/UAM-USR-04.md) | Edit user: 3 แท็บ (Profile & access / Systems & roles / Permission preview) | 8 | 🟠 P1 | UAM-USR-01, UAM-FND-03, UAM-FND-06, UAM-QA-01 |
| [UAM-USR-02](items/UAM-USR-02.md) | Role details (View) | 3 | 🟡 P2 | UAM-USR-01, UAM-FND-06 |
| [UAM-USR-03](items/UAM-USR-03.md) | User details (View) | 3 | 🟡 P2 | UAM-USR-01, UAM-FND-06 |
| [UAM-HOM-02](items/UAM-HOM-02.md) | Home: สถานะ loading / empty ("Data not found") / error | 2 | 🟢 P3 | UAM-HOM-01, UAM-FND-04 |

## 🌊 Wave 7

| Code | งาน | Pts | Priority | ต้องเสร็จก่อน |
|---|---|---|---|---|
| [UAM-ROL-02](items/UAM-ROL-02.md) | Role editor: ขั้น Menus & groups (โครงเมนูเดียว ลากวาง) | 8 | 🟠 P1 | UAM-ROL-01 |
| [UAM-SYS-03](items/UAM-SYS-03.md) | Drawer ของ Menu (ดู/เพิ่ม/แก้ไข) | 3 | 🟡 P2 | UAM-SYS-02 |
| [UAM-SYS-04](items/UAM-SYS-04.md) | Drawer ของ System to System (ดู/เพิ่ม/แก้ไข) | 3 | 🟡 P2 | UAM-SYS-02 |
| [UAM-USR-05](items/UAM-USR-05.md) | Edit user: การตรวจสอบและ error (AD ไม่ครบ, ระบบซ้ำ, ข้อมูลไม่ครบ, 422) | 3 | 🟡 P2 | UAM-USR-04, UAM-ERR-03 |
| [UAM-USR-06](items/UAM-USR-06.md) | ปุ่มกลับจาก User/Role details และ Edit กลับแท็บเดิมผ่าน fragment | 1 | 🟢 P3 | UAM-USR-02, UAM-USR-03, UAM-USR-04 |
| [UAM-RSP-02](items/UAM-RSP-02.md) | Phone ของหน้าสถานะ (loading/empty/error/403/404/dialog) | 2 | 🟢 P3 | UAM-DSN-01, UAM-ERR-05, UAM-HOM-02, UAM-ERR-02 |

## 🌊 Wave 8

| Code | งาน | Pts | Priority | ต้องเสร็จก่อน |
|---|---|---|---|---|
| [UAM-ROL-03](items/UAM-ROL-03.md) | Role editor: ขั้น Permissions (ตารางเดียว + เลือกทั้งหมด) | 5 | 🔴 P0 | UAM-ROL-02 |
| [UAM-SYS-05](items/UAM-SYS-05.md) | ถอด route action ของ System Setting ทั้ง 10 ตัว + redirect ลิงก์เก่า | 2 | 🟢 P3 | UAM-SYS-02, UAM-SYS-03, UAM-SYS-04, UAM-ERR-04 |

## 🌊 Wave 9

| Code | งาน | Pts | Priority | ต้องเสร็จก่อน |
|---|---|---|---|---|
| [UAM-ROL-04](items/UAM-ROL-04.md) | Role editor: บันทึก/แมป payload + ตรวจ regression | 3 | 🟠 P1 | UAM-ROL-03, UAM-QA-01 |

## 🌊 Wave 10

| Code | งาน | Pts | Priority | ต้องเสร็จก่อน |
|---|---|---|---|---|
| [UAM-RSP-01](items/UAM-RSP-01.md) | Responsive/phone (390px) ของทุกหน้าหลัก | 5 | 🟡 P2 | UAM-AUT-01, UAM-AUT-02, UAM-HOM-01, UAM-SYS-05, UAM-USR-06, UAM-ROL-04, UAM-RPT-01 |
| [UAM-ERR-06](items/UAM-ERR-06.md) | ข้อผิดพลาดชื่อซ้ำ 40301 (ALREADY_EXISTED) ใน System drawer และ Role editor | 2 | 🟢 P3 | UAM-DSN-01, UAM-SYS-02, UAM-ROL-04 |

## 🌊 Wave 11

| Code | งาน | Pts | Priority | ต้องเสร็จก่อน |
|---|---|---|---|---|
| [UAM-A11Y-01](items/UAM-A11Y-01.md) | Accessibility audit บน Angular จริง (WCAG 2.1 AA) | 3 | 🟡 P2 | UAM-RSP-01 |
| [UAM-QA-02](items/UAM-QA-02.md) | เก็บกวาด inline style และตรวจระยะห่างกับหน้าจอจริง | 2 | 🟢 P3 | UAM-RSP-01 |

## 🔥 Critical path (ยาวที่สุดตามแต้ม effort รวม 48 pts)
UAM-FND-01 → UAM-FND-02 → UAM-FND-03 → UAM-FND-05 → UAM-USR-01 → UAM-ROL-01 → UAM-ROL-02 → UAM-ROL-03 → UAM-ROL-04 → UAM-RSP-01 → UAM-A11Y-01

## 👷 แนะนำการแบ่งสายงาน (ถ้ามีหลายคน)
- 🧱 **สาย A – Foundation**: FND-01 → FND-02 → FND-03/04 → FND-05/06 (ทุกสายอื่นรอสายนี้)
- 🧭 **สาย B – Platform/Quality** (เริ่มคู่ขนานกับ FND-02): QA-01, SHL-01 → SHL-02 → SHL-03, ERR-01..04
- ⚙️ **สาย C – Settings**: SYS-01 → SYS-02 → SYS-03 ∥ SYS-04 → SYS-05
- 👥 **สาย D – Users/Roles**: USR-01 → (USR-02 ∥ USR-03 ∥ USR-04 → USR-05) → USR-06; ROL-01 → ROL-02 → ROL-03 → ROL-04
- 📄 **สาย E – หน้าอิสระ**: AUT-01, AUT-02, HOM-01/02, RPT-01/02 (ทำได้ทันทีหลัง FND/SHL ที่เกี่ยวข้อง)
- 🎨 **สาย F – ออกแบบ**: DSN-01 ทำคู่ขนานตั้งแต่ต้น (ไม่ขึ้นกับโค้ด) เพื่อไม่ให้ ERR-06 / RSP-02 ติด
- 🏁 **ปิดท้าย**: RSP-01 → A11Y-01 ∥ QA-02

## 🚦 สิ่งที่ต้องทำก่อนเปิด issue
ยืนยัน SHL-03 และ DSN-01 กับผู้ใช้ (ไม่บล็อก wave 1–2)
