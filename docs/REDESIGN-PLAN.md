# 全站重设计：INDEX / 索引档案（已批准）

> 状态：2026-10-18 用户批准。分支 feat/redesign-index（从 c3a537b）。本文件是实施依据；完成后内容并入 docs/DESIGN.md。

## 0. 目标

把「暖色点阵画册」改造成「可检索的标本档案」：去装饰、立版面、卡片变图版、导航变索引、详情页变工作台。不改数据、不加依赖、不加路由；9 个现有页面全部重画，共享壳与组件重写。

验收底线：pnpm check / pnpm build 全绿且测试数不低于 292；47 个预渲染地址不变；375/768/1280 × 明暗 × 中英截图人眼通过；首屏 gzip ≤ 220KB；不新增任何依赖与字体。

## 1. 现状诊断

1. 同质化卡片太多：首页 3 张展品卡 + 4 张工具卡 + 5 行展厅 + 分类参考，全是圆角盒同一层级，动线靠猜。
2. 装饰抢内容：渐变洗墙 + 点阵 + hover 上浮 + 大阴影 + 12px 圆角；元数据（编号、别名、参数）反而最小最淡。
3. 导航与搜索不匹配任务：5 链接 + 设置挤一行；反查/俗称/速查入口分散；搜索只在首页和词条库。
4. 页面骨架各写各的：标题、间距、分隔线、圆角没有统一规则；text-sm 与 text-[11px] 混用。
5. 详情页核心动作被淹没：PromptCard 与 7 个知识区块挤在右栏，中英文同时展开，滚动后看不见；易混项是纯文本。
6. index.html description 仍写「30 个可交互效果标本」。

## 2. 方向：INDEX / 索引档案

- 核心命题：站点不是展示效果，而是给效果编目（编号、学名、俗称、参数、易混、出处、可复制需求），索引是视觉主语。
- 三个换法：
  1. 去装饰，立版面：删除渐变、点阵、柔影、大圆角；用 1px 结构线、2px 页标题线、编号/图注建立密度。
  2. 去浮卡，立图版：卡片 → Plate（1px 边框、4–6px 方角、demo 在上图注在下）；hover 只改边框与箭头，不位移。
  3. 去彩色，立印章：朱红只给编号、激活、印章、关键动作；链接默认不红。
- 保留：暖纸底、朱红、Space Grotesk + JetBrains Mono + 系统中文、展签元数据、现场 demo、博物馆词汇。
- 否决：编辑杂志风（缺图像资产、与查名字任务不符）、极简 SaaS 风（丢博物馆身份与数据对应物）。

## 3. 设计 Token（重写 src/styles/global.css）

### 颜色

| Token | 浅色 | 深色 | 用途 |
| --- | --- | --- | --- |
| --canvas | #f2f0e9 | #0e0e10 | 页面底色 |
| --surface | #f8f6f1 | #151518 | 次级面 |
| --raised | #fffdf9 | #1a1a1e | 图版/弹层 |
| --ink | #141414 | #f1efe9 | 主文字 |
| --ink-2 | #3b3a36 | #cbc9c1 | 正文次级 |
| --muted | #6b6960 | #908d84 | 注释图注 |
| --line | #d9d3c6 | #2d2c31 | 结构线 |
| --line-strong | #b5ad9c | #49474f | hover 边框 |
| --accent | #c23b22 | #ff614a | 编号/激活/印章 |
| --accent-ink | #fffdf9 | #141414 | 朱红底文字 |
| --accent-soft | accent 10% | accent 14% | 选中底 |
| --selection | accent 20% | accent 26% | 选区 |
| --overlay | rgba(20,20,20,.42) | rgba(0,0,0,.62) | 遮罩 |
| --shadow-overlay | 0 18px 48px rgba(20,20,20,.14) | 0 18px 48px rgba(0,0,0,.6) | 仅弹层 |

其余无阴影。theme-color 改 #f2f0e9 / #0e0e10。对比度：正文 ≥12:1，muted ≥4.5:1，accent ≥4.5:1。

### 字体与字阶（不新增字体）

