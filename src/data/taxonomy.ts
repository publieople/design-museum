import { pick } from '../i18n/pick'
import type { Locale } from '../lib/prefs'
import type { Bi, CategoryId, DemoShape, FacetId, Feel, Intent, Scene, StageId, TagId } from './types'

export interface CategoryMeta {
  id: CategoryId
  /** 藏品编号前缀 */
  letter: string
  nameZh: string
  nameEn: string
  blurb: Bi
}

export const CATEGORIES: CategoryMeta[] = [
  {
    id: 'motion',
    letter: 'M',
    nameZh: '动效与节奏',
    nameEn: 'Motion & Timing',
    blurb: { zh: '元素怎么进场、怎么随时间变化', en: 'How elements enter and change over time' },
  },
  {
    id: 'feedback',
    letter: 'F',
    nameZh: '交互反馈',
    nameEn: 'Interaction & Feedback',
    blurb: { zh: '用户动手之后，界面怎么回应', en: 'How the interface answers what the user does' },
  },
  {
    id: 'layout',
    letter: 'L',
    nameZh: '布局与结构',
    nameEn: 'Layout & Structure',
    blurb: { zh: '内容怎么排布、滚动时怎么变化', en: 'How content is arranged and how it moves on scroll' },
  },
  {
    id: 'visual',
    letter: 'V',
    nameZh: '视觉质感',
    nameEn: 'Visual & Material',
    blurb: { zh: '表面、材质、光与色彩的观感', en: 'Surfaces, materials, light and colour' },
  },
  {
    id: 'type',
    letter: 'T',
    nameZh: '排版与文字',
    nameEn: 'Typography & Text',
    blurb: { zh: '文字本身的形态与呈现方式', en: 'The shape and behaviour of the type itself' },
  },
]

export const SCENES: { id: Scene; label: Bi }[] = [
  { id: 'button', label: { zh: '按钮', en: 'Button' } },
  { id: 'card', label: { zh: '卡片', en: 'Card' } },
  { id: 'list', label: { zh: '列表', en: 'List' } },
  { id: 'page', label: { zh: '页面', en: 'Page' } },
  { id: 'scroll', label: { zh: '滚动', en: 'Scroll' } },
  { id: 'text', label: { zh: '文字', en: 'Text' } },
  { id: 'form', label: { zh: '表单', en: 'Form' } },
  { id: 'nav', label: { zh: '导航', en: 'Nav' } },
]

export const FEELS: { id: Feel; label: Bi; hint: Bi }[] = [
  { id: 'crisp', label: { zh: '利落', en: 'Crisp' }, hint: { zh: '快、干脆、有力度', en: 'Fast, decisive, with weight' } },
  { id: 'calm', label: { zh: '沉稳', en: 'Calm' }, hint: { zh: '克制、缓慢、不打扰', en: 'Restrained, slow, unobtrusive' } },
  { id: 'playful', label: { zh: '活泼', en: 'Playful' }, hint: { zh: '有弹性、有性格、抓眼球', en: 'Springy, opinionated, eye-catching' } },
  { id: 'soft', label: { zh: '柔和', en: 'Soft' }, hint: { zh: '轻、淡、不抢戏', en: 'Light, faint, never the star' } },
]

export const INTENTS: { id: Intent; label: Bi; hint: Bi }[] = [
  { id: 'attention', label: { zh: '吸引注意', en: 'Draw attention' }, hint: { zh: '让人第一眼看到它', en: 'Make it the first thing seen' } },
  { id: 'hierarchy', label: { zh: '表达层级', en: 'Show hierarchy' }, hint: { zh: '区分主次与先后', en: 'Separate primary from secondary' } },
  { id: 'affordance', label: { zh: '暗示可操作', en: 'Signal affordance' }, hint: { zh: '让人知道这里能点、能拖', en: 'Show that it can be clicked or dragged' } },
  { id: 'waiting', label: { zh: '缓解等待', en: 'Ease waiting' }, hint: { zh: '让等待不显得漫长', en: 'Make a wait feel shorter' } },
]

