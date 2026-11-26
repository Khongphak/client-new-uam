---
title: "[UAM-ERR-08] ตัดสินใจ: ปุ่ม Try again ของ dialog network/server ให้ replay request แทน reload หน้า (รอผู้ใช้/PM ตัดสิน)"
labels: ["design", "err", "P3", "wave-5"]
---

# 🚨 UAM-ERR-08 — ปุ่ม Try again ของ dialog network/server: replay request หรือคง reload

| ฟิลด์ | ค่า |
|---|---|
| Code | `UAM-ERR-08` |
| ประเภท | 🎨 design → ✨ feature (ถ้าตัดสินให้ทำ) |
| Priority | 🟢 **P3** (score 37) |
| ⭐ Value / 🔓 Unblocks / 💪 Effort | 3 / 1 / 3 pts |
| 🌊 Wave (ลำดับการทำ) | 5 |
| 🌿 Branch | `feature/UAM-ERR-08-retry-replays-request` (แตกจาก `develop`; ใช้เมื่อตัดสินให้ทำเท่านั้น) |
| ⛓️ Depends on | [UAM-ERR-03](UAM-ERR-03.md) + **คำตัดสินของผู้ใช้/PM** |
| 🚧 Blocks | — |
| 👤 Role | `role:pm` (ตัดสินใจ) → `role:senior` ถ้าทำ (แตะ interceptor) |

> ⛔ **ยังเริ่ม implement ไม่ได้** — ติด `status:backlog` จนกว่าผู้ใช้/PM จะตัดสินว่า "ทำ replay" หรือ "คง reload" ห้ามเปลี่ยน logic retry/refresh/logout เดิมก่อนมีคำตัดสิน (UAM-ERR-03: "เปลี่ยนเฉพาะ UI ไม่เปลี่ยน logic การ retry/logout")

## 📝 Description
พบจากการรีวิว PR #94: ปุ่ม "Try again" ใน dialog network / server ปัจจุบัน**รีโหลดทั้งหน้า** เพราะ interceptor ไม่เก็บ request ที่ล้มไว้ ผลคือข้อมูลที่ผู้ใช้กรอกค้างอยู่หาย (เช่น กำลังกรอกฟอร์มบน `/login`)

## 🎯 Design reference
- Artboard: DlgNetwork, DlgServer (ปุ่ม Try again)
- ที่มา: รีวิว PR #94

## 🐞 Actual result (ปัจจุบัน)
กด Try again → reload หน้า; ค่าที่กรอกในฟอร์มหาย

## ✅ Expected result
**ขึ้นกับคำตัดสิน:**
- ตัวเลือก A — replay: กด Try again ส่ง request ที่ล้มซ้ำ (ครั้งเดียวต่อการกด) โดยไม่รีโหลดหน้า ค่าในฟอร์มยังอยู่; ล้มอีกครั้งแสดง dialog เดิม (ไม่ซ้อน)
- ตัวเลือก B — คง reload: ไม่แก้โค้ด ปิด item นี้เป็น not planned และบันทึกเป็นพฤติกรรมที่ตั้งใจใน UAM-ERR-03 / TC-ERR-003

## 🛠️ แนวทางการแก้ไข (ถ้าเลือก A)
- interceptor เก็บ "วิธีส่งซ้ำ" ของ request ที่ล้มล่าสุดไว้ใน state ของ dialog (signals) แล้วปุ่ม Try again เรียกซ้ำผ่าน chain เดิม
- ต้องตอบให้ได้ก่อนทำ: ถ้ามีหลาย request ล้มพร้อมกันจะ replay ทั้งหมดหรือเฉพาะตัวล่าสุด; request ที่ไม่ idempotent (POST add/update) ควร replay ไหม (เสี่ยงบันทึกซ้ำ)
- ไม่เปลี่ยน payload, ไม่เปลี่ยน logic refresh token / logout ของ session

## ☑️ Acceptance criteria
- ☑️ มีคำตัดสินของผู้ใช้/PM บันทึกใน issue นี้ก่อนเริ่ม
- ☑️ (A) unit test: กด Try again ส่ง request เดิมซ้ำโดยไม่ reload; ล้มซ้ำไม่เกิด dialog ซ้อน
- ☑️ (A) TC-ERR-008 ผ่าน (desktop + phone)
- ☑️ Payload ที่ส่งหลังบ้านไม่เปลี่ยน (ผ่าน UAM-QA-01)
- ☑️ ผ่าน lint/build/test ใน CI

> 💡 หมายเหตุ: ช่อง "Actual result" มาจากการรีวิว PR #94 บนโค้ดใน repo นี้ (ไม่ใช่โค้ดเก่า) — **ห้ามเปิดอ่านโค้ดเก่า**
