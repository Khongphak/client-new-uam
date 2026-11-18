# layout

โครงหน้าของแอป

- `shell/` — topbar 70px + sidebar 250px (drawer ต่ำกว่า 768px) เมนูกรองตาม role (`shell-menu.ts`); โปรไฟล์ผู้ใช้มาจาก token `SHELL_PROFILE` (ค่าเริ่มต้น = ไม่มีผู้ใช้ จนกว่า UAM-AUT-01 จะ provide)
- `placeholder-page` — หน้าชั่วคราวที่ route `/` (lazy) จนกว่าจะมีหน้าจริง
