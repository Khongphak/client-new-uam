from __future__ import annotations
import json, os, time, traceback, datetime
from pathlib import Path
from playwright.sync_api import sync_playwright
from .models import VIEWPORTS, Case
from .actions import Ctx, run_step, sel, expand, StepError


class Collector:
    """เก็บสัญญาณผิดปกติระหว่างรัน: console error, JS exception, HTTP 5xx, request fail"""
    def __init__(self, page):
        self.console, self.page_errors, self.http5xx, self.req_failed = [], [], [], []
        page.on("console", lambda m: self.console.append(m.text) if m.type == "error" else None)
        page.on("pageerror", lambda e: self.page_errors.append(str(e)))
        page.on("response", lambda r: self.http5xx.append(f"{r.status} {r.url}") if r.status >= 500 else None)
        page.on("requestfailed", lambda r: self.req_failed.append(f"{r.url} :: {r.failure}"))

    def dump(self):
        return {"console_errors": self.console[:20], "page_errors": self.page_errors[:20],
                "http_5xx": self.http5xx[:20], "request_failed": self.req_failed[:20]}


class Runner:
    def __init__(self, cfg: dict, out: Path, base_url: str, headless=True, retries=1,
                 trace=True, shots_all=False, hires=False, viewports=None):
        self.cfg, self.out, self.base_url = cfg, out, base_url.rstrip("/")
        self.headless, self.retries, self.trace = headless, retries, trace
        self.shots_all, self.hires, self.only_vps = shots_all, hires, viewports
        self.timeout = int(cfg.get("timeout_ms", 8000))
        self.auth_states: dict[str, str | None] = {}
        self.results: list[dict] = []

    # ---------- browser ----------
    def _launch(self, pw):
        exe = os.environ.get("UAM_CHROMIUM") or self.cfg.get("chromium_path")
        kw = {"headless": self.headless, "args": ["--no-sandbox"]}
        if exe:
            kw["executable_path"] = exe
        return pw.chromium.launch(**kw)

    def _ctx_args(self, vp: str):
        a = dict(VIEWPORTS[vp])
        a["device_scale_factor"] = 2 if self.hires else 1
        a["locale"] = self.cfg.get("locale", "th-TH")
        return a

    # ---------- login ----------
    def _login_state(self, browser, role: str, vp: str):
        key = f"{role}-{vp}"
        if key in self.auth_states:
            return self.auth_states[key]
        a = self.cfg.get("auth", {})
        r = (a.get("roles") or {}).get(role)
        if not r:
            self.auth_states[key] = None
            raise StepError(f"ไม่มี config auth.roles.{role}")
        user, pw_ = os.environ.get(r["user_env"]), os.environ.get(r["pass_env"])
        if not user or not pw_:
            raise StepError(f"ไม่ได้ตั้ง env {r['user_env']}/{r['pass_env']}")
        ctx = browser.new_context(**self._ctx_args(vp))
        page = ctx.new_page()
        page.set_default_timeout(self.timeout)
        try:
            page.goto(self.base_url + a.get("login_path", "/login"), wait_until="domcontentloaded")
            page.locator(sel(a["username"])).first.fill(user)
            page.locator(sel(a["password"])).first.fill(pw_)
            page.locator(sel(a["submit"])).first.click()
            page.wait_for_url(__import__("re").compile(a.get("success_url_regex", ".*")), timeout=self.timeout)
            if a.get("consent_url_regex") and __import__("re").search(a["consent_url_regex"], page.url):
                for s in a.get("consent_steps", []):
                    page.locator(sel(s)).first.click()
                page.wait_for_url(__import__("re").compile(a.get("after_consent_regex", ".*")), timeout=self.timeout)
            p = self.out / ".auth" / f"{key}.json"
            p.parent.mkdir(parents=True, exist_ok=True)
            ctx.storage_state(path=str(p))
            self.auth_states[key] = str(p)
        finally:
            ctx.close()
        return self.auth_states[key]

    # ---------- one case ----------
    def _attempt(self, browser, case: Case, vp: str, shots_dir: Path):
        rec = {"steps": [], "shots": [], "collector": {}}
        state = None
        if case.role:
            state = self._login_state(browser, case.role, vp)
        args = self._ctx_args(vp)
        if state:
            args["storage_state"] = state
        ctx = browser.new_context(**args)
        if self.trace:
            ctx.tracing.start(screenshots=True, snapshots=True)
        page = ctx.new_page()
        page.set_default_timeout(self.timeout)
        col = Collector(page)
        c = Ctx(page, self.base_url, shots_dir, self.timeout, self.shots_all)
        err = None
        try:
            for i, st in enumerate(case.steps, 1):
                t0 = time.time()
                name = next(k for k in st if k not in ("caption", "timeout", "optional"))
                try:
                    run_step(c, st)
                    rec["steps"].append({"n": i, "action": name, "status": "passed", "ms": int((time.time() - t0) * 1000)})
                except Exception as e:
                    rec["steps"].append({"n": i, "action": name, "status": "failed", "ms": int((time.time() - t0) * 1000), "error": _short(e)})
                    err = {"step": i, "action": name, "raw": str(st), "message": _short(e), "url": page.url}
                    try:
                        c.shot("FAILED", f"ล้มเหลวที่ step {i} ({name})")
                        err["screenshot"] = c.shots[-1]["file"]
                    except Exception:
                        pass
                    break
        finally:
            rec["shots"], rec["collector"] = c.shots, col.dump()
            if self.trace and err:
                tp = shots_dir / "trace.zip"
                ctx.tracing.stop(path=str(tp))
                err["trace"] = tp.name
            elif self.trace:
                ctx.tracing.stop()
            ctx.close()
        rec["error"] = err
        return rec

    def run(self, cases: list[Case]):
        self.out.mkdir(parents=True, exist_ok=True)
        status = {}
        with sync_playwright() as pw:
            browser = self._launch(pw)
            try:
                for case in cases:
                    for vp in case.viewports:
                        if self.only_vps and vp not in self.only_vps:
                            continue
                        r = self._run_case(browser, case, vp, status)
                        status[(case.id, vp)] = r["status"]
                        self.results.append(r)
                        _print(r)
            finally:
                browser.close()
        return self.results

    def _run_case(self, browser, case: Case, vp: str, status: dict):
        base = {"id": case.id, "title": case.title, "viewport": vp, "backlog": case.backlog,
                "severity": case.severity, "role": case.role, "epic": case.epic, "manual": case.manual,
                "selftest_expect": case.selftest_expect, "attempts": 0, "flaky": False, "steps_total": len(case.steps)}
        missing = [e for e in case.requires_env if not os.environ.get(e)]
        if missing:
            return {**base, "status": "skipped", "reason": f"ไม่ได้ตั้ง env: {', '.join(missing)}"}
        for d in case.depends_on:
            if status.get((d, vp)) not in ("passed", None):
                return {**base, "status": "blocked", "reason": f"ขึ้นกับ {d} ซึ่งสถานะ {status.get((d, vp))}"}
        shots_dir = self.out / "screenshots" / case.id / vp
        if shots_dir.exists():
            for f in shots_dir.glob("*"):
                if f.is_file(): f.unlink()
        t0 = time.time()
        last, rec = None, None
        try:
            for attempt in range(1, self.retries + 2):
                rec = self._attempt(browser, case, vp, shots_dir)
                rec["attempt"] = attempt
                if not rec["error"]:
                    base["attempts"], base["flaky"] = attempt, attempt > 1
                    if attempt > 1:
                        base["first_error"] = last["error"]
                    return {**base, "status": "passed", "ms": int((time.time() - t0) * 1000), **rec}
                last = rec
            base["attempts"] = self.retries + 1
            return {**base, "status": "failed", "ms": int((time.time() - t0) * 1000), **last}
        except StepError as e:   # login/ตั้งค่าไม่ได้
            return {**base, "status": "blocked", "reason": f"เตรียมผู้ใช้ไม่ได้: {e}"}
        except Exception as e:
            return {**base, "status": "error", "reason": _short(e), "trace": traceback.format_exc()[-800:]}

    def save(self):
        data = {"generated_at": datetime.datetime.now().isoformat(timespec="seconds"),
                "base_url": self.base_url, "results": self.results}
        (self.out / "results.json").write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
        return data


def _short(e) -> str:
    s = str(e).strip().splitlines()
    return " | ".join(x.strip() for x in s[:3])[:400]


ICON = {"passed": "✅", "failed": "❌", "skipped": "⏭️", "blocked": "🚧", "error": "💥"}


def _print(r):
    extra = f" — {r.get('reason') or (r.get('error') or {}).get('message', '')}" if r["status"] != "passed" else (" (flaky)" if r["flaky"] else "")
    print(f"{ICON[r['status']]} {r['id']} [{r['viewport']}] {r['title']}{extra}", flush=True)
