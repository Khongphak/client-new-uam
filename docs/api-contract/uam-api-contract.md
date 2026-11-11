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

### 2.1.1 รูปแบบค่าที่สังเกตได้จากข้อมูลตัวอย่าง (mock ที่ผู้ใช้ส่งมา — ใช้เป็นแนวทาง ไม่ใช่ผลจริง)
- ตัวอย่างซอง: `status: 'IP-S-0001'`, `statusCode: '20000'`, `message: 'Success'`
- **วันเวลา** เป็นสตริง ISO **ไม่มี timezone** และเศษวินาทีไม่คงที่ (`2025-01-16T15:17:14.63`, `…14.633`, `…14.637`) — ห้ามใช้ `Date` ตีความตรงๆ โดยไม่กำหนดโซนเวลา ให้ parse เองและตกลงโซนเวลาก่อน (ดูคำถามเปิด)
- `status` ของระเบียนเป็น `'Active'` / `'Inactive'` (ตัวพิมพ์ตามนี้)
- `createdBy`/`updatedBy` อาจเป็น `'System'` (ไม่ใช่ชื่อผู้ใช้เสมอไป)
- `image` เป็นสตริง **base64 ของไฟล์ SVG ไม่มีคำนำหน้า `data:`** (ต้องต่อ `data:image/svg+xml;base64,` เองถ้าจะใช้เป็นแหล่งรูป หรือ decode แล้ว sanitize ก่อนฝัง) — เนื้อหา SVG มาจากเซิร์ฟเวอร์ ต้องถือเป็นข้อมูลไม่ไว้ใจ: ห้ามฝังเป็น HTML ดิบ
- `imageId` ของไอคอนเป็นตัวเลขต่อเนื่อง (เช่น 150–161) อ้างถึง `get-icons`
- **`get-all-users` (ตัวอย่าง mock ของรายการผู้ใช้):** ทุกแถวมี `roleName: null` และ `uamRole: ''` (สตริงว่าง) — **สองฟิลด์นี้ใช้แสดงผลไม่ได้** ต้องหาชื่อ UAM role จาก `uamRoleId` โดยเทียบกับ `get-all-uam-roles` (ตรงกับที่ Users list ต้องแสดงคอลัมน์ role)
- `phoneNo` เป็น `null` หรือสตริงเบอร์ต่อภายในสั้นๆ (ไม่ใช่เบอร์โทรเต็ม — ห้ามบังคับรูปแบบเบอร์โทรเต็มตอน validate) ฟิลด์ที่มาจากระบบ AD อาจมีค่าผิด/สะกดผิด (เช่น ตำแหน่ง) → แสดงตามที่ได้ ไม่แก้
- `createdBy` ของผู้ใช้ที่นำเข้ามาเป็น `'admin'`, `updatedBy` เป็น `username` ของคนที่แก้ (ตัวพิมพ์ตามต้นฉบับ ไม่ได้ปรับเป็นพิมพ์เล็ก) — **การเทียบ `username` อย่าสมมติว่าไม่สนตัวพิมพ์ใหญ่เล็ก** จนกว่าจะยืนยัน
- `isSuperAdmin` ในรายการเป็น boolean จริง (ในฟอร์มส่งกลับเป็นสตริง `'true'`/`'false'` ก่อนแปลง ดู add-user)
- ⚠️ ตัวอย่างนี้มี**ชื่อ อีเมลบริษัท และตำแหน่งของพนักงานจริง** ไม่ได้คัดลอกลง repo และไม่ควรใช้เป็น fixture — fixture ของ #5 ต้องใช้ข้อมูลสมมติที่สร้างขึ้นใหม่ในรูปแบบเดียวกัน

### 2.2 Systems
| วิธี | Path | หมายเหตุ |
|---|---|---|
| GET | `v1/Systems/get-all-systems` | → `ISystemItem[]` |
| GET | `v1/Systems/get-systems?{query}` | query ตัวกรองส่งเป็นสตริงที่ต่อเอง (ชื่อพารามิเตอร์ต้องยืนยัน) |
| POST | `v1/Systems/add-system` | body ดูด้านล่าง |
| PUT | `v1/Systems/update-system` | body ดูด้านล่าง |

