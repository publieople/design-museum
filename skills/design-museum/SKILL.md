---
name: design-museum
description: 把「我想要那种……的效果」翻译成准确的前端效果名字与可直接提给 AI 的设计需求。当用户用口语、比喻或模糊描述说自己想要某个网页效果（鼠标移上去卡片浮起来、磨砂玻璃、数字往上滚、卡片跟着滚动堆叠、文字逐字出现、按钮被磁铁吸过去……），或者需要某个前端效果的英文术语、CSS 属性名、推荐取值、易混概念的区别（毛玻璃 vs 玻璃拟态、粘性 vs 固定、交错进场 vs 延迟动画）、无障碍降级写法（prefers-reduced-motion）时使用。数据来自前端设计博物馆的机器可读目录：30 条中英双语词条，每条含别名、易混项、踩坑、推荐取值、控件默认值与中英需求句。
allowed-tools: Bash, Read, WebFetch
tags: [frontend, css, ui, motion, terminology, prompt-engineering]
metadata:
  site: https://publieople.github.io/design-museum/
  catalog-json: https://publieople.github.io/design-museum/catalog.json
  catalog-markdown: https://publieople.github.io/design-museum/catalog.md
  repo: https://github.com/publieople/design-museum
---

# 前端设计博物馆 Design Museum

## 什么时候用

- 用户描述想要的效果但说不出名字（「鼠标移上去卡片轻轻浮起来」）。
- 用户要英文术语 / CSS 属性名 / 推荐取值。
- 用户要一句能直接粘给 AI 的需求句。
- 用户要分清两个容易混的概念（毛玻璃 vs 玻璃拟态、粘性头部 vs 固定头部、交错进场 vs 普通延迟动画、涟漪 vs 按压反馈）。
- 用户要无障碍降级写法（`prefers-reduced-motion`）。

## 怎么查（按这个顺序）

1. **取目录**。优先本机仓库里的 `public/catalog.json`（存在时直接读，不用联网）；
   否则 `curl -sL https://publieople.github.io/design-museum/catalog.json`（约 68KB，紧凑 JSON）。
   结构：`entries[]` 每条含 `slug / code / url / category / nameZh / nameEn / aliases / oneLiner / oneLinerEn / keywords / tags / demo.shape / controls / prompt / related / detail`；
   另有 `facets`（标签的四个面）、`vocab`（展厅 / 场景 / 感觉 / 目的 / 演示形态的中英对照）。
2. **匹配**。顺序是 aliases（口语俗称）→ nameZh / nameEn → keywords（英文术语与 CSS 属性名）→ oneLiner。
   取命中最强的 1–3 条；用户描述含糊时把候选一起报出来让他挑，而不是硬选一条。
3. **要细节就展开**。什么时候用、别搞混、踩坑、推荐取值、无障碍降级、参考链接在
   `catalog.md#<slug>`（一份 Markdown，每条词条一个锚点）或词条页 `<site>/entry/<slug>/`（预渲染 HTML，不需要执行 JS）。
4. **交付**。用 `prompt.zh`（中文需求句）与 `prompt.en`（给模型的英文关键词），把 `controls` 的取值替换进句子；
   用户没指定参数就用 `controls[].def`（默认值）。`controls` 只有 range / select / toggle 三种，值就直接填进句子里的数字。

## 输出给用户的样子

- 名字：中文俗称 + 英文术语，附词条地址。
- 需求句：中文一条（可直接粘贴）、英文关键词一条（给模型定位标准实现）。
- 提醒：踩坑（`pitfalls`）与相邻概念的区别（`confusions`）各一句，避免 AI 做歪。
- 涉及动效时补一句无障碍降级写法（`reducedMotion`）。

## 别搞混（目录里每条都有 confusions，这里只举最常见的几个）

- **毛玻璃 frosted-glass** 用 `backdrop-filter` 糊「背后」；`filter: blur()` 糊的是元素自己。
- **玻璃拟态 glassmorphism** 是毛玻璃 + 描边 / 高光 / 投影的一整套视觉语言，两者可以同时出现。
- **缓动 easing** 谈的是时间曲线；**交错进场 stagger** 谈的是元素之间的固定间隔。
- **粘性头部 sticky-header** 是 `position: sticky`（参与文档流）；固定头部是 `fixed`。
- **滚动驱动 scroll-driven** 跟滚动位置绑定（`animation-timeline`）；**视差 parallax** 是背景与前景位移速度不同。
- **文字平衡 text-balance** 改的是断行（`text-wrap: balance`）；**流体字号 fluid-type** 改的是字号随视口变化。

## 维护这个 skill

- 词表（标签四个 facet）、演示形态（`demo.shape`）、增删改查规则：仓库 `docs/ENTRY-SPEC.md`。
- 目录是生成物：`pnpm gen:catalog`；守门测试 `src/data/catalog.test.ts`。
- 加一条词条：`pnpm new:entry <slug> --hall <厅> --shape <形态>`；查重：`pnpm find:entry "口语说法"`。

## 安装到本机 harness

```bash
mkdir -p ~/.dsh/skills/design-museum
curl -sL https://raw.githubusercontent.com/publieople/design-museum/main/skills/design-museum/SKILL.md \
  -o ~/.dsh/skills/design-museum/SKILL.md
```

想离线用，把仓库 `public/catalog.json` 与 `public/catalog.md` 一起拷到同一目录，第 1 步直接读本地文件。