export const STAGES: { id: StageId; label: Bi; hint: Bi }[] = [
  { id: 'light', label: { zh: '浅色', en: 'Light' }, hint: { zh: '浅色墙面', en: 'Light wall' } },
  { id: 'dark', label: { zh: '深色', en: 'Dark' }, hint: { zh: '深色墙面', en: 'Dark wall' } },
  { id: 'accent', label: { zh: '彩色', en: 'Colour' }, hint: { zh: '高饱和背景', en: 'Saturated backdrop' } },
  {
    id: 'photo',
    label: { zh: '照片感', en: 'Photo' },
    hint: { zh: '照片感背景（毛玻璃、发光类必备）', en: 'Photo-like backdrop — required by glass and glow' },
  },
]

const CATEGORY_BY_ID = new Map(CATEGORIES.map((category) => [category.id, category]))

export function categoryOf(id: CategoryId): CategoryMeta {
  const found = CATEGORY_BY_ID.get(id)
  if (!found) throw new Error(`未知展厅：${id}`)
  return found
}

export function categoryBlurb(id: CategoryId, locale: Locale): string {
  return pick(categoryOf(id).blurb, locale)
}

const SCENE_BY_ID = new Map(SCENES.map((item) => [item.id, item]))
const FEEL_BY_ID = new Map(FEELS.map((item) => [item.id, item]))
const INTENT_BY_ID = new Map(INTENTS.map((item) => [item.id, item]))
const STAGE_BY_ID = new Map(STAGES.map((item) => [item.id, item]))

export function sceneLabel(id: Scene, locale: Locale): string {
  return pick(SCENE_BY_ID.get(id)?.label, locale) || id
}
export function feelLabel(id: Feel, locale: Locale): string {
  return pick(FEEL_BY_ID.get(id)?.label, locale) || id
}
export function intentLabel(id: Intent, locale: Locale): string {
  return pick(INTENT_BY_ID.get(id)?.label, locale) || id
}
export function stageLabel(id: StageId, locale: Locale): string {
  return pick(STAGE_BY_ID.get(id)?.label, locale) || id
}
export function stageHint(id: StageId, locale: Locale): string {
  return pick(STAGE_BY_ID.get(id)?.hint, locale)
}

const LETTER_ORDER = new Map(CATEGORIES.map((category, index) => [category.letter, index]))

/* ------------------------------------------------------------------------- *
 * 标签词表（受控闭集）
 *
 * 标签是跨展厅的检索面（facet），和 scenes/feel/intent 是同一类东西，
 * 只是那三个一直在数据里，其余几个收进统一的 tags 数组。
 * 规矩（由 src/data/entrySpec.test.ts 守着）：
 *  - 只认这张表里的 id，自由标签一律不收：同一个意思裂成好几个词就搜不动了；
 *  - 每条词条 2–6 个标签，至少 1 个 tech；
 *  - 每个标签至少被 2 条词条用到，用不上的合并或删掉（stage B 会补 retired）。
 * ------------------------------------------------------------------------- */
export interface FacetMeta {
  id: FacetId
  label: Bi
  hint: Bi
}

export const FACETS: FacetMeta[] = [
  {
    id: 'tech',
    label: { zh: '怎么实现', en: 'Mechanism' },
    hint: { zh: '纯 CSS，还是要写 JS / 用浏览器 API', en: 'Pure CSS, or needs JS and browser APIs' },
  },
  {
    id: 'cost',
    label: { zh: '什么代价', en: 'Cost' },
    hint: { zh: '性能上要付出什么', en: 'What it costs in performance' },
  },
  {
    id: 'a11y',
    label: { zh: '无障碍', en: 'Accessibility' },
    hint: { zh: '谁用不了，怎么补', en: 'Who is left out, and the fix' },
  },
  {
    id: 'support',
    label: { zh: '兼容性', en: 'Support' },
    hint: { zh: '能不能直接用，还是得先查兼容表', en: 'Safe to ship, or check the compatibility table first' },
  },
]

export interface TagMeta {
  id: TagId
  facet: FacetId
  label: Bi
  hint: Bi
}

