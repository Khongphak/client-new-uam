# UAM Redesign: Design Spec

> ⚠️ **หมายเหตุ (2026-11-10):** ดีไซน์วาดบน PrimeNG 17 (lara-light-blue) แต่แอปใหม่สร้างบน PrimeNG 22 ที่ใช้ระบบ preset — "ตรงกับ artboard" ให้ตีความว่าตรงด้วยสายตา/โทเคน ไม่ใช่คัดลอก CSS เดิม ดู [ADR-0001](../architecture/ADR-0001-latest-stack.md)

สเปกดีไซน์ฉบับสุดท้ายของ UAM (User Access Management) ใช้เป็นข้อกำหนดของแต่ละ backlog item ร่วมกับ source code ปัจจุบัน

- สถานะ: ผู้ใช้ยืนยันว่าดีไซน์เสร็จแล้ว (2026-11-10)
- ต้นฉบับ: Design canvas (private) https://claude.ai/artifact/MetSkdiAtHMczBcj5szk26 (ซิงก์ล่าสุดจากเวอร์ชัน `1794328238-7487`)
- Source code เดิมที่ดีไซน์นี้อ้างอิง: repo `client-uam-develop` (Angular 17.2, PrimeNG 17.18, PrimeFlex 3.3, PrimeIcons 7, NgRx) path ด้านล่างเป็น path ใต้ `src/app/` ของ repo นั้น

## ไฟล์ในโฟลเดอร์นี้

| ไฟล์ | คืออะไร |
|---|---|
| `project/uam.css` | สไตล์ชีตเดียวของทั้งดีไซน์: ธีม PrimeNG 17 lara-light-blue + override ของแอป + คอมโพเนนต์ `u-*` (ดูบล็อกตั้งแต่ `/* ===== v32` ถึง `/* ===== v40` ท้ายไฟล์) |
| `project/<Name>.dc.html` | หนึ่งไฟล์ต่อหนึ่ง artboard (HTML ที่จำลองข้อมูลไว้ ไม่ใช่โค้ดที่ต้องคัดลอกไปใช้) |
| `project/*Phone.dc.html` | แค่ import หน้า desktop มาแสดงที่ความกว้าง 390px (หน้าเดียวกันเป็น responsive) |
| `project/canvas.json` | รายการ artboard, ตำแหน่งบน canvas และโน้ต (ภาษาไทย) ที่อธิบายกติกาและที่มาจาก source |

ข้อจำกัด: ไฟล์ `.dc.html` อ้าง `./support.js` ซึ่งมาจาก runtime ของ Design canvas ดังนั้นเปิดไฟล์ตรงๆ ในเบราว์เซอร์จะไม่เรนเดอร์ ให้ดูผ่านลิงก์ canvas ด้านบน (ต้องล็อกอินบัญชีที่เป็นเจ้าของ) ส่วนไฟล์ในโฟลเดอร์นี้ใช้อ่านโครงสร้าง คลาส ข้อความ และตรรกะของแต่ละหน้า
รูปโลโก้ ไอคอนเมนูซ้าย และฟอนต์ Sukhumvit Set ถูกอ้างด้วย URL แบบ `/_blob/<id>` ของ canvas จึงไม่ได้อยู่ในโฟลเดอร์นี้ ตอน implement ให้ใช้ไฟล์จริงจาก assets ของแอปเดิม (`assets/images`, `assets/svg`, ฟอนต์ใน `src/styles.scss`)
หน้าสถานะ (loading/empty/error) ใช้ `<dc-import name="Home" state="loading">` คือหน้าเดียวกันที่รับพร็อพ `state`

## ข้อจำกัดแข็ง: ห้ามแก้หลังบ้าน

Backend ไม่เปลี่ยน ดังนั้น:
- ห้ามต้องการฟิลด์ใหม่ใน Model Response และห้ามเปลี่ยน Payload ที่ส่งไปหลังบ้าน
- ใช้ได้เฉพาะฟิลด์ใน `shared/interfaces/**` ปัจจุบัน
- ทำฝั่งหน้าบ้านได้: ค้นหา/กรองจากแถวที่โหลดแล้ว, ตัวนับในแท็บ, ช่วงวันที่ลัด, สถานะ loading/error/empty, หน้า 403, toast

