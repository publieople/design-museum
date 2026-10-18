#!/usr/bin/env node
/**
 * 视觉回归截图：把 dist/ 起成静态服务，再用本机 Chrome 逐页截图。
 * 不引入依赖（puppeteer/playwright），只用 node 内置模块 + Chrome 的 --screenshot。
 *
 *   pnpm build && pnpm screenshots
 *
 * 产物在 .screenshots/（已 gitignore）。要人眼比对就打开这些 PNG。
 * Chrome 路径可用 CHROME_BIN 覆盖。
 */
import { createReadStream, mkdirSync, statSync } from 'node:fs'
import http from 'node:http'
import { spawn } from 'node:child_process'
import { extname, join, resolve } from 'node:path'

const ROOT = resolve(process.cwd(), 'dist')
const OUT = resolve(process.cwd(), '.screenshots')
const CHROME = process.env.CHROME_BIN || 'google-chrome-stable'

const ROUTES = [
  ['home', '/'],
  ['browse', '/browse/'],
  ['aliases', '/aliases/'],
  ['feel', '/feel/'],
  ['reverse', '/reverse/'],
  ['sheet', '/cheatsheet/'],
  ['entry', '/entry/frosted-glass/'],
  ['about', '/about/'],
  ['live', '/live/'],
  ['live-scroll', '/live/scroll-driven/'],
  ['live-reveal', '/live/scroll-reveal/'],
  ['live-parallax', '/live/parallax/'],
  ['live-stack', '/live/sticky-stack/'],
  ['live-cursor', '/live/cursor-follower/'],
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

function shoot(url, width, height, out) {
  return new Promise((done, fail) => {
    const child = spawn(
      CHROME,
      [
        '--headless=new',
        '--disable-gpu',
        '--hide-scrollbars',
        '--no-first-run',
        '--no-default-browser-check',
        `--user-data-dir=${join(OUT, '.chrome-profile')}`,
        `--window-size=${width},${height}`,
        `--virtual-time-budget=2500`,
        `--screenshot=${out}`,
        url,
      ],
      { stdio: 'ignore' },
    )
    const timer = setTimeout(() => {
      child.kill('SIGKILL')
      fail(new Error('Chrome 超时：' + url))
    }, 30000)
    child.on('error', (error) => {
      clearTimeout(timer)
      fail(error)
    })
    child.on('exit', (code) => {
      clearTimeout(timer)
      if (code === 0) done()
      else fail(new Error('Chrome 退出码 ' + code + '：' + url))
    })
  })
}

const server = await serve()
const port = server.address().port
mkdirSync(OUT, { recursive: true })

let count = 0
try {
  for (const [name, route] of ROUTES) {
    for (const [label, width, height] of VIEWPORTS) {
      const file = join(OUT, `${name}-${label}.png`)
      await shoot(`http://127.0.0.1:${port}${route}`, width, height, file)
      console.log('✓', file)
      count += 1
    }
  }
} finally {
  server.close()
}

console.log(`\n共 ${count} 张，打开 .screenshots/ 逐张看。`)
