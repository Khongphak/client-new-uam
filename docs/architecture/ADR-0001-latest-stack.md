# ADR-0001 — สร้างแอปใหม่บน Angular 21 LTS + PrimeNG 21 (MIT)

- สถานะ: **Accepted (2026-11-11)** — ผู้ใช้เลือกทาง B (คง MIT) แทน Angular 22 / PrimeNG 22; Senior ตรวจชุด 21 ด้วยการติดตั้ง/รันจริงแล้ว (UAM-ARC-01)
- วันที่: 2026-11-10 (ร่าง v22) · 2026-11-11 (เปลี่ยนเป็นชุด 21 และ Accepted) · ผู้ตัดสินใจ: ผู้ใช้ (ตัด NgRx, clean-room, เลือก MIT) · ร่าง: PM · ตรวจ: Senior

## บริบท
แอปที่ `ng new` ไว้ก่อนหน้า (Angular 17.2, PrimeNG 17.18, PrimeFlex 3.3, PrimeIcons 7, NgRx 17, Karma) ล้าสมัย ผู้ใช้ต้องการสร้างใหม่ ไม่ใช้ NgRx และออกแบบใหม่ทุกชั้น (clean-room)

### เหตุผลที่ไม่เลือก v22 / ข้อควรระวัง
PrimeNG 22, `@primeuix/themes` 3 และ PrimeIcons 8 ไม่ได้เป็น MIT แล้ว (ต้องมี license key) และ PrimeNG 21 รองรับเฉพาะ Angular 21 ผู้ใช้จึงเลือกชุด MIT ทั้งสาย: **Angular 21 LTS + PrimeNG 21.1.10 (community) + `@primeuix/themes` 2 + PrimeIcons 7** — **ห้ามอัปเกรด PrimeNG / `@primeuix/themes` / primeicons เกิน 21.1.10 / 2.x / 7.x และห้ามใช้เวอร์ชัน `-lts` ของ PrimeNG (เช่น `20.5.1-lts`, เป็น license แบบเสียเงิน) โดยไม่ผ่านการตัดสินใจใหม่ของผู้ใช้ (ADR ใหม่)**; CI มีเช็กกันไว้ (ดู [(ฉ)](#ฉ-เช็ก-license-ใน-ci))

### วิธีตรวจ (UAM-ARC-01)
`npx @angular/cli@21 new <app> --defaults --style=scss --routing --ssr=false --skip-git` ใน scratch นอก repo แล้วติดตั้ง `primeng@21.1.10 @primeuix/themes@2 primeicons@7 primeflex@4 @angular/cdk@21 @vitest/coverage-v8@4` จริง; อ่าน `.d.ts`/`package.json`/LICENSE ของแพ็กเกจที่ติดตั้ง; รัน `ng test` (Vitest) และ `ng build` กับแอปทดลองที่มี button/select/dialog/table/toast/drawer + Reactive Forms — ไฟล์ทดลองไม่ได้เข้า repo

### เวอร์ชันที่ล็อก (ติดตั้งจริง 2026-11-11)
| แพ็กเกจ | เวอร์ชัน | ช่วงใน package.json | License | หมายเหตุ |
|---|---|---|---|---|
| Node | 22.23.4 | engines ของ Angular 21: `^20.19.0 \|\| ^22.12.0 \|\| >=24.0.0` | — | ใช้ Node 22 (≥ 22.12) ทั้งเครื่องและ CI |
| @angular/* (core, common, forms, router, …) | 21.2.26 | `^21.2.0` | MIT | Angular 21 ออก 2025-11-19; เป็น **LTS** ตั้งแต่ v22 ออก (2026-06-03) ถึงประมาณ 2027-05 (18 เดือนนับจากออก) |
| @angular/cli, @angular/build | 21.2.29 | `^21.2.29` | MIT | builder `@angular/build:application` / `:unit-test` |
| @angular/cdk | 21.2.14 | `^21.2.0` | MIT | peer ของ PrimeNG 21 (`^21.0.0`) — **ต้องติดตั้งเอง** |
| typescript | 5.9.3 | `~5.9.2` | Apache-2.0 | ตามที่ CLI 21 เลือก — ห้ามขึ้น TS 6 |
| vitest / @vitest/coverage-v8 | 4.1.12 | `^4.0.8` | MIT | coverage ต้องติดตั้ง `@vitest/coverage-v8` เพิ่ม (ไม่มากับ `ng new`) |
| jsdom | 28.1.0 | `^28.0.0` | MIT | |
| primeng | 21.1.10 | `21.1.10` (ตรงตัว) | MIT (community; ส่วน `-lts` ไม่ใช่) | dist-tag `v21-stable`; peer Angular `^21.0.0` (core `^21.0.7`), cdk `^21.0.0`, rxjs `^6 \|\| ^7.8.1`; dep `@primeuix/styled` 0.7.4, `@primeuix/styles` 2.0.3, `@primeuix/utils` 0.6.4, `@primeuix/motion` 0.0.10 (MIT ทั้งหมด) |
| @primeuix/themes | 2.0.3 | `~2.0.3` | MIT | preset Aura / Lara / Material / Nora |
| primeicons | 7.0.0 | `7.0.0` (ตรงตัว) | MIT | |
| primeflex | 4.0.0 | `^4.0.0` | MIT | CSS ล้วน ออกล่าสุด 2025-02 (ไม่มีการพัฒนาต่อ) |
| @ngrx/* | — | — | — | **ไม่ใช้** (ผู้ใช้ตัดสินแล้ว) |

ค่าเริ่มต้นของ `ng new` v21 (ตรวจแล้ว): standalone, **zoneless** (ไม่มี zone.js/polyfills), builder esbuild, **Vitest + jsdom**, ไม่มี `@angular/animations`, ชื่อไฟล์แบบ style guide ใหม่ (`ng g c user-list` → `user-list.ts`/`.html`/`.scss`/`.spec.ts` ไม่มี suffix `.component`) — **ต่างจาก v22: OnPush ยังไม่ใช่ค่าเริ่มต้น** → ตั้ง `"schematics": { "@schematics/angular:component": { "changeDetection": "OnPush" } }` ใน `angular.json` (FND-01)

## ผลตรวจที่ยืนยันแล้ว
### (ก) ธีม PrimeNG 21 — preset ผ่าน `@primeuix/themes` 2
ใช้ได้จริง (Vitest ตรวจว่า style ที่ฉีดมี `--p-primary-500: #2854a7`; build ผ่าน):
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
- `@primeuix/themes` 2 export `definePreset`, `updatePreset`, `palette`; ฐานที่มี `aura`, `lara`, `material`, `nora`; ทุกตัวตั้ง primary เริ่มต้นเป็น emerald → **ต้อง override เสมอ**
- แอปไม่มี dark mode ในดีไซน์ → `darkModeSelector: 'none'`
- สีที่ไม่อยู่ใน palette (`#00194b`, gradient, muted, line, `--sp-1..6`) ใส่เป็น `--uam-*` ใน SCSS (`UAM-FND-02`) หรือ `components`/`extend` ของ preset; ไม่มีไฟล์ CSS ธีม (`lara-light-blue`) แบบ v17 แล้ว

### (ข) Animation / provider กับ zoneless
- PrimeNG 21.1.10 **ไม่ import `@angular/animations`** (ตรวจ `fesm2022` แล้ว 0 ไฟล์) → ไม่ต้อง `provideAnimations*()` และไม่ต้องติดตั้ง `@angular/animations`
- provider ที่ต้องมี: `providePrimeNG({...})` และ `MessageService`/`ConfirmationService` ที่ระดับที่ใช้ toast/confirm
- ทำงานกับ zoneless ได้: dialog เปิดจาก `signal.set()` ใน Vitest/jsdom (test ผ่าน)

### (ค) คำสั่ง test (Vitest ผ่าน `ng test`)
- `ng test` ใช้ builder `@angular/build:unit-test` (runner `vitest`, environment jsdom); ต้องใส่ `--watch=false` ใน CI
- `--coverage` ต้องมี `@vitest/coverage-v8@4` (เวอร์ชันหลักเดียวกับ vitest); ตรวจแล้วว่าออก `coverage/<project>/lcov.info`, exit code 0 เมื่อผ่าน
- สคริปต์ที่กำหนด (ใช้ใน FND-01):
```json
"test": "ng test",
"test:ci": "ng test --watch=false --coverage --coverage-reporters=text-summary --coverage-reporters=lcov"
```

### (ฆ) Forms และ API แบบ signal ใน Angular 21
- **Signal Forms** (`@angular/forms/signals`, selector `[formField]`) ใน 21.2 ยังเป็น **`@experimental`** → **ไม่ใช้**; ใช้ **Reactive Forms แบบ typed** (`FormControl<T>`, `nonNullable`) — ตรวจแล้วว่า `[formControl]` ผูกกับ `p-select`/`pInputText` ได้และ validation ทำงาน (Vitest)
- `resource`, `rxResource`, `httpResource` ใน 21 ยังเป็น **`@experimental`** → **ไม่ใช้** ในโค้ดแอป; `linkedSignal` (`@publicApi 20.0`), `signal`/`computed`, `toSignal`, `provideZonelessChangeDetection` (`@publicApi 20.2`) เสถียร
- เหตุผล: API experimental ใน 21 ถูกเปลี่ยนชื่อ/รูปแบบก่อนเสถียรใน 22 — ใช้ตอนนี้ = ต้องแก้ทั้งแอปตอนย้ายเวอร์ชัน

### (ง) PrimeFlex 4
- CSS ล้วน ไม่ขึ้นกับเวอร์ชัน PrimeNG → ใช้ร่วมกับ PrimeNG 21 ได้ (build แอปทดลองผ่าน, class `flex`/`gap-*` ใช้ได้)
- โหลดผ่าน `angular.json` › `styles`: `node_modules/primeflex/primeflex.min.css`, `node_modules/primeicons/primeicons.css` (ก่อน `src/styles.scss`); ไม่ใช้ partial SCSS ที่พึ่ง Sass `@import` (deprecated)

### (จ) `ng build` แอปทดลอง
ผ่านการคอมไพล์ (button, select, dialog, table, toast, drawer, inputtext + PrimeFlex + PrimeIcons) — initial 1.42 MB raw / **221 kB transfer** แต่**ไม่ผ่าน budget เริ่มต้นของ `ng new`** (warning 500 kB / error 1 MB) → ใน FND-01 ต้อง (1) lazy-load ทุก feature route และ (2) ตั้ง budget initial เป็น warning 1.5 MB / error 2 MB แล้ววัดใหม่หลังมี shell จริง

### (ฉ) เช็ก license ใน CI
ตรวจทุกแพ็กเกจในสาย PrimeNG ที่ติดตั้งแล้วเป็น MIT (ตารางบน) จึงไม่ต้องสแกน license ทั้ง tree (ซึ่งมี Apache/ISC/BSD ปกติ); ความเสี่ยงจริงคือการอัปเกรดหลุดไป v22/`-lts` → FND-01 เพิ่มสคริปต์ `npm run check:licenses` (Node ล้วน ไม่มี dependency) ใน job `build-test` ที่อ่าน `package-lock.json` แล้ว **fail ถ้า** `primeng` major > 21, `@primeuix/themes` major > 2, `primeicons` major > 7 หรือเวอร์ชันมี `-lts` (ทดลองแล้ว: lock จริง → exit 0, แก้ primeng เป็น 22.1.4 → exit 1)

### (ช) การติดตั้งด้วย npm
- `npm install` ด้วย **npm 10.9.x** (ที่มากับ Node 22 ในเครื่องนี้) ล้มทันทีแม้แอปเปล่าจาก `ng new` (ยังไม่มี PrimeNG): `Cannot read properties of null (reading 'edgesOut')` ใน `@npmcli/arborist` ตอน `#loadPeerSet` — เป็น **บั๊กของ npm 10 ตอนสร้าง tree ใหม่** ไม่ใช่ peer conflict จริง
- `npx npm@11 install` (11.21.2) ติดตั้งทั้งชุด **ผ่านโดยไม่ต้อง `--legacy-peer-deps`** และไม่มี ERESOLVE → peer deps ของชุดนี้สอดคล้องกันจริง
- เมื่อมี `package-lock.json` แล้ว **`npm ci` ด้วย npm 10 ผ่าน** (exit 0) → **CI ใช้ `npm ci` ปกติ ไม่ต้องใส่ `--legacy-peer-deps`**
- กติกา: สร้าง/แก้ lockfile (`npm install <pkg>`) ด้วย `npx npm@11 install …`; **ห้ามใช้ `--legacy-peer-deps`** (จะซ่อน peer ที่ไม่ตรงจริง); npm 11 อาจเตือน `install-scripts` (เช่น `@parcel/watcher`, `msgpackr-extract` ที่เป็น optional) — build/test ผ่านโดยไม่ต้องอนุมัติ

## การตัดสินใจ
1. **Angular 21.2 (LTS) + TS ~5.9 + Node 22** ตามค่าเริ่มต้นของ CLI 21: zoneless, standalone, **OnPush (ตั้งใน schematics)**, signals, control flow `@if/@for`
2. **ทดสอบ**: Vitest 4 + jsdom + `@vitest/coverage-v8`; ไม่มี Karma; สคริปต์ `test` / `test:ci` ตาม (ค); CI เรียก `npm ci`, `npm run check:licenses`, `npm run test:ci`, `npm run build` (job ชื่อ `build-test`); Playwright สำหรับ E2E/screenshot
3. **UI**: PrimeNG 21.1.10 + `@primeuix/themes` 2 preset ฐาน **Lara** (ใกล้ `lara-light-blue` ของต้นแบบที่สุด) + `palette('#2854a7')` ตาม (ก) + PrimeIcons 7; "ตรง artboard" = **ตรงด้วย token ไม่ต้อง pixel-exact** (ผู้ใช้ยืนยัน) ไม่ copy CSS
4. **Utility CSS**: PrimeFlex 4 แบบไฟล์ min.css ตาม (ง); ไม่เพิ่ม Tailwind
5. **State: signals ล้วน ไม่ใช้ NgRx** (ดูส่วน [แพตเทิร์น state](#แพตเทิร์น-state-ด้วย-signals-ข้อ-5))
6. **Forms**: **Reactive Forms แบบ typed** สำหรับฟอร์มทั้งหมด (Signal Forms ยัง experimental ใน 21 ตาม (ฆ)); ค่าของฟอร์มที่ template ต้องใช้แปลงเป็น signal ด้วย `toSignal(control.valueChanges)` เมื่อจำเป็น
7. **โครงสร้างโค้ด**: ตาม [แพตเทิร์นทุกชั้น](#แพตเทิร์นทุกชั้น-refactor-ทั้งหมด-ไม่ใช่แค่-ngrx) ด้านล่าง; interfaces ฝั่ง API อยู่ที่ `src/app/shared/interfaces/**`
8. **ฟอนต์/assets**: font-stack ที่มี Sukhumvit Set เป็นตัวแรก, ไฟล์ฟอนต์/โลโก้ใส่ใน `public/` เมื่อมีไฟล์จริง (ไม่ใช้ `/_blob/<id>`)
9. **แพ็กเกจเมเนเจอร์**: npm + package-lock ตาม (ช); ห้ามเพิ่ม dependency ใหม่โดยไม่ผ่าน Senior (dependency ใหม่จาก ADR นี้: `@angular/cdk`, `@vitest/coverage-v8`); ห้ามอัปเกรดสาย PrimeNG ตาม [ข้อควรระวัง](#เหตุผลที่ไม่เลือก-v22--ข้อควรระวัง)
10. **หน้า `/setting`**: คงเป็นหน้าการ์ดตามดีไซน์เดิม (ผู้ใช้ยืนยัน)

## Clean-room (ข้อกำหนดผู้ใช้)
- **ห้าม implement โดยอิงโค้ดเก่า `client-uam-develop` เด็ดขาด** — ไม่อ่าน/คัดลอก/พอร์ต/ยึดโครงสร้าง ชื่อไฟล์ ชื่อคลาส หรือแพตเทิร์นของเดิม
- ที่มาของ requirement มีเพียง: สเปก+ดีไซน์ใน `docs/` และ **สัญญา backend** (payload, ฟิลด์ response, `RESULT_CODE`)
- **พฤติกรรมที่มาจาก backend ต้องได้จากแหล่งสัญญา API (UAM-API-01) ไม่ใช่จากโค้ดเก่า**; ชื่อ path เดิมที่ปรากฏในเอกสารเป็นแค่ "ที่มาของ requirement" ห้ามใช้เป็นแนวทาง implement
- ไม่แน่ใจ → ถาม PM/ผู้ใช้ ไม่ไปเปิดโค้ดเก่า

## แพตเทิร์นทุกชั้น (refactor ทั้งหมด ไม่ใช่แค่ NgRx)
| ชั้น | แพตเทิร์น |
|---|---|
| โฟลเดอร์/ชื่อไฟล์ | ตาม Angular style guide ล่าสุด (ชื่อที่ `ng g` v21 สร้าง): `user-list.ts`/`.html`/`.scss`/`.spec.ts`, `session.ts`, `auth-guard.ts`; จัดตาม feature: `src/app/{core,layout,shared,access,system-catalog,identity-roles,reporting}`; 1 ไฟล์ 1 แนวคิด |
| DI | `inject()` เท่านั้น (ไม่ใช้ constructor injection); service `providedIn: 'root'` เฉพาะของที่แชร์ทั้งแอป ที่เหลือ provide ระดับ route/component |
| Change detection | zoneless + OnPush (ตั้งใน schematics): state ใน template ต้องเป็น signal; ห้ามพึ่ง `setTimeout`/zone; ไม่ใช้ `ChangeDetectorRef.detectChanges()` |
| Routing | standalone routes, **lazy ทุก feature** (`loadComponent`/`loadChildren`), **functional guards** (`CanActivateFn`/`CanMatchFn`) และ **functional resolvers** (`ResolveFn`) ที่อ่านจาก permission policy; ใช้ `withComponentInputBinding()` รับ param เป็น input |
| Auth/session + HTTP | `provideHttpClient(withInterceptors([...]))` + **functional interceptors** (แนบ token, map error); **typed API client** ต่อ context (คืน `Observable` ของ type ใน `shared/interfaces/**` ตรงตัว) + **mapper** แยก DTO ↔ view model; ไม่ใช้ `resource`/`httpResource` (experimental ใน 21 ตาม (ฆ)) |
| Error handling | **typed result/error model กลาง** (`ApiError` แบบ discriminated union จาก `RESULT_CODE`/HTTP status) แปลงที่ interceptor/mapper จุดเดียว แทน constants กระจาย; หน้าแสดงผ่านคอมโพเนนต์ state/error ร่วม (FND-04) |
| ข้อความ/dialog | **message catalog แบบ typed** (key → ข้อความไทย, ใช้ `satisfies`) + `MessageService`/`ConfirmationService` ของ PrimeNG ผ่าน wrapper เดียว |
| สิทธิ์ | **permission policy แบบ typed** (pure function `can(session, action, resource)`) ใช้ร่วมกันทั้ง guard, เมนู และปุ่ม แทนการเช็ก role กระจาย |
| ตาราง/ฟิลเตอร์ | คอมโพเนนต์/helper ร่วมบน `p-table`; state ฟิลเตอร์/หน้า/เรียงเป็น signals (`linkedSignal` รีเซ็ตหน้าเมื่อฟิลเตอร์เปลี่ยน), sync กับ query param เมื่อดีไซน์ต้องการ |
| Forms | Reactive Forms แบบ typed + validator ร่วมอยู่ใน `shared` |
| Domain logic | pure TS ไม่ขึ้นกับ Angular (เช่น โครงเมนูใน Role editor) → unit test ได้เร็ว |

## แพตเทิร์น state ด้วย signals (ข้อ 5)
ไม่ใช้ NgRx ถูกต้องกับแอปนี้: เป็น CRUD/list/form ต่อหน้า state ที่ต้องแชร์ข้ามหน้ามีน้อย; Angular 21 มี `signal`/`computed`/`linkedSignal`/`toSignal` เสถียรพอ จึงไม่ต้องมี store กลาง reducer/effect

| ขอบเขต | ที่อยู่ | แพตเทิร์น |
|---|---|---|
| **แชร์ทั้งแอป** — session/โปรไฟล์/สิทธิ์ | `core/session.ts` (`providedIn: 'root'`) | `#state = signal<Session \| null>(null)` เป็น private; เปิด `readonly` ผ่าน `computed` (`user`, `isLoggedIn`, `permissions`); เปลี่ยนค่าผ่านเมธอดที่มีชื่อ (`signIn`, `signOut`) เท่านั้น; guard/policy อ่านจาก service นี้ |
| **แชร์ทั้งแอป** — toast/confirm | `core/notify.ts` | wrapper บาง ๆ ของ `MessageService`/`ConfirmationService` + message catalog; ไม่เก็บ state เอง |
| **ข้อมูลต่อหน้า** (list/detail) | store เล็กที่ provide ระดับ route/คอมโพเนนต์หน้า | signal `params` (id, ฟิลเตอร์, หน้า) → เรียก typed client (`switchMap` ยกเลิกคำขอเก่า, `takeUntilDestroyed`) → เขียนผลลง signal `data`/`loading`/`error` แบบอ่านอย่างเดียวภายนอก; ไม่มี global cache — ออกจากหน้าแล้วทิ้ง; หลังบันทึกเรียก `reload()` |
| **state เฉพาะที่ซับซ้อน** — Role editor (โครงเมนู/drag-drop/stepper) | `identity-roles/role-editor/role-editor-store.ts` provide ที่คอมโพเนนต์ editor | คลาส signal store: `signal` ภายใน + `computed` สำหรับค่าที่อนุมาน + เมธอดเปลี่ยน state ที่เรียก pure function ใน domain (`moveMenu(tree, from, to)`) → ทดสอบ domain แบบ pure TS และ store แบบไม่ต้อง render |
| **UI ล้วน** (เปิด drawer, แท็บ) | ในคอมโพเนนต์ | `signal` ธรรมดา |

กติกา: ห้าม `effect()` เพื่อ sync state ไปมา (ใช้ `computed`/`linkedSignal`); เปิดเผยเฉพาะ `Signal` แบบอ่านอย่างเดียว; ถ้าภายหลังมีเหตุจำเป็นจริงให้ทำ ADR ใหม่ (ไม่กลับไปใช้ NgRx โดยไม่ผ่านผู้ใช้)

## ข้อควรระวังที่พบ
1. ห้ามอัปเกรด/ใช้ `-lts` ของสาย PrimeNG — ดู [เหตุผลที่ไม่เลือก v22](#เหตุผลที่ไม่เลือก-v22--ข้อควรระวัง) และ (ฉ); `npm update`/Dependabot ต้องไม่ยกเวอร์ชันข้าม major (pin `primeng`/`primeicons` ตรงตัว, `@primeuix/themes` `~2.0.3`)
2. PrimeNG 21 peer ต้องการ `@angular/cdk` ^21 แต่ไม่ได้ติดตั้งให้อัตโนมัติ — ลืม = build ล้ม
3. Budget initial เริ่มต้นของ `ng new` ไม่พอ — ดู (จ)
4. TypeScript ต้องอยู่ที่ `~5.9` (ตาม Angular 21)
5. coverage ต้องเพิ่ม `@vitest/coverage-v8`; `ng test` ไม่มี `--watch=false` จะค้างใน terminal ที่มี TTY
6. ทุก preset ตั้ง primary เป็น emerald — ลืม override = สีเขียวทั้งแอป
7. OnPush ไม่ใช่ค่าเริ่มต้นใน v21 — ต้องตั้ง schematics และตรวจในรีวิว
8. npm 10 สร้าง lockfile ใหม่ไม่ได้ในเครื่องนี้ — ดู (ช)
9. PrimeFlex 4 ไม่มีการพัฒนาต่อ ใช้ได้เพราะเป็น CSS ล้วน แต่ไม่ควรขยายการพึ่งพา
10. Angular 21 LTS หมดราว 2027-05 → การย้ายไป v22+ ต้องเป็น ADR ใหม่ที่ตัดสินเรื่อง license ของ PrimeNG อีกครั้ง

## ผลกระทบ
- `UAM-FND-01` ทำใหม่: แทนที่แอป Angular 17 ทั้งหมดด้วยเวอร์ชันในตารางข้างบน + `@vitest/coverage-v8` + สคริปต์ `test`/`test:ci`/`check:licenses` + CI Node 22 + budget + schematics OnPush
- `UAM-FND-02`: custom preset ตาม (ก) + `--uam-*` tokens
- ฟอร์มทั้งหมด (SYS/USR/ROL) ใช้ Reactive Forms แบบ typed
- งานที่ต้องการ payload จริง (`UAM-QA-01`, SYS/USR/ROL) รอ `UAM-API-01`

## ประเด็นที่ปิดแล้ว (ผู้ใช้ตอบ 2026-11-10/11)
1. ~~License ของ PrimeNG 22~~ — เลือก **B: Angular 21 LTS + PrimeNG 21.1.10 (MIT)** ตาม ADR นี้
2. ~~ความตรง artboard~~ — รับได้ที่ไม่ pixel-exact (ตรงด้วย token)
3. ~~NgRx~~ — ไม่ใช้ (signals + service)
4. ~~แหล่งสัญญา API~~ — ดู #46 / PR #50 (UAM-API-01)
