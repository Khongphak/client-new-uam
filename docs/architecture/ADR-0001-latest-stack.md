# ADR-0001 — สร้างแอปใหม่บน stack ล่าสุด

- สถานะ: **Accepted-pending-user** — Senior ตรวจด้วยการติดตั้ง/รันจริงแล้ว (UAM-ARC-01) เหลือ [ประเด็นเปิด](#ประเด็นเปิด-ต้องให้ผู้ใช้ตัดสินใจ) ที่ผู้ใช้ต้องตอบ โดยเฉพาะ **license ของ PrimeNG 22** ก่อนเริ่ม UAM-FND-01
- วันที่: 2026-11-10 · ผู้ตัดสินใจ: ผู้ใช้ (สั่งให้ใช้ Angular และ lib เวอร์ชันล่าสุด, ตัด NgRx, clean-room) · ร่าง: PM · ตรวจ: Senior

## บริบท
แอปที่ `ng new` ไว้ก่อนหน้า (Angular 17.2, PrimeNG 17.18, PrimeFlex 3.3, PrimeIcons 7, NgRx 17, Karma) ล้าสมัย ผู้ใช้ต้องการสร้างใหม่ด้วยเวอร์ชันล่าสุด ไม่ใช้ NgRx และออกแบบใหม่ทุกชั้น (clean-room)

### วิธีตรวจ (UAM-ARC-01)
สร้างแอปด้วย `@angular/cli@22` ใน scratch นอก repo แล้วติดตั้ง `primeng@22 @primeuix/themes@3.1 primeicons@8 primeflex@4 @angular/cdk@22` จริง; อ่าน `.d.ts`/`package.json`/LICENSE ของแพ็กเกจที่ติดตั้ง; รัน `ng build`, `ng test` และเปิดหน้าที่ build แล้วใน Chromium (Playwright) — ไฟล์ทดลองไม่ได้เข้า repo

### เวอร์ชันที่ล็อก (ติดตั้งจริง 2026-11-10)
| แพ็กเกจ | เวอร์ชัน | ช่วงใน package.json | License | หมายเหตุ |
|---|---|---|---|---|
| Node | 22.23.4 | engines `^22.22.3 \|\| ^24.15.0 \|\| >=26` | — | CI ใช้ Node 22 |
| @angular/* (core, common, forms, router, …) | 22.2.5 | `^22.2.0` | MIT | |
| @angular/cli, @angular/build | 22.2.6 | `^22.2.6` | MIT | builder `@angular/build:application` / `:unit-test` |
| @angular/cdk | 22.2.6 | `^22.2.0` | MIT | peer ของ PrimeNG 22 (ต้องติดตั้งเอง) |
| typescript | 6.0.3 | `~6.0.2` | Apache-2.0 | `@angular/build` รับ `>=6.0 <6.1` — **ห้ามขึ้น TS 7** |
| vitest / @vitest/coverage-v8 | 5.1.0 | `^5.0.0` | MIT | coverage ต้องติดตั้ง `@vitest/coverage-v8` เพิ่ม (ไม่มากับ `ng new`) |
| jsdom | 30.1.3 | `^30.0.0` | MIT | (npm มี 31 แล้ว แต่ใช้ตามที่ CLI เลือก) |
| primeng | 22.1.4 | `^22.1.4` | ⚠️ **PrimeUI License** (ต้องมี license key) | peer Angular/cdk `^22.1.0`; dep `@primeui/license-manager`, `@primeicons/angular`, `@primeuix/motion` |
| @primeuix/themes | 3.1.0 | `^3.1.0` | ⚠️ PrimeUI License | preset Aura / Lara / Material / Nora (+ `*-compat`) |
| primeicons | 8.0.2 | `^8.0.2` | ⚠️ PrimeUI License | v7 ยังเป็น MIT |
| primeflex | 4.0.0 | `^4.0.0` | MIT | ออกล่าสุด 2025-02 (ไม่มีการพัฒนาต่อ) |
| @ngrx/* | — | — | — | **ไม่ใช้** (ผู้ใช้ตัดสินแล้ว) |

ค่าเริ่มต้นของ `ng new` v22 (ตรวจแล้ว): standalone (ไม่ต้องเขียน `standalone: true`), **zoneless** (ไม่มี zone.js/polyfills), **OnPush เป็นค่าเริ่มต้น** (`ChangeDetectionStrategy.Default` deprecated → `Eager`), builder esbuild, **Vitest + jsdom**, ไม่มี `@angular/animations`, schematics ตั้งชื่อไฟล์แบบ style guide ใหม่ (`user-list.ts`, `session.ts`, `auth-guard.ts`, `auth-interceptor.ts` — ไม่มี suffix `.component`/`.service`)

## ผลตรวจที่ยืนยันแล้ว
### (ก) ธีม PrimeNG 22 — preset
ใช้ได้จริง (build + เปิดใน Chromium: `--p-primary-color = light-dark(#2854a7, …)`, ปุ่ม/ตาราง/dialog แสดงสี primary ถูก):
```ts
// app.config.ts
import { providePrimeNG } from 'primeng/config';
import { definePreset, palette } from '@primeuix/themes';
import Lara from '@primeuix/themes/lara';

export const UamPreset = definePreset(Lara, {
  semantic: { primary: palette('#2854a7') }, // 50..950 สร้างจากสีเดียว; 500 = #2854a7
});

providePrimeNG({ theme: { preset: UamPreset, options: { darkModeSelector: 'none' } } });
```
- `palette('#2854a7')` → `{50:#f4f6fb … 500:#2854a7, 600:#22478e … 950:#0a152a}`; `primary.color` ของ Lara = `primary.500` ในโหมดสว่าง
- ฐานที่มี: `aura`, `lara`, `material`, `nora` และ `*-compat`; ทุกตัวตั้ง primary เริ่มต้นเป็น emerald → **ต้อง override เสมอ**
- token ใช้ CSS `light-dark()` → ตั้ง `darkModeSelector: 'none'` (แอปนี้ไม่มี dark mode ในดีไซน์)
- สีที่ไม่อยู่ใน palette (`#00194b`, gradient, muted, line, `--sp-1..6`) ใส่เป็น `--uam-*` ใน SCSS (`UAM-FND-02`) หรือ `components`/`extend` ของ preset; ไม่มีไฟล์ CSS ธีม (`lara-light-blue`) แบบ v17 แล้ว

### (ข) Animation / provider กับ zoneless
- PrimeNG 22 **ไม่ใช้ `@angular/animations`** (ไม่มีไฟล์ใด import) ใช้ระบบ motion ของตัวเอง (`primeng/motion`, `pMotion*`, CSS class) → **ไม่ต้อง** `provideAnimations*()` และไม่ต้องติดตั้ง `@angular/animations`
- provider ที่ต้องมี: `providePrimeNG({...})` ตัวเดียว (ลงทะเบียน app initializer ตั้งธีม + ตรวจ license) และ `MessageService`/`ConfirmationService` ที่ระดับที่ใช้ toast/confirm
- ทำงานกับ zoneless ได้: dialog เปิดจาก `signal.set()` ทั้งใน Chromium และใน Vitest/jsdom

### (ค) คำสั่ง test (Vitest ผ่าน `ng test`)
- `ng test` ใช้ builder `@angular/build:unit-test` (runner ค่าเริ่มต้น `vitest`, environment jsdom) — `--watch` ค่าเริ่มต้น true เฉพาะเมื่อมี TTY จึงต้องใส่ `--watch=false` ให้ชัดใน CI
- `--coverage` ต้องมี `@vitest/coverage-v8` (ถ้าไม่มีจะ error ทันที) รายงานออกที่ `coverage/<project>/`
- ตรวจแล้วว่า test ล้ม → exit code 1, ผ่าน → 0
- สคริปต์ที่กำหนด (ใช้ใน FND-01):
```json
"test": "ng test",
"test:ci": "ng test --watch=false --coverage --coverage-reporters=text-summary --coverage-reporters=lcov"
```

### (ฆ) Signal Forms
- `@angular/forms/signals` (`form`, `FormField`/`[formField]`, `required`, `schema`, `submit` …) เป็น **`@publicApi 22.0` = เสถียรแล้ว** (เหลือ experimental เฉพาะ WebMCP)
- `[formField]` ทำ interop กับ `ControlValueAccessor` → ใช้กับ PrimeNG 22 ได้: ทดสอบ `pInputText`, `p-select`, `p-toggleswitch` ผูก model/validation ได้จริง (Vitest)
- `resource`, `rxResource`, `httpResource` = `@publicApi 22.0` (เสถียร); `linkedSignal` เสถียรตั้งแต่ 20

### (ง) PrimeFlex 4
- เป็น CSS ล้วน ไม่ขึ้นกับเวอร์ชัน PrimeNG → ใช้ร่วมกันได้ (class `flex`, `gap-*`, `grid`/`col-*` ยังเหมือน v3)
- วิธีโหลดที่แนะนำ: ใส่ `node_modules/primeflex/primeflex.min.css` ใน `angular.json` › `styles` (ไม่มี warning) — ขนาด 361 kB raw / ~20 kB gzip
- ทางเลือก import partial SCSS (`primeflex/core/_flexbox` ฯลฯ) เล็กกว่า (~70 kB) แต่ใช้ Sass `@import` → มี deprecation warning (Dart Sass 3 จะลบ) จึง**ไม่แนะนำ**
- ไอคอน: `node_modules/primeicons/primeicons.css` ใน `styles`

### (จ) `ng build` แอปทดลองที่มี PrimeNG 22
ผ่าน (button, table, dialog, toast, select, drawer + PrimeFlex + PrimeIcons) — initial 1.57 MB raw / **244 kB transfer**; ไม่ผ่าน budget เริ่มต้นของ `ng new` (error 1 MB) เพราะ PrimeNG + PrimeFlex CSS → ใน FND-01 ต้อง (1) lazy-load ทุก feature route และ (2) ตั้ง budget initial เป็น warning 1.5 MB / error 2 MB แล้ววัดใหม่หลังมี shell จริง

## การตัดสินใจ
1. **Angular 22.2 + TS ~6.0 + Node 22** ตามค่าเริ่มต้นของ CLI: zoneless, standalone, OnPush (ค่าเริ่มต้น), signals, control flow `@if/@for`
2. **ทดสอบ**: Vitest + jsdom + `@vitest/coverage-v8`; ไม่มี Karma; สคริปต์ `test` / `test:ci` ตาม (ค); CI เรียก `npm run test:ci` และ `npm run build` (job ชื่อ `build-test`); Playwright สำหรับ E2E/screenshot
3. **UI**: PrimeNG 22 + `@primeuix/themes` preset ฐาน **Lara** (ใกล้ `lara-light-blue` ของต้นแบบที่สุด) + `palette('#2854a7')` ตาม (ก) — *ขึ้นกับประเด็นเปิดข้อ 1 (license)*; "ตรง artboard" = ตรงด้วยสายตา/token ไม่ใช่ copy CSS
4. **Utility CSS**: PrimeFlex 4 แบบไฟล์ min.css ตาม (ง); ไม่เพิ่ม Tailwind
5. **State: signals ล้วน ไม่ใช้ NgRx** (ดูส่วน [แพตเทิร์น state](#แพตเทิร์น-state-ด้วย-signals-ข้อ-5))
6. **Forms**: **Signal Forms** (`@angular/forms/signals`) สำหรับฟอร์มใหม่ทั้งหมด (เสถียรใน 22 และใช้กับ PrimeNG ได้ตาม (ฆ)); ไม่ผสม Reactive Forms ในฟอร์มเดียวกัน
7. **โครงสร้างโค้ด**: ตาม [แพตเทิร์นทุกชั้น](#แพตเทิร์นทุกชั้น-refactor-ทั้งหมด-ไม่ใช่แค่-ngrx) ด้านล่าง; interfaces ฝั่ง API อยู่ที่ `src/app/shared/interfaces/**`
8. **ฟอนต์/assets**: font-stack ที่มี Sukhumvit Set เป็นตัวแรก, ไฟล์ฟอนต์/โลโก้ใส่ใน `public/` เมื่อมีไฟล์จริง (ไม่ใช้ `/_blob/<id>`)
9. **แพ็กเกจเมเนเจอร์**: npm + package-lock; ห้ามเพิ่ม dependency ใหม่โดยไม่ผ่าน Senior (dependency ใหม่จาก ADR นี้: `@angular/cdk`, `@vitest/coverage-v8`)

## Clean-room (ข้อกำหนดผู้ใช้)
- **ห้าม implement โดยอิงโค้ดเก่า `client-uam-develop` เด็ดขาด** — ไม่อ่าน/คัดลอก/พอร์ต/ยึดโครงสร้าง ชื่อไฟล์ ชื่อคลาส หรือแพตเทิร์นของเดิม
- ที่มาของ requirement มีเพียง: สเปก+ดีไซน์ใน `docs/` และ **สัญญา backend** (payload, ฟิลด์ response, `RESULT_CODE`)
- **พฤติกรรมที่มาจาก backend ต้องได้จากแหล่งสัญญา API (UAM-API-01) ไม่ใช่จากโค้ดเก่า**; ชื่อ path เดิมที่ปรากฏในเอกสารเป็นแค่ "ที่มาของ requirement" ห้ามใช้เป็นแนวทาง implement
- ไม่แน่ใจ → ถาม PM/ผู้ใช้ ไม่ไปเปิดโค้ดเก่า

## แพตเทิร์นทุกชั้น (refactor ทั้งหมด ไม่ใช่แค่ NgRx)
| ชั้น | แพตเทิร์น |
|---|---|
| โฟลเดอร์/ชื่อไฟล์ | ตาม Angular style guide ล่าสุด (ชื่อที่ `ng g` v22 สร้าง): `user-list.ts`/`.html`/`.scss`/`.spec.ts`, `session.ts`, `auth-guard.ts`; จัดตาม feature: `src/app/{core,layout,shared,access,system-catalog,identity-roles,reporting}`; 1 ไฟล์ 1 แนวคิด |
| DI | `inject()` เท่านั้น (ไม่ใช้ constructor injection); service `providedIn: 'root'` เฉพาะของที่แชร์ทั้งแอป ที่เหลือ provide ระดับ route/component |
| Change detection | zoneless + OnPush (ค่าเริ่มต้น): state ใน template ต้องเป็น signal; ห้ามพึ่ง `setTimeout`/zone; ไม่ใช้ `ChangeDetectorRef.detectChanges()` |
| Routing | standalone routes, **lazy ทุก feature** (`loadComponent`/`loadChildren`), **functional guards** (`CanActivateFn`/`CanMatchFn`) และ **functional resolvers** (`ResolveFn`) ที่อ่านจาก permission policy; ใช้ `withComponentInputBinding()` รับ param เป็น input |
| Auth/session + HTTP | `provideHttpClient(withInterceptors([...]))` + **functional interceptors** (แนบ token, map error); **typed API client** ต่อ context (คืน type ของ `shared/interfaces/**` ตรงตัว) + **mapper** แยก DTO ↔ view model; ฝั่งอ่านใช้ `httpResource`/`resource`, ฝั่งเขียนเรียก client ตรง |
| Error handling | **typed result/error model กลาง** (`ApiError` แบบ discriminated union จาก `RESULT_CODE`/HTTP status) แปลงที่ interceptor/mapper จุดเดียว แทน constants กระจาย; หน้าแสดงผ่านคอมโพเนนต์ state/error ร่วม (FND-04) |
| ข้อความ/dialog | **message catalog แบบ typed** (key → ข้อความไทย, ใช้ `satisfies`) + `MessageService`/`ConfirmationService` ของ PrimeNG ผ่าน wrapper เดียว |
| สิทธิ์ | **permission policy แบบ typed** (pure function `can(session, action, resource)`) ใช้ร่วมกันทั้ง guard, เมนู และปุ่ม แทนการเช็ก role กระจาย |
| ตาราง/ฟิลเตอร์ | คอมโพเนนต์/helper ร่วมบน `p-table`; state ฟิลเตอร์/หน้า/เรียงเป็น signals (`linkedSignal` รีเซ็ตหน้าเมื่อฟิลเตอร์เปลี่ยน), sync กับ query param เมื่อดีไซน์ต้องการ |
| Forms | Signal Forms + schema validation; validator ร่วมอยู่ใน `shared` |
| Domain logic | pure TS ไม่ขึ้นกับ Angular (เช่น โครงเมนูใน Role editor) → unit test ได้เร็ว |

## แพตเทิร์น state ด้วย signals (ข้อ 5)
ไม่ใช้ NgRx ถูกต้องกับแอปนี้: เป็น CRUD/list/form ต่อหน้า state ที่ต้องแชร์ข้ามหน้ามีน้อย; Angular 22 มี `signal`/`computed`/`linkedSignal`/`resource`/`httpResource` เสถียรครบ จึงไม่ต้องมี store กลาง reducer/effect

| ขอบเขต | ที่อยู่ | แพตเทิร์น |
|---|---|---|
| **แชร์ทั้งแอป** — session/โปรไฟล์/สิทธิ์ | `core/session.ts` (`providedIn: 'root'`) | `#state = signal<Session \| null>(null)` เป็น private; เปิด `readonly` ผ่าน `computed` (`user`, `isLoggedIn`, `permissions`); เปลี่ยนค่าผ่านเมธอดที่มีชื่อ (`signIn`, `signOut`) เท่านั้น; guard/policy อ่านจาก service นี้ |
| **แชร์ทั้งแอป** — toast/confirm | `core/notify.ts` | wrapper บาง ๆ ของ `MessageService`/`ConfirmationService` + message catalog; ไม่เก็บ state เอง |
| **ข้อมูลต่อหน้า** (list/detail) | ในคอมโพเนนต์หน้า หรือ service ที่ provide ระดับ route | `httpResource`/`resource` ผูกกับ signal ของพารามิเตอร์ (id, ฟิลเตอร์, หน้า) → ได้ `value/isLoading/error` อัตโนมัติ; ไม่มี global cache — ออกจากหน้าแล้วทิ้ง; หลังบันทึกเรียก `.reload()` |
| **state เฉพาะที่ซับซ้อน** — Role editor (โครงเมนู/drag-drop/stepper) | `identity-roles/role-editor/role-editor-store.ts` provide ที่คอมโพเนนต์ editor | คลาส signal store: `signal` ภายใน + `computed` สำหรับค่าที่อนุมาน + เมธอดเปลี่ยน state ที่เรียก pure function ใน domain (`moveMenu(tree, from, to)`) → ทดสอบ domain แบบ pure TS และ store แบบไม่ต้อง render |
| **UI ล้วน** (เปิด drawer, แท็บ) | ในคอมโพเนนต์ | `signal` ธรรมดา |

กติกา: ห้าม `effect()` เพื่อ sync state ไปมา (ใช้ `computed`/`linkedSignal`); เปิดเผยเฉพาะ `Signal` แบบอ่านอย่างเดียว; ถ้าภายหลังมีเหตุจำเป็นจริงให้ทำ ADR ใหม่ (ไม่กลับไปใช้ NgRx โดยไม่ผ่านผู้ใช้)

## ข้อควรระวังที่พบ
1. ⚠️ **PrimeNG 22, `@primeuix/themes` 3, PrimeIcons 8 เปลี่ยนจาก MIT เป็น PrimeUI License** (PrimeNG เวอร์ชัน community (ไม่มี suffix `-lts`) ≤ 21.1.10 เป็น MIT; เวอร์ชัน `-lts` (เช่น 20.5.1-lts) เป็น paid LTS license ของ PrimeTek; `@primeuix/themes` ≤2.0.3 และ PrimeIcons 7 ยังเป็น MIT) — ต้องมี license key: Community (ฟรี เฉพาะองค์กรที่เข้าเกณฑ์**ครบทั้ง 4 ข้อ**: รายได้ต่อปี < US$1M, นักพัฒนา < 5 (license ครอบคลุมสูงสุด 4 dev), พนักงาน < 10, เงินทุนจากภายนอก/VC < US$3M; บุคคล นักศึกษา non-profit และโอเพนซอร์สที่ไม่ใช่เชิงพาณิชย์ก็เข้าเกณฑ์; ต่ออายุทุกปีโดยยืนยันว่ายังเข้าเกณฑ์) หรือ Commercial (จ่ายต่อนักพัฒนา); ถ้าไม่มี key: `console.warn("[PrimeUI] PrimeUI license is not configured.")` และ**แสดงป้าย "Invalid PrimeUI License" มุมขวาล่างในทุกหน้า** (ตรวจแล้วใน Chromium); key ส่งผ่าน `providePrimeNG({ license })` และตรวจแบบ offline → key จะอยู่ใน bundle ฝั่ง client แต่**ห้าม commit ลง repo** (CLAUDE.md §1 ข้อ 6) ให้ inject ตอน build จาก secret ของ CI (กำหนดวิธีใน FND-01)
2. Budget initial เริ่มต้นของ `ng new` (1 MB) ไม่พอ — ดู (จ)
3. TypeScript ต้องอยู่ที่ `~6.0` (TS 7 ยังไม่รองรับ)
4. coverage ต้องเพิ่ม `@vitest/coverage-v8`; `ng test` ไม่มี `--watch=false` จะค้างใน terminal ที่มี TTY
5. ทุก preset ตั้ง primary เป็น emerald — ลืม override = สีเขียวทั้งแอป
6. PrimeFlex 4 ไม่มีการพัฒนาต่อ (ออก 2025-02) ใช้ได้เพราะเป็น CSS ล้วน แต่ไม่ควรขยายการพึ่งพา
7. ป้าย license ของ PrimeNG ถูกเพิ่มใน `document.body` — test/บอทที่นับ element ใน body ต้องระวัง

## ผลกระทบ
- `UAM-FND-01` ทำใหม่: แทนที่แอป Angular 17 ทั้งหมดด้วยเวอร์ชันในตารางข้างบน + `@vitest/coverage-v8` + สคริปต์ `test`/`test:ci` + CI Node 22 + budget + วิธี inject license key
- `UAM-FND-02`: custom preset ตาม (ก) + `--uam-*` tokens
- ฟอร์มทั้งหมด (SYS/USR/ROL) ใช้ Signal Forms
- งานที่ต้องการ payload จริง (`UAM-QA-01`, SYS/USR/ROL) รอ `UAM-API-01`

## ประเด็นเปิด (ต้องให้ผู้ใช้ตัดสินใจ)
1. **License ของ PrimeNG 22 (บล็อก FND-01)** — เลือก:
   - **A. PrimeNG 22 + license key** (Community ถ้าองค์กรเข้าเกณฑ์ หรือซื้อ Commercial) → ใช้ stack ล่าสุดตาม ADR นี้ทั้งหมด *(Senior แนะนำ ถ้าได้ key)*
   - **B. คง MIT: Angular 21 LTS + PrimeNG 21.1.10 (community ไม่ใช่ `-lts`) + `@primeuix/themes` 2 + PrimeIcons 7** (PrimeNG 21 peer = Angular ^21 ใช้กับ Angular 22 ไม่ได้) → ไม่ใช่ "ล่าสุด" ต้องย้ายอีกครั้งภายหลัง และต้องตรวจซ้ำ (ยังไม่ได้ทดลองใน ARC-01)
2. **แหล่งสัญญา API** (payload/ฟิลด์/`RESULT_CODE`): API spec/Swagger หรือ HAR ที่ผู้ใช้ให้ — **ไม่ใช่โค้ดเก่า** (clean-room) — ดู UAM-API-01
3. รับได้ไหมที่หน้าตา PrimeNG 22 ต่างจากต้นแบบ PrimeNG 17 เล็กน้อย (ตรงด้วย token/ภาพ ไม่ pixel-exact)
4. ~~NgRx~~ — ตัดสินแล้ว: ไม่ใช้ NgRx (ผู้ใช้ยืนยัน 2026-11-10)
