/**
 * 墓碑：删掉的词条不能就这么消失在 URL 里。
 *
 * 删一条词条的流程是「从 entries/ 里拿掉 + 在这里留一条墓碑」。GitHub Pages
 * 没有 301，所以构建期会给每个墓碑写一份真实的静态页（meta refresh 跳转 +
 * canonical 指向新地址 + noindex），见 scripts/prerender.mjs。墓碑不进 sitemap。
 *
 * 规矩（src/data/retired.test.ts 会拦）：slug 与 code 都不得与在册词条冲突，
 * replacedBy 必须是在册 slug（不许指向另一个墓碑，否则跳转会变成死链）。
 */
export interface RetiredEntry {
  /** 原 slug：它同时是原地址 /entry/<slug>/ 与跳转页的文件名 */
  slug: string
  /** 原展示编号。编号可以重排，但墓碑保留历史编号，方便对照旧截图与旧链接 */
  code: string
  nameZh: string
  nameEn: string
  /** 下架时间，YYYY-MM */
  retiredAt: string
  /** 接替它的在册词条 slug；没有替代就落到 /browse */
  replacedBy?: string
  /** 一句话说明为什么删，会印在跳转页上 */
  reason: string
}

/** 当前没有下架的词条。删词条时往这里加一条，别让旧地址变成 404 */
export const RETIRED: readonly RetiredEntry[] = []

export function retiredFor(slug: string): RetiredEntry | undefined {
  return RETIRED.find((item) => item.slug === slug)
}

/** 墓碑跳转页指向的站内路径 */
export function tombstoneTarget(entry: RetiredEntry): string {
  return entry.replacedBy ? `/entry/${entry.replacedBy}` : '/browse'
}
