// 生成 src/data/entryMeta.ts：把首屏要用的词条字段从完整词条里摘出来，打成静态数组。
// 跑法：npm run gen:meta（改了任何 src/data/entries/** 或 metaOf.ts 之后都要跑；
// src/data/meta.test.ts 会在 CI 里检查生成物是否过期）。
import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const server = await createServer({
  root,
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
})

try {
  const { ENTRIES } = await server.ssrLoadModule('/src/data/index.ts')
  const { metaOf } = await server.ssrLoadModule('/src/data/metaOf.ts')
  const meta = ENTRIES.map(metaOf)

  const file = [
    '/**',
    ' * 自动生成，请勿手改：改了词条或 src/data/metaOf.ts 之后跑 npm run gen:meta。',
    ' * 首屏只加载这份 meta；完整词条（spec/refs/related/reducedMotion/controls/prompt/en）',
    ' * 留在 src/data/index.ts，只被详情页等懒加载路由引用。',
    ' */',
    "import type { EntryMeta } from './types'",
    '',
    // 用类型标注而不是 satisfies：标注会给 30 个对象字面量做上下文类型，
    // 否则 TS 会把数组元素推成「缺失的键是 undefined」的联合，反而过不了 ControlValues 的索引签名。
    `export const ENTRY_META: EntryMeta[] = ${JSON.stringify(meta, null, 2)}`,
    '',
  ].join('\n')

  await writeFile(path.join(root, 'src/data/entryMeta.ts'), file, 'utf8')
  console.log(`entryMeta.ts: ${meta.length} 条 / ${Buffer.byteLength(file)} 字节`)
} finally {
  await server.close()
}