Body ของ `update-system` (ยืนยันจากตัวอย่างโค้ดฟอร์มแก้ไข — 2026-11-11):
`{ id, systemId, type, systemName, description, url, ownerName, imageId, status: 'Active' | 'Inactive', accessTokenTime: number, refreshTokenTime: number, createdDate, createdBy, updatedDate, updatedBy }`
- ต่างจาก add: ต้องส่ง **`id`, `systemId`** (ส่งกลับตามที่ได้จากเรคคอร์ดเดิม) และ **`accessTokenTime`, `refreshTokenTime`** (ฟอร์มแก้ไขแก้ได้) ส่วน `status` มาจากสวิตช์ Active
- ⚠️ ฟิลด์ audit (`createdDate`, `createdBy`, `updatedDate`, `updatedBy`) ถูก**ส่งกลับตามค่าเดิมของเรคคอร์ด** ที่โหลดมาก่อนบันทึก — ยืนยันไม่ได้ว่า backend ต้องการหรือแค่ไม่สนใจ; แอปใหม่ควรเก็บเรคคอร์ดที่โหลดไว้แล้วส่งกลับเหมือนเดิมจนกว่าจะยืนยันว่าตัดได้
- ⚠️ ตัวอย่างโค้ดเดิมโหลดเรคคอร์ดก่อนบันทึกทุกครั้ง (ลูปบน `res.data`) เพื่อเอาฟิลด์เหล่านี้ — ลำดับ "อ่านก่อนแล้วเขียน" เป็นส่วนของพฤติกรรมที่ต้องรักษา
- `authenrizationType` **ไม่อยู่ใน body ของ update** (ต่างจาก `ISystemItem` ตอนอ่าน)

Body ของ `add-system` (ยืนยันจากตัวอย่างโค้ดฟอร์มเพิ่ม — 2026-11-11):
`{ type: string, systemName: string, description: string, url: string, ownerName: string, imageId: number, status: 'Active' }`
- `type` = `code` ของตัวเลือกจาก general data (ชนิดระบบ); `ownerName` = `code` ของตัวเลือกเจ้าของ (แหล่งตัวเลือกนี้ยังไม่ทราบ); `imageId` = `id` ของไอคอนจาก `get-icons`
- สถานะตอนสร้างส่งคงที่ `'Active'` (ฟอร์มเพิ่มไม่มีตัวเลือกสถานะ)
- ฟิลด์อ่านอย่างเดียวใน `ISystemItem` (`authenrizationType`, `accessTokenTime`, `refreshTokenTime`, `systemId`) **ไม่อยู่ใน body ตอนเพิ่ม** (แก้ไขแล้ว: ที่ถูกคือ ฟอร์มเดิมบังคับกรอกอายุ token แต่**ไม่ส่งใน add** — เป็นบั๊กของแอปเดิม ไม่ใช่ backend กำหนดเอง ดูภาคผนวก C)

`ISystemItem`: `id, createdDate, systemId, systemName, type, description, image?, imageId, url, authenrizationType` (**สะกดผิดตาม backend — ต้องคงไว้**), `ownerName, accessTokenTime, refreshTokenTime, status, createdBy, updatedDate, updatedBy, icon`

### 2.3 System to System
| วิธี | Path | Body |
|---|---|---|
| GET | `v1/SystemToSystem/get-all-system-to-system` | — |
| GET | `v1/SystemToSystem/get-system-to-system-by-id?id={n}` | — |
| POST | `v1/SystemToSystem/add-system-to-system` | `{ sourceSystemUUId, targetSystemUUId, accessTokenTime: number, status: 'Active' \| 'Inactive' }` |
| PUT | `v1/SystemToSystem/update-system-to-system` | ฟิลด์เดียวกัน + `id: number` (ยืนยันจากตัวอย่างโค้ด: `status` มาจากสวิตช์ Active, ค่า `sourceSystemUUId`/`targetSystemUUId` = `code` ของตัวเลือกระบบ, `accessTokenTime` มาจากช่อง token time) |

