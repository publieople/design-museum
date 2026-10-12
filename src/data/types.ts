export type CategoryId = 'motion' | 'feedback' | 'layout' | 'visual' | 'type'

/** 用在什么地方 */
export type Scene = 'button' | 'card' | 'list' | 'page' | 'scroll' | 'text' | 'form' | 'nav'

/** 什么感觉 */
export type Feel = 'crisp' | 'calm' | 'playful' | 'soft'

/** 想达到什么目的 */
export type Intent = 'attention' | 'hierarchy' | 'affordance' | 'waiting'

/** demo 舞台背景：毛玻璃这类效果必须靠背景才看得出来 */
export type StageId = 'light' | 'dark' | 'accent' | 'photo'

/**
 * 标签有四个面（facet）。scenes / feel / intent 是另外三个面，
 * 它们有自己的字段（历史原因），其余 facet 统一收进 Entry.tags。
 * 词表与双语标签都在 src/data/taxonomy.ts，自由标签一律不收。
 */
export type FacetId = 'tech' | 'cost' | 'a11y' | 'support'

export type TagId =
  // tech：怎么实现
  | 'css-only'
  | 'js'
  | 'browser-api'
  | 'modern-css'
  | 'filter-blend'
  | 'gradient'
  | 'font-feature'
  | 'scroll-linked'
  | 'stateful'
  // cost：什么代价
  | 'composited'
  | 'paint-heavy'
  | 'layout-triggering'
  | 'main-thread'
  // a11y：无障碍
  | 'motion-heavy'
  | 'keyboard-operable'
  | 'pointer-dependent'
  // support：兼容性
  | 'stable'
  | 'check-support'

/**
 * 演示形态。舞台不是只有一种：滚动类要自带滚动容器，指针类要一大块可移动的区域，
 * 整页对比类要两块「页面」。形态决定容器尺寸、缩略图策略与测试断言，所以放数据里。
 */
export type DemoShape = 'stage' | 'interactive' | 'scroll' | 'sequence' | 'page'

export interface DemoSpec {
  shape: DemoShape
  /** 舞台内容区最小高度（px），默认 256；scroll/sequence 这类需要更高时给 */
  minHeight?: number
  /**
   * 卡片缩略图策略：默认 fit（等比缩放到填满舞台）。
   * 非 stage 形态要给 still——把交互定格成一帧，配「自己动手试试」角标，
   * 因为缩小的假交互既看不出效果又骗人。
   */
  thumb?: 'fit' | 'still'
  /** 缩略图角标文案键，不给就由 loop 策略推 */
  hintKey?: 'stage.needsScroll'
}

export type Control =
  | {
      kind: 'range'
      id: string
      label: string
      min: number
      max: number
      step: number
      def: number
      unit?: string
      hint?: string
    }
  | {
      kind: 'select'
      id: string
      label: string
      options: { value: string; label: string }[]
      def: string
    }
  | { kind: 'toggle'; id: string; label: string; def: boolean }

export type ControlValues = Record<string, number | string | boolean>

export interface PromptPair {
  /** 可直接粘给 AI 的中文需求句 */
  zh: string
  /** AI 最容易认的英文术语与属性名 */
  en: string
}

export interface Reference {
  label: string
  url: string
}

/** 双语文本。en 缺失时回退中文，所以英文内容可以一条条慢慢补。 */
export interface Bi {
  zh: string
  en?: string
}

/**
 * 词条的英文覆盖层：只放需要翻译的散文，术语与关键词本来就有英文。
 * 逐字段可选，缺哪个回退哪个。
 */
export interface EntryTranslation {
  oneLiner?: string
  whenToUse?: string[]
  confusions?: { with?: string; diff?: string }[]
  pitfalls?: string[]
  spec?: { label?: string }[]
  reducedMotion?: string
  /** 与 entry.controls 逐项对应，只翻标签与提示 */
  controls?: { label?: string; hint?: string }[]
}

export interface Entry {
  /** kebab-case，全站唯一，也是 demo 组件的文件名 */
  slug: string
  /** 藏品编号：类别字母 + 两位序号，如 "V-01" */
  code: string
  nameZh: string
  nameEn: string
  /** 口语俗称与英文别名——搜索必须能命中它们 */
  aliases: string[]
  category: CategoryId
  /** 一句话是什么，≤40 字 */
  oneLiner: string
  /** 2–4 条适用场景 */
  whenToUse: string[]
  /** 易混淆对比：把最容易被 AI 搞混的两个概念切开 */
  confusions: { with: string; diff: string }[]
  /** 常见误用与坑 */
  pitfalls: string[]
  /** 英文技术关键词 / CSS 属性名 */
  keywords: string[]
  /** 推荐取值表 */
  spec: { label: string; value: string }[]
  /** 无障碍降级写法（这个字段本身就是内容） */
  reducedMotion: string
  /** ≥1 条 MDN / web.dev 参考 */
  refs: Reference[]
  /** 相关词条 slug */
  related: string[]
  scenes: Scene[]
  feel: Feel[]
  intent: Intent[]
  /** 跨展厅的受控标签，词表在 taxonomy.ts 的 TAGS */
  tags: TagId[]
  /** 演示形态：舞台容器、缩略图策略与测试断言都看它 */
  demo: DemoSpec
  controls: Control[]
  /** 随参数实时生成的可复制需求 */
  prompt: (values: ControlValues) => PromptPair
  /**
   * 自动循环重播策略，缺省视为 'replay'：
   * - replay：一次性动画，重播就是再看一遍（进场、按压反馈、数字滚动…）
   * - continuous：不需要外部重播——它自己在动（骨架微光、渐变漂移），或者本来就是静态的
   * - manual：要用户滚动 / 拖动 / 指针交互才会动（视差、滚动驱动、粘性、磁吸、手风琴…）
   */
  loop?: 'replay' | 'continuous' | 'manual'
  /** 英文覆盖层；缺字段回退中文 */
  en?: EntryTranslation
}

export interface DemoProps {
  values: ControlValues
  stage: StageId
  /** 递增即重播：demo 用它作为 key 或依赖来重置动画 */
  replayKey: number
  /**
   * 慢放倍率，1 为正常。默认由舞台用 Web Animations playbackRate 统一处理，
   * rAF 自驱的 demo（如弹簧）可以自己读这个值。
   */
  timeScale?: number
  /**
   * 当前界面语言。demo 内部的示例文案要跟着切换，
   * 默认 'zh' 是为了让直接渲染 demo 的测试保持稳定。
   */
  locale?: 'zh' | 'en'
}

/**
 * 首屏（首页 / 词条库 / 感觉导航 / 搜索框）真正会读到的字段。
 *
 * spec、refs、related、reducedMotion、controls、prompt 和整个英文覆盖层只在详情页用，
 * 它们留在完整词条里，跟着详情页那条懒加载 chunk 走，不进首屏。
 *
 * src/data/entryMeta.ts 由 `npm run gen:meta` 生成，src/data/meta.test.ts 守着它别过期。
 */
export type EntryMeta = Omit<
  Entry,
  'spec' | 'reducedMotion' | 'refs' | 'related' | 'controls' | 'prompt' | 'en'
> & {
  /** 控件默认值的快照：卡片上的缩略 demo 要它，但不值得把 controls 定义整包带进首屏 */
  defaults: ControlValues
  /** 英文覆盖层里唯一在首屏用到的字段（卡片上的一句话） */
  en?: Pick<EntryTranslation, 'oneLiner'>
}
