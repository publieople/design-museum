# 词条流水线：从「看到别人的效果」到「上线一条词条」

这份文档把「找网站 → 拆效果 → 自己重新实现」固化成可重复的流程。
[ENTRY-SPEC.md](ENTRY-SPEC.md) 回答「什么算一条、字段怎么填」，本文回答**一条词条怎么被生产出来**：
谁在什么时候做什么、做完拿什么当证据、卡住了退回哪一步。

适用对象：人（发现与终审）与 agent（拆解、实现、写作、自检）。两条产线共用同一个候选池
`docs/entry-backlog.json`——它是唯一真源，聊天记录和临时笔记都不算数。

---

## 0. 一分钟版

| # | 阶段 | 一句话 | 产物 | 谁拍板 |
| --- | --- | --- | --- | --- |
| 1 | 发现 scout | 在别人的站点上看到值得命名的效果 | backlog 里一条 `candidate` | 人 |
| 2 | 拆解 extract | 拆成六格，判断算不算「一条」 | 六格表 + 四条判据结论 | agent 提议，人确认 |
| 3 | 立项 triage | 查重、定厅/形态/编号、排优先级 | 状态升到 `triaged` / `planned` | 人 |
| 4 | 实现 build | 生成骨架，词条 + demo 一起写 | `entries/<厅>/<slug>.ts` + `demos/<slug>.tsx` | agent |
| 5 | 写作 write | 中文正文、英文覆盖层、prompt、refs | 词条字段全部填满 | agent |
| 6 | 验收 verify | 测试 + 构建 + 截图 + 人眼四舞台 | 全绿的本地分支 | agent 自检，人终审 |
| 7 | 发布 ship | 分支 → PR → 合并 → 线上验证 | 线上可访问的词条页 | 人 |

状态机（`docs/entry-backlog.json` 的 `status` 字段）：

```text
candidate ──拆解通过──▶ triaged ──排进本轮──▶ planned ──合并上线──▶ shipped
    │                      │                    │
    └──判定「不算一条」──▶ 删掉或并进现有词条的 aliases
```

硬规矩：**`shipped` 必须对应真实存在的词条文件；非 `shipped` 的 slug 不许已经存在。**
这条由 `scripts/backlog.mjs` 校验，状态和文件对不上时 `pnpm backlog` 直接 exit 1。

---

## 1. 发现（scout）

**目标**：把「这个效果好看」变成一条能被检索、能被复现的候选记录。不是收藏链接。

### 从哪找

完整清单与每个来源的挖法见 [ENTRY-SOURCES.md](ENTRY-SOURCES.md)。优先级从高到低：

1. **组件库**（MagicUI、Aceternity UI、React Bits、Hover.dev、Uiverse.io）——效果边界清楚、有名字、可逐组件拆解；
2. **教程站**（Codrops、CSS-Tricks、web.dev、MDN）——有原理与推荐值，适合补 `spec` 与 `reducedMotion`；
3. **作品集与获奖站**（Awwwards、Godly）——**只做灵感**，不逐像素拆，因为它们是多个效果叠加的成品页；
4. **用户提问**——「那种鼠标移上去卡片浮起来的效果叫什么」是最好的选题，说明检索词缺口真实存在。

### 多久扫一次

- **每周一次，30 分钟**：把本周看到的链接过一遍，只做「值不值得进池」的判断；
- **每月一次，2 小时**：按 [ENTRY-SOURCES.md](ENTRY-SOURCES.md) 逐个来源翻新上架组件，补 `candidate`；
- **每季度一次**：清池——半年没动的 `candidate` 要么降级删掉，要么补一句「为什么还值得做」。

### 记录什么

直接往 `docs/entry-backlog.json` 的 `items` 里加一条，字段固定八个：

```json
{
  "slug": "tilt-card",
  "nameZh": "3D 倾斜卡片",
  "nameEn": "3D Tilt Card",
  "hall": "motion",
  "shape": "interactive",
  "source": "Codrops https://tympanus.net/codrops/",
  "status": "candidate",
  "note": "整张卡片按指针位置做 perspective 旋转，悬停抬升只上浮不转向。"
}
```

