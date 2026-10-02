# 前端设计博物馆

**先给效果起个名字，再让 AI 实现它。**

用 AI 做网页时最卡的一步，往往不是不会做，而是不知道那个效果叫什么。这个站把常见前端设计效果做成可以看、可以摸、可以调参数的「标本」，每条都给出中英术语、推荐取值和一段可以直接粘给 AI 的需求描述。

## 这个站里有什么

- **30 条词条**，分五个展厅：动效与节奏、交互反馈、布局与结构、视觉质感、排版与文字。
- **每条词条**：一句话是什么、什么时候用、最容易混的两个概念差在哪、真实踩坑、推荐取值、无障碍降级写法、参考链接，以及——
- **一个活的演示**：参数滑块实时生效，舞台背景可切浅色/深色/彩色/照片感（毛玻璃、发光这类效果离开背景就不成立），可重播。
- **一键复制的提示词**：中文需求句（带当前参数）和英文关键词（AI 最容易认的术语），随滑块实时更新。
- **感觉导航**：不知道叫什么，就回答「用在哪 / 什么感觉 / 想达到什么」，从候选里挑。
- **速查表**：勾选这次要用的几个效果，导出一整段需求清单，一次给 AI 说清。

## 本地跑

```bash
pnpm install
pnpm dev          # http://localhost:5173
```

其他命令：

```bash
pnpm typecheck    # tsc -b，零错误是提交门槛
pnpm test         # vitest：内容校验 + 检索 + 提示词 + 渲染冒烟
pnpm validate     # 只跑内容校验
pnpm build        # 产物在 dist/
pnpm preview      # 预览产物
```

打开 `#/debug/all` 会把全馆 demo 一次挂起来，谁崩了一眼就能看到。

## 技术栈

Vite 8 + React 19 + TypeScript + Tailwind CSS v4。零后端，纯静态产物，可托管在 GitHub Pages / Vercel / 任意静态空间。

刻意的取舍：

- **不引路由库**：只有 6 个路由且是静态托管，`src/lib/router.tsx` 是一个基于 `hashchange` 的 40 行 hash 路由，顺带省掉 Pages 的 404 重写。
- **不引检索库**：几十条数据在内存里，`src/lib/search.ts` 用「归一化 + 分字段加权 + 逐词兜底」打分，够用且可单测。
- **字体本地打包**：`@fontsource-variable/*`，不请求外部字体 CDN，首次加载不闪、离线可用。

## 目录结构

```
src/
├── data/
│   ├── types.ts              # Entry / Control / DemoProps —— 内容模型的唯一真相
│   ├── taxonomy.ts           # 五个展厅、场景、感觉、目的的标签
│   ├── index.ts              # import.meta.glob 自动聚合所有词条
│   ├── entries/<展厅>/<slug>.ts
│   ├── entries.test.ts       # 每条词条自身合法 + 与 demo 一一对应
│   └── content.test.ts       # 全馆收齐（30 条 / 每厅 6 条 / 无死链）
├── demos/
│   ├── registry.ts           # import.meta.glob 自动注册 demo
│   └── <slug>.tsx            # 文件名必须等于词条 slug
├── components/               # DemoStage / ControlPanel / PromptCard / EntryCard ...
├── lib/                      # router / search / prompt / copy / controls / motion / viewport
├── pages/                    # 首页 / 词条库 / 详情 / 感觉导航 / 速查表 / 怎么用 / 冒烟页
└── styles/global.css         # 设计 token 与少量全局关键帧
```

## 新增一条词条（5 步）

1. 想清楚它有没有公认的名字。没有名字的效果先别加——这个站的价值全在「有名字」。
2. 复制 `src/data/entries/visual/frosted-glass.ts`，放到对应展厅目录下，文件名用 slug。
3. 填内容。几条硬规矩：
   - `aliases` 里必须写大家嘴上会说的中文俗称（「磨砂」「果冻」），搜索靠它命中；
   - `confusions` 至少一条，写清它和最容易混的效果差在哪（AI 也最容易在这里做错）；
   - `refs` 至少一条 MDN 或 web.dev，别凭印象写属性；
   - `oneLiner` 一句话说清「它是什么」，不写「它能带来什么价值」。
4. 写 `src/demos/<slug>.tsx`，默认导出组件，接收 `{ values, stage, replayKey }`。控件一动画面就要变；会动的记得走 `usePrefersReducedMotion()`；配色用 `var(--stage-ink)` 而不是写死颜色。
5. 跑 `pnpm test`。绿了就完事——缺 demo、字段空、编号不连续、`related` 有死链都会被测试拦下来。

## 部署

推送到 `main` 后由 `.github/workflows/deploy.yml` 自动构建并发布到 GitHub Pages（`VITE_BASE=/design-museum/`）。首次需要把 Pages 的 Source 设为 **GitHub Actions**：

```bash
gh api -X POST repos/publieople/design-museum/pages -f build_type=workflow
```

部署到 Vercel 也一样，构建产物就是 `dist/`，不需要 `VITE_BASE`。

## 待办（第二批候选）

命令面板（command palette）、自定义光标、共享元素过渡、拖拽排序、无限滚动、容器查询、暗色模式切换、弹出层 popover、模态与抽屉、头像堆叠。

## 致谢

词条内容参考 MDN Web Docs、web.dev 与 W3C 相关规范；本地写作时也参考了 `ui-ux-pro-max` 技能中的动效与 UX 规则数据。
