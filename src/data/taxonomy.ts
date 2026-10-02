import type { CategoryId, Feel, Intent, Scene, StageId } from './types'

export interface CategoryMeta {
  id: CategoryId
  /** 藏品编号前缀 */
  letter: string
  nameZh: string
  nameEn: string
  blurb: string
}

export const CATEGORIES: CategoryMeta[] = [
  { id: 'motion', letter: 'M', nameZh: '动效与节奏', nameEn: 'Motion & Timing', blurb: '元素怎么进场、怎么随时间变化' },
  { id: 'feedback', letter: 'F', nameZh: '交互反馈', nameEn: 'Interaction & Feedback', blurb: '用户动手之后，界面怎么回应' },
  { id: 'layout', letter: 'L', nameZh: '布局与结构', nameEn: 'Layout & Structure', blurb: '内容怎么排布、滚动时怎么变化' },
  { id: 'visual', letter: 'V', nameZh: '视觉质感', nameEn: 'Visual & Material', blurb: '表面、材质、光与色彩的观感' },
  { id: 'type', letter: 'T', nameZh: '排版与文字', nameEn: 'Typography & Text', blurb: '文字本身的形态与呈现方式' },
]

export const SCENES: { id: Scene; label: string }[] = [
  { id: 'button', label: '按钮' },
  { id: 'card', label: '卡片' },
  { id: 'list', label: '列表' },
  { id: 'page', label: '页面' },
  { id: 'scroll', label: '滚动' },
  { id: 'text', label: '文字' },
  { id: 'form', label: '表单' },
  { id: 'nav', label: '导航' },
]

export const FEELS: { id: Feel; label: string; hint: string }[] = [
  { id: 'crisp', label: '利落', hint: '快、干脆、有力度' },
  { id: 'calm', label: '沉稳', hint: '克制、缓慢、不打扰' },
  { id: 'playful', label: '活泼', hint: '有弹性、有性格、抓眼球' },
  { id: 'soft', label: '柔和', hint: '轻、淡、不抢戏' },
]

export const INTENTS: { id: Intent; label: string; hint: string }[] = [
  { id: 'attention', label: '吸引注意', hint: '让人第一眼看到它' },
  { id: 'hierarchy', label: '表达层级', hint: '区分主次与先后' },
  { id: 'affordance', label: '暗示可操作', hint: '让人知道这里能点、能拖' },
  { id: 'waiting', label: '缓解等待', hint: '让等待不显得漫长' },
]

export const STAGES: { id: StageId; label: string; hint: string }[] = [
  { id: 'light', label: '浅色', hint: '浅色墙面' },
  { id: 'dark', label: '深色', hint: '深色墙面' },
  { id: 'accent', label: '彩色', hint: '高饱和背景' },
  { id: 'photo', label: '照片感', hint: '照片感背景（毛玻璃、发光类必备）' },
]

const CATEGORY_BY_ID = new Map(CATEGORIES.map((c) => [c.id, c]))

export function categoryOf(id: CategoryId): CategoryMeta {
  const found = CATEGORY_BY_ID.get(id)
  if (!found) throw new Error(`未知分类：${id}`)
  return found
}

const SCENE_LABEL = new Map(SCENES.map((s) => [s.id, s.label]))
const FEEL_LABEL = new Map(FEELS.map((f) => [f.id, f.label]))
const INTENT_LABEL = new Map(INTENTS.map((i) => [i.id, i.label]))

export function sceneLabel(id: Scene) {
  return SCENE_LABEL.get(id) ?? id
}
export function feelLabel(id: Feel) {
  return FEEL_LABEL.get(id) ?? id
}
export function intentLabel(id: Intent) {
  return INTENT_LABEL.get(id) ?? id
}

const LETTER_ORDER = new Map(CATEGORIES.map((category, index) => [category.letter, index]))

/**
 * 藏品编号排序：先按展厅的展陈顺序（动效 → 交互 → 布局 → 质感 → 排版），再按序号。
 * 用展厅顺序而不是字母序，馆里的浏览动线才是设计过的。
 */
export function codeOrder(code: string) {
  const [letter = '', num = '0'] = code.split('-')
  const hall = String(LETTER_ORDER.get(letter) ?? 99).padStart(2, '0')
  return `${hall}-${num.padStart(2, '0')}`
}
