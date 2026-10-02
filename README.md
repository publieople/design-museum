# 前端设计博物馆

**先给效果起个名字，再让 AI 实现它。**

用 AI 做网页时最卡的一步，往往不是不会做，而是不知道那个效果叫什么。这个站把常见前端设计效果做成可以看、可以摸、可以调参数的「标本」，每条都给出中英术语、推荐取值和一段可以直接粘给 AI 的需求描述。

线上：<https://publieople.github.io/design-museum/>

## 这个站里有什么

- **30 条词条**，分五个展厅：动效与节奏、交互反馈、布局与结构、视觉质感、排版与文字。每条**中英双语**。
- **每条词条**：一句话是什么、什么时候用、最容易混的两个概念差在哪、真实踩坑、推荐取值、无障碍降级写法、参考链接，以及——
- **一个活的演示**：参数滑块实时生效，舞台背景可切浅色/深色/彩色/照片感（毛玻璃、发光这类效果离开背景就不成立），可重播、可**循环重播**、可**慢放**。
- **一键复制的提示词**：中文需求句（带当前参数）和英文关键词（AI 最容易认的术语），随滑块实时更新；外加一个**分享链接**，把你调好的那组参数一起带走。
- **感觉导航**：不知道叫什么，就回答「用在哪 / 什么感觉 / 想达到什么」，从候选里挑。
- **速查表**：勾选这次要用的几个效果，导出一整段需求清单；**会带上你在词条页调过的参数**，不是永远用默认值。

## 设置（右上角）

| 设置项 | 说明 |
|---|---|
| 站点主题 | 浅色 / 深色 / 跟随系统，切换带过渡动画 |
| 界面语言 | 中文 / English，切换同样有过渡 |
| 展品背景 | 按展品自动，或强制全馆统一用某一种背景 |
| 循环重播 | 演示自动一遍遍重播 |
| 慢放 | 约 1/3 速度，方便看清缓动与弹簧 |

**站点主题和展品背景是分开记录的两个偏好**，改一个不会影响另一个：主题决定界面色调，展品背景只决定演示区那面「墙」的颜色。两者都存在 `localStorage` 里，并且 `index.html` 里有一段内联脚本在 React 挂载前就把主题落到 `<html>`，所以刷新不会闪一下再变色。

## 本地跑

```bash
pnpm install
pnpm dev          # http://localhost:5173
```

```bash
pnpm typecheck    # tsc -b，零错误是提交门槛
pnpm test         # vitest：内容校验 + 检索 + 参数 URL + 偏好 + i18n + 提示词 + 渲染冒烟（120 项）
pnpm validate     # 只跑内容校验
pnpm build        # 产物在 dist/
pnpm preview      # 预览产物
```

打开 `#/debug/all` 会把全馆 demo 一次挂起来，谁崩了一眼就能看到。

## 键盘

- `/` 聚焦搜索框（在别的输入框里打字时不会抢）
- `↑` `↓` 在搜索建议里移动，`Enter` 打开，`Esc` 清空
- 搜索框是一个符合 combobox 语义的控件，带 `aria-activedescendant`

## 技术栈

Vite 8 + React 19 + TypeScript + Tailwind CSS v4。零后端，纯静态产物。

刻意的取舍：

- **不引路由库**：只有 6 个路由且是静态托管，`src/lib/router.tsx` 是四十来行的 hash 路由，顺带省掉 Pages 的 404 重写。
- **不引检索库**：几十条数据在内存里，`src/lib/search.ts` 用「归一化 + 分字段加权 + 逐词兜底」打分。
- **不引状态库**：偏好只有五项，`src/lib/prefs.tsx` 一个 context 就够。
- **字体本地打包**：`@fontsource-variable/*`，不请求外部字体 CDN。

### 性能

页面与 demo 都是按需加载：`src/demos/registry.ts` 用非 eager 的 `import.meta.glob`，30 个 demo 各自成一个 chunk（每个 1–4KB），首页只下载真正挂出来的那几个；`src/App.tsx` 里各页面也是 `lazy`。构建产物 46 个 chunk。改之前是单包 433KB（gzip 138KB），现在首屏约 356KB（gzip 119KB），且换页不再重新下载所有 demo。

## 目录结构

