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

## ใช้งานใน contract test (UAM-QA-01)
ที่นี่คือ `src/testing/fixtures/` (ย้ายมาจาก `docs/api-contract/fixtures/`); ลงทะเบียนชื่อไฟล์ใน `index.ts` (`fixtures['add-system.request']`) — เพิ่มไฟล์ใหม่ต้องเพิ่มใน `index.ts` ด้วย (`scripts/fixtures.test.mjs` ตรวจให้)

```ts
import { expectContractRequest, flushFixture } from '../../testing/contract/http-contract';

const req = expectContractRequest(httpCtrl, {
  method: 'POST', url: 'v1/Systems/add-system', fixture: 'add-system.request', // + baseUrl ถ้า client ต่อให้
});
flushFixture(req, 'envelope-success'); // ส่ง response fixture ให้ client parse
httpCtrl.verify();
```
`expectContractRequest` เทียบ method + URL (รวม query) + body แบบเข้ม: ชื่อคีย์/ตัวพิมพ์/ชนิดค่า/ค่า/คีย์เกิน/คีย์ขาด (ผ่าน JSON round-trip เหมือนที่ส่งจริง — คีย์ `undefined` ถือว่าหาย) ดู `contract/json-diff.ts`

## ข้อยกเว้นจาก payload ของระบบเดิม (ผู้ใช้อนุมัติ, ยังไม่ยืนยันกับ backend)
ดู `deviations.ts` — มีเพียงสองข้อ: (1) `add-system` ส่ง `accessTokenTime`/`refreshTokenTime` (2) trim `systemName`/`screenName`/`roleName` ก่อนส่ง (fixture จึงไม่มีช่องว่างหัวท้าย; test ของ client ใช้ `padded()` เป็น input)

## ไม่ได้ทำในงานนี้
service/interface ของ API (UAM-API-01), UI, การเทียบกับ response จริงของ backend (`TODO(source)` ยังคงอยู่)
