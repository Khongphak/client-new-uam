// Builds docs/backlog/status.json from GitHub issue labels (pure: no network, no token).
// Usage: gh issue list --state all --limit 200 --json number,state,stateReason,labels | node scripts/gen-status.mjs [--check]
//        node scripts/gen-status.mjs issues.json [--check]
// --check: do not write; exit 1 if labels disagree with issue state.
import { readFileSync, writeFileSync } from 'node:fs';

const LABEL_TO_STATUS = {
  'status:done': 'done',
  'status:qa': 'done',
  'status:in-progress': 'doing',
  'status:in-review': 'doing',
  'status:backlog': 'todo',
  'status:ready': 'todo',
  'status:blocked': 'todo',
};

const labelNames = (labels = []) => labels.map((l) => (typeof l === 'string' ? l : l?.name)).filter(Boolean);

/** @returns {{status: Record<string,string>, warnings: string[], mismatches: string[]}} */
export function buildStatus(issues, issueMap) {
  const byNumber = new Map(issues.map((i) => [i.number, i]));
  const status = {};
  const warnings = [];
  const mismatches = [];
  const mismatch = (msg) => {
    warnings.push(msg);
    mismatches.push(msg);
  };

  for (const [code, number] of Object.entries(issueMap)) {
    const issue = byNumber.get(number);
    if (!issue) {
      warnings.push(`${code}: ไม่พบ issue #${number} ในข้อมูลที่ให้ -> todo`);
      status[code] = 'todo';
      continue;
    }
    const known = [...new Set(labelNames(issue.labels).filter((n) => n.startsWith('status:')))];
    const closed = String(issue.state).toUpperCase() === 'CLOSED';
    const reason = String(issue.stateReason ?? '').toUpperCase();
    let fromLabel = 'todo';

    if (known.length === 0) mismatch(`${code} (#${number}): ไม่มี label status:* -> todo`);
    else if (known.length > 1) mismatch(`${code} (#${number}): มี label status:* หลายตัว (${known.join(', ')}) -> todo`);
    else if (!(known[0] in LABEL_TO_STATUS)) mismatch(`${code} (#${number}): label ไม่รู้จัก ${known[0]} -> todo`);
    else {
      fromLabel = LABEL_TO_STATUS[known[0]];
      if (known[0] === 'status:blocked') warnings.push(`${code} (#${number}): status:blocked`);
    }

    if (closed && reason === 'NOT_PLANNED') {
      mismatch(`${code} (#${number}): ปิดแบบ not_planned (label: ${known.join(', ') || '-'}) -> ไม่ใส่ done`);
      status[code] = fromLabel === 'done' ? 'todo' : fromLabel;
    } else if (closed && fromLabel !== 'done') {
      mismatch(`${code} (#${number}): issue ปิดแล้วแต่ label เป็น ${known.join(', ') || '-'} -> done`);
      status[code] = 'done';
    } else {
      status[code] = fromLabel;
    }
  }
  return { status, warnings, mismatches };
}

const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));

export function run({ input, mapPath, outPath, check, log = console.error }) {
  const issues = JSON.parse(readFileSync(input === '-' ? 0 : input, 'utf8'));
  const { status, warnings, mismatches } = buildStatus(issues, readJson(mapPath));
  for (const w of warnings) log(`WARN ${w}`);

  if (check) {
    log(mismatches.length ? `FAIL: label ไม่ตรง ${mismatches.length} รายการ` : 'OK: label ตรงกับสถานะ issue');
    return { exitCode: mismatches.length ? 1 : 0, status };
  }
  let comment;
  try {
    comment = readJson(outPath)._comment;
  } catch {
    comment = undefined;
  }
  const out = comment === undefined ? status : { _comment: comment, ...status };
  writeFileSync(outPath, `${JSON.stringify(out, null, 2)}\n`);
  log(`เขียน ${outPath} (${Object.keys(status).length} งาน)`);
  return { exitCode: 0, status };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  process.exitCode = run({
    input: args.find((a) => !a.startsWith('--')) ?? '-',
    mapPath: 'docs/backlog/issue-map.json',
    outPath: 'docs/backlog/status.json',
    check: args.includes('--check'),
  }).exitCode;
}
