#!/usr/bin/env node
/**
 * 视觉回归截图：把 dist/ 起成静态服务，再用本机 Chrome 逐页截图。
 * 不引入依赖（puppeteer/playwright），只用 node 内置模块 + Chrome DevTools Protocol。
 *
 *   pnpm build && pnpm screenshots
 *
 * 产物在 .screenshots/（已 gitignore）。要人眼比对就打开这些 PNG。
 * 做基线 / 比对见 scripts/visual-diff.mjs：
 *
 *   pnpm screenshots:baseline   # 写 .screenshots/baseline/
 *   pnpm screenshots:diff       # 和基线逐像素比，退出码可用于门禁
 *
 * 为了「同一个构建 → 同一张图」，脚本做了三件事：
 *   1. 强制 reduced-motion，循环演示停在静态终态；
 *   2. 等网络静默 + 字体就绪 + DOM 不再变化才截图（demo 是懒加载 chunk + IntersectionObserver 挂上来的，
 *      固定延时偶尔会截到封面或空舞台）；
 *   3. 每次运行用独立 profile，失败自动重试，避免 Chrome 单例锁造成的随机超时。
 *
 * Chrome 路径可用 CHROME_BIN 覆盖。
 */
import { createReadStream, mkdirSync, mkdtempSync, rmSync, statSync, writeFileSync } from 'node:fs'
import http from 'node:http'
import { spawn } from 'node:child_process'
import { tmpdir } from 'node:os'
import { extname, join, resolve } from 'node:path'

const ROOT = resolve(process.cwd(), 'dist')
const DEFAULT_OUT = '.screenshots'
const PROFILE = mkdtempSync(join(tmpdir(), 'dm-shots-'))
const CHROME = process.env.CHROME_BIN || 'google-chrome-stable'
const ATTEMPTS = 2

const ROUTES = [
  ['home', '/'],
  ['browse', '/browse/'],
  ['aliases', '/aliases/'],
  ['compare', '/compare/'],
  ['feel', '/feel/'],
  ['reverse', '/reverse/'],
  ['sheet', '/cheatsheet/'],
  ['entry', '/entry/frosted-glass/'],
  ['about', '/about/'],
  ['live', '/live/'],
  ['live-scroll', '/live/scroll-driven/'],
  ['live-reveal', '/live/scroll-reveal/'],
  ['live-parallax', '/live/parallax/'],
  ['live-virtual', '/live/virtual-scrolling/'],
  ['live-progress', '/live/scroll-progress/'],
  ['live-stack', '/live/sticky-stack/'],
  ['live-sticky', '/live/sticky-header/'],
  ['live-transitions', '/live/view-transitions/'],
  ['live-palette', '/live/command-palette/'],
  ['live-toast', '/live/toast/'],
  ['live-cursor', '/live/cursor-follower/'],
  ['404', '/404.html'],
]
const VIEWPORTS = [
  ['375', 375, 812],
  ['768', 768, 1024],
  ['1280', 1280, 900],
]
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.json': 'application/json',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
  '.ico': 'image/x-icon',
}

function usage() {
  console.log(`用法：node scripts/screenshots.mjs [--out <dir>] [--only <csv>]

  --out <dir>    截图输出目录（默认 ${DEFAULT_OUT}）
  --only <csv>   只截这些路由名，逗号分隔，方便调试，例如 home,about,entry
   -h, --help    显示本帮助

路由名：${ROUTES.map(([name]) => name).join(', ')}`)
}

function parseArgs(argv) {
  const args = { out: DEFAULT_OUT, only: null }
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === '--out') {
      const value = argv[i + 1]
      if (!value || value.startsWith('--')) {
        console.error('--out 需要一个目录参数')
        process.exit(1)
      }
      args.out = value
      i += 1
    } else if (arg === '--only') {
      const value = argv[i + 1]
      if (!value || value.startsWith('--')) {
        console.error('--only 需要一个逗号分隔的路由名列表')
        process.exit(1)
      }
      args.only = value
      i += 1
    } else if (arg === '--help' || arg === '-h') {
      usage()
      process.exit(0)
    } else {
      console.error('未知参数：' + arg)
      usage()
      process.exit(1)
    }
  }
  return args
}