```
src/
├── data/
│   ├── types.ts              # Entry / Control / DemoProps / EntryTranslation
│   ├── taxonomy.ts           # 展厅、场景、感觉、目的（双语标签）
│   ├── index.ts              # import.meta.glob 聚合词条
│   ├── entries/<展厅>/<slug>.ts
│   ├── entries.test.ts       # 每条词条自身合法 + 与 demo 一一对应 + 英文覆盖层
│   └── content.test.ts       # 全馆收齐（30 条 / 每厅 6 条 / 无死链）
├── demos/<slug>.tsx          # 文件名必须等于词条 slug，按需加载
├── i18n/
│   ├── strings.ts            # 界面文案表（每条都必须有 zh 与 en，有测试把关）
│   ├── index.tsx             # translate() / useT() / useLocale()
│   └── pick.ts               # 词条双语取值（en 缺失回退中文）
├── lib/
│   ├── prefs.tsx             # 主题 / 语言 / 展品背景 / 慢放 / 循环，落 localStorage
│   ├── localize.ts           # 把 Entry + 英文覆盖层解析成单语视图
│   ├── entryState.ts         # 参数 ↔ URL、调过的参数记忆
│   ├── search.ts  prompt.ts  copy.ts  controls.ts  motion.ts  viewport.ts  timeScale.ts
├── components/               # DemoStage / DemoRunner / ControlPanel / PromptCard / SettingsMenu ...
├── pages/
└── styles/global.css         # 设计 token、主题变量、切换过渡
```

## 双语是怎么做的

界面文案走 `src/i18n/strings.ts`，一条 key 一份 `{ zh, en }`，测试会检查两版都非空。

词条正文不走文案表：每个词条文件里有一个**可选的 `en` 覆盖层**，只放需要翻译的散文（`oneLiner` / `whenToUse` / `confusions` / `pitfalls` / `spec.label` / `reducedMotion` / `controls` 的 label 与 hint）。`src/lib/localize.ts` **逐字段回退**：没翻的字段自动显示中文，所以英文可以一条条慢慢补，不会因为缺一两句就露出空白。术语、别名、关键词本来就有英文，不参与翻译。

## 新增一条词条（5 步）

1. 想清楚它有没有公认的名字。没有名字的效果先别加——这个站的价值全在「有名字」。
2. 复制 `src/data/entries/visual/frosted-glass.ts`，放到对应展厅目录下，文件名用 slug。
3. 填内容。几条硬规矩：
   - `aliases` 里必须写大家嘴上会说的中文俗称（「磨砂」「果冻」），搜索靠它命中；
   - `confusions` 至少一条，写清它和最容易混的效果差在哪（AI 也最容易在这里做错）；
   - `refs` 至少一条 MDN 或 web.dev，别凭印象写属性；
   - `oneLiner` 一句话说清「它是什么」，不写「它能带来什么价值」。
4. 写 `src/demos/<slug>.tsx`，默认导出组件，接收 `{ values, stage, replayKey, timeScale }`。控件一动画面就要变；会动的记得走 `usePrefersReducedMotion()`；配色用 `var(--stage-ink)` 而不是写死颜色。
5. 跑 `pnpm test`。绿了就完事——缺 demo、字段空、编号不连续、`related` 有死链、`en` 块条数对不齐都会被拦下来。

## 部署

推送到 `main` 后由 `.github/workflows/deploy.yml` 自动构建并发布到 GitHub Pages（`VITE_BASE=/design-museum/`）。首次需要把 Pages 的 Source 设为 **GitHub Actions**：

```bash
gh api -X POST repos/publieople/design-museum/pages -f build_type=workflow
```

## 已知限制

- **demo 内部的文案仍是中文**（比如示例卡片上的「把需求写清楚」）。界面与词条正文都已双语，但 30 个 demo 组件里的示例文字还没接 `useLocale()`。英文界面下这是唯一还成片出现中文的地方。
- **sitemap 只有入口页**：hash 路由下 30 条词条共享同一个 URL，爬虫拿不到独立地址。要真正被搜到需要改成 BrowserRouter + 预渲染。
- `pnpm lint` 有若干 react-hooks 的 warning（0 error），未纳入 CI 门槛。

## 待办（按性价比排序）

1. demo 内部文案接 i18n，补上英文界面最后一块中文。
2. 反查：粘贴一段代码或别人的描述 → 说出它叫什么。
3. 拼音搜索（maoboli → 毛玻璃）与错别字容错。
4. 俗称总表页：把全站 `aliases` 汇总成可搜、可贡献的一页。
5. 「别搞混」做成双向对比页（毛玻璃 ⇄ 玻璃拟态 ⇄ 半透明）。
6. 视觉回归测试：30 个 demo 的截图对比。

## 致谢

词条内容参考 MDN Web Docs、web.dev 与 W3C 相关规范；本地写作时也参考了 `ui-ux-pro-max` 技能中的动效与 UX 规则数据。