- display = Space Grotesk Variable + 系统中文；mono = JetBrains Mono Variable；正文系统中文栈。
- --text-display: clamp(2.6rem, 1.4rem+4.4vw, 5.25rem)/0.98/-0.035em（仅首页）
- --text-h1: clamp(2rem, 1.3rem+2.2vw, 3.5rem)/1.04/-0.028em
- --text-h2: clamp(1.35rem, 1.1rem+0.8vw, 1.75rem)/1.2
- --text-h3: 1.0625rem/1.35
- --text-body: 1rem/1.72，最大 68ch
- --text-caption: 0.8125rem/1.55
- --text-micro: 0.6875rem/1.4/0.12em/uppercase（编号、元数据）
- 页面正文禁用 text-sm/text-lg/text-[11px]；demos 豁免。mono 数字 tabular-nums。

### 间距/栅格/边框/圆角

- 4px 基准；区块间距移动 48/桌面 80；组件内边距 12/16/24。
- 12 列；宽容器 max-w-[88rem] + px-5 sm:px-8；阅读 max-w-[44rem]；≥1280 内容区左右 1px 竖线。
- 圆角：标签/按钮 2–4px，图版 6px，弹层 8px；禁用 rounded-xl。
- 边框：结构 1px line；页标题下 2px ink；索引分隔可用 1px dotted。
- 阴影仅弹层；图版 hover 不位移。

### 背景与动效

- 删除 body::before 渐变、body::after 点阵、--wash-*、--wall-dot*。宽屏加左右 1px 竖线与页脚上方双细线；正文无底纹。
- 页面进入：main opacity 0→1 + translateY(4px)，240ms cubic-bezier(.2,.7,.2,1)；reduced-motion 关闭。
- 删除 enter/enter-1..5 逐卡错峰；首页 hero 可 2 段 60ms。
- hover 120ms 只动颜色/边框/箭头 ≤3px；保留 demo 动画、View Transitions（200ms crossfade）、粘性头部滚动边线。
- 搜索弹层 180ms fade+4px rise；抽屉 220ms slide。

## 4. 骨架与页面档案

- A 封面：首页。
- B 索引：词条库、俗称总表（PageHeader + 左 IndexRail + 右内容）。
- C 工作台：详情、反查、速查表（PageHeader + 主操作区 + 粘性输出栏）。
- D 阅读：怎么用、404（44rem 窄栏）。
- E 问卷：感觉导航（编号步骤 + 结果）。
- 全站共用 PageHeader（kicker/h1/lede/meta/actions + 2px 标题线）与区块编号 01、02。

### 顶栏与页脚

- 桌面 56px sticky，canvas 92% + blur 8px，底部 1px 线。wordmark 15px/600 + mono 小字；5 个主链接保留（词条库/反查/感觉/速查/怎么用），active = accent + 2px 底边线 + aria-current。
- 右侧搜索按钮（图标 + 搜索 + Kbd /）+ 设置。移动端 wordmark + 搜索图标 + 菜单按钮；菜单全屏抽屉：搜索框、6 入口（含俗称总表）、设置、页脚链接。
- skip link；抽屉/弹层 focus trap、Esc、滚动锁、焦点还原。
- 页脚：双细线；四列（品牌 / 索引 / 工具 / 许可源码）；移动纵向；底部版权与许可行；删除重复分类参考。

### 全局搜索弹层

- 触发：顶栏按钮、/、Ctrl/Cmd+K。
- 居中偏上 15vh，max-w-xl，1px 边框 + 8px 圆角 + 遮罩；输入 44px；最多 8 条建议（编号/中文/英文/展厅字母）；底部 Kbd 提示。
- 空查询 4 示例（毛玻璃、maoboli、数字滚动、磁吸按钮）；无结果给词条库/感觉导航出口。
- 复用 searchEntries + 纯函数 suggestionsFor + hook useEntrySearch；SSR 关闭态不渲染；路由变化关闭；不写 history。

### IndexRail

- 桌面 ≥1024：13rem 粘性栏，标题「索引 / INDEX」；条目 = 展厅（全部 40 / M8 / F8 / L8 / V8 / T8），右侧计数；选中左 2px accent + ink；底部工具链接。
- 词条库 rail 写 URL（?cat=），俗称总表写锚点（#motion…）。移动隐藏，PageHeader 下横向可滚动展厅条。

## 5. 组件清单

