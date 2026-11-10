---
title: "[UAM-SHL-03] กติกาของ route `/setting` (เด้งไปหน้าลูกแรกที่มีสิทธิ์)"
labels: ["feature", "shl", "P2", "wave-5"]
---

# 🧭 UAM-SHL-03 — กติกาของ route `/setting` (เด้งไปหน้าลูกแรกที่มีสิทธิ์)

| ฟิลด์ | ค่า |
|---|---|
| Code | `UAM-SHL-03` |
| ประเภท | ✨ feature |
| Priority | 🟡 **P2** (score 58) |
| ⭐ Value / 🔓 Unblocks / 💪 Effort | 3 / 3 / 2 pts |
| 🌊 Wave (ลำดับการทำ) | 5 |
| 🌿 Branch | `feature/UAM-SHL-03-setting-route-rule` (แตกจาก `develop`) |
| ⛓️ Depends on | [UAM-SHL-02](UAM-SHL-02.md) |
| 🚧 Blocks | — |

## 📝 Description
ดีไซน์ตัดหน้าการ์ด Setting ออก จึงต้องกำหนดว่า `/setting` ทำอะไร

## 🎯 Design reference
- Artboard: README หัวข้อสิทธิ์ตาม route (ยังไม่ตัดสินใจ)
- ที่มาของ requirement (ชื่อ path ของระบบเดิม — **อ้างอิงที่มาเท่านั้น ห้ามอ่าน/คัดลอก/ยึดโครงสร้างตาม** ดู CLAUDE.md §1 ข้อ 2): `setting-page.component.ts`, routing ของ `/setting`

## 🐞 Actual result (ปัจจุบัน)
ยังไม่มีกติกา (หน้าการ์ดเดิมถูกตัดออกจากดีไซน์)

## ✅ Expected result
แนะนำ: redirect ไปหน้าลูกแรกที่ผู้ใช้มีสิทธิ์ (DEVELOPER → `/setting/system-setting`; ADMIN/super admin → `/setting/system-setting`) และแสดง 403 ถ้าไม่มีสิทธิ์ลูกใดเลย

## 🛠️ แนวทางการแก้ไข
- **ต้องให้ผู้ใช้ยืนยันก่อนเริ่ม** (ตัวเลือก: redirect หรือคงหน้าการ์ดเดิม)
- เก็บ fragment/deep link เดิมให้ใช้ได้

## ☑️ Acceptance criteria
- ☑️ ผู้ใช้ยืนยันกติกาแล้ว
- ☑️ ตรงกับ artboard ที่อ้างถึง (desktop และ phone ถ้ามี)
- ☑️ ใช้เฉพาะฟิลด์ใน `shared/interfaces/**` ปัจจุบัน
- ☑️ Payload ที่ส่งหลังบ้านไม่เปลี่ยน (ผ่าน UAM-QA-01)
- ☑️ ผ่าน lint/build/test ใน CI

> 💡 หมายเหตุ: ช่อง "Actual result" เขียนจากสเปก/พฤติกรรมที่ระบุในเอกสารดีไซน์ ไม่ใช่จากโค้ด — ยืนยันกับแอปใหม่ใน repo นี้และสัญญา API เท่านั้น (**ห้ามเปิดอ่านโค้ดเก่า**) ถ้าไม่ชัดให้ถาม PM
