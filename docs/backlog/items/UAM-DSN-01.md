---
title: "[UAM-DSN-01] ปิดช่องว่างของดีไซน์: phone ของหน้าสถานะ, error ของ drawer, ชื่อซ้ำ 40301"
labels: ["design", "dsn", "P2", "wave-0"]
---

# 🖌️ UAM-DSN-01 — ปิดช่องว่างของดีไซน์: phone ของหน้าสถานะ, error ของ drawer, ชื่อซ้ำ 40301

| ฟิลด์ | ค่า |
|---|---|
| Code | `UAM-DSN-01` |
| ประเภท | 🎨 design |
| Priority | 🟡 **P2** (score 67) |
| ⭐ Value / 🔓 Unblocks / 💪 Effort | 3 / 4 / 3 pts |
| 🌊 Wave (ลำดับการทำ) | 0 |
| 🌿 Branch | `design/UAM-DSN-01-design-gaps` (แตกจาก `develop`) |
| ⛓️ Depends on | — (เริ่มได้เลย) |
| 🚧 Blocks | [UAM-ERR-06](UAM-ERR-06.md), [UAM-RSP-02](UAM-RSP-02.md) |

## 📝 Description
ดีไซน์ยังขาด (1) หน้า phone ของหน้าสถานะ (2) สถานะ error ของ drawer ใน System Setting (3) การแสดงข้อผิดพลาดชื่อซ้ำ 40301 (ALREADY_EXISTED) ในฟอร์ม System/Role

## 🎯 Design reference
- Artboard: Err*, Dlg*, Home*/Users*, Systems (drawer)
- Source เดิม (`client-uam-develop`, path ใต้ `src/app/`): `design-spec/README.md` หัวข้อ "ช่องว่างที่ยังเปิดอยู่" ข้อ 1

## 🐞 Actual result (ปัจจุบัน)
ไม่มี artboard สำหรับกรณีเหล่านี้

## ✅ Expected result
มี artboard + note ใน `canvas.json` ครบ และอัปเดต `docs/design-spec` เพื่อให้ story ที่เกี่ยวข้องเริ่มได้

## 🛠️ แนวทางการแก้ไข
- ออกแบบใน Design canvas แล้วซิงก์ไฟล์เข้า `docs/design-spec`
- ใช้ `u-state`/`u-toast`/inline error ที่มีอยู่ก่อน

## ☑️ Acceptance criteria
- ☑️ ผู้ใช้ยืนยันดีไซน์
- ☑️ ตรงกับ artboard ที่อ้างถึง (desktop และ phone ถ้ามี)
- ☑️ ใช้เฉพาะฟิลด์ใน `shared/interfaces/**` ปัจจุบัน
- ☑️ Payload ที่ส่งหลังบ้านไม่เปลี่ยน (ผ่าน UAM-QA-01)
- ☑️ ผ่าน lint/build/test ใน CI

> 💡 หมายเหตุ: ระบุ "actual result" จากสเปก/เอกสารดีไซน์ — ให้ยืนยันกับ source เดิมตอนเริ่มทำ (session ที่ทำต้องมีสิทธิ์อ่าน `client-uam-develop`)