const args = parseArgs(process.argv.slice(2))
const OUT = resolve(process.cwd(), args.out)

let routes = ROUTES
if (args.only) {
  const wanted = args.only
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean)
  const unknown = wanted.filter((name) => !ROUTES.some(([routeName]) => routeName === name))
  if (unknown.length > 0) {
    console.error('未知路由名：' + unknown.join(', '))
    console.error('可选路由名：' + ROUTES.map(([name]) => name).join(', '))
    process.exit(1)
  }
  const set = new Set(wanted)
  routes = ROUTES.filter(([name]) => set.has(name))
  if (routes.length === 0) {
    console.error('--only 没有匹配到任何路由')
    process.exit(1)
  }
}

function serve() {
  return new Promise((done) => {
    const server = http.createServer((req, res) => {
      const path = decodeURIComponent(req.url.split('?')[0])
      let file = join(ROOT, path)
      try {
        if (statSync(file).isDirectory()) file = join(file, 'index.html')
      } catch {
        file = join(ROOT, path, 'index.html')
      }
      let stat
      try {
        stat = statSync(file)
      } catch {
        res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
        res.end('not found')
        return
      }
      res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream', 'content-length': stat.size })
      createReadStream(file).pipe(res)
    })
    server.listen(0, '127.0.0.1', () => done(server))
  })
}

const sleep = (ms) => new Promise((done) => setTimeout(done, ms))

async function waitFor(fn, timeoutMs, label) {
  const started = Date.now()
  for (;;) {
    const value = await fn()
    if (value) return value
    if (Date.now() - started > timeoutMs) throw new Error('等待超时：' + label)
    await sleep(120)
  }
}

async function freePort() {
  const server = http.createServer()
  await new Promise((done) => server.listen(0, '127.0.0.1', done))
  const port = server.address().port
  await new Promise((done) => server.close(done))
  return port
}

let chrome = null

