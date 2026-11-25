#!/usr/bin/env node
/**
 * 词条候选池工具：查看分布 / 过滤 / 机器可读输出 / 一致性体检。
 *
 *   node scripts/backlog.mjs                 总览（按状态、按展厅、每厅缺口）
 *   node scripts/backlog.mjs --hall motion   只看某个展厅
 *   node scripts/backlog.mjs --status planned 只看某个状态
 *   node scripts/backlog.mjs --json          输出 JSON（可与过滤参数组合）
 *
 * 数据源：docs/entry-backlog.json；在册词条：扫 src/data/entries/<hall>/<slug>.ts。
 * 零依赖，只用 node 内置模块；发现问题逐条报错并以 exit 1 退出。
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BACKLOG_FILE = join(ROOT, 'docs', 'entry-backlog.json');
const ENTRIES_DIR = join(ROOT, 'src', 'data', 'entries');
const RETIRED_FILE = join(ROOT, 'src', 'data', 'retired.ts');

const HALLS = [
  ['motion', '动效'],
  ['feedback', '反馈'],
  ['layout', '布局'],
  ['visual', '视觉'],
  ['type', '字体'],
];
const SHAPES = ['stage', 'interactive', 'scroll', 'sequence', 'page'];
const STATUSES = [
  ['candidate', '候选'],
  ['triaged', '已拆解'],
  ['planned', '已排期'],
  ['shipped', '已上线'],
];
const HALL_LABEL = new Map(HALLS);
const HALL_IDS = HALLS.map(([id]) => id);
const STATUS_IDS = STATUSES.map(([id]) => id);
const STATUS_LABEL = new Map(STATUSES);
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DEFAULT_TARGET = 12;

const args = parseArgs(process.argv.slice(2));
if (args.help) {
  printHelp();
  process.exit(0);
}

const raw = readBacklog();
const items = Array.isArray(raw.items) ? raw.items : [];
const target = Number.isInteger(raw.hallTarget) && raw.hallTarget > 0 ? raw.hallTarget : DEFAULT_TARGET;
const entries = scanEntries();
const retired = scanRetired();
const problems = validate(raw, items, entries, retired);

if (problems.length > 0) {
  for (const line of problems) console.error('✗ ' + line);
  console.error('\n共 ' + problems.length + ' 处问题，先修 docs/entry-backlog.json 再继续。');
  process.exit(1);
}

const filtered = items.filter(
  (item) => (!args.hall || item.hall === args.hall) && (!args.status || item.status === args.status),
);
const stats = summarize(items, target);

if (args.json) {
  console.log(
    JSON.stringify(
      {
        version: raw.version ?? 1,
        updated: raw.updated ?? null,
        hallTarget: target,
        total: items.length,
        shown: filtered.length,
        filter: { hall: args.hall ?? null, status: args.status ?? null },
        byStatus: stats.byStatus,
        byHall: stats.byHall,
        gap: stats.gap,
        items: filtered.map((item) => ({
          slug: item.slug,
          nameZh: item.nameZh,
          nameEn: item.nameEn,
          hall: item.hall,
          shape: item.shape,
          source: item.source,
          status: item.status,
          note: item.note,
        })),
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

if (args.hall || args.status) {
  printFiltered(filtered, args);
  process.exit(0);
}

printOverview(stats, items, target, raw);

// ---------------------------------------------------------------- 参数

function parseArgs(argv) {
  const out = { hall: null, status: null, json: false, help: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--json') {
      out.json = true;
    } else if (arg === '--help' || arg === '-h') {
      out.help = true;
    } else if (arg === '--hall') {
      out.hall = nextValue(argv, (i += 1), '--hall');
    } else if (arg === '--status') {
      out.status = nextValue(argv, (i += 1), '--status');
    } else if (arg.startsWith('--hall=')) {
      out.hall = arg.slice('--hall='.length);
    } else if (arg.startsWith('--status=')) {
      out.status = arg.slice('--status='.length);
    } else {
      fail('未知参数 ' + arg + '（可用：--hall、--status、--json、--help）');
    }
  }
  if (out.hall !== null && !HALL_IDS.includes(out.hall)) {
    fail('--hall 只能是 ' + HALL_IDS.join(' / ') + '，收到「' + out.hall + '」');
  }
  if (out.status !== null && !STATUS_IDS.includes(out.status)) {
    fail('--status 只能是 ' + STATUS_IDS.join(' / ') + '，收到「' + out.status + '」');
  }
  return out;
}

function nextValue(argv, index, flag) {
  const value = argv[index];
  if (!value || value.startsWith('-')) fail(flag + ' 后面要跟一个值');
  return value;
}

function fail(message) {
  console.error('✗ ' + message);
  process.exit(1);
}

function printHelp() {
  console.log(
    [
      '用法：node scripts/backlog.mjs [--hall <id>] [--status <id>] [--json]',
      '',
      '  --hall    ' + HALL_IDS.join(' | '),
      '  --status  ' + STATUS_IDS.join(' | '),
      '  --json    输出机器可读 JSON（可与过滤参数组合）',
      '',
      '不带参数时打印总览；无论哪种模式都会先做一致性校验，有问题 exit 1。',
    ].join('\n'),
  );
}

// ---------------------------------------------------------------- 数据读取

function readBacklog() {
  if (!existsSync(BACKLOG_FILE)) fail('找不到 ' + relative(BACKLOG_FILE) + '，先创建候选池文件');
  let parsed;
  try {
    parsed = JSON.parse(readFileSync(BACKLOG_FILE, 'utf8'));
  } catch (error) {
    fail('docs/entry-backlog.json 不是合法 JSON：' + error.message);
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    fail('docs/entry-backlog.json 顶层必须是对象 { version, updated, hallTarget, items }');
  }
  return parsed;
}

/** 扫 src/data/entries/<hall>/<slug>.ts，返回 slug -> hall；不 import TS。 */
function scanEntries() {
  const found = new Map();
  if (!existsSync(ENTRIES_DIR)) return found;
  for (const hall of readdirSync(ENTRIES_DIR)) {
    if (!HALL_IDS.includes(hall)) continue;
    const dir = join(ENTRIES_DIR, hall);
    if (!statSync(dir).isDirectory()) continue;
    for (const file of readdirSync(dir)) {
      if (file.endsWith('.ts')) found.set(file.slice(0, -3), hall);
    }
  }
  return found;
}