ฟิลด์จริงที่ตรวจแล้ว:
- Roles list: Role Name, System Name, Description, Status, Updated Date, Updated By (ไม่มีจำนวนเมนู ไม่มีจำนวนผู้ใช้)
- Users list: Username, Name, Surname, Email, Ext. Number, Department, Status, Updated Date/By และโมเดลมี `uamRole` (ไม่มีจำนวนระบบ)
- Home card (`IUserSystemItem`): ชื่อ, รูป, คำอธิบาย, ชนิด, เจ้าของ, status (ไม่มี role ไม่มี maintenance)
- Approvers มาจาก AD เป็นชื่ออย่างเดียว (`managers[].name`)
- Report: เลือกรายงาน, System Name, Department หรือช่วงวันที่, Reset, Export (ดาวน์โหลด Excel) ไม่มีข้อมูลพรีวิว
- Menu list มี `functional`, System to System มี `accessTokenTime`

สิ่งที่เคยใส่แล้วถอดออกเพราะไม่มีในโมเดล: จำนวนเมนู/ผู้ใช้ใน Roles, จำนวนระบบใน Users, "Last login", role และสถานะ Maintenance ใน Home, ตารางพรีวิว Report, ข้อความล็อกบัญชีใน Login

## จับคู่ artboard กับ source (ดัชนีของ backlog)

| # | Artboard | Source ใต้ `src/app/` |
|---|---|---|
| 1 | `Main` Login | `auth/auth-login` |
| 2 | `Consent` PDPA | `consent/consent-form`, `shared/service/auth-guard/consent.guard.ts` |
| 3 | `Home` | `main/home/home` + `component/system-card` |
| 4 | `Systems` System Setting (แท็บ System / Menu / System to System + drawer) | `main/setting-page/setting-sub-page/setting-system`; หน้า action `setting-action-page/system-action`, `menu-screen-action`, `system-to-system-action-page` (ตัดสินใจแล้ว: ใช้ drawer แทน) |
| 5 | `Users` (แท็บ Roles, Users) | `setting-sub-page/setting-users`; คอลัมน์ใน `shared/constants/table/setting-menu/users-column.ts/users-column.ts` และ `setting-system-column.ts` |
| 6 | `UserEditor` (3 แท็บ) | `setting-action-page/users-action` (+ `component/system-role-form`), preview = `shared/component/table-preview` |
| 7 | `RoleEditor` (3 ขั้น) | `setting-action-page/user-roles-action`, `shared/component/tree-group-menu`, `role-permission` |
| 8 | `Report` | `main/report-page/report` |
| 9, 10 | `UserView`, `RoleView` | หน้า action เดียวกันในโหมด view |
| 11-28 | `Err404`, `Err403`, `Dlg*`, `Home*`/`Users*`/`Edit*`/`ReportFail` | `shared/service/webapi.interceptor.ts`, `interceptor/http-error-handler.service.ts`, `auth-guard/role.guard.ts`, `main/notfound`, `shared/constants/modal.data.ts`, `http/http.data.ts` |

## สิทธิ์ตาม route (ตรวจจากโค้ดแล้ว 2026-11-10)

Role คือ `CONFIG_UAM_ROLE` = ADMIN, DEVELOPER, AUDIT, USER ส่วน Super admin คือ `systemAdmin` ของโปรไฟล์ล็อกอิน (ฟิลด์โมเดล `isSuperAdmin`, แสดงเป็น "System Admin")
`roleGuard` = `allowedRoles.includes(uamRole) || systemAdmin` ดังนั้น **super admin ผ่านทุก roleGuard** แม้เป็น route ของ ADMIN อย่างเดียว ผู้ไม่มีสิทธิ์ถูกส่งไป `/notfound` (ตอนนี้; ดู "การตัดสินใจ" ข้อ 3)

| Route | ADMIN | DEVELOPER | AUDIT | USER | Super admin |
|---|---|---|---|---|---|
| `/login`, `/notfound`, `**` | สาธารณะ | สาธารณะ | สาธารณะ | สาธารณะ | สาธารณะ |
| `/pdpaconsent` | ล็อกอิน | ล็อกอิน | ล็อกอิน | ล็อกอิน | ล็อกอิน |
| `/home` (ต้องล็อกอิน + ยอมรับ consent) | ได้ | ได้ | ได้ | ได้ | ได้ |
| `/setting` และ `/setting/system-setting` (+ `action-system*`, `action-menu-screen*`, `action-system-to-system*`) | ได้ | ได้ | ไม่ได้ | ไม่ได้ | ได้ |
| `/setting/users-setting` (+ `action-role*`, `action-users*`) | ได้ | **ไม่ได้** | ไม่ได้ | ไม่ได้ | ได้ |
| `/report` | ได้ | ไม่ได้ | ได้ | ไม่ได้ | ได้ |