- `slug` 先定，因为它是查重键；kebab-case，别用 `effect-1` 这种占位名；
- `source` 必须带 URL，**只记来源页，不存截图、不存源码**；
- `note` 一句话说清「它和已有词条的差别」，写不出差别说明大概率是同义项。

### 阶段约定

| 项 | 内容 |
| --- | --- |
| 输入 | 浏览记录、用户提问、来源清单 |
| 输出 | backlog 中一条 `status: "candidate"` |
| 负责人 | 人发现；agent 可代填字段（但 `note` 要人过一眼） |
| 检查点 | `node scripts/backlog.mjs` 通过；slug 不与在册/墓碑冲突 |
| 失败退回 | 说不清「这是什么效果」→ 停在自己的笔记里，不进池；只是「好看」→ 不进池 |

---

## 2. 拆解（extract）

**目标**：把一段观感拆成可实现的参数，并回答「这算不算独立的一条」。

### 六格拆解法

任何效果都能拆成六格。缺任何一格，实现阶段一定返工。

| 格 | 要回答的问题 | 反例（没拆开） | 正例 |
| --- | --- | --- | --- |
| **命名** | 它叫什么？英文术语是什么？口语怎么叫？ | 「卡片动一下」 | 3D Tilt Card / 倾斜卡片 / 「卡片跟着鼠标歪」 |
| **触发** | 什么让它开始？hover / 指针位置 / 滚动 / 时间 / 点击 / 进入视口 | 「鼠标动」 | 指针在卡片内移动，按相对中心的偏移驱动旋转 |
| **时间** | 多快、什么曲线、是否循环、能否打断 | 「很快」 | 120ms 回到原位，cubic-bezier(0.22,1,0.36,1)，离开即回弹 |
| **空间** | 在哪个平面动？位移/旋转/缩放/透视距离、变换原点 | 「转一下」 | rotateX/rotateY ≤ 12deg，perspective 800px，transform-origin 中心 |
| **参数** | 哪些值值得做成控件？合理区间与默认值 | 「可以调」 | 最大倾角 4–20deg（默认 10），透视 400–1600px（默认 800） |
| **降级** | 触屏、键盘、reduced-motion、不支持时各是什么样 | 「不支持就算了」 | reduced-motion 时取消旋转只留阴影与描边高亮；触屏改为点击态 |

拆完先自己实现一遍最小版（20–40 行、零依赖）。**实现不出来说明还没拆开**，回上一步补观察。

### 判断「算不算一条」：ENTRY-SPEC 的四条判据

逐条对照 [ENTRY-SPEC.md](ENTRY-SPEC.md) 第 1 节：

1. **有名字**——中文能叫出口、英文有通行术语，用户能拿它去搜；
2. **有属性**——能用具体数值描述（时长、角度、模糊半径、间距），不是纯形容词；
3. **能演示**——一个自带舞台的 demo 就能还原，不需要整页滚动或后端；
4. **能提需求**——能写成一句可执行的 prompt，交给 AI 就能做出七八成。

四条全过才立项。另外三条「不算」的红线：

- **纯风格**（「赛博朋克风」）→ 拆成具体效果再收；
- **同义别名**（已有词条的口语说法）→ 写进现有词条的 `aliases`，不新增；
- **同效果不同档位**（「弱一点的毛玻璃」）→ 做成 `controls` 的参数，不新增。

### 什么时候拆成两条

同时满足才拆：**专名可查** + **视觉可区分** + **主属性集不同**（例如一个靠 `filter`、一个靠 `transform`）。
拆开后两条的 `confusions` 必须互相指认，否则搜索会把它们混成一个。

### 阶段约定

| 项 | 内容 |
| --- | --- |
| 输入 | 一条 `candidate` + 来源页 |
| 输出 | 六格表（模板 A）+ 四条判据结论 + 最小实现草稿（不进仓库） |
| 负责人 | agent 主拆；人确认命名与边界 |
| 检查点 | 六格无空格；最小实现能跑；判据四条全过 |
| 失败退回 | 拆不出参数 → 回 scout 补观察；判定同义 → 并进现有词条 `aliases` 并删候选 |

---

## 3. 立项（triage）

**目标**：把「值得做」变成「可以开工」：位置定了、编号定了、重复排除了。