/** 从 retired.ts 里粗读已立墓碑的 slug，避免新增词条撞上老地址。 */
function scanRetired() {
  const found = new Set();
  if (!existsSync(RETIRED_FILE)) return found;
  const text = readFileSync(RETIRED_FILE, 'utf8');
  const re = /\bslug:\s*['"]([a-z0-9-]+)['"]/g;
  let match = re.exec(text);
  while (match !== null) {
    found.add(match[1]);
    match = re.exec(text);
  }
  return found;
}

// ---------------------------------------------------------------- 校验

function validate(doc, list, existing, tombstones) {
  const problems = [];
  if (!Array.isArray(doc.items)) problems.push('缺少 items 数组');
  if (list.length === 0) problems.push('items 为空，候选池至少要有一条');
  const seen = new Set();
  list.forEach((item, index) => {
    const at = 'items[' + index + ']' + (item && item.slug ? '（' + item.slug + '）' : '');
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      problems.push(at + ' 不是对象');
      return;
    }
    const slug = item.slug;
    if (typeof slug !== 'string' || slug.trim() === '') {
      problems.push(at + ' 缺少 slug');
    } else if (!SLUG_RE.test(slug)) {
      problems.push(at + ' 的 slug「' + slug + '」不符合 kebab-case（小写字母/数字/连字符）');
    } else if (seen.has(slug)) {
      problems.push(at + ' 的 slug「' + slug + '」重复');
    } else {
      seen.add(slug);
    }
    for (const field of ['nameZh', 'nameEn', 'source', 'note']) {
      const value = item[field];
      if (typeof value !== 'string' || value.trim() === '') problems.push(at + ' 的 ' + field + ' 不能为空');
    }
    if (!HALL_IDS.includes(item.hall)) problems.push(at + ' 的 hall「' + item.hall + '」不合法（只能是 ' + HALL_IDS.join('/') + '）');
    if (!SHAPES.includes(item.shape)) problems.push(at + ' 的 shape「' + item.shape + '」不合法（只能是 ' + SHAPES.join('/') + '）');
    if (!STATUS_IDS.includes(item.status)) {
      problems.push(at + ' 的 status「' + item.status + '」不合法（只能是 ' + STATUS_IDS.join('/') + '）');
    } else if (item.status === 'shipped') {
      if (!existing.has(slug)) {
        problems.push(at + ' 标了 shipped，但 src/data/entries/ 里没有这个词条');
      } else if (existing.get(slug) !== item.hall) {
        problems.push(at + ' 标了 shipped，但词条实际在 ' + existing.get(slug) + '/ 目录，不在 ' + item.hall + '/');
      }
    } else if (existing.has(slug)) {
      problems.push(at + ' 还没 shipped，但词条已存在于 src/data/entries/' + existing.get(slug) + '/，状态该改成 shipped 或换个 slug');
    }
    if (typeof slug === 'string' && tombstones.has(slug)) {
      problems.push(at + ' 的 slug「' + slug + '」已在 retired.ts 立过墓碑，不能复用');
    }
  });
  if (list.length > 0 && list.length < 40) problems.push('候选池只有 ' + list.length + ' 条，低于 40 条下限');
  return problems;
}