เมนูซ้าย (`layout/components/app.menu.ts`): ADMIN หรือ super admin = Home, Setting, Report; DEVELOPER = Home, Setting; AUDIT = Home, Report; USER = Home อย่างเดียว
การ์ดหน้า Setting เดิม (`setting-page.component.ts`): DEVELOPER เห็น System Setting อย่างเดียว; ADMIN เห็น System Setting + User & Permissions; super admin เห็นทั้งหมด (fragment: system-setup, menu, system-to-system, roles, users)
ผลต่อดีไซน์: เมนูซ้ายและเมนูย่อยของ Setting ต้องกรองตาม role (ต้นแบบแสดงมุมมอง ADMIN อย่างเดียว) และเพราะดีไซน์ตัดหน้าการ์ด Setting ออก route `/setting` ต้องมีกติกา (เด้งไปหน้าลูกแรกที่มีสิทธิ์ หรือคงหน้าเดิม) ยังไม่ได้ตัดสินใจ ให้ยืนยันตอนทำ backlog

## กติกาดีไซน์ที่ตกลงกัน

- Shell: topbar (70px) และ sidebar (250px, รายการที่เปิดอยู่เป็นไล่สีน้ำเงิน) ตามแอปเดิม; sidebar แสดงถึงความกว้าง 768px ต่ำกว่านั้นเป็น drawer
- ฟอนต์ Sukhumvit Set; สีหลัก `#00194b` / `#2854a7`; ใช้คอมโพเนนต์ PrimeNG และไอคอน PrimeIcons เท่านั้น (ไอคอนระบบ/กลุ่มมาจากตัวเลือกไอคอนในแอป)
- หัวหน้าหน้า: ชื่อ (+meta) บนพื้นเทา ปุ่มการกระทำอยู่บรรทัดเดียวกับชื่อ แท็บเป็นเส้นใต้ หน้า detail มีปุ่มกลับแบบไอคอนบนบรรทัดชื่อ
- ตาราง: การ์ดมีแถบเครื่องมือ (ค้นหาซ้าย; ปุ่ม Filters พร้อมตัวนับ และ Reset ขวา); Filters เปิดแผง dropdown มีป้ายชื่อ ใช้เหมือนกันทั้ง System Setting, Users, Roles; ท้ายตาราง "Showing 1 to X of Y entries" ซ้าย paginator ขวา; สถานะเป็นจุดสี + ข้อความ (`u-status`) ไม่ใช้ chip สี; แท็บเรียง Roles ก่อน Users ตาม source
- หน้า detail: Role information = แถบสถิติ (Menus, Groups, Top level) + รายการข้อมูลมีไอคอน; User information = รายการข้อมูลสองคอลัมน์; Approvers เป็นรายการลำดับ 1-3 แสดงชื่อ อ่านอย่างเดียว
- Dialog: โครงเดียว (ไอคอน, หัวข้อ, หนึ่งย่อหน้า, แถวรายละเอียดถ้ามี, ปุ่มชิดขวา); ข้อความมาจาก `modal.data.ts`
- Role editor: 3 ขั้น (Role info, Menus & groups, Permissions); โครงเมนูเดียว ลากวาง + ย้ายขึ้น/ลง + "Move to..."; เมนูใช้ได้ครั้งเดียวต่อ role; วางเมนูระดับบนสุดได้; กลุ่มซ้อนสูงสุด 2 ชั้น; ไอคอนกลุ่ม; ฟังก์ชันสิทธิ์มาจาก DB (กี่ตัวก็ได้) มี "เลือกทั้งหมด" ต่อกลุ่มและที่หัวคอลัมน์
- Edit user: AD lookup เติมช่องแบบอ่านอย่างเดียว; UAM role เป็นการ์ดเลือก; สวิตช์ System Admin และ Active; แถวระบบ+role; ระบบซ้ำและข้อมูลไม่ครบแสดงที่แถวพร้อมสรุปด้านบน; ปุ่ม Save ปิดเมื่อยังมีข้อผิดพลาด

