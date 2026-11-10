# 🧪 กลยุทธ์และขั้นตอนการทดสอบ

> สถานะ: แผน (ยังไม่มีโค้ดแอปใน repo — เครื่องมือด้านล่างยืนยันกับ source เดิมตอนทำ `UAM-FND-01`)

## 1. 🔺 ระดับของ test

| ระดับ | เครื่องมือ (แนะนำ) | ทดสอบอะไร | สัดส่วน |
|---|---|---|---|
| Unit | Jasmine+Karma (ตามค่าเริ่มต้นของ Angular; ถ้าทีมต้องการเร็วขึ้นพิจารณา Jest) + `HttpTestingController` | domain logic, guard, pipe, service mapping, component ใช้ซ้ำ (`u-*`) | มากที่สุด |
| Contract | unit test + JSON snapshot | **payload ที่ส่งหลังบ้านต้องไม่เปลี่ยน** (`UAM-QA-01`) | เท่าที่จำเป็น |
| E2E | Playwright (viewport desktop 1440 และ phone 390×844) | flow ผู้ใช้จริงบน browser, mock API ด้วย `page.route` | น้อย แต่ครอบ flow สำคัญ |
| A11y | axe-core (ผ่าน Playwright) | WCAG 2.1 AA (`UAM-A11Y-01`) | ทุกหน้าหลัก |

## 2. ⚙️ ขั้นตอนเตรียม (ทำใน `UAM-FND-01` / `UAM-QA-01`)

**Unit**
1. ตั้งค่า test runner, coverage report, script `npm test` (headless) และ `npm run test:ci`
2. สร้าง test utilities: factory ของ model (`IUserSystemItem`, user, role ฯลฯ), mock `AuthService`/store
3. เพิ่มใน CI: lint → unit (+coverage gate เริ่ม 70% สำหรับโค้ดใหม่) → build

**Contract**
1. เก็บ payload จริงของ create/update System, Menu, S2S, Role, User และ Report export เป็น fixture
2. test เทียบ JSON ที่ service ส่งกับ fixture — เปลี่ยนต้อง fail

**E2E (Playwright)**
1. `npm i -D @playwright/test` + `playwright.config.ts` (projects: `desktop`, `phone`; baseURL = `ng serve`)
2. mock API กลางที่ `e2e/mocks/` (ไม่พึ่ง backend จริง) พร้อม fixture ต่อ role
3. helper login ตาม role (ADMIN/DEVELOPER/AUDIT/USER/super admin) ด้วย storage state
4. Page Object ต่อหน้า (`e2e/pages/*.ts`)
5. ใน CI: `npx playwright test --trace off`; เปิด trace เฉพาะตอน debug

## 3. 📋 Test ที่ต้องมี (map กับ backlog)

| Flow E2E | Backlog |
|---|---|
| Login สำเร็จ/ผิด, consent ติ๊ก/Decline | AUT-01/02 |
| เมนูซ้ายและ route ตามสิทธิ์ 5 กลุ่ม → 403 / 404 | SHL-02, ERR-01/02 |
| System Setting: ค้นหา/กรอง/เปิด drawer ผ่าน deep link/สร้าง/แก้/ลบ | SYS-01..05, ERR-04 |
| Roles/Users: กรอง, เปิด view, กลับแท็บเดิมด้วย fragment | USR-01..06 |
| Edit user: AD ไม่ครบ/ระบบซ้ำ/ข้อมูลไม่ครบ → Save ปิด | USR-04/05 |
| Role editor 3 ขั้น: ลากวาง, เมนูซ้ำไม่ได้, ซ้อนเกิน 2 ชั้นไม่ได้, เลือกทั้งหมด | ROL-01..04 |
| Report: export สำเร็จ/ล้มเหลว (toast) | RPT-01/02 |
| session หมดอายุ / network / 5000x | ERR-03 |
| Phone 390px ของทุกหน้าหลัก | RSP-01 |

## 4. ✅ Definition of Done ต่อ backlog
- Unit test ของ logic ใหม่ผ่าน, contract test ผ่าน
- มี E2E อย่างน้อย 1 happy path + 1 error path ของ story (ถ้ามี UI flow)
- ไม่มี a11y violation ระดับ serious/critical ในหน้าที่แตะ
- CI เขียว

## 5. 🧭 TDD + DDD ใช้ร่วมกันได้ไหม?
**ได้ และเข้ากันดี** แต่ต้องใช้ให้พอดีกับงานนี้ (front-end redesign ที่ backend ไม่เปลี่ยน)

- **TDD** เหมาะที่สุดกับ logic ที่ตัดสินใจ: กติกาสิทธิ์ (`roleGuard`, เมนูตาม role), ตัวกรอง/ตัวนับฝั่งหน้าบ้าน, กติกา Role editor (เมนูใช้ครั้งเดียว, ซ้อนสูงสุด 2 ชั้น), การแมปฟอร์ม → payload, validation ของ Edit user — ทำ red → green → refactor ได้เต็มที่
- **DDD** ใช้แบบเบา (tactical-lite): แยกโค้ดตาม bounded context ที่ตรงกับ epic — Access (auth/consent/guard), System Catalog (system/menu/S2S), Identity & Roles (user/role/permission), Reporting — แต่ละ context มี `domain/` (กติกาล้วน ไม่ผูก Angular), `application/` (store/facade), `infrastructure/` (HTTP + mapper), `ui/`
- **ตัวเชื่อมสำคัญ:** DDD ให้ domain logic เป็น pure function/class ที่ไม่ผูก framework → TDD ทดสอบได้เร็วมาก; TDD ช่วยกันไม่ให้ model แตกเมื่อ payload ต้องคงเดิม (anti-corruption layer = mapper ที่มี contract test)
- **ข้อควรระวัง:** อย่า over-engineer — ไม่ต้องมี aggregate/event sourcing เต็มรูป เพราะ domain จริงอยู่หลังบ้าน ฝั่งนี้เป็น UI + กติกาการนำเสนอ; ใช้ ubiquitous language ตามสเปก (Role, System Admin, Approver, Group menu) ในชื่อ class/ไฟล์; สำหรับ UI ใช้ TDD แบบ component test ที่ทดสอบพฤติกรรม ไม่ใช่ implementation และใช้ E2E แค่ flow หลัก
- **ข้อเสนอ:** เริ่ม TDD ทันทีใน story ที่มี logic (SHL-02, ERR-02, USR-05, ROL-02, QA-01); จัดโครงโฟลเดอร์ตาม context ตั้งแต่ FND-01 แต่ migrate โค้ดเดิมทีละ context พร้อม story ที่แตะ ไม่ทำ big-bang refactor
