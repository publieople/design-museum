# 条目规范（ENTRY-SPEC）

这份文档是「什么算一条词条、怎么加、怎么删、怎么改、怎么找」的唯一真源。
写规范的原因是：条目从 30 条长到 40、100 条以后，靠记忆和口口相传一定会分裂——
同一个效果两条词条、同义词各占一个标签、demo 各写各的舞台尺寸。
**文档里能自动测的规矩，都在 `src/data/entrySpec.test.ts` 里；改规范先改测试和数据，再改这份文档。**

读者有三种：贡献者（加一条词条）、维护者（审 PR、查重、退役条目）、AI（把这座馆当检索库用）。

---

## 1. 什么算一条词条

一条词条 = **一个可独立演示的前端效果**。四条判据全过才算：

1. **有名字。** 中文俗称 + 英文术语都有；英文术语能在 MDN / web.dev / W3C CSS spec 里查到。
2. **有属性。** 主实现是一组确定的 CSS / JS API，能填进 `spec` 字段的「推荐取值表」。
3. **能演示。** 一个 demo 就能独立演示这个效果，且至少有一个参数真的可调。
4. **能提需求。** `prompt(values)` 能生成有信息量的中英需求句——把参数填进去句子仍然成立。

### 不算一条
- **纯风格**（赛博朋克、极简、杂志感）：那是一整套选择，不是某个效果，进不了条目。
- **没有效果语义的单属性**（`gap`、`color`）：它们是参数，不是效果。
- **同一效果的别名或写法**：进 `aliases`，不要新开条目。
- **同一效果的不同档位**：进 `controls`，不要新开条目。
- **现有条目能拼出来的组合套路**：先拼，拼不出来再说。

### 什么时候可以拆成两条
先例是 `frosted-glass` 与 `glassmorphism`，与 `text-balance` 与 `fluid-type` 这类关系不同，前者拆得开，后者拆不开。判断标准是三条同时成立：
专名可查 + 视觉结果可区分 + 主属性集不同，并且**两条词条的 `confusions` 必须互相指认**。

新增一条时必须回答三个问题（写在 PR 描述里）：
1. 它和现有哪一条最像？
2. 差异是哪一行属性？
3. 为什么那一条装不下它？

---

## 2. 数据模型

一条词条 = `src/data/entries/<厅>/<slug>.ts` 里 default 导出的一个 `Entry` 对象，
加一个同名的 demo 组件 `src/demos/<slug>.tsx`。**文件名必须等于 slug，slug 必须等于 URL 最后一段。**

| 字段 | 类型 | 必填 | 谁在用 |
| --- | --- | --- | --- |
| `slug` | kebab-case 字符串 | 是 | 文件名、URL、related、搜索索引——**不可变主键** |
| `code` | `^[A-Z]-\\d{2}$` | 是 | 展示编号，可重排；厅字母必须与 category 一致 |
| `nameZh` / `nameEn` | 字符串 | 是 | 标题、搜索 |
| `aliases` | 字符串数组 | 是，≥1 | 口语与俗称，搜索的第一入口 |
| `category` | 五个厅之一 | 是 | 一级归属，决定目录与编号字母 |
| `oneLiner` | ≤48 字 | 是 | 卡片与列表的一句话 |
| `whenToUse` | 2–4 条 | 是 | 详情页「什么时候用」 |
| `confusions` | ≥1 条 | 是 | 「别搞混」对比，必须写清差在哪一行属性 |
| `pitfalls` | ≥1 条 | 是 | 常见误用 |
| `keywords` | ≥1 个 | 是 | 英文技术关键词 / CSS 属性名 |
| `spec` | ≥1 行 | 是 | 推荐取值表 |
| `reducedMotion` | 字符串 | 是 | 无障碍降级写法（这个字段本身就是内容） |
| `refs` | ≥1 条 https | 是 | 参考文献，见第 8 节的白名单 |
| `related` | slug 数组 | 是 | 相关词条，不许指向自己或墓碑 |
| `scenes` / `feel` / `intent` | 闭集数组 | 是 | 三个老 facet（用在哪 / 什么感觉 / 什么目的） |
| `tags` | 受控标签 2–6 个 | 是 | 其余四个 facet，见第 3 节 |
| `demo` | `DemoSpec` | 是 | 演示形态，见第 4 节 |
| `controls` | 控件数组 | 是 | 只允许 range / select / toggle 三种 |
| `prompt` | `(values) => {zh, en}` | 是 | 这个项目的出口：可粘贴给 AI 的需求句 |
| `loop` | `replay` / `continuous` / `manual` | 否 | 自动重播策略，缺省 `replay` |
| `en` | 覆盖层 | 否 | 英文散文，逐字段可选，缺哪项回退中文 |

首屏只用 `EntryMeta`（`src/data/entryMeta.ts`，由 `npm run gen:meta` 生成），
全文只进详情页那条懒加载 chunk。**改完任何词条字段都要跑 `npm run gen:meta`**，
`src/data/meta.test.ts` 会在 CI 里盯着生成物有没有过期。

