---
title: "[UAM-DEMO-03] Demo จำลอง error ผ่าน interceptor chain เดียวกับของจริง (?demo=50001/session/network)"
labels: ["feature", "demo", "P2", "wave-5"]
---

# 🎭 UAM-DEMO-03 — Demo จำลอง error ผ่าน interceptor chain เดียวกับของจริง

| ฟิลด์ | ค่า |
|---|---|
| Code | `UAM-DEMO-03` |
| ประเภท | ✨ feature |
| Priority | 🟡 **P2** (score 67) |
| ⭐ Value / 🔓 Unblocks / 💪 Effort | 3 / 4 / 3 pts |
| 🌊 Wave (ลำดับการทำ) | 5 |
| 🌿 Branch | `feature/UAM-DEMO-03-demo-errors-through-chain` (แตกจาก `develop`) |
| ⛓️ Depends on | [UAM-DEMO-01](UAM-DEMO-01.md), [UAM-API-02](UAM-API-02.md), [UAM-ERR-03](UAM-ERR-03.md) |
| 🚧 Blocks | — (ทำให้ QA ทดสอบ TC-ERR-002/003/004 บน demo build ได้) |
| 👤 Role | `role:senior` (แตะลำดับ interceptor ทั้งแอป อาจกระทบ test เดิม) |

## 📝 Description
พบจากการรีวิว PR #94 (UAM-ERR-03): ค่าจำลองความล้มเหลวของโหมด demo (UAM-DEMO-01) ตอบ**ก่อน**ถึง interceptor จริง จึงไม่เกิด dialog ของ UAM-ERR-03 และจำลอง network error ไม่ได้ ต้องให้ demo ตอบ*ภายใน* chain เดียวกับที่ production ใช้

## 🎯 Design reference
- ไม่มี artboard ใหม่ (ใช้ DlgSession / DlgNetwork / DlgServer ของ UAM-ERR-03)
- ที่มา: รีวิว PR #94; ADR/กติกา demo ใน [UAM-DEMO-01](UAM-DEMO-01.md) (production build ต้องไม่มีโค้ด demo)

## 🐞 Actual result (ปัจจุบัน)
- `src/app/app.config.ts` ลงทะเบียน `withInterceptors([...demoHttpInterceptors, ...apiInterceptors])` → demo interceptor อยู่**นอกสุด** ตอบเองก่อนถึง `errorDialogInterceptor` / `sessionInterceptor`
- `?demo=50001` และ `?demo=session` ไม่เปิด dialog ของ UAM-ERR-03 (ยืนยันบน demo build แล้วตอนรีวิว PR #94)
- ไม่มีค่าจำลอง network error (status 0)

## ✅ Expected result
- บน demo build: `?demo=50001` (และ 50000/50002) → dialog server ของ ERR-03; `?demo=session` → dialog session หมดอายุ → logout ไป `/login`; ค่าจำลองใหม่สำหรับ network (status 0) → dialog network
- production build ยังไม่มีโค้ด demo (`npm run check:no-demo` ผ่าน)
- พฤติกรรม retry / refresh / logout ของ interceptor จริงไม่เปลี่ยน

## 🛠️ แนวทางการแก้ไข
- ให้ demo ตอบ*ภายใน* chain เช่น วาง demo interceptor เป็นตัว**สุดท้าย**ต่อจาก `apiInterceptors` (แทน backend) หรือให้ demo ส่ง error เป็น `HttpErrorResponse`/ซองคำตอบที่ chain เห็นตามจริง — Senior เลือกแนวทาง
- เพิ่มค่าจำลอง network (status 0) ในชุดค่า `?demo=` (ชื่อค่าให้ Senior กำหนด แล้วบันทึกใน README/คู่มือ demo)
- ⚠️ ลำดับ interceptor อาจกระทบ test เดิม (demo-api / demo-clients / api-interceptors) — ห้ามปิดหรือแก้ test ให้ผ่าน ถ้า test เดิมขัดกับพฤติกรรมใหม่ให้อธิบายใน PR
- ห้ามเปลี่ยน payload / ฟิลด์ (ใช้เฉพาะ `shared/interfaces/**`)

## ☑️ Acceptance criteria
- ☑️ unit/integration test: `?demo=50001` ทำให้ `HttpErrorDialogState.current()` เป็นชนิด server
- ☑️ unit/integration test: `?demo=session` ทำให้ `Session.expired()` เป็น `true`
- ☑️ unit test: ค่าจำลอง network ทำให้ dialog ชนิด network
- ☑️ `npm run build` + `npm run check:no-demo` ผ่าน (production ไม่มีโค้ด demo)
- ☑️ test เดิมของ interceptor/demo ผ่านโดยไม่ถูกปิดหรือแก้ให้ผ่าน
- ☑️ TC-ERR-007 ผ่านบน demo build (desktop)
- ☑️ ผ่าน lint/build/test ใน CI

> 💡 หมายเหตุ: ช่อง "Actual result" มาจากการรีวิว PR #94 บนโค้ดใน repo นี้ (ไม่ใช่โค้ดเก่า) — **ห้ามเปิดอ่านโค้ดเก่า** ถ้าไม่ชัดให้ถาม PM