(รูปคำตอบ GET ของ S2S ยังไม่มี interface ในไฟล์ที่ได้)

### 2.4 Menu screens / groups (`menu-*.service.ts`)
| วิธี | Path |
|---|---|
| GET | `v1/Menus/get-all-menuScreens` |
| GET | `v1/Menus/get-menuScreens?systemName={name}` (ถ้าไม่ส่งชื่อ = ไม่มี query) |
| GET | `v1/Menus/get-menuScreen-byId?{id}` (ส่ง id เป็นสตริงต่อท้ายตรงๆ — รูปแบบ `id=…` ต้องยืนยัน) |
| POST | `v1/Menus/add-menuScreen` (body ดูด้านล่าง) · PUT `v1/Menus/update-menuScreen` (body ดูด้านล่าง) |

Body ของ `add-menuScreen` (ยืนยันจากตัวอย่างโค้ด):
`{ systemId: string, functional: string, screenName: string, description: string, url: string, imageId: number, status: 'Active' }`
- `systemId` = `code` ของระบบที่เลือก
- **`functional` เป็นสตริงที่หน้าตาเหมือน JSON array** สร้างจากรายการฟังก์ชันที่เลือกต่อกันด้วยจุลภาคแล้วครอบด้วย `[ ]` — ไม่ใช่ array จริง ต้องส่งแบบนี้ให้ตรง backend
  - **สมาชิกคือ "ชื่อฟังก์ชัน" ไม่ใช่เลข id** (ยืนยันจากตัวอย่างข้อมูล mock ของ response ที่ผู้ใช้ส่งมา): เช่น `"[Add,View,Edit,Report]"`, `"[View,Export]"`, `"[Add]"` ไม่มีช่องว่างหลังจุลภาค ไม่มีเครื่องหมายคำพูดรอบแต่ละค่า
  - ชื่อที่พบในตัวอย่าง: `Add`, `View`, `Edit`, `Report`, `Export` (ลำดับในสตริงไม่คงที่: `[Report,Edit,View]` ก็มี) — ชุดนี้ **มาจาก DB ไม่ตายตัว** (ดีไซน์ระบุว่า "กี่ตัวก็ได้") อย่าฮาร์ดโค้ดรายการ
  - ฝั่งอ่าน (`IMenuGroupBySystemIdItem.functional`, `IMenuScreenItem.functional`) ได้สตริงรูปแบบเดียวกันกลับมา ต้อง parse เอง (ตัด `[` `]` แล้วแยกด้วยจุลภาค) และเทียบชื่อแบบตรงตัว
- ยืนยันว่าชื่อฟิลด์ที่ใช้คือ `functional` (ไม่ใช่ `function`)

Body ของ `update-menuScreen`: เหมือน add ทุกฟิลด์ + **`id: number`**, และ `status: 'Active' | 'Inactive'` ตามสวิตช์ Active (ไม่ส่งฟิลด์ audit)
`{ id, systemId, functional, screenName, description, url, imageId, status }`
- `systemId` ตอนแก้ไขอ่านจากช่องที่ถูกล็อก (อ่านค่าด้วยวิธีที่รวมช่อง disabled) — เป็นค่า `code` ของระบบเดิม
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
| POST | `v1/Users/add-user` | body ดูด้านล่าง |
| PUT | `v1/Users/update-user/{userId}` | body เหมือน add-user ทุกฟิลด์ (ดูด้านล่าง) ต่างที่ `status` |

