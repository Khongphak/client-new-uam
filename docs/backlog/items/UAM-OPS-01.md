---
title: "[UAM-OPS-01] Deploy พรีวิวบน Vercel (URL ต่อ PR) + ตั้งค่า SPA"
labels: ["chore", "ops", "P1", "wave-2"]
---

# 🚀 UAM-OPS-01 — Deploy พรีวิวบน Vercel (URL ต่อ PR) + ตั้งค่า SPA

| ฟิลด์ | ค่า |
|---|---|
| Code | `UAM-OPS-01` |
| ประเภท | 🧹 chore |
| Priority | 🟠 **P1** (score 78) |
| ⭐ Value / 🔓 Unblocks / 💪 Effort | 4 / 4 / 2 pts |
| 🌊 Wave (ลำดับการทำ) | 2 |
| 🌿 Branch | `chore/UAM-OPS-01-vercel-preview` (แตกจาก `develop`) |
| ⛓️ Depends on | [UAM-FND-01](UAM-FND-01.md) |
| 🚧 Blocks | — (ช่วยรีวิวหน้าตาของทุกงาน UI) |

## 📝 Description
ให้ผู้ใช้ดู UI ผ่านเว็บได้โดยไม่ต้องรันในเครื่อง: ทุก PR ได้ URL พรีวิวบน Vercel และ `develop` ได้ URL ถาวรหนึ่งอัน ฝั่ง repo ทำ `vercel.json` และสคริปต์/เอกสาร ส่วน**การผูก repo กับบัญชี Vercel ผู้ใช้ทำเอง** (ตอนเปิดงานนี้ยังไม่ได้เชื่อม)

## 🎯 Design reference
- Artboard: -
- ที่มาของ requirement (ชื่อ path ของระบบเดิม — **อ้างอิงที่มาเท่านั้น ห้ามอ่าน/คัดลอก/ยึดโครงสร้างตาม** ดู CLAUDE.md §1 ข้อ 2): คำสั่งผู้ใช้ 2026-11-14 (ต้องการดูผ่าน Vercel; ทุกอย่างเป็น mock ก่อน)

## 🐞 Actual result (ปัจจุบัน)
repo ไม่มี `vercel.json` และยังไม่ได้ผูกกับ Vercel; แอปเป็นหน้า placeholder เดียว

## ✅ Expected result
เปิด URL พรีวิวของ PR แล้วเห็นแอปที่ build จาก PR นั้น; เข้า URL ลึก (เช่น `/setting`) หรือรีเฟรชแล้วไม่ขึ้น 404 ของ Vercel (SPA rewrite); พรีวิวไม่เรียก backend จริง

## 🛠️ แนวทางการแก้ไข
- เพิ่ม `vercel.json`: `outputDirectory` ชี้โฟลเดอร์ผลลัพธ์ของ `ng build` (**ยืนยันจากการรัน build จริง** ว่าอยู่ที่ใด เช่น `dist/client-new-uam/browser`), `rewrites` ส่งทุก path ที่ไม่ใช่ไฟล์ไป `/index.html`, `installCommand: npm ci`
- Node ใช้ตาม `.nvmrc` / `engines` (22); **ห้ามใช้ `--legacy-peer-deps`**; lockfile สร้างด้วย npm 11 ตาม ADR-0001 (ช)
- ช่วงแรกใช้ `buildCommand: npm run build` (แอปเป็น placeholder); เมื่อ [UAM-DEMO-01](UAM-DEMO-01.md) เสร็จให้เปลี่ยนเป็น `npm run build:demo`
- ห้ามใส่ secret/ตัวแปรสภาพแวดล้อมที่เป็นความลับ; พรีวิวต้องไม่ชี้ไป API จริงของบริษัท
- เขียนขั้นตอนฝั่งผู้ใช้ใน `docs/workflow/` (หรือ README): ผูก repo กับ Vercel, เลือก framework preset "Other", ตรวจ **Deployment Protection (Vercel Authentication) ของ Preview ต้องเปิด** เพราะ repo นี้ public — URL พรีวิวจะเปิดได้โดยทุกคนที่มีลิงก์ถ้าไม่เปิด
- ไม่ทำให้ CI `build-test` เปลี่ยนชื่อหรือเงื่อนไข (ruleset บังคับ)

## ☑️ Acceptance criteria
- ☑️ `vercel.json` มีและ build บน Vercel ผ่านจาก PR จริง (แนบลิงก์พรีวิว)
- ☑️ รีเฟรชที่ path ลึกแล้วไม่ 404
- ☑️ พรีวิวไม่มี network call ไป host ภายนอก/ภายในบริษัท (ตรวจแท็บ Network)
- ☑️ มีเอกสารขั้นตอนฝั่งผู้ใช้ รวมการเปิด Deployment Protection
- ☑️ ไม่มี secret ใน repo; CI `build-test` ยังเขียว

> 💡 หมายเหตุ: ผู้ใช้ต้องผูก repo กับ Vercel เอง (ยังไม่ได้ทำ) agent ทำได้แค่ฝั่ง repo — ถ้า agent ติดเพราะต้องการสิทธิ์บัญชี Vercel ให้ comment ที่ issue แล้วรอ