### 字段联动清单（加一个字段要同时动的地方）
1. `src/data/types.ts`——类型定义（含 `EntryMeta` 的取舍）
2. `src/data/metaOf.ts`——首屏要不要这个字段
3. `src/data/entries.test.ts`——逐字段校验
4. `src/data/entryMeta.ts`——跑 `gen:meta`
5. `catalog.md` / `catalog.json`（阶段 D）与这份文档的字段表

少一处就是「悄悄漏掉了」，所以这里写死清单。

---

## 3. facet 与标签

检索面（facet）有七个，前三个一直在数据里，其余四个统一放在 `tags`：

| facet | 存哪 | 取值 |
| --- | --- | --- |
| 归属 | `category` | 五个展厅 |
| 用在哪 | `scenes` | button / card / list / page / scroll / text / form / nav |
| 什么感觉 | `feel` | crisp / calm / playful / soft |
| 什么目的 | `intent` | attention / hierarchy / affordance / waiting |
| 怎么实现 | `tags.tech` | css-only / js / browser-api / modern-css / filter-blend / gradient / font-feature / scroll-linked / stateful |
| 什么代价 | `tags.cost` | composited / paint-heavy / layout-triggering / main-thread |
| 无障碍 | `tags.a11y` | motion-heavy / keyboard-operable / pointer-dependent |
| 兼容性 | `tags.support` | stable / check-support |

词表在 `src/data/taxonomy.ts` 的 `TAGS`（18 个，双语标签 + 一句说明）。

### 标签的硬规矩
- **只认闭集里的 id。** 自由标签一个都不收：同一个意思裂成「毛玻璃 / 玻璃 / glass」三条，搜索就废了。
- 每条词条 **2–6 个标签**，**至少 1 个 tech**。
- 每个标签**至少被 2 条词条用到**；用不上的合并或删掉，别留在词表里等着。
- 词表**总数 ≤ 40**；加标签要同时给中英标签与一句说明。
- 加了标签**必须挑一条现有词条用上**，否则就是孤儿（测试会拦住）。

### 怎么给一条词条挑标签
先问「它靠什么成立」→ tech；再问「它让浏览器多干哪些活」→ cost；
然后问「谁因此拿不到它」→ a11y；最后问「今天能不能直接上线」→ support。

---

## 4. 演示形态（demo 不是一种）

`demo: DemoSpec` 是数据，因为形态同时决定**舞台容器尺寸、卡片缩略图策略、交互提示、测试断言**四处。

| shape | 用在 | 舞台怎么做 |
| --- | --- | --- |
| `stage`（默认） | 进场、缓动、渐变、材质 | 居中舞台就装得下 |
| `interactive` | 磁吸按钮、聚光卡片、光标跟随 | 一大块可移动指针的区域 |
| `scroll` | 粘性、视差、滚动驱动、跑马灯、虚拟列表 | **自带滚动容器** |
| `sequence` | 乐观更新、骨架屏序列 | 分步推进的控制 |
| `page` | View Transitions | 两块「页面」 |

字段：`shape`（必填）、`minHeight`（可选，120–800，覆盖默认 256）、
`thumb`（`fit` 默认 / `still` 定格）、`hintKey`（角标文案键）。

### demo 的四条约定
1. **不依赖整页滚动。** 滚动类必须在舞台里自带滚动容器，否则详情页、预渲染快照和缩略图都拍不到它。唯一例外是 `/live/<slug>/` 现场页：那一层本来就不是展台（页面即演示），它不参与缩略图、不参与 catalog，规则见 `docs/DESIGN.md` 第 6 节。
2. **控件只用三种。** range / select / toggle。自定义控件会让 `prompt`、速查表和 catalog 无法自动派生。
3. **reduced-motion 必须有交代。** 字段 `reducedMotion` 是必填内容；demo 侧要真的降级。
4. **非 stage 形态的缩略图要 still。** 把交互定格成一帧 + 「自己动手试试」角标，缩小的假交互既看不出效果又骗人。

---

## 5. 增删改查

### 增
```fish
pnpm new:entry marquee --hall layout --shape scroll
```
生成 `src/data/entries/<厅>/<slug>.ts` + `src/demos/<slug>.tsx` 骨架（编号自动取该厅下一个），
字段带 TODO 占位，测试必然红——这是故意的：空壳过不了 CI。重名（在册或墓碑）、未知厅、未知形态、
非 kebab 的 slug 会直接报错退出。然后按顺序：
1. 查重（`pnpm find:entry "人话描述"`，看有没有更该改的现有条目）
2. 填 4 条判据与 `confusions` 互指
3. 写 demo，标 `demo.shape`，接 `reducedMotion`
4. 填 `spec` / `refs` / `prompt`
5. `pnpm gen:meta`，然后 `pnpm check`（typecheck + lint + test 一条命令），最后 `pnpm dev` 打开
   `/entry/<slug>/` 四个舞台人眼验收

