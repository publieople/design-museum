# 设计系统：INDEX / 索引档案

这份文档是「重新设计后」的视觉与组件约定，改页面前先读。它只讲**为什么这样排、怎么复用**；词条内容规范见 [ENTRY-SPEC.md](ENTRY-SPEC.md)，重设计的分阶段方案见 [REDESIGN-PLAN.md](REDESIGN-PLAN.md)。

## 1. 这套语言是什么

站点被当成一座**索引档案室**：每个前端效果是一件藏品，页面是档案卡、索引柜与展台。

三条原则：

1. **纸、墨、朱红三色**。没有渐变光斑、没有点阵背景、没有卡片投影。层次靠 1px 线、留白和字号，不靠装饰。
2. **方角、细线、mono 小标签**。按钮、输入框、卡片最多 6px 圆角；编号、字段名、英文名、计数一律等宽字小号大写感排版。
3. **朱红是唯一强调色**。只给当前项、编号、主按钮、少量强调；一整屏里出现面积越小越准。

## 2. Token

全部定义在 `src/styles/global.css` 的 `:root`，暗色跟随系统或 `data-theme`。

| Token | 亮色 | 用途 |
| --- | --- | --- |
| `--canvas` | `#f2f0e9` | 页面底色（纸面） |
| `--surface` | `#f8f6f1` | 内嵌区域：输入框底、代码块、抽屉 |
| `--raised` | `#fffdf9` | 抬起的纸片：卡片、弹层 |
| `--ink` | `#141414` | 主文字、粗线 |
| `--ink-2` | `#3b3a36` | 次级文字 |
| `--muted` | `#6b6960` | 标签、说明、占位符 |
| `--line` | `#d9d3c6` | 发丝分隔线 |
| `--line-strong` | `#b5ad9c` | 二级分隔、输入框描边 |
| `--accent` | `#c23b22` | 朱红：当前项、主按钮、编号 |
| `--accent-ink` | `#fffdf9` | 朱红底上的文字 |
| `--overlay` | `rgba(20,20,20,.42)` | 对话框/抽屉遮罩 |
| `--shadow-overlay` | 见 css | **只**给浮层用 |

暗色对应值在 `@media (prefers-color-scheme: dark)` 与 `[data-theme='dark']` 里各写一份，改 token 时两处都要改。

Tailwind 里通过 `@theme inline` 映射成 `bg-canvas`、`text-ink-2`、`border-line-strong`、`text-accent` 等类名；**不要在组件里写死十六进制颜色**。

## 3. 字阶与排版

| 类 | 用途 |
| --- | --- |
| `text-display` | 首页主标题（clamp 到 4.25rem） |
| `text-h1` | 页面标题 |
| `text-h2` | 区块标题、featured 卡片标题 |
| `text-h3` | 小节标题、列表标题 |
| `text-body` | 正文（1rem / 1.72） |
| `text-caption` | 说明、行内小字 |
| `text-micro` | mono 小标签、编号、计数 |

- 标题字体：`font-display`（Space Grotesk + 中文回退）；正文系统无衬线；标签/编号/英文名 `font-mono`。
- `.label-mono`：11px 等宽、大写感、字距 0.08em、`--muted`，用于字段名与小节标签。
- `.stamp`：编号戳（V-01），accent 描边 + accent 字 + 方角。
- 阅读型页面正文宽度控制在 `max-w-[68ch]` 左右；索引型页面用满外壳宽度。

## 4. 外壳与布局

`Layout` 负责一切，页面不自己画 header/footer：

- 外壳宽度 `max-w-[88rem]`，横向内边距 `px-5 sm:px-8`；页面内部自己决定是否收窄。
- 报头 56px 高、粘性、`backdrop-blur`、底部 1px 线；桌面 5 个索引入口（词条库/反查/俗称总表/感觉导航/速查表），当前项朱红 + 2px 底线。
- 搜索：桌面按钮（⌘K/Ctrl+K 打开 `SearchDialog`），页面内搜索用 `SearchBox`（`/` 聚焦）。两个入口共用 `suggestionsFor`。
- 移动端导航收进右侧抽屉（`useModal` 提供 Esc、焦点陷阱、滚动锁）。
- 页脚四栏：品牌 / 索引 / 工具 / 许可与源码。
- 跳转正文的 skip link 在 `#main`。

## 5. 组件清单（都在 `src/components/`）

| 组件 | API | 用途 |
| --- | --- | --- |
| `PageHeader` | `{kicker?, title, lede?, meta?, actions?, className?}` | 所有页面顶部：眉题 + 标题 + 导语 + 计数/操作 |
| `SpecimenPlate` | `{entry, variant?: 'grid' \| 'featured' \| 'row', showDemo?}` | 词条纸片：网格卡、首页 featured、索引行；内嵌缩小舞台 |
| `SearchBox` | `{value, onChange, autoFocus?, placeholder?, className?}` | 页面内搜索（首页、词条库） |
| `SearchDialog` | `{open, onClose}` | 全站搜索浮层 |
| `MetaLine` | `{items: {label?, value}[], className?}` | 一行字段：展厅、形态、循环、标签 |
| `Rule` | `{variant?: 'line' \| 'dotted' \| 'strong' \| 'double'}` | 章节分隔 |
| `Tag` | `{active?, children}` | 标签、筛选项、关键词 |
| `Kbd` | `{children}` | 键帽（⌘K、Esc） |
| `Button` / `buttonClass` | `variant: primary/secondary/ghost, size: sm/md` | 所有按钮 |
| `EmptyState` / `Skeleton` | `{title, body?, action?}` / `{className?}` | 空态与占位 |
| `DemoStage` | `{stage, shape, loopable, hint, flush?, ...}` | 展品舞台；`flush` 用于嵌进纸片去掉自身边框 |
| `PromptPanel` | 见文件 | 详情页输出舱：中英提示词、参数、分享链接 |
| `ControlPanel` | 见文件 | 参数控件（range/select/toggle） |
| `SettingsMenu` / `Toast` | 见文件 | 主题/语言/展品舞台设置；左下角方角提示条 |

