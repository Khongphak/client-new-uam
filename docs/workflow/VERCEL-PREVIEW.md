# Vercel preview (UAM-OPS-01)

ทุก PR ได้ URL พรีวิวบน Vercel และ `develop` ได้ URL ถาวรหนึ่งอัน
ฝั่ง repo มี `vercel.json` แล้ว ส่วนการผูกบัญชี Vercel **ผู้ใช้ทำเอง** (agent ทำแทนไม่ได้)

## ค่าใน `vercel.json`
| ค่า | เหตุผล |
|---|---|
| `installCommand: npm ci` | ใช้ lockfile ตรงๆ ห้าม `--legacy-peer-deps` |
| `buildCommand: npm run build` | แอปตอนนี้เป็น placeholder; เมื่อ UAM-DEMO-01 เสร็จให้เปลี่ยนเป็น `npm run build:demo` |
| `outputDirectory: dist/client-new-uam/browser` | ยืนยันจากการรัน `ng build` จริง |
| `rewrites` → `/index.html` | SPA: เข้า/รีเฟรช path ลึก (เช่น `/setting`) แล้วไม่ 404 (Vercel เสิร์ฟไฟล์จริงก่อน แล้วค่อย rewrite) |

Node version: Vercel อ่านจาก `engines` (`^22.12.0`) ใน `package.json`

## ขั้นตอนฝั่งผู้ใช้
1. Vercel → **Add New… → Project** → เลือก repo `Khongphak/client-new-uam`
2. **Framework Preset = Other** (ค่าอื่นๆ มาจาก `vercel.json`) ห้ามใส่ Environment Variables ที่เป็นความลับ
3. **Settings → Git → Production Branch = `develop`** เพื่อให้ `develop` ได้ URL ถาวร (`main` ให้ผู้ใช้ตัดสินเองตอน deploy จริง)
4. **Settings → Deployment Protection → เปิด Vercel Authentication สำหรับ Preview** — repo นี้ public ถ้าไม่เปิด ทุกคนที่มีลิงก์ PR จะเปิดพรีวิวได้
5. เปิด PR ทดสอบ → รอ bot ของ Vercel คอมเมนต์ URL

## ตรวจหลังตั้งค่า
- เปิด URL ลึก เช่น `<preview>/setting` แล้วรีเฟรช → ต้องไม่เจอหน้า 404 ของ Vercel
- DevTools → Network: ต้องไม่มีคำขอไป host ภายนอก/ภายในบริษัท (พรีวิวต้องไม่เรียก API จริง)
- CI `build-test` ต้องยังเขียว (งานนี้ไม่แตะ workflow)