### 删
不真删：`src/data/retired.ts` 里立墓碑（slug / code / 中英名 / 退役时间 / `replacedBy` / 原因），
并把词条文件从 `src/data/entries/` 里拿掉。`scripts/prerender.mjs` 已经接好：构建期为墓碑生成
`dist/entry/<slug>/index.html`——独立静态页（不挂 App 壳），只有 meta refresh + canonical + noindex，
指向 `replacedBy`（没填就跳 `/browse`）。墓碑不进 sitemap。
GitHub Pages 做不了 301，这是能做到的最接近的东西——已经被搜索引擎收录的地址不会变成死链。
同时：从 `related` 里摘掉、从速查表与 catalog 里消失（它们都读 ENTRIES，自动生效）。

### 改
- **`slug` 不可改**（它是主键）。要改 = 删 + 增 + 墓碑指向新 slug。
- **`category` 可以改**，但必须同时移文件、改 code 的厅字母、重跑 `gen:meta`。
- **`code` 可以重排**，只影响展示顺序。
- 其余字段随便改，但记得第 2 节的「字段联动清单」。

### 查
- 站内：搜索框（别名 + 关键词）、展厅浏览、速查表、感觉反查，以及按 facet 过滤（阶段 C）。
- 给 AI：`catalog.md` / `catalog.json`（阶段 D），以及配套 skill `skills/design-museum/SKILL.md`。
- 给维护者：`pnpm find:entry "人话"` 打印命中条目与命中理由（命中哪个字段、什么权重），
  既是查重门，也是搜索调试器——搜不到就说明该补别名或该新增条目。

---

## 6. 守门的测试

| 文件 | 守什么 |
| --- | --- |
| `src/data/content.test.ts` | 每厅至少 6 件、编号从 01 连续、related 无死链、每厅被引用 |
| `src/data/entries.test.ts` | 逐条字段完整性与取值合法性、控件合法、code/slug 唯一、每条有 demo 且无孤儿 demo、英文覆盖层对齐 |
| `src/data/meta.test.ts` | 生成物与源数据逐条一致（过期就红）、meta 不夹带详情页字段 |
| `src/data/entrySpec.test.ts` | **本规范**：文件路径 = `<category>/<slug>.ts`、标签闭集与数量、孤儿标签、词表规模与双语、形态合法与 thumb 规则、自带滚动的 loop 策略 |
| `src/data/retired.test.ts` | 墓碑：slug/code 不与在册冲突、`replacedBy` 必须指向在册条目、在册条目的 `related` 不许指向墓碑、跳转目标 |
| `src/data/palettes.test.ts` | 配色数据与展示一致 |

一条命令跑全：`pnpm check`（typecheck + lint + test）。要连预渲染一起验，跑 `pnpm build`。

生成物管线：`entries/**` + `metaOf.ts` →（`gen:meta`）→ `entryMeta.ts`（首屏）
→ `meta.ts` / 搜索索引 / 卡片；`routes.ts` + `routeModules.ts` →（`build`）→ 预渲染 HTML + sitemap。

---

## 7. 预算（加内容前先看这里）

- **首屏未压缩总字节 ≤ 260KB**（当前 201KB）。`entryMeta.ts` 随条目数线性长：30 条 77.5KB，40 条 103.6KB，100 条约 250KB。
  超过预算就把首屏 meta 瘦成索引字段（slug / 名称 / 别名 / 一句话 / 厅 / 标签 / 默认值），完整 meta 走按需 chunk。
- **CLS ≤ 0.05**（当前 0.0303）。
- 每加一条词条，`gen:meta` 的字节数要记一笔，涨得离谱就是字段挑多了。

---

## 8. 来源与版权

- `refs` 白名单：MDN、web.dev、W3C / CSS spec、Chrome Developers。其它来源要在 PR 里说明理由。
- demo 与文案**自己写**：不复制别人站点的实现代码，不整段搬运文档。词条正文原创（许可见 `LICENSE-CONTENT`）。
- 引用第三方素材要登记 `THIRD_PARTY_NOTICES.md`。

---

## 9. 为什么这样定（FAQ）

**为什么标签不能自由填？** 标签是过滤器的键。自由填写后「毛玻璃 / 玻璃 / frosted / glassy」会各成一类，
搜索质量随时间单调下降；闭集 + 别名映射才是能长期维护的做法——口语进 `aliases`，不是一个新标签。

**为什么控件只允许三种？** `prompt`、速查表、catalog 都由 `controls` 自动派生。
一旦允许自定义控件部件，这三处就要各自写特例，等于放弃自动生成。

**为什么 demo 只演示一个效果？** 一条词条是「一个名字对应一个效果」。
把两个效果塞进一个 demo，`prompt` 生成的句子就会含混，AI 拿到之后照样做不对。

**为什么删条目要立墓碑？** 每条在册词条都有一个被收录的静态地址。
删了就 404，等于把已经赚到的搜索流量丢掉；墓碑跳转页成本几乎为零。