Body ของ `add-user` (ยืนยันจากตัวอย่างโค้ด):
`{ username, firstname, lastname, fullName, email, department, position, phoneNo: string | null, uamRoleId: string | null, isSuperAdmin: boolean, status: 'Active', systemRoles: SystemRole[], manager: string }`
(ชนิดตาม interface ของฟอร์มเดิม; `uamRoleId` ประกาศเป็น string แม้ response ฝั่งอ่านเป็นเลข — ค่าที่ส่งคือ `code` ของตัวเลือก UAM role ตรวจกับตัวอย่างจริงว่า backend รับเลขหรือสตริง)

`SystemRole` (สมาชิกของ `systemRoles`): `{ userSystemId: any, systemId: string | null, systemName: string | null, roleId: number | null, roleName: string | null }`
- **วิธีสร้างรายการ `systemRoles` (ยืนยันจากตัวอย่างโค้ด):**
  1. รวมแถวระบบ+role จากฟอร์ม (โหมด Edit และ Add เป็นคนละรายการแต่กติกาเหมือนกัน)
  2. ทิ้งแถวที่ยังเลือกไม่ครบ (ไม่มีระบบ หรือไม่มี role)
  3. `systemId` = `code` ของระบบที่เลือก; `roleName` = `name` ของ role ที่เลือก
  4. หา `roleId` และ `systemName` โดยจับคู่ (`systemId`, `roleName`) กับรายการ role ทั้งหมดที่โหลดจาก `get-all-roles` — **ถ้าจับคู่ไม่เจอ แถวนั้นถูกทิ้งเงียบๆ**
  5. `userSystemId` = ค่า `desc` ของตัวเลือก role (id ของแถว user-system ที่มีอยู่แล้วตอน Edit) และเป็น `null` สำหรับแถวที่เพิ่มใหม่
- **ข้อควรระวัง:** การจับคู่ด้วย `roleName` ทำให้เกิดปัญหาถ้าชื่อ role ซ้ำกันภายในระบบเดียวกัน (เลือก role ผิดตัว) และแถวที่จับคู่ไม่เจอหายไปโดยไม่แจ้งผู้ใช้ — แอปใหม่ควรเก็บ `roleId` มากับตัวเลือกตั้งแต่แรก ไม่จับคู่ด้วยชื่อ และบอกผู้ใช้เมื่อแถวใดหาย (ตรงกับกติกา "ระบบซ้ำ/ข้อมูลไม่ครบ" ใน Edit user)
- ส่งทั้ง id และชื่อของระบบ/role (ซ้ำซ้อน) — ต้องส่งครบห้าฟิลด์จนกว่าจะยืนยันว่าตัดชื่อได้
- ข้อมูลโปรไฟล์ (ชื่อ อีเมล แผนก ตำแหน่ง เบอร์) มาจากผลค้นหา AD (`search-users-activeDirectory`) ที่เติมช่องแบบอ่านอย่างเดียว
- `uamRoleId` = `code` ของ UAM role ที่เลือก; `isSuperAdmin` มาจากตัวเลือกที่เป็นสตริง `'true'`/`'false'` แล้วแปลงเป็น boolean ก่อนส่ง
- สังเกตตัวพิมพ์: ที่นี่ใช้ `firstname`/`lastname` (ตัวพิมพ์เล็กล้วน) แต่ `fullName` (N ตัวใหญ่) — **ต้องคงไว้ตามนี้**
- **`manager` เป็นสตริง ไม่ใช่ array** (ยืนยันจากตัวอย่าง): นำค่าที่ไม่ว่างของช่อง manager ทั้งหมดต่อกันด้วยจุลภาค (ไม่มีเครื่องหมายคำพูดรอบแต่ละค่า) แล้วครอบด้วย `[ ]` เช่น `"[a,b]"` — ไม่ใช่ JSON ที่ parse ได้ถ้าค่ามีอักขระพิเศษ และ**ค่าที่มีจุลภาคอยู่ในตัวจะแยกไม่ออก** **ค่าแต่ละตัวคือ `name` ของผู้อนุมัติ** (ยืนยันจากตัวอย่างโค้ดฟอร์มแก้ไข): ฟอร์มมีช่อง manager ได้ **สูงสุด 3 ช่อง** (`manager1`–`manager3`) ตรงกับรายการ Approvers ลำดับ 1–3 ในดีไซน์ และตอนโหลดมาแสดง ฟอร์มเติมจาก `managers[i].name` (i = 0..2) ของเรคคอร์ดผู้ใช้ — **ฝั่งอ่านมีฟิลด์ `managers` เป็น array ของ object ที่มี `name`** ต่างจาก request ที่ส่ง `manager` เป็นสตริงเดียว
  - (แก้ไขแล้ว — ดูภาคผนวก C ข้อ C.1: `managers[]` มาจาก `search-users-activeDirectory` ไม่ใช่ `get-user-byId`; ฝั่งอ่านผู้ใช้ได้ `manager` เป็นสตริง) ข้อความเดิม: ไม่แน่ใจว่า `managers` มาจาก endpoint ไหน (ไม่ตรงกับ `manager: string` ใน `IUserByIdItem` หรือ `manager[]` ใน `IResUamUserProfile`) น่าจะเป็นรูปคำตอบของ `get-userRole-byId` ที่ interface ยังไม่ครอบคลุม — ตรวจกับตัวอย่างจริง
  - ยังไม่ทราบว่า backend ตัดสตริงอย่างไร และชื่อที่มีจุลภาคอยู่ในตัวจะพังหรือไม่