### 步骤

1. **查重**（必做，且要看命中理由）：

   ```fish
   pnpm find:entry "鼠标移上去卡片歪一下"
   ```

   命中现有词条 → 停：要么补它的 `aliases`，要么确认差异足够大并在 `note` 里写清。
   搜不到任何东西 → 说明这个词确实缺，是好选题。

2. **定展厅**（`hall`，即 `category`）：按「效果主要解决什么问题」选，不按实现技术选。

   | hall | 收什么 | 典型 |
   | --- | --- | --- |
   | `motion` | 位移、节奏、编排 | 交错进场、弹簧、视差 |
   | `feedback` | 对用户操作的即时回应 | 按压反馈、轻提示、骨架屏 |
   | `layout` | 内容的空间组织与容器行为 | Bento 网格、粘性头部、瀑布流 |
   | `visual` | 材质、光、颜色、纹理 | 毛玻璃、渐变网格、颗粒噪点 |
   | `type` | 文字本身的排布与动效 | 逐字显现、流体排版、描边文字 |

3. **定形态**（`shape`）：`stage` 默认；需要指针交互 → `interactive`；需要滚动容器 → `scroll`；
   分步推进 → `sequence`；两块页面切换 → `page`。非 `stage` 记得 `thumb: 'still'`。
4. **定编号**：`pnpm new:entry <slug> --hall <厅> --shape <形态>` 会自动取该厅下一个连续编号，
   **不要手填**。厅内编号必须从 01 连续，跳号测试会红。
5. **排优先级**：写进 backlog 后把状态改成 `triaged`（拆解完成、可开工）；
   决定本轮做的改成 `planned`，并保证每厅 `shipped + planned` 向 `hallTarget`（默认 12）靠近。
6. **补关系**：顺手想好 `related` 候选（2–3 条在册词条），写进候选记录的 `note` 或单独记在 PR 描述里，
   实现时不用再想。

### 阶段约定

| 项 | 内容 |
| --- | --- |
| 输入 | 六格表 + 判据结论 |
| 输出 | backlog 状态 `triaged`/`planned`；厅、形态、编号、slug 全部确定 |
| 负责人 | 人（拍板优先级与厅归属） |
| 检查点 | `pnpm find:entry` 无同义命中或已写清差异；`pnpm backlog` exit 0；厅内编号可连续 |
| 失败退回 | 撞名 → 回 extract 重新界定；厅归属摇摆 → 按「用户为什么需要它」定，不按技术栈定 |

---

## 4. 实现（build）

**目标**：词条数据与 demo 一起长出来，零依赖、可 SSR、能被测试和截图管线消费。

```fish
pnpm new:entry tilt-card --hall motion --shape interactive
# → src/data/entries/motion/tilt-card.ts
# → src/demos/tilt-card.tsx
```

骨架必然测试红，这是故意的。并发写文件时**不要**跑 `new:entry`（它要 SSR 加载全部词条），
多人同时开工就按已定编号手写文件。

### 词条文件

- 文件名 = `slug`，路径必须是 `src/data/entries/<hall>/<slug>.ts`；
- `src/data/index.ts` 用 `import.meta.glob` 自动收录，**不要手改索引**；
- 字段清单与取值规则以 ENTRY-SPEC 第 2 节为准；先填 `nameZh/nameEn/aliases/oneLiner`，
  再填 `whenToUse/confusions/pitfalls`，最后填 `spec/keywords/reducedMotion/refs/related`。

### demo 文件

遵守 ENTRY-SPEC 第 4 节四条约定，外加：

- 接收 `{ values, stage, replayKey, timeScale, locale }`，**控件一动画面立刻变**；
- 颜色只用 `var(--stage-ink)` / `var(--stage-muted)` / `var(--accent)`；
  需要不透明底用 `color-mix(in srgb, var(--stage-ink) 10%, var(--stage-bg, transparent))`；
- 会动的效果走 `usePrefersReducedMotion()`，降级后的样子要和 `reducedMotion` 字段说的一致；
- 示例文案按 `locale` 切换（英文模式不许出现中文）；
- 不用 `h1`，不引第三方库，不在模块顶层碰 `window`（SSR 预渲染会执行）；
- 随机效果用固定种子数组，别用 `Math.random()`，否则水合不一致。