| 组件 | 动作 | 职责 |
| --- | --- | --- |
| PageHeader | 新增 | 统一页头与 2px 标题线 |
| IndexRail | 新增 | 索引页展厅导航与计数 |
| SpecimenPlate | 新增替代 EntryCard | grid/featured/row 三形态，demo + 图注 |
| SearchDialog | 新增 | 全局搜索弹层 |
| SearchField | 由 SearchBox 拆出 | 页面内搜索输入，逻辑保留 |
| PromptPanel | 由 PromptCard 重写 | 中/英/链接 tabs、参数摘要、复制、粘性 |
| ControlPanel | 重写视觉 | 参数横条 InstrumentStrip，API 不变 |
| FilterRow / FilterDisclosure | 替代 FilterChips/TagFilter 视觉 | 方角可选标签、details 筛选面板 |
| Button / LinkButton | 新增 | primary（ink 底）/ secondary（线框）/ ghost |
| MetaLine / Rule / Tag / Kbd / EmptyState / Skeleton | 新增 | 基础排版件 |
| icons.tsx | 新增 | 搜索/菜单/关闭/复制/箭头/勾 等内联 SVG |
| SettingsMenu | 视觉重做 | 方角分组弹层，功能存储不变 |
| Toast | 视觉重做 | 左下、方角、mono |
| DemoStage | 改框架 | 1px 边框 + 图注；详情大图版 + 四角角标；demo 内容与舞台配色不变 |
| EntryCard | 删除 | 全部换成 SpecimenPlate |
| surface-card/surface-row/surface-pill/enter-* | 删除 | 旧装饰类清退 |

SpecimenPlate：图版（1px 边框、6px 方角、无阴影）+ demo 缩略图 + 图注（mono 编号 / 形态·循环、h3 中文 + mono 英文、一句话 2 行、别名 2 个、打开→）。grid/featured/row 三形态；SSR 安全，demo 仅视口内挂载。

## 6. 逐页蓝图

- 首页 /（A）：kicker「40 件标本 · 5 个展厅 · 索引 No.01」+ 保留 h1「先给效果起个名字，再让 AI 实现它。」+ 两行 lede + 搜索框 + 热门 chips（毛玻璃/粘性头部/数字滚动/磁吸按钮）+ 浏览全部；≥1024 右侧固定本期图版（frosted-glass，V-01）。区块 01 工具索引（反查/俗称/按感觉/速查，4 列编号+一句+箭头）；02 正在展出 3 图版（首张大）；03 五个展厅表格（字母/中文/英文/件数/说明/箭头，整行 hover 反白）；04 三步使用 + /about 链接。删除底部分类参考。搜索命中在封面下出现 row 列表（最多 8）+ 查看全部。
- 词条库 /browse（B）：PageHeader「词条库 / INDEX」+ 40 件 · 5 个展厅；左 rail 全部+5 厅；右：搜索、排序（编号默认/中文名）、结果数、已选摘要+清除、三个 details（场景/感觉/标签按 facet 分组）；结果 xl4/lg3/sm2/移动1；空态清除+3 推荐；URL q/cat/scene/feel/tag 完全兼容，排序本地状态不写 URL；移动 rail 变横向展厅条。
- 反查 /reverse（C）：PageHeader；左 8 列输入台（大 textarea、示例 CSS/示例描述/反查/清空、Ctrl/Cmd+Enter）；右 4 列识别栏（CSS 属性标签、匹配数、提示）；结果排名行（01/02、名称+英文、百分比+4px 进度条、理由 mono、打开箭头、行间 1px 线、最多 6）；空态 3 示例；无匹配出口；逻辑不变。
- 俗称总表 /aliases（B）：PageHeader「俗称总表 / ALIAS INDEX」+ 251 别名 · 40 词条；搜索 + 贡献新俗称（GitHub issue）；左 rail 5 展厅锚点+计数；右分组（组头 sticky 字母+名称+数量；3/2/1 列）；每行 alias → 点线 leader → 中文名 · 编号；hover 左 accent 线；搜索 mark 高亮并保留分组；无结果空态；filterAliases 语义与去重保留。
- 感觉导航 /feel（E）：PageHeader；三大编号区块（01 用在哪/02 什么感觉/03 想达到什么），选项改大号可选行（label+hint，选中 ink 底），移动 2 列桌面 4 列；顶部摘要（已选数/重置/看结果↓）；结果「匹配 N 件」网格；保留 useState 逻辑，无 URL 状态。
- 速查表 /cheatsheet（C）：PageHeader + 已选 N + 全选/清空；左 7 列调参提示条 + 5 厅分组清单（组头 sticky、组内全选、每行 44px checkbox/编号/中文/英文）；右 5 列 sticky 导出（语言 tab、已选计数、textarea mono 可编辑、复制整段）；移动导出面板排清单前；保留 prompt 生成/参数回填/localStorage。
- 词条详情 /entry/:slug（C）：面包屑 + 编号章 + h1 + 英文 + 一句话 + 别名 + meta（形态/loop/标签数）；大图版（桌面 min-h 420）+ 图注行（舞台切换/循环/慢放/重播在图注右侧）；参数横条 2/4 列 + 重置；右栏 sticky 输出舱（tabs 中/英/链接、复制主按钮、参数摘要），移动移到参数条后不固定；档案记录 01 什么时候用、02 推荐取值 dt/dd、03 容易搞混（与 X 区别 + diff + 可跳转「打开对照 →」）、04 踩坑；右栏 关键词/无障碍/参考/相关/标签；保留 URL 参数回写、localStorage、demo 懒加载、有无 demo 两态；新增纯函数 resolveConfusionTarget(label, entries)（归一化名称/别名精确匹配，无则纯文本）+ 测试。
- 怎么用 /about（D）：44rem；01 三步（大号编号+两栏）；02 为什么术语比形容词管用（引用块 + 形容词→术语→参数对照表）；03 两个误区（✕/✓ 两栏）；04 模板与目录地址（带复制按钮代码块）；05 继续走；保留「怎么用这份词典」锚点与英文无中文硬断言。
- 404：大号 mono 404 + 说明 + 搜索框 + 3 入口；debug 只套壳。