- **`systemRoles`**: ดูรูปสมาชิกและวิธีสร้างด้านบน (พารามิเตอร์ของฟังก์ชันเดิมเลือกฟอร์ม Edit หรือ Add เท่านั้น ไม่ใช่ "โหมดกรอง")
- **Update ต่างจาก add เฉพาะ `status`:** add ส่ง `'Active'` คงที่ ส่วน update ส่ง `'Active'` หรือ `'Inactive'` ตามสวิตช์ Active ของฟอร์ม (ตรงกับดีไซน์ Edit user ที่มีสวิตช์ Active)
- Path ของ update ใช้ `userId` ใน URL ส่วน body ไม่มี `id`
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
1. **Request body:** ได้แล้วสำหรับ add-system, add-menuScreen, add-user (ข้อ 2.2, 2.4, 2.5) ของ Role (`IReqRole`) และ S2S `update-user`, `update-system`, `update-menuScreen` และ S2S edit ก็ได้แล้ว `systemRoles`, ความหมายของ `manager` และชนิดของ `functional` (ชื่อฟังก์ชัน) ครบแล้ว **ที่ยังขาด:** endpoint ที่คืน `managers[]` และรูปเต็มของมัน, ชนิดของ `userSystemId`, โซนเวลาของวันเวลาที่ไม่มี timezone, ชนิดสมาชิกของ `functional`
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

---

## ภาคผนวก C — ผลจากรอบที่ 2 (สเปกที่ Claude อีกตัวอ่านจากโปรเจกต์เก่าโดยตรง, 2026-11-11)

สเปกรอบนี้ละเอียดและเชื่อถือได้กว่าร่างด้านบน (อ่านจากโค้ดที่เรียกใช้จริง ไม่ใช่แค่ interface) **ถ้าขัดกับข้อความก่อนหน้า ให้ยึดภาคผนวกนี้** ไฟล์ต้นฉบับ (`api-spec.md`) มี base URL ของ dev, clientId, GUID ของระบบ และชื่อ/อีเมลของพนักงานจริง จึง**ไม่ commit ลง repo**; ที่นี่สรุปเฉพาะข้อเท็จจริงที่แอปใหม่ต้องใช้