### 阶段约定

| 项 | 内容 |
| --- | --- |
| 输入 | 已立项的 slug / 厅 / 形态 / 编号 |
| 输出 | 词条文件 + demo 文件，`pnpm dev` 下能跑 |
| 负责人 | agent；人只做方向性 review |
| 检查点 | 控件都能动；四个舞台都正常；reduced-motion 有真实降级；无硬编码颜色与文案 |
| 失败退回 | 做不出效果 → 回 extract 补拆（多半是「时间」或「空间」格没拆开）；依赖第三方 → 改成纯 CSS/原生 API 或放弃 |

---

## 5. 写作（write）

**目标**：让人读三段就能判断「这是不是我要的效果」，让 AI 读 prompt 就能做出七八成。

### 中文正文

- `oneLiner` ≤40 字（测试上限 48），一句话说清「是什么」，不写「非常丝滑」这类评价；
- `whenToUse` 2–4 条，写**场景与代价**，例如「列表项需要强调可点时」而不是「很好用」；
- `confusions` ≥1 条，`with` 优先指向在册词条的 `nameZh`，`diff` 必须写清「差在哪」——
  只写「两者不同」等于没写；
- `pitfalls` ≥1 条，写真实会踩的坑（性能、可访问性、Safari 差异、和滚动容器打架）；
- `spec` 2–4 条真实推荐值，带单位（`backdrop-filter: blur(12px)`、`transition: 180ms`）；
- `keywords` 5–8 个，含 CSS 属性名/API 名（`backdrop-filter`、`PointerEvent`）；
- `refs` 至少一条，只收 MDN / web.dev / W3C / CSS spec / Chrome Developers。

### 英文覆盖层 `en`

`en` 是完整覆盖层，不是摘要：`oneLiner` / `whenToUse` / `confusions` / `pitfalls` / `spec` /
`reducedMotion` / `controls` 全部要给，**条数与中文一一对应**，`with` 用目标词条的 `nameEn`。
英文里不许残留 CJK 字符，`entryTranslation.test.ts` 会拦。

### prompt

`prompt(values)` 返回 `{ zh, en }`，必须随控件参数变化、可直接粘给 AI：

- 开头一句说清要做什么、用在什么元素上；
- 中间把控件当前值写成具体 CSS / API 要求（含单位与曲线）；
- 结尾一句写降级与边界（触屏、reduced-motion、不要引入依赖）。

### 阶段约定

| 项 | 内容 |
| --- | --- |
| 输入 | 能跑的 demo + 六格表 |
| 输出 | 字段全部填满的词条（无 TODO 占位） |
| 负责人 | agent 起草；人只改「命名、边界、语气」 |
| 检查点 | 无占位符；`confusions.diff` 有实质内容；中英条数对齐；prompt 里能看到参数值 |
| 失败退回 | 写不出 `pitfalls` → 说明没真跑过，回 build 在四个舞台各跑一遍；`diff` 写不清 → 回 extract 重新对照 |

---

## 6. 验收（verify）

**目标**：机器能测的全绿，机器测不出的（好不好看、像不像）由人眼过。

### 机器门槛

```fish
pnpm check          # typecheck + lint + test（提交门槛）
pnpm build          # 额外跑预渲染，验证静态页与 sitemap
pnpm gen:meta       # 改了词条内容或 metaOf.ts 后必须跑
pnpm screenshots    # 截四舞台图，落到 dist/screenshots
```

单独跑某组测试：

```fish
pnpm exec vitest run src/data/entries.test.ts src/data/content.test.ts \
  src/data/entrySpec.test.ts src/data/entryTranslation.test.ts
```

### 人眼四舞台

`/entry/<slug>/` 页面上切 `light` / `dark` / `accent` / `photo` 四个舞台：

- 每个舞台下 demo 都看得清（`photo` 舞台最容易暴露硬编码颜色）；
- 控件拖动时画面连续变化，不闪、不跳、不掉帧；
- 触屏宽度（375px）下舞台不溢出、不依赖 hover；
- 系统开启「减少动态效果」后，必须真的停/降级，且 `reducedMotion` 文案与实际一致；
- 英文模式切过去，页面无中文残留。