export const TAGS: TagMeta[] = [
  // ── tech：怎么实现 ──────────────────────────────────────────────────
  {
    id: 'css-only',
    facet: 'tech',
    label: { zh: '纯 CSS', en: 'CSS only' },
    hint: { zh: '不写 JS，靠 CSS 属性与伪类就成立', en: 'No JS — plain properties and pseudo-classes' },
  },
  {
    id: 'js',
    facet: 'tech',
    label: { zh: '需要 JS', en: 'Needs JS' },
    hint: { zh: '要脚本算状态、事件或每帧数值', en: 'Scripts for state, events or per-frame numbers' },
  },
  {
    id: 'browser-api',
    facet: 'tech',
    label: { zh: '浏览器 API', en: 'Browser API' },
    hint: { zh: 'IntersectionObserver、pointermove、getBoundingClientRect 这类', en: 'IntersectionObserver, pointermove, getBoundingClientRect and friends' },
  },
  {
    id: 'modern-css',
    facet: 'tech',
    label: { zh: '新 CSS 特性', en: 'Modern CSS' },
    hint: { zh: 'animation-timeline、@property、text-wrap、backdrop-filter 这一代', en: 'The animation-timeline / @property / text-wrap / backdrop-filter generation' },
  },
  {
    id: 'filter-blend',
    facet: 'tech',
    label: { zh: '滤镜与混合', en: 'Filter & blend' },
    hint: { zh: 'filter、backdrop-filter、mix-blend-mode', en: 'filter, backdrop-filter, mix-blend-mode' },
  },
  {
    id: 'gradient',
    facet: 'tech',
    label: { zh: '渐变', en: 'Gradient' },
    hint: { zh: '靠 gradient 值做出来的效果', en: 'Built from gradient values' },
  },
  {
    id: 'font-feature',
    facet: 'tech',
    label: { zh: '字体特性', en: 'Font feature' },
    hint: { zh: 'font-variation-settings、tabular-nums 这类字体能力', en: 'font-variation-settings, tabular-nums and other font powers' },
  },
  {
    id: 'scroll-linked',
    facet: 'tech',
    label: { zh: '随滚动变化', en: 'Scroll-linked' },
    hint: { zh: '效果跟着滚动位置或滚动方向走', en: 'Driven by scroll position or direction' },
  },
  {
    id: 'stateful',
    facet: 'tech',
    label: { zh: '有状态', en: 'Stateful' },
    hint: { zh: '要管理展开/队列/乐观回滚这类多状态', en: 'Manages multiple states: expand, queue, optimistic rollback' },
  },

  // ── cost：什么代价 ──────────────────────────────────────────────────
  {
    id: 'composited',
    facet: 'cost',
    label: { zh: '合成层动画', en: 'Composited' },
    hint: { zh: '只动 transform / opacity，不重排不重绘', en: 'Only transform and opacity — no layout, no paint' },
  },
  {
    id: 'paint-heavy',
    facet: 'cost',
    label: { zh: '重绘开销', en: 'Paint heavy' },
    hint: { zh: '大面积模糊、滤镜或渐变，重绘成本高', en: 'Large blurs, filters or gradients: expensive to paint' },
  },
  {
    id: 'layout-triggering',
    facet: 'cost',
    label: { zh: '会引发重排', en: 'Triggers layout' },
    hint: { zh: '改尺寸、字号或行盒，浏览器要重新排版', en: 'Changes size, font-size or line boxes, forcing a re-layout' },
  },
  {
    id: 'main-thread',
    facet: 'cost',
    label: { zh: '主线程每帧', en: 'Main-thread per frame' },
    hint: { zh: 'rAF / pointermove 里每帧算数值，会挤占主线程', en: 'Per-frame math in rAF or pointermove competes with the main thread' },
  },

  // ── a11y：无障碍 ────────────────────────────────────────────────────
  {
    id: 'motion-heavy',
    facet: 'a11y',
    label: { zh: '动效较多', en: 'Motion heavy' },
    hint: { zh: '动作明显，必须给 prefers-reduced-motion 降级', en: 'Noticeable motion — a prefers-reduced-motion fallback is mandatory' },
  },
  {
    id: 'keyboard-operable',
    facet: 'a11y',
    label: { zh: '键盘可用', en: 'Keyboard operable' },
    hint: { zh: '能用 Tab / Enter / 方向键完成，或有原生元素兜底', en: 'Reachable with Tab, Enter and arrow keys, or native elements' },
  },
  {
    id: 'pointer-dependent',
    facet: 'a11y',
    label: { zh: '只能指针操作', en: 'Pointer only' },
    hint: { zh: '要靠鼠标悬停或移动，键盘和触屏用户拿不到，需要别的地方补', en: 'Needs hover or pointer movement — keyboard and touch users miss it, so add a fallback elsewhere' },
  },

  // ── support：兼容性 ─────────────────────────────────────────────────
  {
    id: 'stable',
    facet: 'support',
    label: { zh: '可以直接用', en: 'Safe to ship' },
    hint: { zh: '三大引擎支持多年，不需要额外降级', en: 'Years of support across the three engines — no fallback needed' },
  },
  {
    id: 'check-support',
    facet: 'support',
    label: { zh: '先查兼容', en: 'Check support' },
    hint: { zh: '较新的 CSS 能力，用前核对 MDN/caniuse 并准备降级', en: 'Newer CSS capability: check MDN or caniuse and prepare a fallback' },
  },
]

