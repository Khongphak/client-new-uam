# ADR-0001 — สร้างแอปใหม่บน stack ล่าสุด

- สถานะ: **Draft (PM) → รอ Senior ยืนยันใน issue UAM-ARC-01 และผู้ใช้ยืนยันตอนเช้า**
- วันที่: 2026-11-10 · ผู้ตัดสินใจ: ผู้ใช้ (สั่งให้ใช้ Angular และ lib เวอร์ชันล่าสุด)

## บริบท
แอปที่ `ng new` ไว้ก่อนหน้า (Angular 17.2, PrimeNG 17.18, PrimeFlex 3.3, PrimeIcons 7, NgRx 17, Karma) ล้าสมัย ผู้ใช้ต้องการสร้างใหม่ด้วยเวอร์ชันล่าสุด ตรวจจาก npm เมื่อ 2026-11-10:

| แพ็กเกจ | ล่าสุด | หมายเหตุ |
|---|---|---|
| @angular/core, cli | 22.2.x | ต้องใช้ Node `^22.22.3 \|\| ^24.15.0 \|\| >=26` (เครื่องนี้ 22.23.4) |
| typescript | 7.0.2 (latest) | **แต่ `@angular/build` กำหนด `>=6.0 <6.1`** → ใช้ `~6.0.x` ตามที่ CLI เลือก ห้ามขึ้น 7 จนกว่า Angular รองรับ |
| primeng | 22.1.x | peer: Angular ^22.1, @angular/cdk ^22.1 |
| @primeuix/themes | 3.1.x | ระบบธีมแบบ preset (ไม่ใช่ไฟล์ CSS ธีมแบบ lara-light-blue ของ v17) |
| primeicons | 8.0.x | |
| primeflex | 4.0.0 | ยังคงเป็น utility CSS ของ Prime |
| @ngrx/* | 22.0.x | **ไม่ใช้** (ผู้ใช้ต้องการตัด NgRx เพราะโค้ดเก่ามีบั๊กจาก NgRx) |
| vitest | 5.x | `ng new` ใช้เป็นตัวรัน unit test เริ่มต้น (jsdom) |
| @playwright/test | 1.65 | สำหรับ browser/component test ถ้าจำเป็น |

ค่าเริ่มต้นของ `ng new` v22 (ตรวจจากการสร้างจริง): standalone, **zoneless (ไม่มี zone.js)**, builder `@angular/build` (esbuild), **Vitest + jsdom (ไม่มี Karma)**, TypeScript ~6.0, ไม่มี `@angular/animations`

## ข้อเสนอการตัดสินใจ (ค่าเริ่มต้นที่ PM เสนอ — Senior ตรวจสอบกับ docs/โค้ดจริงใน UAM-ARC-01)
1. **Angular 22.2 + TS ~6.0 + Node 22 (CI ใช้ 22)** ใช้ค่าเริ่มต้นของ CLI: zoneless, standalone, signals, control flow ใหม่
2. **ทดสอบ**: Vitest + jsdom สำหรับ unit/component; เอา Karma ออก; สคริปต์มาตรฐาน `npm test` (watch) และ `npm run test:ci` (รันครั้งเดียว + coverage) — CI เรียก `test:ci` และ `build`
3. **UI**: PrimeNG 22 + `@primeuix/themes` — สร้าง **custom preset** (ฐาน Lara) ตั้ง primary เป็น `#2854a7` + tokens จาก `uam.css` ให้ภาพใกล้ artboard (ดีไซน์วาดบน PrimeNG 17 CSS; DOM/สไตล์ v22 ต่างกัน → "ตรง artboard" = ตรงด้วยสายตาและ token ไม่ใช่ copy CSS)
4. **Utility CSS**: PrimeFlex 4 เฉพาะที่จำเป็น ไม่เพิ่ม Tailwind
5. **State: ไม่ใช้ NgRx เลย** (ตามที่ผู้ใช้ต้องการ) — ใช้ Angular signals (`signal`/`computed`/`resource`/`httpResource`) ใน service ที่ `providedIn: 'root'` หรือระดับ route/feature; หลักการ: ข้อมูลจาก server โหลดต่อหน้า (ไม่เก็บ global cache), state ที่ต้องแชร์ข้ามหน้ามีเฉพาะ session/โปรไฟล์ผู้ใช้/สิทธิ์ และ toast/dialog; state ซับซ้อนเฉพาะที่ (เช่น โครงเมนูใน Role editor) เป็นคลาส/service ที่ทดสอบได้แบบ pure TS; ถ้าภายหลังมีเหตุจำเป็นจริงค่อยทำ ADR ใหม่
6. **Forms**: Reactive Forms (เสถียร) สำหรับ editor ทั้งหมด; ประเมิน Signal Forms ใหม่เมื่อ API เสถียรในเวอร์ชันที่ติดตั้ง
7. **โครงสร้างโค้ด (DDD-lite)**: `src/app/{core,layout,shared,access,system-catalog,identity-roles,reporting}`; interfaces ฝั่ง API อยู่ที่ `src/app/shared/interfaces/**` ตามกติกา "ใช้เฉพาะฟิลด์เดิม"; domain logic เป็น pure TS แยกจาก Angular
8. **ฟอนต์/assets**: ใช้ font-stack ที่มี Sukhumvit Set เป็นตัวแรก, ไฟล์ฟอนต์/โลโก้ใส่ใน `public/` เมื่อมีไฟล์จริง (ไม่ใช้ `/_blob/<id>`)
9. **แพ็กเกจเมเนเจอร์**: npm; ล็อกเวอร์ชันด้วย package-lock; ห้ามเพิ่ม dependency ใหม่โดยไม่ผ่าน Senior

## ผลกระทบ
- `UAM-FND-01` ต้อง**ทำใหม่** (reopen #2): แทนที่แอป Angular 17 ด้วย Angular 22 ทั้งหมด + เปลี่ยน CI เป็น Node 22 + สคริปต์ test ใหม่
- `UAM-FND-02` เปลี่ยนจาก "แปลง uam.css เป็น SCSS" เป็น "custom preset + tokens" (ขนาดเพิ่ม)
- เปลี่ยนคำสั่ง test ใน CLAUDE.md, template, skill, CI (`npm run test:ci`)
- งานที่ต้องการ payload จริง (`UAM-QA-01`, SYS/USR/ROL) บล็อกด้วยคำถามแหล่งความจริงของ payload → เพิ่ม `UAM-API-01`

## ประเด็นเปิด (ต้องให้ผู้ใช้ตัดสินใจ)
1. **แหล่งความจริงของ payload/interfaces**: ห้ามใช้โค้ดโปรเจกต์เก่า แต่ backend ไม่เปลี่ยน → ใช้ API spec/Swagger, HAR หรืออนุญาตอ่านโค้ดเก่าเป็น "เอกสารอ้างอิงอย่างเดียว"?
2. รับได้ไหมที่หน้าตา PrimeNG 22 ต่างจากต้นแบบ PrimeNG 17 เล็กน้อย (ตรงด้วย token/ภาพ ไม่ pixel-exact)
3. ~~NgRx~~ — ตัดสินแล้ว: ไม่ใช้ NgRx (ผู้ใช้ยืนยัน 2026-11-10); เหตุผลเชิงเทคนิคของ PM: แอปเป็น CRUD/list/form ต่อหน้า ไม่มี state ร่วมซับซ้อนที่ต้องมี store กลาง, boilerplate/บั๊กจาก effects/reducers มากกว่าประโยชน์