### `pnpm backlog` 一致性

```fish
pnpm backlog        # 词条上线后，把候选池里对应条目的 status 改成 shipped
```

### 阶段约定

| 项 | 内容 |
| --- | --- |
| 输入 | 写完的词条 + demo |
| 输出 | 全绿的本地分支 + 四舞台截图 + 候选池状态更新 |
| 负责人 | agent 自检；人终审视觉与文案 |
| 检查点 | `pnpm check`、`pnpm build` 全绿；四舞台通过；`pnpm backlog` exit 0 |
| 失败退回 | 测试红 → 按报错修，**不要改测试**；视觉不对 → 回 build；命名被质疑 → 回 extract |

---

## 7. 发布（ship）

**目标**：一条可回滚的提交，一次可验证的线上变更。

```fish
git switch -c feat/entry-tilt-card
git add src/data/entries/motion/tilt-card.ts src/demos/tilt-card.tsx docs/entry-backlog.json
git commit -m "feat(entries): 新增 3D 倾斜卡片词条"
git push -u origin feat/entry-tilt-card
gh pr create --fill
```

- **Conventional Commits + 中文描述**，一条提交一件事；
- PR 描述写：词条编号、一句话定位、`confusions` 指向谁、验收截图；
- 合并后等 Deploy 完成，**线上再验一次**：`/entry/<slug>/` 能开、搜索能搜到、sitemap 有它、
  `catalog.md` 里出现；
- 出问题用 `git revert` 回滚那次合并，**不要 force push**，也不要在 main 上直接改。

### 阶段约定

| 项 | 内容 |
| --- | --- |
| 输入 | 全绿分支 |
| 输出 | 合并的 PR + 线上可访问的词条 |
| 负责人 | 人（合并与线上验收） |
| 检查点 | CI 绿；线上页面、搜索、sitemap、catalog 四处都对 |
| 失败退回 | 线上 404 → 查 `retired.ts` 与预渲染路由；样式坏 → revert 后回 verify |

---

## 模板 A：效果拆解表

复制这张表到 issue / PR 描述里填，六个格子不许留空。

| 命名 | 触发 | 时间 | 空间 | 参数 | 降级 |
| --- | --- | --- | --- | --- | --- |
| 中文名 / 英文术语 / 口语别名 | hover / 指针位置 / 滚动 / 时间 / 点击 / 进入视口 | 时长 + 缓动曲线 + 是否循环 + 能否打断 | 位移 / 旋转 / 缩放 / 透视 / 变换原点 / 层级 | 控件名：区间（默认值） | 触屏 / 键盘 / reduced-motion / 不支持时 |
|  |  |  |  |  |  |

已填示例（F-09 停靠栏放大）：

| 命名 | 触发 | 时间 | 空间 | 参数 | 降级 |
| --- | --- | --- | --- | --- | --- |
| 停靠栏放大 / Dock Magnification / 「图标跟着鼠标变大」 | 指针在图标条上水平移动，按到每个图标中心的距离衰减 | 80ms linear 跟随；离开后 120ms 回到 1.0；不循环、随时可打断 | 沿 X 轴按距离缩放，`transform-origin: bottom center`，整排图标底边对齐 | 最大缩放 1.2–2.2（1.55）；影响半径 40–220px（120） | 触屏不放大只保留点击态；reduced-motion 完全不动；键盘聚焦用描边高亮代替缩放 |

---

## 模板 B：词条验收清单

复制到 PR 描述，逐项打勾；没打勾的不许合并。

**数据**

- [ ] 文件路径 = `src/data/entries/<hall>/<slug>.ts`，slug 与文件名一致
- [ ] `code` 厅字母正确、厅内编号连续
- [ ] `aliases` 3–8 个，含口语与英文
- [ ] `oneLiner` ≤40 字，说清「是什么」
- [ ] `whenToUse` 2–4 条，写场景与代价
- [ ] `confusions` ≥1 条，`with` 用目标词条 `nameZh`，`diff` 写清差别
- [ ] `pitfalls` ≥1 条，是真实会踩的坑
- [ ] `keywords` 5–8 个，含 CSS 属性 / API 名
- [ ] `spec` 2–4 条，带单位
- [ ] `reducedMotion` 具体，和 demo 行为一致
- [ ] `refs` ≥1 条，且在白名单内（MDN / web.dev / W3C / CSS spec / Chrome Developers）
- [ ] `related` 指向在册 slug，尽量双向
- [ ] `tags` 2–6 个闭集 id，至少 1 个 tech；没有新造标签
- [ ] `controls` 1–3 个，只用 range / select / toggle，默认值在区间内

