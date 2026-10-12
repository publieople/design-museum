// 预渲染：给每个页面生成一份带完整正文的静态 HTML。
//
// 为什么需要它：爬虫（搜索引擎、GPTBot/ClaudeBot/PerplexityBot）不执行 JS，
// 而这一站的内容全在 React 里。构建之后把真实页面渲染成静态 HTML 写进
// dist/<路径>/index.html，爬虫拿到 HTML 的第一眼就能读到一个词条。
//
// 跑法：npm run build（vite build 之后自动跑它），或单独 npm run prerender。
// 浏览器端不做水合，仍是 createRoot 重新渲染：localStorage 里的主题/语言
// 与 SSR 默认值可能不同，水合只会带来错配。
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** 把壳里的一处属性换掉；匹配不到就直接报错，免得悄悄产出没更新的页面 */
function replaceOnce(html, pattern, replacement, label) {
  if (!pattern.test(html)) throw new Error(`dist/index.html 里找不到 ${label}，预渲染壳变了？`)
  return html.replace(pattern, replacement)
}

function pageHtml(shell, { title, description, canonical, body, jsonLd, ogType }) {
  let html = replaceOnce(shell, /<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`, '<title>')
  html = replaceOnce(
    html,
    /<meta\s+name="description"\s+content="[^"]*"\s*\/>/,
    `<meta name="description" content="${escapeHtml(description)}" />`,
    'meta description',
  )
  html = replaceOnce(
    html,
    /<link rel="canonical" href="[^"]*" \/>/,
    `<link rel="canonical" href="${canonical}" />\n    <meta property="og:url" content="${canonical}" />`,
    'canonical',
  )
  html = replaceOnce(
    html,
    /<meta property="og:title" content="[^"]*" \/>/,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    'og:title',
  )
  html = replaceOnce(
    html,
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    'og:description',
  )
  html = replaceOnce(
    html,
    /<meta property="og:type" content="[^"]*" \/>/,
    `<meta property="og:type" content="${ogType}" />`,
    'og:type',
  )
  html = replaceOnce(
    html,
    /<\/head>/,
    `  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>\n  </head>`,
    '</head>',
  )
  return replaceOnce(html, /<div id="root"><\/div>/, `<div id="root">${body}</div>`, 'root 容器')
}

const base = process.env.VITE_BASE ?? '/'
const server = await createServer({
  root,
  base,
  mode: 'production',
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
})

try {
  const { loadPages, renderPage } = await server.ssrLoadModule('/src/prerenderApp.tsx')
  const { STATIC_PAGES, SITE_ORIGIN, absoluteUrl, hrefFor, entryPath } = await server.ssrLoadModule('/src/lib/routes.ts')
  const { ENTRIES } = await server.ssrLoadModule('/src/data/index.ts')
  const { RETIRED, tombstoneTarget } = await server.ssrLoadModule('/src/data/retired.ts')
  const { translate } = await server.ssrLoadModule('/src/i18n/index.tsx')

  const shell = await readFile(path.join(dist, 'index.html'), 'utf8')
  const pages = await loadPages()
  const siteName = translate('zh', 'site.name')

  const targets = [
    ...STATIC_PAGES.map((page) => ({
      target: page.path,
      title: page.titleKey ? `${translate('zh', page.titleKey)} · ${siteName}` : `${siteName} · ${translate('zh', 'site.tagline')}`,
      description: translate('zh', page.descKey, { n: ENTRIES.length }),
      ogType: 'website',
    })),
    ...ENTRIES.map((entry) => ({
      target: entryPath(entry.slug),
      title: `${entry.nameZh} · ${siteName}`,
      description: translate('zh', 'seo.entry.desc', {
        name: entry.nameZh,
        code: entry.code,
        oneLiner: entry.oneLiner,
      }),
      ogType: 'article',
      entry,
    })),
  ]

  const urls = []
  for (const item of targets) {
    const canonical = absoluteUrl(item.target)
    const jsonLd = item.entry
      ? {
          '@context': 'https://schema.org',
          '@type': 'TechArticle',
          headline: item.entry.nameZh,
          alternativeHeadline: item.entry.nameEn,
          description: item.entry.oneLiner,
          url: canonical,
          inLanguage: 'zh-CN',
          isPartOf: { '@type': 'WebSite', name: siteName, url: absoluteUrl('/') },
        }
      : {
          '@context': 'https://schema.org',
          '@type': item.target === '/' ? 'WebSite' : 'WebPage',
          name: item.title,
          description: item.description,
          url: canonical,
          inLanguage: 'zh-CN',
        }
    const html = pageHtml(shell, {
      title: item.title,
      description: item.description,
      canonical,
      body: renderPage(item.target, pages),
      jsonLd,
      ogType: item.ogType,
    })
    const dir = item.target === '/' ? dist : path.join(dist, item.target)
    await mkdir(dir, { recursive: true })
    await writeFile(path.join(dir, 'index.html'), html, 'utf8')
    urls.push({ loc: canonical, priority: item.entry ? '0.6' : item.target === '/' ? '1.0' : '0.8' })
  }

  // 404 交给 GitHub Pages 的兜底文件，前端路由会把未知路径渲染成「这里没有展品」
  await writeFile(path.join(dist, '404.html'), shell, 'utf8')

  // 墓碑：删掉的词条不能就这么消失在 URL 里。GitHub Pages 没有 301，所以给
  // 每个墓碑写一份真实的静态页：meta refresh 跳到新地址 + canonical + noindex。
  // 它不进 sitemap，也不挂 App 壳——没有 JS，也就不会先闪一个「这里没有展品」。
  for (const retired of RETIRED) {
    const target = tombstoneTarget(retired)
    const canonical = absoluteUrl(target)
    const html = [
      '<!doctype html>',
      '<html lang="zh-CN">',
      '  <head>',
      '    <meta charset="UTF-8" />',
      '    <meta name="viewport" content="width=device-width, initial-scale=1" />',
      '    <title>' + escapeHtml(retired.nameZh) + ' · 已下架 · ' + escapeHtml(siteName) + '</title>',
      '    <meta name="robots" content="noindex" />',
      '    <link rel="canonical" href="' + canonical + '" />',
      '    <meta http-equiv="refresh" content="0; url=' + canonical + '" />',
      '    <style>',
      '      body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #f6f3ec;',
      '        color: #1c1917; font: 14px/1.75 system-ui, -apple-system, "Noto Sans SC", sans-serif }',
      '      main { max-width: 34rem; padding: 2.5rem }',
      '      p.code { font-family: ui-monospace, SFMono-Regular, monospace; letter-spacing: .08em;',
      '        color: #b3341f; margin: 0 0 .5rem }',
      '      h1 { font-size: 1.15rem; margin: 0 0 .75rem }',
      '      p { margin: 0 0 .6rem; color: #57534e }',
      '      a { color: #b3341f }',
      '    </style>',
      '  </head>',
      '  <body>',
      '    <main>',
      '      <p class="code">' + escapeHtml(retired.code) + ' · RETIRED</p>',
      '      <h1>' + escapeHtml(retired.nameZh) + '（' + escapeHtml(retired.nameEn) + '）已下架</h1>',
      '      <p>' + escapeHtml(retired.reason) + '</p>',
      '      <p>This entry has been retired. Taking you to <a href="' + hrefFor(target) + '">' + target + '/</a>…</p>',
      '    </main>',
      '  </body>',
      '</html>',
      '',
    ].join('\n')
    const dir = path.join(dist, entryPath(retired.slug))
    await mkdir(dir, { recursive: true })
    await writeFile(path.join(dir, 'index.html'), html, 'utf8')
    console.log('墓碑页 /entry/' + retired.slug + '/ → ' + target)
  }

  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map(
      (url) => `  <url>\n    <loc>${url.loc}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>${url.priority}</priority>\n  </url>`,
    ),
    '</urlset>',
    '',
  ].join('\n')
  // public/ 里那份占位 sitemap（只有首页一条）已经在构建时拷进 dist，这里覆盖它
  await writeFile(path.join(dist, 'sitemap.xml'), sitemap, 'utf8')
  await rm(path.join(dist, 'sitemap.xml.placeholder'), { force: true })

  console.log(
    `预渲染完成：${targets.length} 个页面 + 404.html + ${RETIRED.length} 个墓碑页，sitemap ${urls.length} 条`,
  )
  console.log(`站点域名：${SITE_ORIGIN}，部署前缀：${base}`)
} finally {
  await server.close()
}