function summarize(list, hallTarget) {
  const byStatus = new Map(STATUS_IDS.map((id) => [id, 0]));
  const byHall = new Map(HALL_IDS.map((id) => [id, { total: 0, shipped: 0, planned: 0, triaged: 0, candidate: 0 }]));
  for (const item of list) {
    byStatus.set(item.status, (byStatus.get(item.status) ?? 0) + 1);
    const hall = byHall.get(item.hall);
    if (!hall) continue;
    hall.total += 1;
    hall[item.status] += 1;
  }
  const gap = {};
  for (const [id, hall] of byHall) gap[id] = Math.max(0, hallTarget - hall.shipped - hall.planned);
  return { byStatus: Object.fromEntries(byStatus), byHall: Object.fromEntries(byHall), gap };
}

// ---------------------------------------------------------------- 输出

function printOverview(stats, list, hallTarget, doc) {
  const width = String(list.length).length + 2;
  console.log('📚 docs/entry-backlog.json · ' + list.length + ' 条候选' + (doc.updated ? ' · 更新于 ' + doc.updated : ''));
  console.log('');
  console.log('按状态');
  for (const [id] of STATUSES) {
    const count = stats.byStatus[id] ?? 0;
    console.log('  ' + id.padEnd(10) + String(count).padStart(width) + '  ' + bar(count, list.length) + '  ' + STATUS_LABEL.get(id));
  }
  console.log('');
  console.log('按展厅（每厅目标 ' + hallTarget + ' 条进入「已排期 + 已上线」）');
  for (const hallId of HALL_IDS) {
    const hall = stats.byHall[hallId];
    const parts = [
      '共 ' + hall.total,
      '上线 ' + hall.shipped,
      '排期 ' + hall.planned,
      '拆解 ' + hall.triaged,
      '候选 ' + hall.candidate,
    ].join(' · ');
    const gap = stats.gap[hallId];
    const tail = gap === 0 ? '达标' : '缺口 ' + gap;
    console.log('  ' + (hallId + ' ' + HALL_LABEL.get(hallId)).padEnd(12) + parts.padEnd(44) + tail);
  }
  const next = list.filter((item) => item.status === 'planned');
  console.log('');
  if (next.length > 0) {
    console.log('下一步：已排期 ' + next.length + ' 条，直接按 docs/ENTRY-PIPELINE.md 的 build 阶段开工');
    for (const item of next.slice(0, 8)) {
      console.log('  · ' + item.hall + '/' + item.slug + '  ' + item.nameZh + ' / ' + item.nameEn + '（' + item.shape + '）');
    }
    if (next.length > 8) console.log('  …… 还有 ' + (next.length - 8) + ' 条，用 --status planned 看全');
  } else {
    console.log('下一步：没有 planned，先从 candidate 里 triage 几条出来（doc 阶段 3）');
  }
}

function printFiltered(list, options) {
  const scope = [options.hall ? '展厅 ' + options.hall : null, options.status ? '状态 ' + options.status : null]
    .filter(Boolean)
    .join(' · ');
  console.log(scope + '：' + list.length + ' 条');
  if (list.length === 0) return;
  console.log('');
  for (const item of list) {
    console.log('  [' + item.status + '] ' + item.slug + '  ' + item.nameZh + ' / ' + item.nameEn);
    console.log('      ' + item.hall + ' · ' + item.shape + ' · ' + item.source);
    console.log('      ' + item.note);
  }
}

function bar(count, total) {
  if (count === 0) return '';
  const size = Math.max(1, Math.round((count / Math.max(total, 1)) * 40));
  return '█'.repeat(size);
}

function relative(path) {
  return path.slice(ROOT.length + 1);
}
