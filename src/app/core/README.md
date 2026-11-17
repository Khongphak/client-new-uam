# core

ของที่ใช้ร่วมทั้งแอปและมีได้ชุดเดียว: session/สิทธิ์ (`session.ts`), toast/confirm wrapper (`notify.ts`), interceptor, guard, error model กลาง — ดู ADR-0001 › แพตเทิร์นทุกชั้น

## HTTP interceptors (UAM-API-02)

`api/api-interceptors.ts` — functional interceptors ลงทะเบียนใน `app.config.ts` ต่อจาก interceptor ของ demo (build `demo` จึงตอบก่อนและไม่ถูกขัด):

1. `headersInterceptor` — `Authorization-Type: JWT`, `X-ClientId` (token `CLIENT_ID` มาจาก environment, ค่าเริ่มต้นว่าง), `X-UserType`/`X-Sso-Session` เมื่อ `Session` มีค่า, `withCredentials: true`
2. `sessionInterceptor` — result code 40102 หรือ auth error กลุ่มต้องล็อกอินใหม่ ตั้ง `Session.expired`; ระหว่างนั้นทุกคำขอยกเว้น `v1/auth/logout` และ `v1/auth/login` ล้มที่ฝั่ง client ด้วย `session-expired` จน `Session.signIn()`/`clear()` UI (UAM-ERR-03) อ่าน signal `Session.expired`; ที่นี่ไม่แสดง dialog
3. `refreshInterceptor` — `token-expired` → เรียก `POST v1/auth/refresh-token` ครั้งเดียวร่วมกัน (`TokenRefresher`; คำขอพร้อมกันรอตัวเดียวกัน) แล้วยิงคำขอเดิมซ้ำหนึ่งครั้ง; refresh ล้มหรือยิงซ้ำแล้วยังหมดอายุ = session หมดอายุ

ยังไม่มี retry เฉพาะ HTTP 401 (รอผู้ใช้ตัดสินใจ) — เพิ่มได้โดยเติม interceptor อีกตัวใน `apiInterceptors`