### C.1 ปิดข้อสงสัย 6 ข้อ
| ข้อ | คำตอบ |
|---|---|
| `managers[]` | มาจาก `POST v1/Users/search-users-activeDirectory` → `data[0].managers[].name` เท่านั้น (ฟอร์มเรียกตอนกดปุ่มค้นหา AD ไม่ใช่ตอนโหลด) ส่วน `get-user-byId` คืน `manager` เป็น**สตริงเดียว** `"[ชื่อ1,ชื่อ2,ชื่อ3]"` ฟิลด์อื่นใน object ของ `managers[]` ยังไม่ทราบ |
| `userSystemId` | น่าจะเป็น `number \| null` (= id ของแถว user-system; `null` = แถวใหม่ → insert) ค่ามาจาก `get-user-byId` → `systemRoles[].userSystemId`; ใน Preview เทียบกับ `get-userRole-byId` → `userSystems[].id` ด้วย `===` (ถ้าชนิดไม่ตรง Preview จะจับคู่ไม่เจอ) — ยังต้องยืนยันด้วย response จริง |
| โซนเวลา | โค้ดไม่ระบุ; **น่าจะเป็นเวลาไทย (UTC+7) แบบไม่มี offset** ให้ถือเป็นเวลาท้องถิ่นไทยและอย่าแปลงผ่าน `Date`/UTC; ค่าว่างจาก backend คือ `"0001-01-01T00:00:00"` |
| 40301 | **ไม่มีโค้ดฝั่งไคลเอนต์ใช้เลย** ทุกหน้าบันทึกเช็คแค่ `statusCode === '20000'` ถ้าไม่ใช่แสดง modal "Invalid input" + ข้อความตายตัว (ไม่อ่าน `res.message`); ถ้าเป็น HTTP 4xx แสดง `error.message` ของ server ฟิลด์ที่ตอบ 40301 และข้อความจริง = **ต้องถาม backend** (ที่น่าจะชน: systemName, screenName/roleName ในระบบเดียวกัน, username, คู่ source+target ของ S2S — เป็นการเดาจาก UI) |
| ฟังก์ชันสิทธิ์ | `GET v1/Master/get-generalData?type=function` → `data[].value`; client เติม "Full Control" เอง (ไม่ส่งเป็น permission); ประเภทอื่น: `type=status` (Active/Inactive), `type=systemType` (Web Application/Mobile Application) |
| Consent | `GET v1/Consent/get-consent-last-version` (คืนวัตถุเดียว: `id`, `title` HTML, `description` HTML, `effectiveDate`) และ `POST v1/Consent/add-user-consent-accept` body `{ username, consentId, acceptedFlag:"Y", acceptedDate: ISO UTC }` ; `isConsent` มากับผล login |

### C.2 ข้อแก้ไขจากร่างก่อนหน้า (ที่ผมเข้าใจผิดหรือเดา)
1. **ค่า `functional`/`permission` ตัวพิมพ์เล็ก:** master data ให้ `add`, `view`, `edit`, `report`; mock เมนูเก่าเป็นตัวใหญ่ (`Add`) — ไคลเอนต์เทียบแบบสนตัวพิมพ์ ต้องยืนยันตัวพิมพ์จริงจาก DB (ข้อ 2.4 ที่เขียนว่าเป็น `Add,View,…` ให้ถือเป็นตัวอย่าง mock ไม่ใช่ค่าจริง) ไม่มีช่องว่างหลังจุลภาค ว่าง = `"[]"`
2. **add-system ไม่ส่ง `accessTokenTime`/`refreshTokenTime`** ทั้งที่ฟอร์มบังคับ (≤ 9999) ส่งเฉพาะ update — หน่วยของค่าไม่ระบุ (นาที/วินาที?) → ต้องถาม backend แอปใหม่ควรตัดสินใจให้ชัด
3. **`uamRoleId` เป็นตัวเลข** (`id` จาก `get-all-uam-roles`) แม้ interface เขียน string
4. **รูปไอคอน:** ไคลเอนต์เดิมเติม `data:image/png;base64,` แต่ไอคอนจริงเป็น SVG (เมนู/Role/User เปลี่ยน prefix เป็น `data:image/svg+xml;base64`) — แอปใหม่ต้องตรวจชนิดและ sanitize SVG
5. **ไม่มี endpoint "ลบ"** ใดเลย (System/Menu/Role/User/S2S ปิดด้วย `status: "Inactive"`) — ตรงกับ Delete dialog ใน DSN ที่ต้องทบทวนว่าใช้กับอะไร
6. **ลบแถวใน Edit user = แค่ไม่ส่งใน `systemRoles`** ไม่มี flag ลบ backend ต้องตีความเอง
7. **`get-user-byId`, `get-menuScreen-byId`, `get-system-to-system-by-id` คืนวัตถุเดียว** (ไม่ใช่ array) ส่วน `get-systems`, `get-role` คืน array 1 ตัว
8. **พารามิเตอร์ที่ยืนยันแล้ว:** `get-systems?systemId=`, `get-menuScreen-byId?screenId=`, `get-role?roleId=`, `get-roleMenu-byRoleId?roleId=`, `get-user-byId?userId=`, `get-userRole-byId?userId=`, `get-system-to-system-by-id?id=`, `update-user/{userId}` (id ใน path)
9. **`updatedDate` ต้องไม่ null** ใน list ทุกชนิด (ไคลเอนต์เดิมเรียก `.split('T')` ตรงๆ) และ `status`, `functional`, `image` ใน detail ห้าม null — แอปใหม่ควรทนค่า null ได้ ไม่พังตามบั๊กเดิม
10. **`dateTo` ของ audit-trails report** เป็น "ต้นวัน" (`T00:00:00`) ไม่ใช่สิ้นวัน — ถ้า backend ใช้ `<=` จะขาดข้อมูลวันสุดท้าย ต้องถาม backend
11. **แถวใน `systemRoles` ที่หา role ใน `get-all-roles` ไม่เจอถูกตัดทิ้งเงียบๆ** (ยืนยันแล้ว)

