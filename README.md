# 前端设计博物馆

**先给效果起个名字，再让 AI 实现它。**

用 AI 做网页时最卡的一步，往往不是不会做，而是不知道那个效果叫什么。这个站把常见前端设计效果做成可以看、可以摸、可以调参数的「标本」，每条都给出中英术语、推荐取值和一段可以直接粘给 AI 的需求描述。

线上：<https://publieople.github.io/design-museum/>

## 这个站里有什么

- **30 条词条**，分五个展厅：动效与节奏、交互反馈、布局与结构、视觉质感、排版与文字。每条**中英双语**。
- **每条词条**：一句话是什么、什么时候用、最容易混的两个概念差在哪、真实踩坑、推荐取值、无障碍降级写法、参考链接，以及——
- **一个活的演示**：参数滑块实时生效，舞台背景可切浅色/深色/彩色/照片感（毛玻璃、发光这类效果离开背景就不成立），可重播、可**循环重播**、可**慢放**。词条库里的缩略图会等比放大到填满卡片，**该循环的才循环**（见下）。
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
pnpm test         # vitest：内容校验 + 检索 + 参数 URL + 偏好 + i18n + 提示词 + 页面与 demo 渲染冒烟（177 项）
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

### 循环重播不是无差别的

最开始循环是无条件加在所有演示上的，结果很糟：进度类会瞬间弹回起点，滚动类会跟用户打架，本来就自己在动的会被打断。所以每个词条都要声明自己的循环策略（`loop` 字段，`src/lib/loop.ts` 决定怎么用）：

| 取值 | 含义 | 数量 |
|---|---|---|
| `replay` | 挂载后自己播一次就停，重播就是再看一遍（交错进场、弹簧、逐字显现、数字滚动） | 4 |
| `continuous` | 不需要外部重播——它自己在动（骨架微光、渐变漂移、颗粒抖动、描边自转），或者本来就是静态的（毛玻璃、玻璃拟态、可变字体） | 11 |
| `manual` | 要用户滚动 / 拖动 / 指针交互才会动（视差、滚动驱动、粘性、滚动吸附、磁吸、按压反馈、手风琴、瀑布流） | 15 |

只有 `replay` 会被循环定时器重挂载。`manual` 的缩略图左下角会显示「↕ 自己动手试试」——不放这个角标的话，滚动驱动的卡片看上去就只是一张静止的图。

### 版式

列表类页面（词条库 / 感觉导航 / 速查表）外壳放到 `max-w-[90rem]`，大屏下卡片约 450px；正文类页面（首页 / 词条详情 / 怎么用）保持 `max-w-5xl` 的易读行宽。缩略图舞台用 `aspect-[4/3]` 跟着卡片宽度自适应，里面的 demo 由 `DemoRunner` 量出自然尺寸后等比缩放到填满舞台（0.7–1.7 倍）——30 个 demo 各自按自己的尺寸设计，不缩放的话在宽卡片里只占一小块。

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
│   ├── search.ts  prompt.ts  copy.ts  controls.ts  motion.ts  viewport.ts
│   ├── timeScale.ts          # 慢放：给子树里的 Web Animations 设 playbackRate
│   ├── loop.ts               # 循环策略：哪些演示该被自动重播
│   └── replay.ts             # 循环重播用的计数器
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
   - `oneLiner` 一句话说清「它是什么」，不写「它能带来什么价值」；
   - `loop` 要按 demo 的**实际行为**选，别按名字猜——选的依据见上面那张表。
4. 写 `src/demos/<slug>.tsx`，默认导出组件，接收 `{ values, stage, replayKey, timeScale, locale }`。控件一动画面就要变；会动的记得走 `usePrefersReducedMotion()`；配色用 `var(--stage-ink)` 而不是写死颜色；需要一块不透明的底（进度条轨道、卡片面）时用 `color-mix(in srgb, var(--stage-ink) 10%, var(--stage-bg, transparent))`，`--stage-bg` 是当前舞台的实底近似色；**组件里的示例文案也要按 `locale` 切换**——测试会检查英文模式下渲染结果里没有任何中文字符。
5. 跑 `pnpm test`。绿了就完事——缺 demo、字段空、编号不连续、`related` 有死链、`en` 块条数对不齐都会被拦下来。

## 部署

推送到 `main` 后由 `.github/workflows/deploy.yml` 自动构建并发布到 GitHub Pages（`VITE_BASE=/design-museum/`）。首次需要把 Pages 的 Source 设为 **GitHub Actions**：

```bash
gh api -X POST repos/publieople/design-museum/pages -f build_type=workflow
```

