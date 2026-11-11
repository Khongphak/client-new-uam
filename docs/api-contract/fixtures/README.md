# Golden fixtures ของสัญญา API (ข้อมูลสมมติ)

สำหรับ #5 (UAM-QA-01) — ใช้ตรวจว่า payload/response ของแอปใหม่**ตรงกับ backend ทุกฟิลด์**

## กติกา
- **ข้อมูลทั้งหมดสมมติ** (ชื่อ `Test User`, อีเมล `@example.test`, GUID `00000000-…`, ไอคอน `PHN2Zy8+` = `<svg/>`) ห้ามนำข้อมูลพนักงานจริง/ GUID ระบบจริง/ clientId/ URL ของ environment ลงไฟล์เหล่านี้
- **ชื่อฟิลด์ ตัวพิมพ์ และชนิดต้องตรง backend** (รวมที่สะกดผิด/ตัวพิมพ์ไม่สม่ำเสมอ เช่น `authenrizationType`, `fullName` ใน request กับ `fullname` ใน response, `firstname` ตัวพิมพ์เล็ก)
- วันเวลาไม่มี timezone ตามจริง; `functional`/`permission`/`manager` เป็นสตริงแบบ list (`"[a,b]"`) ไม่ใช่ array
- `functional` ใช้ตัวพิมพ์เล็กตาม master data — **ตัวพิมพ์จริงใน DB ยังไม่ยืนยัน** (ดูสัญญา C.2 ข้อ 1)

## ที่มา (ทุกไฟล์) — `TODO(source)`
สร้างจากสัญญา `docs/api-contract/uam-api-contract.md` (ซึ่งสกัดจากโค้ดเก่า ไม่ใช่ response จริงจาก backend) **ยังไม่ผ่านการเทียบกับ response จริง** ค่าที่ยังไม่ยืนยันดูสัญญาภาคผนวก C.4 จนกว่าจะเทียบแล้ว ให้ถือว่า fixture เหล่านี้ "ตรงตามสัญญา" ไม่ใช่ "ตรงตาม backend"

| ไฟล์ | endpoint |
|---|---|
| `login.request/response`, `consent-*`, `add-consent-accept.request` | `v1/auth/login`, `v1/Consent/*` |
| `envelope-success`, `envelope-already-existed` | ซองคำตอบ (รวม 40301) |
| `general-data-function.response` | `v1/Master/get-generalData?type=function` |
| `get-all-systems.response`, `add-system.request`, `update-system.request` | `v1/Systems/*` |
| `add/update-system-to-system.request` | `v1/SystemToSystem/*` |
| `add/update-menu-screen.request`, `menu-screens-by-system-id.response` | `v1/Menus/*`, `v2/Menus/*` |
| `get-all-roles.response`, `get-role-menu-by-role-id.response`, `add/update-role.request` | `v1/Roles/*` |
| `get-all-users.response`, `get-user-by-id.response`, `ad-search.request/response`, `add/update-user.request` | `v1/Users/*` |
| `audit-trails-report.request` | `v1/Reports/generate-audit-trails-report` |

## ย้ายที่ในอนาคต
ตอนนี้ repo ยังไม่มีแอป (รอ #45 → #2) ไฟล์อยู่ใน `docs/` ก่อน; เมื่อมีแอปแล้วย้ายไปไว้ที่ที่ ADR กำหนด (เช่น `src/testing/fixtures/`) พร้อม helper บน `HttpTestingController` (Vitest) ตามขอบเขตของ #5
