# 贡献指南

前端设计博物馆是一个纯静态、零后端的站点。这份文档是开工依据：怎么写、能改哪里、什么算完成。

第一次参与，建议按顺序读：本文件 → [README](README.md)（项目结构与「新增一条词条」5 步）→ [AGENTS.md](AGENTS.md)（用 AI 代理写代码的话，把它一起交给代理）。

## 1. 环境

- Node **22 或更高**（`.nvmrc` 是 22，CI 也用 22）
- pnpm **11**：`package.json` 的 `packageManager` 已锁版本，装了 corepack 直接 `corepack enable` 即可

```fish
git clone https://github.com/publieople/design-museum.git
cd design-museum
pnpm install
pnpm dev          # http://localhost:5173
```

不要用 npm / yarn 安装：会生成第二份锁文件，CI 走 `--frozen-lockfile`，必然失败。

## 2. 提交门槛

四项全绿，和 CI 一一对应：

```fish
pnpm typecheck    # tsc -b，零错误
pnpm lint         # oxlint，零 error（warning 暂时允许）
pnpm test         # vitest 全绿
pnpm build        # 产物进 dist/
```

`pnpm validate` 只跑内容校验，改词条时可以先跑它快速回归。

本地跑不过就别开 PR —— CI 会挡，来回一轮比本地跑一次慢。

## 3. 分支与 PR

- 分支名 `feat/…`、`fix/…`、`docs/…`、`chore/…`（例：`feat/entry-view-transitions`）
- 一个 PR 只做一件事；混着改的会被要求拆开
- 合并方式是 **Squash merge**，所以 **PR 标题就是最终提交信息**，按下一节的格式写
- 合并条件：CI 四项全绿 + **至少 1 人 approve**；作者不能 approve 自己
- 合并后源分支自动删除
- 涉及视觉的改动**必须在 PR 里贴图**（改动前后各一张更好）——只看代码看不出手感

从 fork 提 PR 时，第一次需要维护者点一次 "Approve and run workflows" CI 才会跑，等放行即可。

## 4. 提交信息

沿用仓库现有风格：**Conventional Commits + 中文描述**。

```
feat: 新增 view-transition 词条
fix: 修滚动驱动进度条跟内容错位
style: 三层交互手感统一
docs: 补贡献指南
```

| type | 用途 |
|---|---|
| feat | 新词条、新功能 |
| fix | 修 bug |
| style | 纯视觉调整（不改行为） |
| refactor | 不改行为的结构调整 |
| docs | 文档 |
| test | 测试 |
| chore | 构建、依赖、CI |
| perf | 性能 |

scope 可选，如 `fix(router): …`。一条提交只做一件事；正文写"为什么"，"改了什么"代码里都看得见。

## 5. 你能改哪里

冲突大多来自"改了别人正要改的文件"，按下面的边界走：

**内容贡献者可以自由改**

- `src/data/entries/<展厅>/<slug>.ts` —— 词条内容
- `src/demos/<slug>.tsx` —— 对应演示（文件名必须等于 slug）

**先开 Issue 讨论再改**

- `src/lib/**` —— 路由、检索、偏好、提示词等逻辑，动一下影响全站
- `src/components/**` —— 布局、卡片、舞台等共享组件
- `index.html`、`vite.config.ts`、`tsconfig*.json`、`.oxlintrc.json`、`.github/**`

新增运行时依赖属于最后一类，默认答案是"不加"：这个站刻意不引路由库、检索库、状态库、UI 组件库（原因见 README 的「技术栈」）。

## 6. 内容规则

完整 5 步在 [README](README.md) 的「新增一条词条」一节。这里只列会被测试拦下的硬规矩：

- `aliases` 必须写口语俗称（「磨砂」「果冻」）——搜索靠它命中
- `confusions` 至少一条：和最容易混的效果差在哪
- `refs` 至少一条 MDN / web.dev / W3C 的链接，**别凭印象写属性名**，去链接里核对
- `oneLiner` 写"它是什么"，不写"它能带来什么价值"
- `loop` 按演示的**实际行为**选（`replay` / `continuous` / `manual`），别按名字猜

## 7. 文案与无障碍

这几条有测试把关，绕不过去：

- 界面文案只进 `src/i18n/strings.ts`，每条 `{ zh, en }` 都不能空；组件里不写死字符串
- 词条正文走 `en` 覆盖层（逐字段回退），术语 / 别名 / 关键词不翻译
- 演示里的示例文案必须按 `locale` 切换：测试会检查英文模式下渲染结果里没有任何中文字符
- 会动的效果走 `usePrefersReducedMotion()`；焦点要可见，交互元素用原生标签
- demo 里不写死颜色，用 `var(--stage-ink)` / `var(--stage-muted)`；需要不透明底时用 `color-mix(in srgb, var(--stage-ink) 10%, var(--stage-bg, transparent))`

## 8. 评审清单（reviewer 用）

- [ ] 四项命令作者本地跑过，CI 全绿
- [ ] 词条有公认名字，不是自造概念
- [ ] `refs` 能点开，属性与取值和文档对得上
- [ ] `confusions` 真能区分两个易混效果，不是同义反复
- [ ] `loop` 与实际行为一致
- [ ] 参数滑块真的改变画面，不是装饰
- [ ] 中英各看一遍：中文下无英文残留，英文下无中文字符
- [ ] 视觉改动有截图，深浅两种主题都看过
- [ ] 没有新增依赖（有的话理由是否成立）
- [ ] 没有引入外部请求（字体、图片、分析脚本）

## 9. 许可与版权

- 代码 [MIT](LICENSE)，内容 [CC BY 4.0](LICENSE-CONTENT)，第三方素材见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)
- **提交即表示你有权提交这些内容，并同意以本项目的上述许可发布**。本项目不要求 CLA，也不强制 `Signed-off-by`（如果之后法务有要求，会在这里加 DCO 检查）
- 从别处拷来的代码、图片、字体一律不许直接进仓库；确需引入时先开 Issue，并按 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) 第 5 节的四步登记

## 10. 沟通

- 问题、提议、词条申请都开 Issue，模板已经准备好
- 维护者会在 **48 小时内**给出第一次反馈；超过两天没动静，直接在 Issue 里 @publieople
- 合并权限目前由维护者持有，长期贡献者会被加为 collaborator（Write 权限）
