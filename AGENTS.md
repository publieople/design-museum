# 给 AI 编码代理的仓库规则

人类贡献者的完整流程见 [CONTRIBUTING.md](CONTRIBUTING.md)。这里是硬约束，改代码前先读完。

## 项目

前端设计博物馆：纯静态站点（Vite 8 + React 19 + TypeScript + Tailwind v4），零后端、零外部请求。教学目标是让人查到前端效果的**名字**，复制成给 AI 的设计需求。

## 命令

```fish
pnpm check && pnpm build
```

`pnpm check` = typecheck + lint + test（提交门槛），`pnpm build` 额外跑预渲染；四项必须全绿才算改完。测试是唯一门槛，覆盖：全部词条的内容校验、条目规范、检索、参数 URL、偏好、i18n、提示词生成、首屏 meta 与词条的同步、页面渲染冒烟。改视觉也要人眼验收（截图），测试看不出好不好看。

改了词条内容或 `src/data/metaOf.ts` 之后要补一条 `pnpm gen:meta`：首屏读的是生成物 `src/data/entryMeta.ts`，`src/data/meta.test.ts` 会拦下过期的生成物。

词条的规范（什么算一条、字段表、标签词表、演示形态、增删改查、预算）以 [docs/ENTRY-SPEC.md](docs/ENTRY-SPEC.md) 为唯一真源；里面能自动测的规矩都落在 `src/data/entrySpec.test.ts`。

加词条用 `pnpm new:entry <slug> --hall <厅> --shape <形态>` 生成骨架（骨架必然测试红，这是故意的）；
查重用 `pnpm find:entry "口语说法"`（打印命中条目、命中字段与权重）；删词条不是删文件——要在
`src/data/retired.ts` 立墓碑，`pnpm build` 会为它生成一个跳转页（meta refresh + canonical + noindex，不进 sitemap）。

## 硬规矩

- **不新增运行时依赖**。刻意不引路由库（`src/lib/router.tsx` + `src/lib/routes.ts` 是手写的真实路径路由）、不引检索库、不引状态库、不引 UI 组件库
- 路由与静态 HTML 是一体的：新增页面必须同时改 `src/pages/routeModules.ts` 与 `src/lib/routes.ts` 的 `STATIC_PAGES`，否则预渲染会漏页（`src/lib/pageFor.tsx` 是 App 与预渲染共用的唯一路由表）
- 站内链接用 `<Link>`、拼地址用 `hrefFor` / `absoluteUrl` / `entryPath`，**不要再手写 `#/…`**；`pnpm build` 会跑 `scripts/prerender.mjs`，别手改 `dist/`
- UI 文案只放 `src/i18n/strings.ts`，`zh`/`en` 都不能空；组件里不写死字符串
- `src/demos/*.tsx` 里的示例文案按 `locale` 切换；测试会检查英文模式下渲染结果不含中文字符
- 会动的效果走 `usePrefersReducedMotion()`
- demo 不写死颜色：用 `var(--stage-ink)` / `var(--stage-muted)`；需要不透明底用 `color-mix(in srgb, var(--stage-ink) 10%, var(--stage-bg, transparent))`
- 不提交 `dist/`（已在 `.gitignore`）
- 不引入外部字体 CDN、外链图片、埋点脚本
- 改 `src/lib/**`、`src/components/**`、构建配置前先说明原因——这些文件影响全站
- 首屏（首页 / 词条库 / 感觉导航 / 搜索）只准用 `src/data/meta.ts` 里的 `ENTRY_META`；`src/data/index.ts` 的完整词条（spec / refs / related / reducedMotion / controls / prompt / en）只准被详情页、速查表这类懒加载路由 import
- 别手改 `src/data/entryMeta.ts`，它是 `pnpm gen:meta` 生成的
- 加字段要按 ENTRY-SPEC 的「字段联动清单」同时改：`types.ts` → `metaOf.ts` → `entries.test.ts` → 跑 `gen:meta` → catalog 与规范文档
- `slug` 是文件与 URL 的不可变主键（改名 = 删 + 增 + 墓碑，见规范第 5 节）；删条目必须在 `src/data/retired.ts` 留一条墓碑，只删词条文件会把已经收录的地址变成 404
- 标签只准用 `src/data/taxonomy.ts` 里 `TAGS` 的闭集 id，每条 2–6 个、至少 1 个 tech；词表总数 ≤ 40，每个标签至少被 2 条词条用到（自由标签一律不收，口语进 `aliases`）
- 每条词条必须声明 `demo.shape`；非 `stage` 形态要给 `thumb: 'still'`；滚动类 demo 必须在舞台里自带滚动容器，不许依赖整页滚动
- `controls` 只允许 range / select / toggle 三种：`prompt`、速查表与 catalog 都从它自动派生

## 新增词条

按 README「新增一条词条」5 步走：文件名 = slug，同时写 `src/demos/<slug>.tsx`；`refs` 至少一条 MDN / web.dev / W3C；`loop` 按演示的实际行为选，不按名字猜；缺字段、编号不连续、`related` 死链都会被测试拦下。

## 许可

代码 MIT，内容 CC BY 4.0，范围见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。**不要粘贴来源不明的代码或图片。**

## 提交

Conventional Commits + 中文描述（`feat`/`fix`/`style`/`refactor`/`docs`/`test`/`chore`/`perf`），一条提交一件事。分支名 `feat/…`、`fix/…`、`docs/…`、`chore/…`。不要直接改 `main`。
