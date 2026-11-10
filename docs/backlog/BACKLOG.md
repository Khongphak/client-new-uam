# 📋 UAM Redesign — Backlog

สร้างจาก `docs/design-spec/README.md` + `project/canvas.json` (44 รายการ) แต่ละรายการมีไฟล์รายละเอียดใน `items/<CODE>.md` ซึ่งพร้อมใช้เป็นเนื้อหา GitHub issue (มี front matter `title`/`labels`)

## 📐 ข้อตกลง
- **Code**: `UAM-<EPIC>-<nn>` — EPIC: FND (foundation), SHL (shell), ERR (error/state), AUT (login/consent), HOM (home), SYS (system setting), USR (users/roles list/view/edit user), ROL (role editor), RPT (report), RSP (responsive), A11Y, QA, DSN (design)
- **ชื่อ branch**: แตกใหม่ทุก backlog จาก `develop` เป็น `<type>/<CODE>-<slug>` เช่น `feature/UAM-SYS-02-system-drawer-deeplink` (ชื่อที่แนะนำอยู่ในแต่ละไฟล์) แล้ว PR กลับ `develop`; ใส่ code ใน title ของ commit/PR และ `Closes #<issue>`
- **Priority score** = (Value + Unblocks) × 10 − Effort; Value/Unblocks 1–5, Effort เป็น story points (1,2,3,5,8). P0 ≥ 85, P1 70–84, P2 55–69, P3 < 55
- **Wave** = ลำดับที่เร็วที่สุดที่เริ่มได้ตาม dependency (ดู `EXECUTION-PLAN.md`)
- เกณฑ์ตรวจรับร่วมทุกรายการ: ตรงกับ artboard, ใช้เฉพาะฟิลด์เดิม, payload เดิมไม่เปลี่ยน

## ⚠️ ข้อควรรู้ / ความเสี่ยง
1. repo นี้มีแค่ `docs/` → ต้องทำ **UAM-FND-01** ก่อนทุกอย่าง
2. **Clean-room:** ห้ามอ่าน/คัดลอก/พอร์ตโค้ดเก่า `client-uam-develop` — ช่อง "Actual result" และ "ที่มาของ requirement" มาจากสเปก/ดีไซน์ ไม่ใช่จากโค้ด; พฤติกรรมที่ตรงกับ backend ต้องมาจากสัญญา API (ดู UAM-API-01)
3. ต้องให้ผู้ใช้ตัดสินใจ: **UAM-SHL-03** (กติกา `/setting`) และดีไซน์ที่ขาดใน **UAM-DSN-01**

