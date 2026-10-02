export type CategoryId = 'motion' | 'feedback' | 'layout' | 'visual' | 'type'

/** 用在什么地方 */
export type Scene = 'button' | 'card' | 'list' | 'page' | 'scroll' | 'text' | 'form' | 'nav'

/** 什么感觉 */
export type Feel = 'crisp' | 'calm' | 'playful' | 'soft'

/** 想达到什么目的 */
export type Intent = 'attention' | 'hierarchy' | 'affordance' | 'waiting'

/** demo 舞台背景：毛玻璃这类效果必须靠背景才看得出来 */
export type StageId = 'light' | 'dark' | 'accent' | 'photo'

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
  controls: Control[]
  /** 随参数实时生成的可复制需求 */
  prompt: (values: ControlValues) => PromptPair
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
}