## คอมโพเนนต์ใน `uam.css` (ต้องกลายเป็นชิ้นส่วนที่ใช้ซ้ำใน Angular/SCSS)

`u-status`, `u-role`, `u-num`, `u-section-title`, `u-subtitle`, `u-tile`, `u-row` (+`is-stack`, `is-cols`), `u-perm-row`, `u-chip(s)`, `u-count`, `u-group-head`, `u-switch-row`, `u-accordion`, `u-sys-grid` + `u-sys-card`, `u-approvers`, `u-stats`, `u-facts` (+`is-cols`, `is-prose`), `u-meta-ico`, `u-dialog*`, `u-state`, `u-skel`, `u-toast`, `u-errpage`, `u-filters` + `bar__end`, `u-card-foot`, `u-back`; ตัวแปร `--uam-*` และสเกลระยะ `--sp-1..6`

## การตัดสินใจที่ผู้ใช้ยืนยันแล้ว (2026-11-10)

1. System Setting ใช้ **drawer** ตามดีไซน์ (ดู/เพิ่ม/แก้ไข ของ System, Menu, System to System) แทน 10 route `action-system`, `-edit`, `-view`, `-setup`, `action-menu-screen`, `-edit`, `-view`, `action-system-to-system`, `-view`, `-edit` ส่วน User & Permission ยังเป็นหน้าแยกเหมือนเดิม (`action-role*`, `action-users*`) ใน story ต้องกำหนดรูปแบบ URL เพื่อให้ deep link และ fragment ของแท็บยังใช้ได้
2. ปุ่มกลับจาก User details / Edit user ต้องกลับไป **แท็บ Users ผ่าน fragment** (`#users`; role ใช้ `#roles`) ตาม tabMenu จริง
3. ทำ **หน้า 403 แยก** `roleGuard` ส่งผู้ไม่มีสิทธิ์ไปหน้านี้แทน `/notfound` ส่วน URL ที่ไม่รู้จักยังไป `/notfound`

## ช่องว่างที่ยังเปิดอยู่

1. ยังไม่ได้ออกแบบ: หน้า phone ของหน้าสถานะ, สถานะผิดพลาดของ drawer ใน System Setting, ข้อผิดพลาดชื่อซ้ำ 40301 (ALREADY_EXISTED) ในฟอร์ม System/Role
2. `/setting` เทียบกับเมนูย่อยในเมนูซ้าย และการกรองเมนูซ้ายตาม role (ดูหัวข้อสิทธิ์ตาม route)
3. ข้อความตัวอย่างใน dialog (เช่น "used by 42 users") เป็นตัวแทนของข้อความจากเซิร์ฟเวอร์ ไม่ใช่ข้อความจริง
4. ระยะห่างยังเป็นการป้องกันด้วย CSS ต้องตรวจกับหน้าจอจริงตอน implement; inline style เหลือราว 85 จุด (จัดวางอย่างเดียว)
5. Accessibility: ใช้ปุ่ม/ลิงก์จริง, label บนปุ่มไอคอน, focus ring `#2854a7`, ปุ่มบนมือถือสูง 44px แต่ยังไม่ได้ audit บน Angular จริง

## ข้อกำหนดก่อนเริ่มทำ backlog

- **Clean-room (ผู้ใช้สั่ง 2026-11-10):** ห้ามให้ session/agent ใดเปิดอ่านหรืออิง source เดิม `client-uam-develop` — ส่วน "Source ใต้ `src/app/`" ในตารางด้านบนและในไฟล์ backlog เป็นเพียงที่มาของ requirement; งานจริงทำใน repo นี้จากสเปก+ดีไซน์+สัญญา API

## วิธีแตกเป็น backlog

หนึ่ง epic ต่อหนึ่งแถวของตารางจับคู่ แต่ละ story ประกอบด้วย: artboard + โน้ตใน `canvas.json` + ไฟล์ source + interface ของโมเดล

ลำดับที่แนะนำ: (1) tokens/ธีม + คอมโพเนนต์ร่วม (2) shell และ breakpoint (3) หน้ารายการ + ตัวกรอง + paginator (4) หน้า detail (5) User editor (6) Role editor (7) Report (8) Login/Consent (9) สถานะ error/empty/loading และข้อความจาก interceptor (10) phone และ a11y

เกณฑ์ตรวจรับของทุก story: ตรงกับ artboard, ใช้เฉพาะฟิลด์ที่มีอยู่, payload เดิมไม่เปลี่ยน