工具类（global.css）：

- `.plate` / `.plate-interactive`：纸片容器 + hover 抬线（1px 变 ink、不位移不投影）。
- `.well`：内嵌凹槽（输入框、代码块、预览）。
- `.rule` / `.rule-strong`：细/粗分隔线。
- `.row-link`：整行链接的 hover（`--surface` 底）。
- `.text-link`：行内链接（accent 下划线）。
- `.skeleton`：加载占位。

## 6. 页面原型

1. **索引页**（词条库、俗称总表、感觉导航）：`PageHeader` → 索引栏/筛选 → `SpecimenPlate` 网格或行列表 → `EmptyState`。索引栏在 `lg` 吸顶，窄屏折成横向或折叠面板。
2. **工作台**（词条详情、反查、速查表）：左/上展台（`DemoStage` + `ControlPanel` 或输入框），右/下输出舱（`PromptPanel`、结果列表、导出预览）；`lg` 两栏，展台 `sticky top-20`。
3. **叙事页**（首页、怎么用、404）：大标题 + 导语 + 一条主路径（搜索或操作），其余内容按 `Rule` 分节；正文 `max-w-[68ch]`。
4. **首页**例外：以搜索为第一屏，其他区块（正在展出、五厅索引、工具入口、三步走）都是搜索的补充，不做轮播、不做大图。
5. **现场页**（`/live/<slug>/`）：不套站点头尾，页面即演示；只保留一条底部浮动导航（返回词条 / 演示名与编号 / 上一个下一个 / 索引 / Esc 提示）。页面内用 `<h1 class="sr-only">` 保住文档标题，视觉大标题用 `h2`/大字号文本。演示区可以整页铺满、可以依赖 `window` 滚动与真实指针；静态 HTML 只渲染封面（名字、一句话、为什么需要整页、返回链接）。

## 7. 动效与无障碍

- 页面切换用 View Transitions（200/240ms）；不做逐卡错峰入场。`prefers-reduced-motion: reduce` 下关闭位移动画。
- 交互态用颜色/边框变化，不用 transform 大位移；`.plate-interactive` 只变边框色。
- 焦点：`focus-visible` 2px accent 轮廓；弹层必须有 Esc、焦点陷阱与可读的 `aria-label`。
- 展品 demo 会动的效果必须走 `usePrefersReducedMotion()`；demo 不写死颜色，用 `var(--stage-ink)` / `var(--stage-muted)` / `var(--stage-bg)`。
- 现场页的动效同样要降级：`reduced-motion` 下不做位移/缩放/跟随，内容静态可读；触屏（`pointer: coarse`）下不假装有光标跟随。优先用 CSS 的 `animation-timeline: scroll()/view()`，JS 只做兜底，且监听要 cleanup。

## 8. 不要做的事

- 不加圆角大卡、投影、渐变光斑、网点背景、装饰插画。
- 不写死颜色/字号（用 token 与字阶）；不在组件里写死中文/英文文案（写进 `src/i18n/strings.ts`，zh/en 都非空）。
- 不新增运行时依赖（字体/UI/路由/检索库都不行）。
- 不在页面里手写 `#/…` 链接；用 `Link`、`hrefFor`、`entryPath`。
- 不手改 `src/data/entryMeta.ts`、不提交 `dist/`。
- 首屏只准 import `ENTRY_META`（`src/data/meta.ts`），完整词条只给详情页/速查表这类懒加载路由。
- 现场页里不要用可见的 `h1`（外壳已有 sr-only h1），也不要把代码片段注释写成中文——英文模式下整页会做「不含中文字符」的断言。
- 不在展台 demo 里依赖整页滚动；需要整页才能成立的效果，去做现场页。

## 9. 加页面 / 加组件

- 新页面：写 `src/pages/XPage.tsx` → `src/pages/routeModules.ts` 注册 → `src/lib/routes.ts` 的 `STATIC_PAGES` 登记 → `src/lib/pageFor.tsx` 加 case → `src/prerenderApp.tsx` 的 `loadPages()` 加载。缺一步预渲染就漏页。
- 新组件：先看能不能用上表里的组合；确实要新组件时，API 用小而扁的 props，颜色/字号用 token 类，文案由调用方传入。
- 加现场页：`src/data/live.ts` 登记 `{ slug, group, noteKey }`（slug 必须是已有词条）→ `src/livedemos/<slug>.tsx` 写默认导出、无 props 的整页组件 → `src/livedemos/registry.ts` 加一条动态 import。路由、预渲染、索引页与 `/live/` 的 sitemap 会自动跟上。文案 key 加在 `strings.ts`（`live.note.<slug>`、分组 `live.group.*`）。
- 改视觉后必须截图人眼验收（/、/browse/、详情页、反查、俗称总表、现场页；375px 与 1280px；明暗两主题）；`pnpm check && pnpm build` 只是门槛，看不出好不好看。
