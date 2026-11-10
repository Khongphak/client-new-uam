---
title: "[UAM-FND-04] คอมโพเนนต์ร่วมชุดสถานะ/ข้อความ (dialog, state, skeleton, toast, errpage)"
labels: ["feature", "fnd", "P0", "wave-3"]
---

# 🧱 UAM-FND-04 — คอมโพเนนต์ร่วมชุดสถานะ/ข้อความ (dialog, state, skeleton, toast, errpage)

| ฟิลด์ | ค่า |
|---|---|
| Code | `UAM-FND-04` |
| ประเภท | ✨ feature |
| Priority | 🔴 **P0** (score 95) |
| ⭐ Value / 🔓 Unblocks / 💪 Effort | 5 / 5 / 5 pts |
| 🌊 Wave (ลำดับการทำ) | 3 |
| 🌿 Branch | `feature/UAM-FND-04-shared-ui-feedback` (แตกจาก `develop`) |
| ⛓️ Depends on | [UAM-FND-02](UAM-FND-02.md) |
| 🚧 Blocks | [UAM-ERR-01](UAM-ERR-01.md), [UAM-ERR-02](UAM-ERR-02.md), [UAM-ERR-03](UAM-ERR-03.md), [UAM-ERR-04](UAM-ERR-04.md), [UAM-ERR-05](UAM-ERR-05.md), [UAM-AUT-02](UAM-AUT-02.md), [UAM-HOM-02](UAM-HOM-02.md), [UAM-RPT-02](UAM-RPT-02.md) |

## 📝 Description
ทำ `u-dialog*` (โครงเดียว: ไอคอน, หัวข้อ, หนึ่งย่อหน้า, แถวรายละเอียดถ้ามี, ปุ่มชิดขวา), `u-state` (loading/empty/error) + `u-skel`, `u-toast`, `u-errpage` เป็นชิ้นส่วนใช้ซ้ำ ข้อความมาจาก `modal.data.ts`

## 🎯 Design reference
- Artboard: Err404, Err403, DlgSession/Network/Server/DeleteConfirm/DeleteFail, HomeLoading/Empty/Error, UsersLoading/Error/Empty, ReportFail
- Source เดิม (`client-uam-develop`, path ใต้ `src/app/`): `shared/constants/modal.data.ts`, `interceptor/http-error-handler.service.ts`

## 🐞 Actual result (ปัจจุบัน)
dialog/ข้อความแต่ละที่มีหน้าตาไม่เหมือนกัน; Report ดาวน์โหลดล้มเหลวแค่ `console.error`

## ✅ Expected result
มี wrapper เดียวสำหรับ dialog ยืนยัน/ผิดพลาด และ state ของรายการ ข้อความจริงมาจาก `modal.data.ts` หรือ server

## 🛠️ แนวทางการแก้ไข
- ครอบ PrimeNG `p-dialog`/`p-toast` ไม่สร้างของใหม่
- รองรับ `details` แถวเดียว (เช่น รหัส RESULT_CODE)
- ข้อความตัวอย่างในดีไซน์ ("used by 42 users") ห้ามฮาร์ดโค้ด ให้ใช้ message จาก server

## ☑️ Acceptance criteria
- ☑️ โครง dialog เหมือนกันทุกกรณี
- ☑️ ตรงกับ artboard ที่อ้างถึง (desktop และ phone ถ้ามี)
- ☑️ ใช้เฉพาะฟิลด์ใน `shared/interfaces/**` ปัจจุบัน
- ☑️ Payload ที่ส่งหลังบ้านไม่เปลี่ยน (ผ่าน UAM-QA-01)
- ☑️ ผ่าน lint/build/test ใน CI

> 💡 หมายเหตุ: ระบุ "actual result" จากสเปก/เอกสารดีไซน์ — ให้ยืนยันกับ source เดิมตอนเริ่มทำ (session ที่ทำต้องมีสิทธิ์อ่าน `client-uam-develop`)