**演示**

- [ ] demo 自带舞台，不依赖整页滚动（`scroll` 形态自带滚动容器）
- [ ] 控件一动画面立刻变，默认值下就能看懂
- [ ] 无硬编码颜色，全部走 `var(--stage-ink)` 系
- [ ] 示例文案按 `locale` 切换，英文模式无中文
- [ ] `usePrefersReducedMotion()` 真实降级
- [ ] 不用 `h1`、零依赖、SSR 安全（模块顶层不碰 `window`）
- [ ] 非 `stage` 形态已设 `thumb: 'still'`

**双语**

- [ ] `en` 覆盖层字段齐全
- [ ] 中英条数一一对应
- [ ] `confusions.with` 用目标词条 `nameEn`
- [ ] 英文无 CJK 残留
- [ ] `prompt` 的 zh / en 都随参数变化、可直接提给 AI

**构建与线上**

- [ ] `pnpm check` 全绿
- [ ] `pnpm build` 全绿（预渲染 + sitemap）
- [ ] 四舞台人眼通过（light / dark / accent / photo）
- [ ] 375px 宽度不溢出
- [ ] `pnpm backlog` exit 0，对应条目已改 `shipped`
- [ ] 合并后线上 `/entry/<slug>/`、搜索、sitemap、catalog 四处验证

---

## 版权红线（不可协商）

我们**教人做出效果**，不搬运别人的劳动成果。

1. **只看行为与公开文档。** 可以观察渲染结果、读公开的 MDN / web.dev / W3C 文档、看组件库的演示页；
   不读、不抄别人的实现源码。
2. **不复制代码。** demo 必须自己写。哪怕对方 MIT 开源，也不整段粘贴——
   一是许可边界容易漏登记，二是抄来的实现往往带着对方的框架依赖。
3. **不复制样式与素材。** 不抄配色方案、不下载图片/SVG/字体、不搬运文案。
   需要视觉素材就自己用 CSS 画（几何图形、渐变、遮罩）。
4. **不整段搬运文档。** `spec` 与正文用自己的话写；`refs` 只给链接，不复制段落。
5. **`refs` 白名单**：MDN、web.dev、W3C / CSS spec、Chrome Developers。
   其它来源（博客、组件库文档）要在 PR 里说明理由，且只作为「行为参考」出现在 PR 描述里，不进 `refs`。
6. **素材登记**：确实引用了第三方素材（例如 CC0 纹理），必须登记 `THIRD_PARTY_NOTICES.md`，
   并在词条里注明来源与许可。

违反以上任意一条，PR 直接关闭，不讨论「只改了一点点」。

---

## 附：角色分工速查

| 阶段 | 人 | agent |
| --- | --- | --- |
| scout | 决定什么值得收 | 抓页面、填候选字段、跑查重 |
| extract | 确认命名与边界 | 填六格表、写最小实现验证可行性 |
| triage | 拍板厅/优先级/编号 | 跑 `find:entry`、改 backlog 状态 |
| build | review 方向 | 写词条与 demo |
| write | 改语气与命名 | 起草全部字段与双语 |
| verify | 四舞台终审、线上验收 | 跑测试/构建/截图、自检清单 |
| ship | 合并、回滚决策 | 开 PR、贴截图、更新候选池 |

## 附：与其它文档的关系

- 字段与判据的唯一真源：[ENTRY-SPEC.md](ENTRY-SPEC.md)
- 来源清单与拆解深度：[ENTRY-SOURCES.md](ENTRY-SOURCES.md)
- 候选池与体检：`docs/entry-backlog.json` + `node scripts/backlog.mjs`
- 视觉与页面规范：`docs/DESIGN.md`
