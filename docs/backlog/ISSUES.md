# 🔢 แผนที่ backlog code ↔ GitHub issue

เปิด issue ครบ 44 รายการ (#2–#43, #45, #46) — รายละเอียดเต็มอยู่ในไฟล์ `items/<CODE>.md` ส่วน issue เก็บสถานะ/label (เลข #44 คือ PR)

| Code | Issue | Wave | Title |
|---|---|---|---|
| UAM-FND-01 | #2 | 1 | สร้างแอปใหม่บน stack ล่าสุด (Angular 22) + baseline CI/test — ทำใหม่ |
| UAM-DSN-01 | #3 | 0 | ปิดช่องว่างของดีไซน์: phone ของหน้าสถานะ, error ของ drawer, ชื่อซ้ำ 40301 |
| UAM-FND-02 | #4 | 2 | Design tokens & ธีม: PrimeNG 22 custom preset + SCSS tokens (ตาม uam.css) |
| UAM-QA-01 | #5 | 2 | ชุดทดสอบ contract: golden fixtures + helper (payload/response ต้องไม่เปลี่ยน) |
| UAM-FND-03 | #6 | 3 | คอมโพเนนต์ร่วมชุดพื้นฐาน (status, role, num, chips, count, tile, row, switch-row, back, section-title) |
| UAM-FND-04 | #7 | 3 | คอมโพเนนต์ร่วมชุดสถานะ/ข้อความ (dialog, state, skeleton, toast, errpage) |
| UAM-SHL-01 | #8 | 3 | Shell: topbar 70px + sidebar 250px + breakpoint 768px |
| UAM-AUT-01 | #9 | 4 | หน้า Login |
| UAM-AUT-02 | #10 | 4 | หน้า PDPA Consent (+ Decline ถามยืนยัน) |
| UAM-ERR-01 | #11 | 4 | หน้า 404 (`/notfound`, `**`) |
| UAM-ERR-02 | #12 | 4 | หน้า 403 แยก + roleGuard ส่งไป 403 |
| UAM-ERR-03 | #13 | 4 | ข้อความ/dialog จาก HTTP interceptor (session หมดอายุ, network, server 50000–50002) |
| UAM-ERR-04 | #14 | 4 | Dialog ยืนยันลบ และลบไม่ได้ (message + statusDescription จาก server) |
| UAM-FND-05 | #15 | 4 | คอมโพเนนต์ร่วมของตาราง: toolbar + Filters panel + footer/paginator |
| UAM-FND-06 | #16 | 4 | คอมโพเนนต์ร่วมของหน้า detail (facts, stats, approvers, accordion, group-head, perm-row, sys-grid/card, meta-ico) |
| UAM-RPT-01 | #17 | 4 | หน้า Report |
| UAM-SHL-02 | #18 | 4 | กรองเมนูซ้ายตาม role (ADMIN/DEVELOPER/AUDIT/USER/Super admin) |
| UAM-ERR-05 | #19 | 5 | สถานะ loading / empty / error ของตารางและรายการ ("No Data Available") |
| UAM-HOM-01 | #20 | 5 | Home: การ์ดระบบ (`u-sys-grid`/`u-sys-card`) |
| UAM-RPT-02 | #21 | 5 | Report: แจ้งผู้ใช้เมื่อดาวน์โหลดไม่สำเร็จ (toast) |
| UAM-SHL-03 | #22 | 5 | กติกาของ route `/setting` (เด้งไปหน้าลูกแรกที่มีสิทธิ์) |
| UAM-SYS-01 | #23 | 5 | System Setting: ตาราง 3 แท็บ (System / Menu / System to System) + ตัวกรอง |
| UAM-USR-01 | #24 | 5 | User & Permission: ตาราง Roles/Users (แท็บ Roles ก่อน Users, fragment `#roles`/`#users`) |
| UAM-HOM-02 | #25 | 6 | Home: สถานะ loading / empty ("Data not found") / error |
| UAM-ROL-01 | #26 | 6 | Role editor: p-steps 3 ขั้น + ขั้น Role info |
| UAM-SYS-02 | #27 | 6 | Drawer ของ System (ดู/เพิ่ม/แก้ไข/setup) + รูปแบบ URL สำหรับ deep link |
| UAM-USR-02 | #28 | 6 | Role details (View) |
| UAM-USR-03 | #29 | 6 | User details (View) |
| UAM-USR-04 | #30 | 6 | Edit user: 3 แท็บ (Profile & access / Systems & roles / Permission preview) |
| UAM-ROL-02 | #31 | 7 | Role editor: ขั้น Menus & groups (โครงเมนูเดียว ลากวาง) |
| UAM-RSP-02 | #32 | 7 | Phone ของหน้าสถานะ (loading/empty/error/403/404/dialog) |
| UAM-SYS-03 | #33 | 7 | Drawer ของ Menu (ดู/เพิ่ม/แก้ไข) |
| UAM-SYS-04 | #34 | 7 | Drawer ของ System to System (ดู/เพิ่ม/แก้ไข) |
| UAM-USR-05 | #35 | 7 | Edit user: การตรวจสอบและ error (AD ไม่ครบ, ระบบซ้ำ, ข้อมูลไม่ครบ, 422) |
| UAM-USR-06 | #36 | 7 | ปุ่มกลับจาก User/Role details และ Edit กลับแท็บเดิมผ่าน fragment |
| UAM-ROL-03 | #37 | 8 | Role editor: ขั้น Permissions (ตารางเดียว + เลือกทั้งหมด) |
| UAM-SYS-05 | #38 | 8 | ถอด route action ของ System Setting ทั้ง 10 ตัว + redirect ลิงก์เก่า |
| UAM-ROL-04 | #39 | 9 | Role editor: บันทึก/แมป payload + ตรวจ regression |
| UAM-ERR-06 | #40 | 10 | ข้อผิดพลาดชื่อซ้ำ 40301 (ALREADY_EXISTED) ใน System drawer และ Role editor |
| UAM-RSP-01 | #41 | 10 | Responsive/phone (390px) ของทุกหน้าหลัก |
| UAM-A11Y-01 | #42 | 11 | Accessibility audit บน Angular จริง (WCAG 2.1 AA) |
| UAM-QA-02 | #43 | 11 | เก็บกวาด inline style และตรวจระยะห่างกับหน้าจอจริง |
| UAM-ARC-01 | #45 | 0 | ADR-0001: ยืนยัน stack ล่าสุดและสถาปัตยกรรม (Angular 22, PrimeNG 22, Vitest, signals) |
| UAM-API-01 | #46 | 2 | โมเดลและ service ของ API (interfaces ใช้ฟิลด์เดิม) — รอผู้ใช้ตัดสินแหล่งความจริง |
