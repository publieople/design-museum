import { pick } from '../i18n/pick'
import type { Locale } from '../lib/prefs'
import type { Bi, CategoryId, Feel, Intent, Scene, StageId } from './types'

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

/**
 * 藏品编号排序：先按展厅的展陈顺序（动效 → 交互 → 布局 → 质感 → 排版），再按序号。
 * 用展厅顺序而不是字母序，馆里的浏览动线才是设计过的。
 */
export function codeOrder(code: string) {
  const [letter = '', num = '0'] = code.split('-')
  const hall = String(LETTER_ORDER.get(letter) ?? 99).padStart(2, '0')
  return `${hall}-${num.padStart(2, '0')}`
}
