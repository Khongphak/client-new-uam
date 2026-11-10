from __future__ import annotations
import argparse, sys, json, threading, http.server, socketserver, functools
from pathlib import Path
from .models import load_config, load_cases, filter_cases
from .runner import Runner
from . import triage as T, report as R, manual as M

ROOT = Path(__file__).resolve().parents[1]


def _finish(runner, out, status_file):
    data = runner.save()
    tri = T.triage(data["results"], T.load_status(status_file))
    drafts = T.write_drafts(tri, out)
    R.write_markdown(data, tri, out)
    R.write_html(data, tri, out)
    mp = M.build(data, out)
    (out / "triage.json").write_text(json.dumps([{k: v for k, v in t.items() if k != "result"} for t in tri], ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\n📁 {out}\n  report.html / report.md / results.json / triage.json\n  issues/ ({len(drafts)} ร่าง) · manual/MANUAL.md")
    bad = [r for r in data["results"] if r["status"] in ("failed", "error")]
    return data, bad


def cmd_run(a):
    cfg = load_config(a.config)
    cases = load_cases(a.cases)
    cases = filter_cases(cases, a.id, a.backlog, a.tag, a.epic)
    if not cases:
        print("ไม่พบ case ตามเงื่อนไข"); return 2
    out = Path(a.out)
    base = a.base_url or cfg.get("base_url", "http://localhost:4200")
    r = Runner(cfg, out, base, headless=not a.headed, retries=a.retries, trace=not a.no_trace,
               shots_all=a.shots_all, hires=a.hires, viewports=a.viewport)
    print(f"▶ {len(cases)} case → {base}")
    r.run(cases)
    _, bad = _finish(r, out, a.backlog_status)
    return 1 if bad else 0


def cmd_list(a):
    for c in load_cases(a.cases):
        print(f"{c.id:18} {','.join(c.viewports):14} {c.role or '-':10} {','.join(c.backlog):22} {c.title}")
    return 0


def cmd_selftest(a):
    app = ROOT / "selftest" / "app"
    class H(http.server.SimpleHTTPRequestHandler):
        def do_GET(self):
            if self.path.startswith("/api/fail"):
                self.send_response(500); self.send_header("Content-Type", "application/json"); self.end_headers()
                self.wfile.write(b'{"RESULT_CODE":50000}'); return
            return super().do_GET()
        def log_message(self, *x): pass
    socketserver.TCPServer.allow_reuse_address = True
    srv = socketserver.TCPServer(("127.0.0.1", 0), functools.partial(H, directory=str(app)))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    base = f"http://127.0.0.1:{srv.server_address[1]}"
    cfg = load_config(ROOT / "selftest" / "config.yaml")
    cases = load_cases([str(ROOT / "selftest" / "cases")])
    out = Path(a.out)
    import os
    os.environ.setdefault("DEMO_USER", "demo"); os.environ.setdefault("DEMO_PASS", "demo")
    r = Runner(cfg, out, base, retries=0)
    r.run(cases)
    srv.shutdown()
    _finish(r, out, None)
    wrong = [(x["id"], x["viewport"], x["status"], x["selftest_expect"]) for x in r.results if x["selftest_expect"] and x["status"] != x["selftest_expect"]]
    if wrong:
        print("❌ selftest ไม่ตรงที่คาด:", wrong); return 1
    print("✅ selftest ผ่าน (บอททำงานครบ: pass/fail/triage/manual)")
    return 0


def main(argv=None):
    p = argparse.ArgumentParser(prog="uam_e2e")
    sp = p.add_subparsers(dest="cmd", required=True)
    r = sp.add_parser("run", help="รัน E2E ทุก case แล้วสร้างรายงาน/ร่าง issue/ร่างคู่มือ")
    r.add_argument("--config", default=str(ROOT / "config.yaml"))
    r.add_argument("--cases", nargs="+", default=[str(ROOT / "cases")])
    r.add_argument("--base-url"); r.add_argument("--out", default=str(ROOT / "output"))
    r.add_argument("--id", nargs="*", help="regex ของ case id"); r.add_argument("--backlog", nargs="*")
    r.add_argument("--tag", nargs="*"); r.add_argument("--epic", nargs="*")
    r.add_argument("--viewport", nargs="*", choices=["desktop", "phone"])
    r.add_argument("--retries", type=int, default=1, help="จำนวน retry (ใช้ตรวจ flaky)")
    r.add_argument("--backlog-status", default=str(ROOT.parent / "docs/backlog/status.json"), help='JSON {"UAM-SYS-02":"done|doing|todo"}')
    r.add_argument("--headed", action="store_true"); r.add_argument("--no-trace", action="store_true")
    r.add_argument("--shots-all", action="store_true", help="แคปทุก action (เก็บภาพทำคู่มือ)")
    r.add_argument("--hires", action="store_true", help="device scale 2 (ภาพคม สำหรับคู่มือ)")
    r.set_defaults(fn=cmd_run)
    l = sp.add_parser("list", help="แสดง case ทั้งหมด"); l.add_argument("--cases", nargs="+", default=[str(ROOT / "cases")]); l.set_defaults(fn=cmd_list)
    s = sp.add_parser("selftest", help="ทดสอบตัวบอทกับแอปจำลองในเครื่อง"); s.add_argument("--out", default=str(ROOT / "output-selftest")); s.set_defaults(fn=cmd_selftest)
    a = p.parse_args(argv)
    sys.exit(a.fn(a))
