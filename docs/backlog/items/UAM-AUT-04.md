---
title: "[UAM-AUT-04] Logout ไม่ล้าง session (regression จาก AUT-03): กด Logout แล้วเปิด /home ยังเข้าได้"
labels: ["bug", "aut", "P0", "wave-7"]
---

# 🚪 UAM-AUT-04 — Logout เรียก logout API + ล้าง session (regression จาก AUT-03)

> 📌 **ลงทะเบียนย้อนหลัง** — issue #114 เปิดและแก้ (PR #115 merged) ก่อนมีไฟล์นี้ ข้อมูล actual/expected อ้างจาก issue #114 และรายงาน QA (BUG-2 รอบ 2: `docs/qa/results/2026-11-26-round2.md`; ยืนยันแก้แล้วรอบ 3: `docs/qa/results/2026-11-26-round3.md`)

| ฟิลด์ | ค่า |
|---|---|
| Code | `UAM-AUT-04` |
| ประเภท | 🐞 bug |
| Priority | 🔴 **P0** (score 87 — คำนวณย้อนหลังตามสูตรใน BACKLOG.md) |
| ⭐ Value / 🔓 Unblocks / 💪 Effort | 5 / 4 / 3 pts |
| 🌊 Wave (ลำดับการทำ) | 7 (ตาม dependency; ทำจริงทันทีหลัง QA รอบ 2) |
| 🌿 Branch | `fix/UAM-AUT-04-logout-clears-session` (แตกจาก `develop`) |
| ⛓️ Depends on | [UAM-AUT-03](UAM-AUT-03.md) (#91, done) |
| 🚧 Blocks | — |
| 🔗 Issue | #114 · PR แก้ #115 (merged) · role: senior |
| 🧪 Test case | TC-AUT-010 (ใหม่), TC-AUT-007, TC-AUT-008 |

## 📝 Description
กด Logout ใน shell ต้องออกจากระบบจริง: แจ้ง backend ตามสัญญา (`POST v1/auth/logout`) และล้าง session ฝั่งหน้าบ้านทั้งหมดก่อนไป `/login`

## 🎯 Design reference
ไม่มี artboard (พฤติกรรม session/routing) — ปุ่ม Logout อยู่ใน shell

## 🐞 Actual result (ก่อนแก้ — จาก issue #114 / QA BUG-2)
กด Logout แล้วไป `/login` แต่:
- `sessionStorage['uam.session']` ยังอยู่
- ไม่มี `POST /v1/auth/logout`
- เปิด `/home` หรือ `/setting/users-setting` ใน tab เดิมแล้วเข้าได้เต็ม (demo และ production+mock, desktop และ phone)

สาเหตุที่เห็นตอนเปิด issue: Logout ใน shell เป็นลิงก์ธรรมดาไป `/login`; หลัง AUT-03 session คงข้ามการโหลดหน้า จึงไม่หายเอง (Decline ที่หน้า consent ล้าง session ถูกต้อง)

## ✅ Expected result
กด Logout → เรียก `v1/auth/logout` + ล้าง session (หน่วยความจำ + `sessionStorage`) แล้วไป `/login`; หลังนั้นเปิด `/home` หรือ route ใต้ shell ต้องกลับ `/login` (มี `returnUrl` ตามกติกา guard); ถ้า request logout ล้ม ต้องล้าง session อยู่ดี

## 🛠️ แนวทางการแก้ไข
- Logout เป็น action ผ่านที่เดียวกับ Decline (ไม่ทำซ้ำ) — ในโค้ดปัจจุบันคือ `SignOut` (`src/app/access/sign-out.ts`) ใช้ทั้งปุ่ม Logout ใน shell และ Decline ที่หน้า consent
- คำนึงถึง UAM-API-02: หลัง session หมดอายุ interceptor ตัดคำขอฝั่ง client — คำขอ logout ได้รับการยกเว้น (`LOGOUT_PATH` ใน `api-interceptors.ts`)
- ห้ามแก้หลังบ้าน/เปลี่ยน payload (`LogoutRequest`: `Username`, `ClientId`)

## ☑️ Acceptance criteria
- ☑️ unit test: Logout ล้าง session + เรียก logout API; ล้มแล้วยังล้าง session
- ☑️ TC-AUT-010: Logout แล้วเปิด /home → /login
- ☑️ ผ่านบน demo และ production+mock ทั้ง desktop และ phone
- ☑️ TC-AUT-006..009 ไม่ regress
- ☑️ CI เขียว

## 🔎 สถานะ
Merged (#115) · QA รอบ 3 ผ่าน (BUG-2 แก้แล้ว) · ผู้ใช้อนุมัติ `status:done`

## 📎 ข้อสังเกตจาก QA (ไม่ทำให้ fail — รอ PM/ผู้ใช้ตัดสิน ดู `docs/reports/daily/2026-11-26.md` รอบที่ 5)
NOTE-10 body logout ส่ง `ClientId:""` เมื่อ `CLIENT_ID` ว่างใน build ที่ทดสอบ · NOTE-11 `uam.rememberedUsername` คงอยู่หลัง Logout (ฟีเจอร์ Remember)