## 部署后的自愈

站点是拿 hash 文件名做分包懒加载的，于是有一个经典的坑：**部署刚完成时，浏览器缓存里可能还是上一份 `index.html`，而它引用的那些 chunk 已经被新构建整批换掉**——动态 import 会 404，页面直接白屏。部署后十几分钟内回访的用户都会撞上，这个项目在 CI 上真实发生过。

`src/lib/lazyWithRetry.ts` 处理了它：任何 chunk 加载失败就 `location.reload()` 一次，用 `sessionStorage` 标记防止刷新死循环，加载成功就把标记清掉（所以下一次部署还能再自愈）。有 4 条单测覆盖这个行为。

## 协作

- [CONTRIBUTING.md](CONTRIBUTING.md) —— 环境、提交门槛、分支与 PR 流程、提交信息格式、**能改哪里**、评审清单
- [AGENTS.md](AGENTS.md) —— 给 AI 编码代理的硬规矩（用 Cursor / Claude Code / DSH 之类写代码时，把它一起交给代理）
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) —— 行为准则
- [`.github/`](.github/) —— PR 模板与 Issue 表单（报告问题 / 申请新词条）

规则不靠自觉，靠 CI 和分支保护：

| 位置 | 规则 |
|---|---|
| PR | `CI / verify` 必须绿：install → typecheck → lint → test → build |
| main | 受保护：不能直推、不能 force push、必须 PR + 1 人 approve、保持线性历史 |
| 合并 | Squash merge，**PR 标题即提交信息**，合并后自动删除源分支 |

维护者本地重放这些设置（`gh` 已登录）：

```fish
# 分支保护
gh api -X PUT repos/publieople/design-museum/branches/main/protection --input - <<'JSON'
{
  "required_status_checks": { "strict": true, "contexts": ["verify"] },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false,
    "required_approving_review_count": 1
  },
  "restrictions": null,
  "required_linear_history": true,
  "allow_force_pushes": false,
  "allow_deletions": false
}
JSON

# 合并方式：只留 squash / rebase，合并后删分支
gh api -X PATCH repos/publieople/design-museum \
  -F allow_merge_commit=false -F allow_squash_merge=true -F allow_rebase_merge=true \
  -F delete_branch_on_merge=true \
  -F squash_merge_commit_title=PR_TITLE -F squash_merge_commit_message=PR_BODY
```

两个注意点：

- `enforce_admins` 现在是 `false`：维护者在只有自己一个人时还能直接合并。等有两人以上写权限，改成 `true`。
- 外部贡献者从 fork 提 PR 时，第一次需要维护者在 Actions 页面点一次 **Approve and run workflows**，否则 CI 不会跑、必过检查永远不上报。

## 许可

**代码 MIT，内容 CC BY 4.0**；第三方组件与字体的完整清单见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。

| 许可 | 覆盖范围 |
|---|---|
| [MIT](LICENSE) | `src/**`（除下行的数据与文案）、`index.html`、构建与配置文件、`.github/**` |
| [CC BY 4.0](LICENSE-CONTENT) | `src/data/entries/**`、`src/data/taxonomy.ts`、`src/i18n/strings.ts`、各 `.md` 文档、`public/og.png` |

转载或改编内容时请注明「前端设计博物馆」并保留许可声明。

两个字体（JetBrains Mono、Space Grotesk）是 SIL OFL 1.1，许可全文在 `public/licenses/` 下，**会跟着构建进产物**（`dist/licenses/`），站点「怎么用」页也给了入口——OFL 要求许可与字体一起分发。

## 已知限制

- **sitemap 只有入口页**：hash 路由下 30 条词条共享同一个 URL，爬虫拿不到独立地址。要真正被搜到需要改成 BrowserRouter + 预渲染。
- `pnpm lint` 目前有 19 条 react-hooks 相关的 warning（0 error）。CI 会跑 lint，只拦 error，warning 不阻塞合并。

## 待办（按性价比排序）

1. 反查：粘贴一段代码或别人的描述 → 说出它叫什么。
2. 拼音搜索（maoboli → 毛玻璃）与错别字容错。
3. 俗称总表页：把全站 `aliases` 汇总成可搜、可贡献的一页。
4. 「别搞混」做成双向对比页（毛玻璃 ⇄ 玻璃拟态 ⇄ 半透明）。
5. 视觉回归测试：30 个 demo 的截图对比。

## 致谢

词条内容参考 MDN Web Docs、web.dev 与 W3C 相关规范；本地写作时也参考了 `ui-ux-pro-max` 技能中的动效与 UX 规则数据。

第三方依赖与字体的声明见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