async function launchChrome() {
  const port = await freePort()
  const child = spawn(
    CHROME,
    [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--no-first-run',
      '--no-default-browser-check',
      // 循环演示停在静态终态，截图才可复现
      '--force-prefers-reduced-motion',
      `--user-data-dir=${PROFILE}`,
      `--remote-debugging-port=${port}`,
      'about:blank',
    ],
    { stdio: 'ignore' },
  )
  child.on('error', (error) => {
    throw error
  })
  await waitFor(async () => {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`)
      return res.ok
    } catch {
      return false
    }
  }, 20000, 'Chrome 启动')
  return { child, port }
}

/** 最小的 CDP 客户端：只用到 Page / Network / Runtime / Emulation 四个域。 */
class Cdp {
  constructor(url) {
    this.url = url
    this.nextId = 1
    this.pending = new Map()
    this.handlers = new Set()
  }

  async connect() {
    this.ws = new WebSocket(this.url)
    await new Promise((done, fail) => {
      this.ws.addEventListener('open', done, { once: true })
      this.ws.addEventListener('error', () => fail(new Error('CDP 连接失败')), { once: true })
    })
    this.ws.addEventListener('message', (event) => {
      const message = JSON.parse(event.data)
      if (message.id) {
        const entry = this.pending.get(message.id)
        if (!entry) return
        this.pending.delete(message.id)
        if (message.error) entry.fail(new Error(message.error.message))
        else entry.done(message.result)
        return
      }
      for (const handler of this.handlers) handler(message)
    })
  }

  send(method, params = {}) {
    const id = this.nextId++
    return new Promise((done, fail) => {
      this.pending.set(id, { done, fail })
      this.ws.send(JSON.stringify({ id, method, params }))
    })
  }

  on(handler) {
    this.handlers.add(handler)
    return () => this.handlers.delete(handler)
  }

  close() {
    try {
      this.ws.close()
    } catch {
      /* 已经关了 */
    }
  }
}

/**
 * 等页面真正安定：load → 无在途请求 → 字体就绪 → DOM 连续一段时间不再变化。
 * 只靠固定延时会在懒加载 chunk / IntersectionObserver 落点上抖。
 */
async function settle(cdp, url) {
  let pending = 0
  let lastActivity = Date.now()
  const off = cdp.on((message) => {
    if (message.method === 'Network.requestWillBeSent') pending += 1
    else if (message.method === 'Network.loadingFinished' || message.method === 'Network.loadingFailed') {
      pending = Math.max(0, pending - 1)
    } else return
    lastActivity = Date.now()
  })

  await cdp.send('Page.enable')
  await cdp.send('Network.enable')
  const loaded = new Promise((done) => {
    const stop = cdp.on((message) => {
      if (message.method === 'Page.loadEventFired') {
        stop()
        done()
      }
    })
  })
  await cdp.send('Page.navigate', { url })
  await Promise.race([loaded, sleep(20000).then(() => {
    throw new Error('页面加载超时：' + url)
  })])

  // 网络静默：连续 500ms 没有新请求，也没有旧请求在途
  await waitFor(async () => pending === 0 && Date.now() - lastActivity > 500, 15000, '网络静默 ' + url)

  // 字体就绪 + 两帧 + DOM 静默 400ms
  await cdp.send('Runtime.evaluate', {
    expression: 'document.fonts.ready.then(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))',
    awaitPromise: true,
  })
  await cdp.send('Runtime.evaluate', {
    expression: `new Promise((resolve) => {
      let timer = setTimeout(resolve, 400)
      const observer = new MutationObserver(() => {
        clearTimeout(timer)
        timer = setTimeout(resolve, 400)
      })
      observer.observe(document.documentElement, { subtree: true, childList: true, attributes: true, characterData: true })
      setTimeout(() => { observer.disconnect(); resolve() }, 6000)
    })`,
    awaitPromise: true,
  })
  off()
}

async function shoot(url, width, height, out) {
  const res = await fetch(`http://127.0.0.1:${chrome.port}/json/new?about:blank`, { method: 'PUT' })
  const target = await res.json()
  const cdp = new Cdp(target.webSocketDebuggerUrl)
  try {
    await cdp.connect()
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: false,
    })
    await settle(cdp, url)
    const shot = await cdp.send('Page.captureScreenshot', { format: 'png', fromSurface: true })
    writeFileSync(out, Buffer.from(shot.data, 'base64'))
  } finally {
    cdp.close()
    await fetch(`http://127.0.0.1:${chrome.port}/json/close/${target.id}`).catch(() => {})
  }
}

async function shootWithRetry(url, width, height, out) {
  for (let attempt = 1; attempt <= ATTEMPTS; attempt += 1) {
    try {
      await shoot(url, width, height, out)
      return
    } catch (error) {
      if (attempt === ATTEMPTS) throw error
      console.warn(`  ! 第 ${attempt} 次失败，重试：${error.message}`)
      await sleep(1200)
    }
  }
}

const server = await serve()
const port = server.address().port
mkdirSync(OUT, { recursive: true })
if (routes.length !== ROUTES.length) {
  console.log('只截 ' + routes.length + ' 条路由：' + routes.map(([name]) => name).join(', '))
}

let count = 0
try {
  chrome = await launchChrome()
  for (const [name, route] of routes) {
    for (const [label, width, height] of VIEWPORTS) {
      const file = join(OUT, `${name}-${label}.png`)
      await shootWithRetry(`http://127.0.0.1:${port}${route}`, width, height, file)
      console.log('✓', file)
      count += 1
    }
  }
} finally {
  server.close()
  chrome?.child.kill('SIGKILL')
  rmSync(PROFILE, { recursive: true, force: true })
}

console.log(`\n共 ${count} 张，输出目录：${OUT}`)