### C.3 ข้อตกลงร่วมที่ต้องรู้ก่อนเขียน service ใหม่
- **auth ใช้ cookie** (`withCredentials: true`) ไม่มี `Authorization: Bearer`; header ที่ทุก request ได้: `Authorization-Type: JWT`, `X-ClientId`, `X-UserType` และ `X-Sso-Session` (เมื่อมีค่า)
- **login:** ตัวอักษรแรกของ `Username` ถูกแปลงเป็นตัวใหญ่ก่อนส่ง; `SystemId` ที่ส่งคือ clientId (ไม่ใช่ systemId) — แอปใหม่ต้องรักษาไว้
- **ข้อผิดพลาด HTTP:** body คาดหวัง `{ errorCode, message }`; `TOKEN_EXPIRED`/`SSO_TOKEN_EXPIRED` → เรียก `refresh-token` 1 ครั้ง (request อื่นรอคิว) แล้วยิงซ้ำ; กลุ่ม re-auth → modal Session expired และตัด request ถัดไปทั้งหมดจนกว่าจะ login ใหม่; retry สูงสุด 2 ครั้งเฉพาะ 401 (หน่วง 1 วินาที) — **เปลี่ยนเฉพาะ UI ห้ามเปลี่ยน logic retry/logout** (ตามเกณฑ์ #13)
- **ปุ่มที่เรียก endpoint เพิ่ม:** กดการ์ดระบบที่ Home ยิง `POST v1/UserAccesses/add-useraccess-history` (`{ id, username, systemId, accessTime, status:"Success" }`, accessTime = เวลาปัจจุบัน+7 ชม. ใน ISO ลงท้าย `Z` ซึ่งเป็น hack) แล้วเปิดระบบด้วย `window.open(systemUrl + "?type=" + userType + "&session_id=" + sessionId)` — **ส่ง session id ผ่าน query string** ซึ่งเป็นประเด็นความปลอดภัยให้ Senior ตัดสินใจ (อย่าพอร์ตตรงๆ)

### C.4 สิ่งที่ยังต้องถาม backend (ปิดจากโค้ดไม่ได้)
ฟิลด์ที่ตอบ 40301 และข้อความจริง · หน่วยของ token time · รูปเต็มของ `managers[]` · ชนิดจริงของ `userSystemId` · โซนเวลา · ความหมายของ `dateTo` ใน audit report · รูปคำตอบจริงของ `get-user-byId` (ว่า `systemRoles[]` มีฟิลด์ใด)

---

## ภาคผนวก D — คำตอบที่ผู้ใช้ให้ (2026-11-11) ต่อคำถาม backend 7 ข้อ

ที่มา: ผู้ใช้ (เจ้าของโปรเจกต์) ตอบ ไม่ใช่คำตอบจากทีม backend โดยตรง — ถ้าทีม backend ตอบต่างออกไป ให้ยึดทีม backend

| ข้อ | คำตอบ | ผลต่อสัญญา |
|---|---|---|
| 1. ฟิลด์ที่ตอบ 40301 | **ไม่ทราบ** | ยังเป็นข้อสมมติ (ดู spec #3 คำตอบข้อ 1); ต้องถามทีม backend ต่อ |
| 2. หน่วย token time | **นาที** และ **"ไม่ส่งไม่ได้"** | `accessTokenTime`/`refreshTokenTime` หน่วยเป็นนาที; ฟิลด์ทั้งสองต้องมี (ดูหมายเหตุด้านล่าง) |
| 3. `managers[]` | **"มีเท่าไหร่ใช้แค่นั้น"** | จำนวนไม่คงที่ที่ 3 — แสดงเท่าที่มี; ไม่ใส่ช่องว่าง; ยังไม่ทราบเพดานสูงสุด |
| 4. ชนิด `userSystemId` | **string** | แก้เป็น `string \| null` (ดูหมายเหตุ) |
| 5. โซนเวลา | **เวลาไทย (UTC+7)** | ยืนยัน: วันเวลาไม่มี offset = เวลาไทย อย่าแปลงเป็น UTC |
| 6. `dateTo` ของ audit report | **รวมวันที่เลือกด้วย** | ส่ง `dateTo` = ต้นวันของวันสุดท้ายได้ตามเดิม ไม่ต้องบวกวัน |
| 7. รูปเต็ม `get-user-byId` | ไม่มีตัวอย่างเต็ม; ได้ `IRoleBody` ซึ่งตรงกับที่บันทึกไว้แล้ว | ไม่มีข้อมูลใหม่; `systemRoles[]` ฝั่งอ่านยังไม่ยืนยันรูปเต็ม |

### หมายเหตุที่ต้องตามต่อ
1. **ข้อ 2 "ไม่ส่งไม่ได้" ขัดกับโค้ดเดิม:** ฟอร์ม Add System เดิมบังคับกรอกอายุ token แต่ **ไม่ส่งใน body ของ add-system** (ส่งเฉพาะ update) ถ้า backend ต้องการค่านี้จริง อาจมีการเติมค่าเริ่มต้นเองฝั่งเซิร์ฟเวอร์ หรือโค้ดเดิมมีจุดที่ส่งไป — **ต้องยืนยันว่า body ของ add-system ต้องมี `accessTokenTime`/`refreshTokenTime` หรือไม่** จนกว่าจะรู้ ห้ามตัดสินใจเอง
2. **`userSystemId` เป็น string แต่ `userSystems[].id` ฝั่งอ่านเป็น number** โค้ดเดิมเทียบด้วย `===` ใน Preview สิทธิ์ ซึ่งจะไม่เจอกันถ้าชนิดไม่ตรง — แอปใหม่ต้องเทียบแบบแปลงเป็น string ทั้งสองข้าง (`String(a) === String(b)`) และส่ง `userSystemId` กลับเป็น string ตามที่ได้รับมา
3. **`manager` (สตริงแบบ list) ไม่จำกัด 3 ตัว** — ดีไซน์เดิมระบุ Approvers ลำดับ 1–3 ต้องปรับให้แสดงตามจำนวนจริง และเดิมฟอร์มมี 3 ช่อง: ต้องตัดสินใจว่าฟอร์มใหม่มีกี่ช่อง/เพิ่มได้ไหม (ถามผู้ใช้/backend: เพดาน?)
