# core

ของที่ใช้ร่วมทั้งแอปและมีได้ชุดเดียว: session/สิทธิ์ (`session.ts`), toast/confirm wrapper (`notify.ts`), interceptor, guard, error model กลาง — ดู ADR-0001 › แพตเทิร์นทุกชั้น

## HTTP interceptors (UAM-API-02)

`api/api-interceptors.ts` — functional interceptors ลงทะเบียนใน `app.config.ts` ต่อจาก interceptor ของ demo (build `demo` จึงตอบก่อนและไม่ถูกขัด):

1. `headersInterceptor` — `Authorization-Type: JWT`, `X-ClientId` (token `CLIENT_ID` มาจาก environment, ค่าเริ่มต้นว่าง), `X-UserType`/`X-Sso-Session` เมื่อ `Session` มีค่า, `withCredentials: true`
2. `sessionInterceptor` — result code 40102 หรือ auth error กลุ่มต้องล็อกอินใหม่ ตั้ง `Session.expired`; ระหว่างนั้นทุกคำขอยกเว้น `v1/auth/logout` และ `v1/auth/login` ล้มที่ฝั่ง client ด้วย `session-expired` จน `Session.signIn()`/`clear()` UI (UAM-ERR-03) อ่าน signal `Session.expired`; ที่นี่ไม่แสดง dialog
3. `refreshInterceptor` — `token-expired` → เรียก `POST v1/auth/refresh-token` ครั้งเดียวร่วมกัน (`TokenRefresher`; คำขอพร้อมกันรอตัวเดียวกัน) แล้วยิงคำขอเดิมซ้ำหนึ่งครั้ง; refresh ล้มหรือยิงซ้ำแล้วยังหมดอายุ = session หมดอายุ

4. `retry401Interceptor` — HTTP 401 ที่ไม่มี `errorCode` ลองใหม่สูงสุด 2 ครั้ง หน่วง 1 วินาที (401 ที่ระบุเหตุผลไม่ retry เพราะไปทาง refresh/login ใหม่; login และ refresh-token ไม่ retry) หลังหมดโควตา = session หมดอายุตามปกติ

## Dialog ของ HTTP error (UAM-ERR-03)

`api/http-error-dialog.ts` — `errorDialogInterceptor` (อยู่นอกสุดของ `apiInterceptors`) แค่**สังเกต** ไม่เปลี่ยนผลลัพธ์ที่ caller ได้ และไม่แตะ logic retry/refresh/logout: network (status 0) และ server (envelope 50000–50002 หรือ HTTP 5xx) ถูกเก็บใน `HttpErrorDialogState` (ชุดเดียว — ถ้ามี dialog เปิดอยู่ error ถัดไปถูกทิ้ง จึงไม่ซ้อน); คำขอที่แสดง error เองใส่ `HttpContext` `SKIP_ERROR_DIALOG` (เช่น แถบ error ใน drawer ตาม UAM-DSN-01) · `api/http-error-dialogs.ts` — `<u-http-error-dialogs />` ติดที่ `app.html` ครั้งเดียว ใช้ `u-dialog`; session หมดอายุอ่านจาก `Session.expired` (ชนะ dialog อื่น) ปุ่ม **Log in again** = `Session.clear()` + ไป `/login`; **Try again** ของ network/server = โหลดหน้าใหม่ (interceptor ไม่เก็บ request ที่ล้ม)
