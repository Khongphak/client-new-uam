# shared

คอมโพเนนต์/validator/helper ที่ใช้ร่วมหลาย feature (ไม่มี state ของแอป)

- `interfaces/` — type ของ request/response ตามสัญญา backend (UAM-API-01) เป็นแหล่งเดียวของฟิลด์ที่ใช้ได้ (CLAUDE.md §1 ข้อ 1)
- `table/` — ตารางรูปแบบเดียวทุกหน้า (UAM-FND-05): `createTableView()` (ค้นหา/กรอง/แบ่งหน้าฝั่งหน้าบ้านจากแถวที่โหลดแล้ว ด้วย signals), `<u-table-toolbar>` (ค้นหา + Filters + Reset + แผง dropdown), `<u-table-footer>` ("Showing X to Y of Z entries" + paginator)
- `detail/` — ชิ้นส่วนหน้า detail (UAM-FND-06): `<u-facts>` (`cols`/`prose`), `<u-stats>` + `countMenuStats()` (คำนวณจากโครงเมนูหน้าบ้าน), `<u-approvers>` (ชื่ออย่างเดียว 3 ช่อง), `<u-meta-ico>`, `<u-accordion>`, `<u-group-head>`, `<u-perm-row>`, `<u-sys-grid>` + `a/div[uSysCard]`