## 7. i18n、内容与文档

- 新增约 40 key（P1 一次性加齐 zh/en，队友只消费不改 strings.ts）：外壳 nav.search/menu/close/skip/tools、footer.index/tools/source；搜索 search.dialogTitle/examples/hot/shortcut/noResults/browseAll/open；首页 home.kicker/hot/toolsTitle/browseAll/step1-3；索引 browse.sort/sortCode/sortName/filters/active/results/railHalls、aliases.jump/groupCount/highlightHint；工作台 entry.output/tabZh/tabEn/tabLink/copyPrompt/reset/params/compareTo/openCompare/metaShape/metaLoop、reverse.detected/matches/rank/hint/exampleCss/exampleText/noMatch/tryBrowse/tryFeel、sheet.export/langZh/langEn/selected/tuned/copyAll/empty；阅读 about.stepTitle/quote/misconception/template/catalog/next；通用 common.copy/copied/close/clear/reset/more/all。
- 保留文案锚点：首页 h1、五个展厅、反查、俗称总表、怎么用这份词典；必须改时同提交更新 smoke。
- index.html：description 改 40 件或不写死数字；theme-color 更新；标题/OG 不动。
- README 更新测试数/chunk/首屏/页面结构 + 设计系统段；新建 docs/DESIGN.md；CONTRIBUTING 加截图验收一句。
- 不改 src/data/**、entryMeta、catalog、词条文案、路由与 URL API。

## 8. 实施（单分支五阶段）

| 阶段 | 内容 | 负责人 | 写作用域 |
| --- | --- | --- | --- |
| P0 基线 | 截图基线 + 记录 check/build/首屏数字 | Lead | 无 |
| P1 基础层 | global.css token；icons；PageHeader/SpecimenPlate/Button/MetaLine/Rule/Tag/Kbd/EmptyState/Skeleton；Layout；SearchDialog + useEntrySearch + suggestionsFor；DemoStage 框架；PromptPanel 骨架；SettingsMenu/Toast 视觉；i18n；index.html；删旧类；smoke 更新 | Lead | src/styles/global.css、src/components/**、src/lib/search.ts 纯函数、src/i18n/strings.ts、src/components/Layout.tsx |
| P2 索引页 | Browse/Aliases/Feel + FilterRow/FilterDisclosure + rail 数据助手与测试 | 队友 A | 三页 + FilterRow/FilterDisclosure + src/lib/indexData.ts/test |
| P3 工作台 | Entry/Reverse/CheatSheet + PromptPanel/ControlPanel/排名行 + confusions 助手与测试 | 队友 B | 三页 + PromptPanel/ControlPanel + src/lib/confusions.ts/test + browseSort |
| P4 叙事页 | Home/About/404/Debug + 首页文案与图版布局 | 队友 C | 四页 |
| P5 收尾 | 截图矩阵修 bug、暗色/英文/移动端、删死代码、README/DESIGN/CONTRIBUTING、性能、PR | Lead | README/docs/CONTRIBUTING/scripts/screenshots.mjs + 修复 |

依赖：P1 完成前 P2–P4 不启动；P2–P4 文件互不重叠可并行；P5 独占。队友不 commit、不改 strings/routes/data/package.json；需要新 key 或跨域修改发消息给 Lead。阶段提交示例：style: 重写设计 token 与页面骨架 / feat: 词条库与俗称总表改为索引版式 / feat: 详情页改为图版与输出舱 / feat: 首页与怎么用页重排 / test: 补索引与易混对照测试 / docs: 记录设计系统与截图验收。

## 9. 测试与验收

- 自动：pnpm check 全绿，测试数 ≥292，新增约 12–18 条：suggestionsFor（空串/拼音/无结果/limit）、browseSort（编号/中文名稳定）、rail 计数（展厅和=40、别名和=251）、resolveConfusionTarget（中文名/别名/未命中）。
- smoke 更新：所有页面 SSR、英文 About 无中文、40 demo 英文无中文、新组件 SSR 安全。
- i18n：现有 zh/en 非空覆盖新 key。
- pnpm build：47 页 + 404 + sitemap 47 不变；dist 无 surface-card、enter-1、--wash-top；index.html description 无「30 个」。
- 预渲染抽查：/、/browse、/reverse、/aliases、/feel、/cheatsheet、/about、/entry/frosted-glass 的 title/desc/canonical/h1。
- 截图矩阵：9 路由 × 375/768/1280；全路由 1280 明暗；首页/词条库/详情 375 暗色；英文抽查 /、/browse、/reverse、/entry/frosted-glass；交互态（搜索弹层、移动菜单、筛选激活、详情调参、反查结果、俗称搜索、速查已选 3、焦点环）。
- 检查：首屏层级、无横向溢出、文字不压线、暗色不脏、图注对齐、中文断行、hover/focus、demo 不裁切。
- 可访问性：skip link、地标、单 h1、弹层/抽屉 focus trap + Esc + 还原 + 滚动锁、combobox ARIA、结果 aria-live、tabs ARIA、表单 label、44px 目标、reduced-motion。
- 性能：首屏 gzip ≤220KB（现状 213）；chunk ≤64；CSS 增量记录；本地 LCP 回归 ≤5%；无新增布局位移。
- DoD：9 路由新视觉无旧残留；check/build 全绿；截图矩阵用户确认；键盘完成搜索→词条→调参→复制、筛选、反查、速查导出；明暗中英三档无溢出；README/DESIGN/CONTRIBUTING/index.html 同步；PR 合并后线上验证。

## 10. 风险

- 去装饰显空 → 线/编号/图注/表格建密度，先做两页对照。
- 换壳期间不一致 → 单分支一次到位，P1 同时替换 Layout、SpecimenPlate 与全部引用。
- 移动抽屉 a11y → 手写 focus trap + Esc + inert + 滚动锁；筛选用原生 details。
- 详情漏内容 → 字段逐项映射并在 P3 验收。
- 文案破坏测试 → 保留锚点，改则同步 smoke。
- 性能回退 → 无依赖、CSS +8KB 内、不引新 chunk。
- 大 PR → 按阶段提交 + PR body 清单 + 截图；squash 合并。
- 方向被否 → P1 只动 token 与壳，可回退。

## 11. 非目标

不改数据/catalog/entryMeta/路由/URL 参数/demo 实现与配色；不加页面（含双向对比页）；不引依赖（图标/动画/字体/截图/axe）；不重做 og/favicon/品牌名/英文词条正文；不做视觉回归 CI；不做打印样式/自动深浅切换逻辑/埋点/后端。

## 12. 假设

保留品牌与博物馆/档案隐喻；朱红唯一强调色；删除背景装饰与卡片阴影可接受；首页仍 3 件；中文系统字体；检索与筛选语义不变；方向若改在 P1 前提出。