## 🗂️ ตารางรวม
| Code | Title | Type | Priority | Score | Pts | Wave | Depends on |
|---|---|---|---|---|---|---|---|
| [UAM-ARC-01](items/UAM-ARC-01.md) | ADR-0001: ยืนยัน stack ล่าสุดและสถาปัตยกรรม (Angular 22, PrimeNG 22, Vitest, signals) | 🎨 design | 🔴 **P0** | 98 | 2 | W0 | — |
| [UAM-DSN-01](items/UAM-DSN-01.md) | ปิดช่องว่างของดีไซน์: phone ของหน้าสถานะ, error ของ drawer, ชื่อซ้ำ 40301 | 🎨 design | 🟡 **P2** | 67 | 3 | W0 | — |
| [UAM-FND-01](items/UAM-FND-01.md) | สร้างแอปใหม่บน stack ล่าสุด (Angular 22) + baseline CI/test — ทำใหม่ | 🧹 chore | 🔴 **P0** | 97 | 3 | W1 | UAM-ARC-01 |
| [UAM-FND-02](items/UAM-FND-02.md) | Design tokens & ธีม: PrimeNG 22 custom preset + SCSS tokens (ตาม uam.css) | ✨ feature | 🔴 **P0** | 95 | 5 | W2 | UAM-FND-01 |
| [UAM-QA-01](items/UAM-QA-01.md) | ชุดทดสอบ contract: golden fixtures + helper (payload/response ต้องไม่เปลี่ยน) | 🧪 test | 🔴 **P0** | 87 | 3 | W2 | UAM-FND-01 |
| [UAM-API-01](items/UAM-API-01.md) | โมเดลและ service ของ API (interfaces ใช้ฟิลด์เดิม) — รอผู้ใช้ตัดสินแหล่งความจริง | ✨ feature | 🔴 **P0** | 85 | 5 | W2 | UAM-FND-01 |
| [UAM-FND-03](items/UAM-FND-03.md) | คอมโพเนนต์ร่วมชุดพื้นฐาน (status, role, num, chips, count, tile, row, switch-row, back, section-title) | ✨ feature | 🔴 **P0** | 95 | 5 | W3 | UAM-FND-02 |
| [UAM-FND-04](items/UAM-FND-04.md) | คอมโพเนนต์ร่วมชุดสถานะ/ข้อความ (dialog, state, skeleton, toast, errpage) | ✨ feature | 🔴 **P0** | 95 | 5 | W3 | UAM-FND-02 |
| [UAM-SHL-01](items/UAM-SHL-01.md) | Shell: topbar 70px + sidebar 250px + breakpoint 768px | ✨ feature | 🔴 **P0** | 95 | 5 | W3 | UAM-FND-02 |
| [UAM-FND-05](items/UAM-FND-05.md) | คอมโพเนนต์ร่วมของตาราง: toolbar + Filters panel + footer/paginator | ✨ feature | 🔴 **P0** | 95 | 5 | W4 | UAM-FND-03 |
| [UAM-ERR-02](items/UAM-ERR-02.md) | หน้า 403 แยก + roleGuard ส่งไป 403 | ✨ feature | 🔴 **P0** | 88 | 2 | W4 | UAM-FND-04, UAM-SHL-01 |
| [UAM-SHL-02](items/UAM-SHL-02.md) | กรองเมนูซ้ายตาม role (ADMIN/DEVELOPER/AUDIT/USER/Super admin) | ✨ feature | 🔴 **P0** | 87 | 3 | W4 | UAM-SHL-01 |
| [UAM-AUT-01](items/UAM-AUT-01.md) | หน้า Login | ✨ feature | 🟠 **P1** | 77 | 3 | W4 | UAM-FND-02, UAM-FND-03 |
| [UAM-ERR-03](items/UAM-ERR-03.md) | ข้อความ/dialog จาก HTTP interceptor (session หมดอายุ, network, server 50000–50002) | ✨ feature | 🟠 **P1** | 77 | 3 | W4 | UAM-FND-04 |
| [UAM-FND-06](items/UAM-FND-06.md) | คอมโพเนนต์ร่วมของหน้า detail (facts, stats, approvers, accordion, group-head, perm-row, sys-grid/card, meta-ico) | ✨ feature | 🟠 **P1** | 75 | 5 | W4 | UAM-FND-03 |
| [UAM-ERR-04](items/UAM-ERR-04.md) | Dialog ยืนยันลบ และลบไม่ได้ (message + statusDescription จาก server) | ✨ feature | 🟡 **P2** | 68 | 2 | W4 | UAM-FND-04 |
| [UAM-AUT-02](items/UAM-AUT-02.md) | หน้า PDPA Consent (+ Decline ถามยืนยัน) | ✨ feature | 🟡 **P2** | 67 | 3 | W4 | UAM-FND-03, UAM-FND-04 |
| [UAM-RPT-01](items/UAM-RPT-01.md) | หน้า Report | ✨ feature | 🟡 **P2** | 67 | 3 | W4 | UAM-SHL-01, UAM-FND-03 |
| [UAM-ERR-01](items/UAM-ERR-01.md) | หน้า 404 (`/notfound`, `**`) | ✨ feature | 🟡 **P2** | 59 | 1 | W4 | UAM-FND-04 |
| [UAM-USR-01](items/UAM-USR-01.md) | User & Permission: ตาราง Roles/Users (แท็บ Roles ก่อน Users, fragment `#roles`/`#users`) | ✨ feature | 🔴 **P0** | 95 | 5 | W5 | UAM-SHL-01, UAM-FND-05 |
| [UAM-SYS-01](items/UAM-SYS-01.md) | System Setting: ตาราง 3 แท็บ (System / Menu / System to System) + ตัวกรอง | ✨ feature | 🔴 **P0** | 85 | 5 | W5 | UAM-SHL-01, UAM-FND-05 |
| [UAM-ERR-05](items/UAM-ERR-05.md) | สถานะ loading / empty / error ของตารางและรายการ ("No Data Available") | ✨ feature | 🟡 **P2** | 67 | 3 | W5 | UAM-FND-04, UAM-FND-05 |
| [UAM-HOM-01](items/UAM-HOM-01.md) | Home: การ์ดระบบ (`u-sys-grid`/`u-sys-card`) | ✨ feature | 🟡 **P2** | 67 | 3 | W5 | UAM-SHL-01, UAM-FND-06 |
| [UAM-SHL-03](items/UAM-SHL-03.md) | กติกาของ route `/setting` (เด้งไปหน้าลูกแรกที่มีสิทธิ์) | ✨ feature | 🟡 **P2** | 58 | 2 | W5 | UAM-SHL-02 |
| [UAM-RPT-02](items/UAM-RPT-02.md) | Report: แจ้งผู้ใช้เมื่อดาวน์โหลดไม่สำเร็จ (toast) | ✨ feature | 🟢 **P3** | 49 | 1 | W5 | UAM-RPT-01, UAM-FND-04 |
| [UAM-SYS-02](items/UAM-SYS-02.md) | Drawer ของ System (ดู/เพิ่ม/แก้ไข/setup) + รูปแบบ URL สำหรับ deep link | ✨ feature | 🔴 **P0** | 95 | 5 | W6 | UAM-SYS-01, UAM-ERR-03, UAM-QA-01 |
| [UAM-ROL-01](items/UAM-ROL-01.md) | Role editor: p-steps 3 ขั้น + ขั้น Role info | ✨ feature | 🔴 **P0** | 87 | 3 | W6 | UAM-USR-01, UAM-FND-06, UAM-QA-01 |
| [UAM-USR-04](items/UAM-USR-04.md) | Edit user: 3 แท็บ (Profile & access / Systems & roles / Permission preview) | ✨ feature | 🟠 **P1** | 82 | 8 | W6 | UAM-USR-01, UAM-FND-03, UAM-FND-06, UAM-QA-01 |
| [UAM-USR-02](items/UAM-USR-02.md) | Role details (View) | ✨ feature | 🟡 **P2** | 57 | 3 | W6 | UAM-USR-01, UAM-FND-06 |
| [UAM-USR-03](items/UAM-USR-03.md) | User details (View) | ✨ feature | 🟡 **P2** | 57 | 3 | W6 | UAM-USR-01, UAM-FND-06 |
| [UAM-HOM-02](items/UAM-HOM-02.md) | Home: สถานะ loading / empty ("Data not found") / error | ✨ feature | 🟢 **P3** | 48 | 2 | W6 | UAM-HOM-01, UAM-FND-04 |
| [UAM-ROL-02](items/UAM-ROL-02.md) | Role editor: ขั้น Menus & groups (โครงเมนูเดียว ลากวาง) | ✨ feature | 🟠 **P1** | 82 | 8 | W7 | UAM-ROL-01 |
| [UAM-SYS-03](items/UAM-SYS-03.md) | Drawer ของ Menu (ดู/เพิ่ม/แก้ไข) | ✨ feature | 🟡 **P2** | 67 | 3 | W7 | UAM-SYS-02 |
| [UAM-SYS-04](items/UAM-SYS-04.md) | Drawer ของ System to System (ดู/เพิ่ม/แก้ไข) | ✨ feature | 🟡 **P2** | 67 | 3 | W7 | UAM-SYS-02 |
| [UAM-USR-05](items/UAM-USR-05.md) | Edit user: การตรวจสอบและ error (AD ไม่ครบ, ระบบซ้ำ, ข้อมูลไม่ครบ, 422) | ✨ feature | 🟡 **P2** | 67 | 3 | W7 | UAM-USR-04, UAM-ERR-03 |
| [UAM-USR-06](items/UAM-USR-06.md) | ปุ่มกลับจาก User/Role details และ Edit กลับแท็บเดิมผ่าน fragment | ✨ feature | 🟢 **P3** | 49 | 1 | W7 | UAM-USR-02, UAM-USR-03, UAM-USR-04 |
| [UAM-RSP-02](items/UAM-RSP-02.md) | Phone ของหน้าสถานะ (loading/empty/error/403/404/dialog) | ✨ feature | 🟢 **P3** | 48 | 2 | W7 | UAM-DSN-01, UAM-ERR-05, UAM-HOM-02, UAM-ERR-02 |
| [UAM-ROL-03](items/UAM-ROL-03.md) | Role editor: ขั้น Permissions (ตารางเดียว + เลือกทั้งหมด) | ✨ feature | 🔴 **P0** | 85 | 5 | W8 | UAM-ROL-02 |
| [UAM-SYS-05](items/UAM-SYS-05.md) | ถอด route action ของ System Setting ทั้ง 10 ตัว + redirect ลิงก์เก่า | 🧹 chore | 🟢 **P3** | 48 | 2 | W8 | UAM-SYS-02, UAM-SYS-03, UAM-SYS-04, UAM-ERR-04 |
| [UAM-ROL-04](items/UAM-ROL-04.md) | Role editor: บันทึก/แมป payload + ตรวจ regression | 🧪 test | 🟠 **P1** | 77 | 3 | W9 | UAM-ROL-03, UAM-QA-01 |
| [UAM-RSP-01](items/UAM-RSP-01.md) | Responsive/phone (390px) ของทุกหน้าหลัก | ✨ feature | 🟡 **P2** | 65 | 5 | W10 | UAM-AUT-01, UAM-AUT-02, UAM-HOM-01, UAM-SYS-05, UAM-USR-06, UAM-ROL-04, UAM-RPT-01 |
| [UAM-ERR-06](items/UAM-ERR-06.md) | ข้อผิดพลาดชื่อซ้ำ 40301 (ALREADY_EXISTED) ใน System drawer และ Role editor | ✨ feature | 🟢 **P3** | 48 | 2 | W10 | UAM-DSN-01, UAM-SYS-02, UAM-ROL-04 |
| [UAM-A11Y-01](items/UAM-A11Y-01.md) | Accessibility audit บน Angular จริง (WCAG 2.1 AA) | 🧪 test | 🟡 **P2** | 57 | 3 | W11 | UAM-RSP-01 |
| [UAM-QA-02](items/UAM-QA-02.md) | เก็บกวาด inline style และตรวจระยะห่างกับหน้าจอจริง | 🧹 chore | 🟢 **P3** | 28 | 2 | W11 | UAM-RSP-01 |
