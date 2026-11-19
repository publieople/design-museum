#!/usr/bin/env node
/**
 * 视觉回归比对：把当前截图和基线逐像素比较，给本地/CI 一个退出码。
 * 不引依赖：PNG 解码/编码都用 node:zlib 手写（8-bit、非隔行、RGB/RGBA/灰度）。
 *
 *   pnpm build
 *   pnpm screenshots:baseline     # 第一次：写 .screenshots/baseline/
 *   pnpm screenshots:diff         # 之后：当前截图 vs 基线
 *
 * 参数：
 *   --baseline <dir>   基线目录（默认 .screenshots/baseline）
 *   --current <dir>    当前截图目录（默认 .screenshots）
 *   --threshold <ratio> 允许的变化像素比例（默认 0.002，即 0.2%）
 *   --write-diffs      写差异图（默认开；--no-write-diffs 关闭）
 *
 * 退出码：0 全部通过；1 有差异/缺图/尺寸不一致/解码失败；2 基线缺失或目录不存在。
 * 差异图与报告写到 .screenshots/diff/（report.json 供机器读）。
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { deflateSync, inflateSync } from 'node:zlib'

const DEFAULTS = {
  baseline: '.screenshots/baseline',
  current: '.screenshots',
  threshold: 0.002,
  writeDiffs: true,
}
const DIFF_DIR = '.screenshots/diff'
const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
const CHANNELS = { 0: 1, 2: 3, 4: 2, 6: 4 }

function usage() {
  console.log('用法：node scripts/visual-diff.mjs [选项]')
  console.log('')
  console.log('  --baseline <dir>     基线目录（默认 ' + DEFAULTS.baseline + '）')
  console.log('  --current <dir>      当前截图目录（默认 ' + DEFAULTS.current + '）')
  console.log('  --threshold <ratio>  允许的变化像素比例（默认 ' + DEFAULTS.threshold + '，即 0.2%）')
  console.log('  --write-diffs        写差异图（默认开）')
  console.log('  --no-write-diffs     不写差异图，只写 report.json')
  console.log('  -h, --help           显示本帮助')
}

function fail(message) {
  console.error(message)
  process.exit(1)
}

function parseArgs(argv) {
  const args = {
    baseline: DEFAULTS.baseline,
    current: DEFAULTS.current,
    threshold: DEFAULTS.threshold,
    writeDiffs: DEFAULTS.writeDiffs,
  }
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === '--baseline' || arg === '--current' || arg === '--threshold') {
      const value = argv[i + 1]
      if (!value || value.startsWith('--')) fail(arg + ' 需要一个参数')
      if (arg === '--baseline') args.baseline = value
      else if (arg === '--current') args.current = value
      else {
        const ratio = Number(value)
        if (!Number.isFinite(ratio) || ratio < 0 || ratio > 1) fail('--threshold 需要 0..1 之间的数字，现在是：' + value)
        args.threshold = ratio
      }
      i += 1
    } else if (arg === '--write-diffs') {
      args.writeDiffs = true
    } else if (arg === '--no-write-diffs') {
      args.writeDiffs = false
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

function listPngs(dir) {
  if (!existsSync(dir)) return null
  const names = readdirSync(dir).filter((name) => name.toLowerCase().endsWith('.png'))
  const files = []
  for (const name of names) {
    try {
      if (statSync(join(dir, name)).isFile()) files.push(name)
    } catch {
      // 读不到就当没有，交给 missing/error 分支报出来
    }
  }
  return files.sort()
}

// ---- PNG 解码（8-bit、非隔行：灰度/RGB/灰度+Alpha/RGBA） ----

function paeth(a, b, c) {
  const p = a + b - c
  const pa = Math.abs(p - a)
  const pb = Math.abs(p - b)
  const pc = Math.abs(p - c)
  if (pa <= pb && pa <= pc) return a
  if (pb <= pc) return b
  return c
}

function decodePng(file) {
  const buf = readFileSync(file)
  if (buf.length < 8 || !buf.subarray(0, 8).equals(PNG_SIGNATURE)) throw new Error('不是 PNG 文件')

  let offset = 8
  let header = null
  const idat = []
  while (offset + 8 <= buf.length) {
    const length = buf.readUInt32BE(offset)
    const type = buf.toString('latin1', offset + 4, offset + 8)
    if (offset + 12 + length > buf.length) throw new Error('PNG chunk 越界：' + type)
    const data = buf.subarray(offset + 8, offset + 8 + length)
    offset += 12 + length
    if (type === 'IHDR') {
      header = {
        width: data.readUInt32BE(0),
        height: data.readUInt32BE(4),
        bitDepth: data[8],
        colorType: data[9],
        compression: data[10],
        filter: data[11],
        interlace: data[12],
      }
    } else if (type === 'IDAT') {
      idat.push(data)
    } else if (type === 'IEND') {
      break
    }
  }

  if (!header) throw new Error('PNG 缺少 IHDR')
  if (header.width === 0 || header.height === 0) throw new Error('PNG 尺寸为 0')
  if (header.bitDepth !== 8) throw new Error('只支持 8-bit PNG（实际 ' + header.bitDepth + '-bit）')
  if (header.interlace !== 0) throw new Error('不支持隔行 PNG')
  const channels = CHANNELS[header.colorType]
  if (!channels) throw new Error('不支持 PNG colorType ' + header.colorType + '（支持 0/2/4/6）')
  if (idat.length === 0) throw new Error('PNG 缺少 IDAT')

  const raw = inflateSync(Buffer.concat(idat))
  const stride = header.width * channels
  const expected = header.height * (stride + 1)
  if (raw.length < expected) throw new Error('PNG 数据不完整：期望 ' + expected + ' 字节，实际 ' + raw.length)

  const pixels = Buffer.alloc(header.width * header.height * channels)
  let pos = 0
  for (let y = 0; y < header.height; y += 1) {
    const filter = raw[pos]
    pos += 1
    if (filter > 4) throw new Error('未知 PNG 滤波类型 ' + filter)
    const rowStart = y * stride
    const prevStart = (y - 1) * stride
    for (let x = 0; x < stride; x += 1) {
      const value = raw[pos]
      pos += 1
      const left = x >= channels ? pixels[rowStart + x - channels] : 0
      const up = y > 0 ? pixels[prevStart + x] : 0
      const upLeft = y > 0 && x >= channels ? pixels[prevStart + x - channels] : 0
      let out
      if (filter === 0) out = value
      else if (filter === 1) out = value + left
      else if (filter === 2) out = value + up
      else if (filter === 3) out = value + ((left + up) >> 1)
      else out = value + paeth(left, up, upLeft)
      pixels[rowStart + x] = out & 0xff
    }
  }

  return {
    width: header.width,
    height: header.height,
    channels,
    pixels,
  }
}

function toRgba(decoded) {
  const { width, height, channels, pixels } = decoded
  const rgba = Buffer.alloc(width * height * 4)
  const count = width * height
  for (let i = 0, p = 0; i < count; i += 1, p += channels) {
    let r
    let g
    let b
    let a
    if (channels === 1) {
      r = pixels[p]
      g = pixels[p]
      b = pixels[p]
      a = 255
    } else if (channels === 2) {
      r = pixels[p]
      g = pixels[p]
      b = pixels[p]
      a = pixels[p + 1]
    } else if (channels === 3) {
      r = pixels[p]
      g = pixels[p + 1]
      b = pixels[p + 2]
      a = 255
    } else {
      r = pixels[p]
      g = pixels[p + 1]
      b = pixels[p + 2]
      a = pixels[p + 3]
    }
    const o = i * 4
    rgba[o] = r
    rgba[o + 1] = g
    rgba[o + 2] = b
    rgba[o + 3] = a
  }
  return rgba
}

// ---- PNG 编码（RGBA，8-bit，非隔行） ----

const CRC_TABLE = (() => {
  const table = new Uint32Array(256)
  for (let n = 0; n < 256; n += 1) {
    let c = n
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c >>> 0
  }
  return table
})()

function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i += 1) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const out = Buffer.alloc(12 + data.length)
  out.writeUInt32BE(data.length, 0)
  out.write(type, 4, 'latin1')
  data.copy(out, 8)
  out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length)
  return out
}

function encodePng(width, height, rgba) {
  const stride = width * 4
  const raw = Buffer.alloc(height * (stride + 1))
  for (let y = 0; y < height; y += 1) {
    raw[y * (stride + 1)] = 0
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride)
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8
  ihdr[9] = 6
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0
  return Buffer.concat([
    PNG_SIGNATURE,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

// ---- 比对 ----

function comparePair(baselineFile, currentFile) {
  const before = decodePng(baselineFile)
  const after = decodePng(currentFile)
  if (before.width !== after.width || before.height !== after.height) {
    return {
      status: 'size',
      detail: '尺寸不一致：基线 ' + before.width + 'x' + before.height + '，当前 ' + after.width + 'x' + after.height,
    }
  }
  const width = before.width
  const height = before.height
  const total = width * height
  const a = toRgba(before)
  const b = toRgba(after)
  const diff = Buffer.alloc(total * 4)
  let changed = 0
  let maxDelta = 0
  for (let i = 0; i < total; i += 1) {
    const o = i * 4
    const dr = Math.abs(a[o] - b[o])
    const dg = Math.abs(a[o + 1] - b[o + 1])
    const db = Math.abs(a[o + 2] - b[o + 2])
    const da = Math.abs(a[o + 3] - b[o + 3])
    const delta = Math.max(dr, dg, db, da)
    if (delta > maxDelta) maxDelta = delta
    if (delta > 0) {
      changed += 1
      diff[o] = 255
      diff[o + 1] = 64
      diff[o + 2] = 64
      diff[o + 3] = 255
    } else {
      // 未变化的部分压成暗灰，变化处红色更显眼
      const lum = Math.round(0.299 * a[o] + 0.587 * a[o + 1] + 0.114 * a[o + 2])
      const gray = Math.round(lum * 0.3)
      diff[o] = gray
      diff[o + 1] = gray
      diff[o + 2] = gray
      diff[o + 3] = 255
    }
  }
  return {
    status: 'compared',
    width,
    height,
    total,
    changed,
    ratio: total === 0 ? 0 : changed / total,
    maxDelta,
    diff,
  }
}

function pad(value, width) {
  const text = String(value)
  return text.length >= width ? text : text + ' '.repeat(width - text.length)
}

function formatRatio(ratio) {
  return (ratio * 100).toFixed(3) + '%'
}

function main() {
  const args = parseArgs(process.argv.slice(2))
  const cwd = process.cwd()
  const baselineDir = resolve(cwd, args.baseline)
  const currentDir = resolve(cwd, args.current)
  const diffDir = resolve(cwd, DIFF_DIR)

  const baselineFiles = listPngs(baselineDir)
  if (baselineFiles === null) {
    console.error('找不到基线目录：' + baselineDir)
    console.error('先跑 pnpm screenshots:baseline 生成基线（约 2-4 分钟）。')
    process.exit(2)
  }
  if (baselineFiles.length === 0) {
    console.error('基线目录里没有 PNG：' + baselineDir)
    console.error('先跑 pnpm screenshots:baseline 生成基线。')
    process.exit(2)
  }

  const currentFiles = listPngs(currentDir)
  if (currentFiles === null) {
    console.error('找不到当前截图目录：' + currentDir)
    console.error('先跑 pnpm build 与 pnpm screenshots 生成当前截图。')
    process.exit(2)
  }

  mkdirSync(diffDir, { recursive: true })

  const names = Array.from(new Set([...baselineFiles, ...currentFiles])).sort()
  const results = []

  for (const name of names) {
    const inBaseline = baselineFiles.includes(name)
    const inCurrent = currentFiles.includes(name)
    if (!inBaseline || !inCurrent) {
      results.push({
        file: name,
        status: 'missing',
        detail: inBaseline ? '当前截图里没有这一张' : '基线里没有这一张',
      })
      continue
    }

    try {
      const comparison = comparePair(join(baselineDir, name), join(currentDir, name))
      if (comparison.status === 'size') {
        results.push({ file: name, status: 'size', detail: comparison.detail })
        continue
      }
      const passed = comparison.ratio <= args.threshold
      const entry = {
        file: name,
        status: passed ? 'pass' : 'fail',
        width: comparison.width,
        height: comparison.height,
        totalPixels: comparison.total,
        changedPixels: comparison.changed,
        ratio: comparison.ratio,
        maxChannelDiff: comparison.maxDelta,
      }
      if (args.writeDiffs) {
        const diffPath = join(diffDir, name)
        writeFileSync(diffPath, encodePng(comparison.width, comparison.height, comparison.diff))
        entry.diffPath = diffPath
      }
      results.push(entry)
    } catch (error) {
      results.push({ file: name, status: 'error', detail: error instanceof Error ? error.message : String(error) })
    }
  }

  const summary = {
    total: results.length,
    pass: results.filter((row) => row.status === 'pass').length,
    fail: results.filter((row) => row.status === 'fail').length,
    missing: results.filter((row) => row.status === 'missing').length,
    size: results.filter((row) => row.status === 'size').length,
    error: results.filter((row) => row.status === 'error').length,
  }

  console.log('视觉回归比对')
  console.log('  baseline  ' + baselineDir)
  console.log('  current   ' + currentDir)
  console.log('  threshold ' + formatRatio(args.threshold) + '（' + args.threshold + '）')
  console.log('')
  console.log(pad('FILE', 28) + pad('CHANGED', 9) + pad('RATIO', 10) + pad('MAXΔ', 6) + 'STATUS')
  console.log('-'.repeat(64))
  for (const row of results) {
    const ratio = typeof row.ratio === 'number' ? formatRatio(row.ratio) : '-'
    const changed = typeof row.changedPixels === 'number' ? String(row.changedPixels) : '-'
    const maxDelta = typeof row.maxChannelDiff === 'number' ? String(row.maxChannelDiff) : '-'
    const status = row.status.toUpperCase()
    console.log(pad(row.file, 28) + pad(changed, 9) + pad(ratio, 10) + pad(maxDelta, 6) + status)
    if (row.detail) console.log('  └ ' + row.detail)
  }
  console.log('')
  console.log(
    '共 ' +
      summary.total +
      ' 张：pass ' +
      summary.pass +
      ' / fail ' +
      summary.fail +
      ' / missing ' +
      summary.missing +
      ' / size ' +
      summary.size +
      ' / error ' +
      summary.error,
  )

  const report = {
    generatedAt: new Date().toISOString(),
    baseline: baselineDir,
    current: currentDir,
    threshold: args.threshold,
    summary,
    results,
  }
  const reportPath = join(diffDir, 'report.json')
  writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n')
  console.log('报告：' + reportPath)
  if (args.writeDiffs && summary.pass + summary.fail > 0) console.log('差异图：' + diffDir + '/<name>.png')

  const failed = summary.fail + summary.missing + summary.size + summary.error
  if (failed > 0) {
    console.error('')
    console.error('视觉回归未通过：' + failed + ' 张需要处理（差异图/报告见 ' + diffDir + '）')
    process.exit(1)
  }
  console.log('视觉回归通过。')
}

main()
