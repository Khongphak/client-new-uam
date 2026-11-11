# สัญญา API ของ UAM (สกัดจากโค้ดเก่า — ร่างสำหรับ #46)

**ที่มา:** ไฟล์ที่ผู้ใช้อัปโหลดเมื่อ 2026-11-11 (`http.data.ts`, `modal.data.ts`, `interfaces.zip`, `service.zip`) ผู้ใช้อนุญาตให้อ่านเพื่อสกัดสัญญา API เท่านั้น (#46)
**ขอบเขต:** เอกสารนี้บันทึก endpoint, ฟิลด์ และรหัสผลลัพธ์ที่ backend กำหนด เขียนใหม่ด้วยถ้อยคำของเรา ไม่คัดลอกโค้ด และ**ไม่**ยึดโครงสร้างของแอปเดิม (ที่ใช้ `any`, มี mock ปนอยู่, URL ฮาร์ดโค้ด) Interface ของแอปใหม่ต้องตั้งชื่อชั้นข้อมูลใหม่ แต่**ชื่อฟิลด์ใน JSON ต้องตรง backend ทุกตัว**
**ไฟล์ต้นทาง** ระบุในวงเล็บเป็นชื่อไฟล์เดิมเพื่อตรวจย้อนกลับ (ใช้ใน PR ตามข้อกำหนด #46)

## 1. ซองคำตอบ (response envelope) และรหัสผลลัพธ์

ทุก endpoint `v1/*` ของ UAM ตอบรูปแบบเดียวกัน (`interfaces/**/IRes*`):

| ฟิลด์ | ชนิด | หมายเหตุ |
|---|---|---|
| `statusCode` | string | รหัสผลลัพธ์ (ตารางด้านล่าง) |
| `status` | string | รหัสข้อความ เช่น `IP-S-0003` (ดูตัวอย่างในคอมเมนต์ของ service) |
| `message` | string \| null | ข้อความจากเซิร์ฟเวอร์ |
| `data` | array หรือ object ตาม endpoint | บาง endpoint ให้ `data` เป็น object เดียว (`IResUserSystemRoleByUserId`) และการบันทึกตอบ `data: true` |

ฟิลด์ `statusCode` ส่งเป็น**สตริง** ไม่ใช่ตัวเลข (`http.data.ts`: `RESULT_CODE`):

| รหัส | ชื่อ | ความหมายต่อ UI |
|---|---|---|
| 20000 | SUCCESS | สำเร็จ |
| 20100 | CREATED | สร้างสำเร็จ |
| 40101 | ACCESS_DENIED | ไม่มีสิทธิ์ |
| 40102 | SESSION_EXPIRED | session หมดอายุ → dialog Session |
| 40300 | INVALID_PARAMETER | พารามิเตอร์ไม่ถูกต้อง |
| **40301** | **ALREADY_EXISTED** | **ข้อมูลซ้ำ (ชื่อซ้ำ) → ดู DSN-01 หัวข้อ C** |
| 40400 | UNKNOWN_URL | ไม่รู้จัก URL |
| 40401 | NOT_FOUND | ไม่พบข้อมูล |
| 50000 | SYSTEM_ERROR | ข้อผิดพลาดระบบ → dialog Server |
| 50001 | DB_ERROR | ข้อผิดพลาดฐานข้อมูล → dialog Server |
| 50002 | TIME_OUT | หมดเวลา → dialog Server |

รหัสข้อผิดพลาดฝั่ง auth (สตริง; `AUTH_ERROR_CODE`): `SSO_SESSION_INVALID`, `SSO_SESSION_EXPIRED`, `TOKEN_INVALID`, `TOKEN_EXPIRED`, `AUDIENCE_MISSING`, `INTERNAL_ERROR`, `REFRESH_TOKEN_INVALID`, `REFRESH_TOKEN_EXPIRED`, `SSO_TOKEN_EXPIRED` — ค่ากลุ่ม "ต้องล็อกอินใหม่" ที่ interceptor เดิมใช้: `INTERNAL_ERROR`, `TOKEN_INVALID`, `AUDIENCE_MISSING`, `SSO_SESSION_INVALID`, `SSO_SESSION_EXPIRED`, `REFRESH_TOKEN_INVALID`, `REFRESH_TOKEN_EXPIRED` (ส่วน `TOKEN_EXPIRED`/`SSO_TOKEN_EXPIRED` ไม่อยู่ในกลุ่มนี้)

ข้อผิดพลาด HTTP ที่ interceptor เดิมอ่าน: สถานะ 0 = เครือข่ายล่ม; 422 มีรูป `{ ModelState: { <field>: <message>, … } }`; ข้อความอ่านจาก `error.message` / `error.Message` / `error.error_description` (ตามลำดับ)

> ⚠️ ไม่พบในไฟล์ที่ได้รับว่ามีโค้ดฝั่งไคลเอนต์ที่ใช้ `ALREADY_EXISTED` / 40301 เลย จึง**ยืนยันไม่ได้**ว่าฟิลด์ใดตอบ 40301 และข้อความจริงของเซิร์ฟเวอร์เป็นอย่างไร (ดูข้อ 7)

## 2. Endpoint ตามกลุ่ม

ฐาน URL = `apiUAM` (ค่าจาก environment — ไม่ให้ใส่ค่าจริงใน repo) ทุก path ด้านล่างต่อท้ายฐานนี้

### 2.1 Auth / Session (`login.service.ts`)
| วิธี | Path | Body / Query | ผลลัพธ์ |
|---|---|---|---|
| POST | `v1/auth/login` | `{ Username, Password, SystemId }` (คีย์ขึ้นต้นตัวใหญ่) | `IResLogin`: `data.result = { sessionId, isConsent, userProfile{ userId, userName, firstName, lastName, position, uamRole, systemAdmin, userType } }` |
| POST | `v1/auth/refresh-token` | `{ SystemId, … }` + header ของ client | `{ isValid, userName, userType }` |
| POST | `v1/auth/logout` | `{ Username, ClientId, RefreshToken? }` | — |
| POST | `v1.1/Authorization/verify-token` | (ดูโค้ด; ยังไม่ได้ตรวจ body) | — |
| GET | `v2/users/get-user-byUsername` | query: `userName`; headers: `Authorization-Type`, `X-ClientId`, `X-UserType?`, `X-Sso-Session?` | `IResUamUserProfile`: `{ userName, fullName, firstName, lastName, position, department, phoneNo, manager[], role, groupMenus[] }` |

โปรไฟล์ในตัว `groupMenus[]`: `{ roleId, roleMenuId, parentId, menuId, screenName, functional, groupName, sortOrder, permission, … }` (ตัดท้ายไฟล์ ยังต้องอ่านครบ)
ตัวระบุ session ถูกเก็บฝั่งไคลเอนต์; รายละเอียดการเก็บไม่ใช่สัญญา API จึงไม่บันทึกที่นี่

### 2.2 Systems
| วิธี | Path | หมายเหตุ |
|---|---|---|
| GET | `v1/Systems/get-all-systems` | → `ISystemItem[]` |
| GET | `v1/Systems/get-systems?{query}` | query ตัวกรองส่งเป็นสตริงที่ต่อเอง (ชื่อพารามิเตอร์ต้องยืนยัน) |
| POST | `v1/Systems/add-system` | body: ยังไม่ทราบรูปแบบ (ไม่มี interface ของ request) |
| PUT | `v1/Systems/update-system` | เช่นเดียวกัน |

`ISystemItem`: `id, createdDate, systemId, systemName, type, description, image?, imageId, url, authenrizationType` (**สะกดผิดตาม backend — ต้องคงไว้**), `ownerName, accessTokenTime, refreshTokenTime, status, createdBy, updatedDate, updatedBy, icon`

### 2.3 System to System
| วิธี | Path | Body |
|---|---|---|
| GET | `v1/SystemToSystem/get-all-system-to-system` | — |
| GET | `v1/SystemToSystem/get-system-to-system-by-id?id={n}` | — |
| POST | `v1/SystemToSystem/add-system-to-system` | `{ sourceSystemUUId, targetSystemUUId, accessTokenTime: number, status: 'Active' \| 'Inactive' }` |
| PUT | `v1/SystemToSystem/update-system-to-system` | ฟิลด์เดียวกัน + `id: number` |

(รูปคำตอบ GET ของ S2S ยังไม่มี interface ในไฟล์ที่ได้)

### 2.4 Menu screens / groups (`menu-*.service.ts`)
| วิธี | Path |
|---|---|
| GET | `v1/Menus/get-all-menuScreens` |
| GET | `v1/Menus/get-menuScreens?systemName={name}` (ถ้าไม่ส่งชื่อ = ไม่มี query) |
| GET | `v1/Menus/get-menuScreen-byId?{id}` (ส่ง id เป็นสตริงต่อท้ายตรงๆ — รูปแบบ `id=…` ต้องยืนยัน) |
| POST | `v1/Menus/add-menuScreen` · PUT `v1/Menus/update-menuScreen` (body ยังไม่ทราบรูปแบบ) |
| GET | `v2/Menus/get-menuScreens-bySystemId?systemId={id}[&roleId={id}]` |
| GET | `v1/Menus/get-menuRoleScreens-bySystemId?systemId={id}[&roleId={id}]` |

(endpoint เกี่ยวกับ menuGroup แบบ `get-all-menuGroups`, `add-menuGroup` ฯลฯ ถูกคอมเมนต์ทิ้งในโค้ดเก่า — **อย่านับเป็นสัญญาที่ใช้งานอยู่**)

`IMenuScreenItem`: `id, systemId, screenName, url, status, function(null), functional, description, imageId, createdDate, createdBy, updatedDate, updatedBy, systemName, image` (**มีทั้ง `function` และ `functional`** ในโมเดลเดิม ตรวจกับตัวอย่างจริงว่าตัวไหนมีค่า)

### 2.4.1 Roles (`user-roles.service.ts`)
| วิธี | Path | หมายเหตุ |
|---|---|---|
| GET | `v1/Roles/get-all-roles` | → `IRoleItem[]` |
| GET | `v1/Roles/get-role?{query}` | |
| GET | `v1/Roles/get-roleMenu-byRoleId?roleId={id}` | → `IRoleMenuItem[]` (มี `groupMenus[]` ซ้อนตัวเอง) |
| POST | `v1/Roles/add-role` | body ตามรูป `IReqRole` ด้านล่าง |
| PUT | `v1/Roles/update-role` | |

`IRoleItem`: `id, systemId, roleName, status, description, createdDate, createdBy, updatedDate, updatedBy, systemName`
`IReqRole` (body ของบันทึก Role): `{ systemId, roleName, status, description, menus: IMenus[] }`
`IMenus`: `{ roleId?, roleMenuId?, menuId?, parentId?, sortOrder, permission?, imageGroupId, groupName?, groupMenus?: IMenus[] }`
→ โครงเมนูใน payload ซ้อนด้วย `groupMenus` แบบ recursive; ตรงกับ Role editor (กลุ่มซ้อนสูงสุด 2 ชั้น ตามดีไซน์)
`permission` มีชนิด `any` ในโมเดลเดิม — **รูปแบบจริง (สตริง? รายการ?) ต้องยืนยัน** (`ImenuRoleScreens.permission` ถูกประกาศเป็น string)

### 2.5 Users (`user.service.ts`)
| วิธี | Path | Body / Query |
|---|---|---|
| GET | `v1/Users/get-all-users` | → `IUserItem[]` |
| GET | `v1/Users/get-user-byId?userId={id}` | → `IUserByIdItem[]` |
| GET | `v1/Users/get-userRole-byId?userId={id}` | → `IUserSystemRoleItem` (object เดียว) |
| POST | `v1/Users/search-users-activeDirectory` | `{ userName, email: null, position: null, department: null }` → `IUserADItem[]` |
| POST | `v1/Users/add-user` | body ยังไม่ทราบรูปแบบ |
| PUT | `v1/Users/update-user/{userId}` | body ยังไม่ทราบรูปแบบ |
| GET | `v1/UAM/get-all-uam-roles` | → `IUAMRoleItem[]` (`id, name, status, description, …`) |
| GET | `v1/Home/get-userSystems?userName={name}` | → `IUserSystemItem[]` สำหรับการ์ดระบบหน้า Home |

`IUserItem`: `id, uamRoleId, roleName, username, fullname, firstname, lastname, email, department, position, phoneNo, isSuperAdmin(boolean), status, uamRole, createdDate, createdBy, updatedDate, updatedBy`
`IUserByIdItem`: ฟิลด์ข้างต้นส่วนใหญ่ + `uamRoleName, systemRoles[], manager`
`IUserADItem`: `username, fullName, firstName, lastName, email, phoneNo, checkPwd, department, position` (ฟิลด์ `checkPwd` มีใน response — ไม่ควรส่งต่อลง UI/log)
`IUserSystemRoleItem`: ฟิลด์ผู้ใช้ + `userId, manager, uamRoleName, userSystems[]` (`isSuperAdmin` ในโมเดลเดิมประกาศชนิด `false` — เป็นบั๊กของโมเดล ใช้ `boolean`)
`IUserSystemsItem`: `id, username, systemId, systemName, systemType, description, systemUrl, imageId, data, ownerName, status, roleId, roleName, menuGroupScreens, menuRoleScreens[]`
`IUserSystemItem` (Home): `id, username, systemId, systemName, systemUrl, systemType, description, ownerName, imageId, data, image, status`

### 2.6 Master data
| GET | `v1/Master/get-generalData?type={type}` | `type` เช่น `status`, ชนิดระบบ (ค่าจริงต้องยืนยัน); → รายการ `{ id, type|value|description, remark, … }` |
|---|---|---|
| GET | `v1/Master/get-icons` | → `{ id, category, name, data, … }` (`data` = รูปไอคอนเข้ารหัส) |

ฟังก์ชันสิทธิ์ (ใช้ที่ขั้น Permissions ของ Role editor) ตอบรูป `IGeneralItemFunctions: { id, type, value, remark, … }` — **endpoint/`type` ที่ให้รายการนี้ยังไม่พบในไฟล์** (ดีไซน์ระบุว่า "มาจาก DB กี่ตัวก็ได้")

### 2.7 Reports
| วิธี | Path | Body | ผลลัพธ์ |
|---|---|---|---|
| POST | `v1/Reports/get-departments` | `{ systemId, dateFrom, dateTo }` | `IDepartmentItem[]`: `{ systemId, systemName, department }` |
| POST | `v1/Reports/generate-authorization-matrix-report` | `{ systemId, department, dateFrom: null, dateTo: null }` | ไฟล์ Excel (blob `.xlsx`) |
| POST | `v1/Reports/generate-audit-trails-report` | `{ systemId, department: null, dateFrom, dateTo }` | ไฟล์ Excel (blob `.xlsx`) |

ตอนดาวน์โหลดล้มเหลว โค้ดเดิมเขียนแค่ลง console — ผู้ใช้ไม่รู้ (ตรงกับ #21 RPT-02 ที่ต้องมี toast)

### 2.8 Consent
`interfaces/consent` มีโมเดล `Consent` (`id, name, title, description, version, effectiveDate, status, createdDate, createdBy, updatedDate, updatedBy`) และ `ConsentAccept` (`id?, username, consentId, acceptedFlag, acceptedDate, …`) แต่**ไม่พบ service/endpoint** ของ consent ในไฟล์ที่ได้รับ — แอปเดิมอ่านสถานะ consent จาก `isConsent` ของผล login เท่านั้น (ดู `consent.guard.ts`)

### 2.9 ที่ไม่ใช่ของ UAM (อย่าใช้)
`DataClaim/*`, `ticket/*`, `userLogin/*`, `user/getUserList` ฯลฯ เป็นของโปรเจกต์อื่นที่ปนอยู่ในโค้ดเก่า ไม่ต้องสร้างใน UAM ใหม่

## 3. สิ่งที่ยืนยันไม่ได้ / ต้องถามก่อนเขียนโค้ด
1. **Request body** ของ add/update: System, Menu screen, User (ไม่มี interface ของ request ในไฟล์ที่ได้; มีแค่ของ Role (`IReqRole`) และ S2S)
2. ฟิลด์ใดตอบ **40301** และรูปข้อความจริง
3. ชื่อพารามิเตอร์ของ `get-systems?{query}`, `get-menuScreen-byId?{id}`, `get-role?{query}` (โค้ดเดิมต่อสตริงเองจึงไม่เห็นชื่อ)
4. endpoint และค่า `type` ของ "ฟังก์ชันสิทธิ์"
5. รูปแบบของ `permission` (string vs list)
6. ตัวเต็มของ `groupMenus` ใน `IResUamUserProfile` (ไฟล์ตัดท้าย)
7. endpoint ของ consent (ถ้ามี)
8. ข้อกำหนดการแบ่งหน้า: มี `IPagination { offset, limit, page, orderAscend, sortBy }` ในโค้ดเก่า แต่ endpoint ของ UAM ที่เห็นทั้งหมดไม่รับค่าเหล่านี้ → **แบ่งหน้า/ค้นหา/เรียงฝั่งไคลเอนต์** เว้นแต่ยืนยันเป็นอย่างอื่น

## 4. ข้อสังเกตด้านความปลอดภัย (ส่งต่อ Senior)
- โค้ดเก่ามี URL `localhost` ฮาร์ดโค้ดใน `ReportService.report()` และฟังก์ชันซ้ำสองตัว — อย่าพอร์ต
- มีการอ่าน/เก็บโทเค็นและ session id ใน storage ฝั่งไคลเอนต์ — การตัดสินใจเรื่องที่เก็บ session ของแอปใหม่ให้ทำใน ADR (ไม่ใช่ที่นี่)
- ไฟล์ที่อัปโหลดมีสตริงที่อ่านเจอคำว่า token/secret ไม่ได้ตรวจเจตนาครบ ไม่ได้คัดลอกลง repo; **อย่า commit ไฟล์อัปโหลดต้นฉบับ**
