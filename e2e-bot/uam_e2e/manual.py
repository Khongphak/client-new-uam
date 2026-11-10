"""สร้างร่างคู่มือผู้ใช้จาก screenshot ของเคสที่ผ่าน (เคสที่มี `manual:` ใน YAML)"""
from __future__ import annotations
import shutil, collections
from pathlib import Path


def build(data, out: Path):
    md = out / "manual"
    img = md / "images"
    img.mkdir(parents=True, exist_ok=True)
    secs = collections.OrderedDict()
    for r in data["results"]:
        if r["status"] != "passed" or not r.get("manual") or not r.get("shots"):
            continue
        secs.setdefault(r["manual"].get("section", "ทั่วไป"), []).append(r)
    L = ["# 📖 ร่างคู่มือผู้ใช้ (สร้างอัตโนมัติจาก E2E)", "",
         "> ภาพมาจากการรันจริง — ตรวจ/ปรับถ้อยคำก่อนเผยแพร่ ถ้าหน้าจอเปลี่ยนให้รันบอทใหม่แล้ว build ซ้ำ", ""]
    for sec, rs in secs.items():
        L += [f"## {sec}", ""]
        for r in rs:
            m = r["manual"]
            L += [f"### {m.get('title', r['title'])} ({r['viewport']})", ""]
            if m.get("intro"): L += [m["intro"], ""]
            if r.get("role"): L += [f"_สิทธิ์ที่ใช้: {r['role']}_", ""]
            for i, s in enumerate(r["shots"], 1):
                src = out / "screenshots" / r["id"] / r["viewport"] / s["file"]
                dst = f"{r['id']}-{r['viewport']}-{s['file']}"
                shutil.copy(src, img / dst)
                L += [f"{i}. {s['caption']}", "", f"   ![{s['caption']}](images/{dst})", ""]
    (md / "MANUAL.md").write_text("\n".join(L) + "\n", encoding="utf-8")
    return md / "MANUAL.md"