const TAG_BY_ID = new Map(TAGS.map((tag) => [tag.id, tag]))

export function tagMeta(id: TagId): TagMeta | undefined {
  return TAG_BY_ID.get(id)
}

export function tagLabel(id: TagId, locale: Locale): string {
  return pick(TAG_BY_ID.get(id)?.label, locale) || id
}

export function tagHint(id: TagId, locale: Locale): string {
  return pick(TAG_BY_ID.get(id)?.hint, locale)
}

export function tagsInFacet(facet: FacetId): TagMeta[] {
  return TAGS.filter((tag) => tag.facet === facet)
}

export function facetLabel(id: FacetId, locale: Locale): string {
  return pick(FACETS.find((facet) => facet.id === id)?.label, locale) || id
}

/* ------------------------------------------------------------------------- *
 * 演示形态：舞台不是只有一种
 *
 * 形态决定三件事：舞台容器给多大、卡片缩略图怎么呈现、测试和角标怎么提示。
 * 所以它必须落在数据里，而不是散在每个 demo 的 className 里。
 * ------------------------------------------------------------------------- */
export const DEMO_SHAPES: { id: DemoShape; label: Bi; hint: Bi }[] = [
  {
    id: 'stage',
    label: { zh: '固定舞台', en: 'Stage' },
    hint: { zh: '默认：居中舞台就装得下', en: 'Default: a centered stage is enough' },
  },
  {
    id: 'interactive',
    label: { zh: '指针交互', en: 'Pointer' },
    hint: { zh: '要在大范围里移动指针或拖动，小舞台做不出来', en: 'Needs pointer movement or dragging over a large area' },
  },
  {
    id: 'scroll',
    label: { zh: '自带滚动', en: 'Scrollable' },
    hint: { zh: '自带滚动容器，不依赖整页滚动', en: 'Ships its own scroll container — never the page scroll' },
  },
  {
    id: 'sequence',
    label: { zh: '分步推进', en: 'Sequence' },
    hint: { zh: '多阶段状态，要一步步推进才看得懂', en: 'Multi-stage states that need stepping through' },
  },
  {
    id: 'page',
    label: { zh: '整页对比', en: 'Page pair' },
    hint: { zh: '需要两块「页面」才演示得出来', en: 'Needs two page-like surfaces' },
  },
]

const DEMO_SHAPE_BY_ID = new Map(DEMO_SHAPES.map((shape) => [shape.id, shape]))

export function demoShapeLabel(id: DemoShape, locale: Locale): string {
  return pick(DEMO_SHAPE_BY_ID.get(id)?.label, locale) || id
}

export function demoShapeHint(id: DemoShape, locale: Locale): string {
  return pick(DEMO_SHAPE_BY_ID.get(id)?.hint, locale)
}

/**
 * 藏品编号排序：先按展厅的展陈顺序（动效 → 交互 → 布局 → 质感 → 排版），再按序号。
 * 用展厅顺序而不是字母序，馆里的浏览动线才是设计过的。
 */
export function codeOrder(code: string) {
  const [letter = '', num = '0'] = code.split('-')
  const hall = String(LETTER_ORDER.get(letter) ?? 99).padStart(2, '0')
  return `${hall}-${num.padStart(2, '0')}`
}
