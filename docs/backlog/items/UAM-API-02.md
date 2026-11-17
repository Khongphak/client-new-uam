---
title: "[UAM-API-02] HTTP interceptors: header/cookie, refresh token, session หมดอายุ (functional interceptors)"
labels: ["feature", "api", "P1", "wave-3"]
---

# 🔌 UAM-API-02 — HTTP interceptors: header/cookie, refresh token, session หมดอายุ (functional interceptors)

| ฟิลด์ | ค่า |
|---|---|
| Code | `UAM-API-02` |
| ประเภท | ✨ feature |
| Priority | 🟠 **P1** (score 77) |
| ⭐ Value / 🔓 Unblocks / 💪 Effort | 4 / 4 / 3 pts |
| 🌊 Wave (ลำดับการทำ) | 3 |
| 🌿 Branch | `feature/UAM-API-02-http-interceptors` (แตกจาก `develop`) |
| ⛓️ Depends on | [UAM-API-01](UAM-API-01.md), [UAM-FND-01](UAM-FND-01.md) |
| 🚧 Blocks | [UAM-AUT-01](UAM-AUT-01.md), [UAM-ERR-03](UAM-ERR-03.md) (ส่วน dialog) |

## 📝 Description
UAM-API-01 ทำ `ApiHttp` + `ApiError` แล้ว แต่ยังไม่มีส่วนที่เป็นเรื่องของ interceptor: header/cookie ของทุกคำขอ, refresh token, และการจัดการ session หมดอายุ (ตามสเปก API ข้อ 1.2, 1.4, 1.5 และ ADR-0001: functional interceptors)

## 🎯 Design reference
- Artboard: - (ไม่มี UI; ข้อความ/dialog เป็นของ UAM-ERR-03)
- ที่มาของ requirement: สัญญา API (`docs/api-contract/`) และสเปกที่ผู้ใช้ส่งให้ UAM-API-01 — ห้ามอ่านโค้ดเก่า

## ✅ Expected result
- ทุกคำขอ UAM มี `Authorization-Type: JWT`, `X-ClientId` (จาก environment config), `X-UserType`/`X-Sso-Session` (เมื่อมีค่าใน session) และ `withCredentials: true`
- `token-expired` → เรียก `POST v1/auth/refresh-token` หนึ่งครั้ง (คำขอพร้อมกันรอคิว) แล้วยิงคำขอเดิมซ้ำ; refresh ล้มเหลว → session หมดอายุ
- `session-expired` → ตั้ง flag ใน `core/session.ts` และตัดคำขอถัดไปที่ฝั่ง client จนกว่าจะ login ใหม่ (ยกเว้น logout); ส่งสัญญาณให้ UI
- retry เฉพาะ HTTP 401 สูงสุด 2 ครั้ง หน่วง 1 วินาที — **ต้องยืนยันกับ PM/ผู้ใช้ก่อนว่าจะคงไว้**
- build `demo` ยังตอบได้ปกติ (interceptor ของ demo ตอบก่อน ไม่ถูกขัด)

## 🛠️ แนวทางการแก้ไข
- functional interceptors ใน `src/app/core/` ลงทะเบียนใน `app.config.ts` ต่อจากจุดที่ DEMO-01 เพิ่ม `provideHttpClient`
- ใช้ `ApiError` ที่มีอยู่ ไม่ทำ error model ซ้ำ; ไม่แสดง dialog/toast เอง
- `clientId`/URL อยู่ใน environment config ห้ามใส่ค่าจริงใน repo
- เขียน test ก่อน: header ครบ, refresh แบบ single-flight (3 คำขอพร้อมกัน → refresh 1 ครั้ง), replay, ตัดคำขอหลัง session หมดอายุ, ไม่ retry ที่ไม่ใช่ 401

## ☑️ Acceptance criteria
- ☑️ test ตามแนวทางผ่าน `npm run test:ci`
- ☑️ `npm run build` และ `check:no-demo` ผ่าน; build `demo` ใช้งานได้และไม่เรียก host ภายนอก
- ☑️ ไม่มี secret/ข้อมูลจริง; อัปเดต `core/README.md`
- ☑️ ผ่าน lint/build/test ใน CI

> 💡 หมายเหตุ/ความเสี่ยง: สเปกไม่ระบุ header ของ `refresh-token` นอกจาก `Content-Type`/`X-ClientId` และไม่ได้อ่าน body คำตอบ (ยืนยันกับ backend จริง); การตัดคำขอหลัง session หมดอายุต้องไม่ทำให้ `v1/auth/logout` ใช้ไม่ได้ · issue: #65
