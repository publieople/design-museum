import type { ControlValues, Entry } from '../../types'

const entry: Entry = {
  slug: 'text-balance',
  code: 'T-02',
  nameZh: '平衡折行',
  nameEn: 'Text Balance',
  aliases: ['平衡换行', '折行平衡', '标题不孤字', 'text-wrap balance', 'balanced headline', 'balanced text wrapping'],
  category: 'type',
  oneLiner: '多行标题的每行长度被拉齐，最后一行不再只剩一个孤字。',
  whenToUse: [
    '一两个短语的标题在窄容器里折行，最后一行只掉下一个字，很难看',
    '卡片标题、引言、按钮文案这类短文本，想让每行长短匀称',
    '同一块文字要在不同宽度下都保持平衡，又不想手写 br 把位置写死',
  ],
  confusions: [
    {
      with: 'text-wrap: pretty',
      diff: 'pretty 主要盯正文最后一行，避免段落末尾只留一个孤字，代价是排版时间略微增加；balance 是把所有行拉成一样长，只适合短文本，Chromium 超过六行就不再做平衡。',
    },
    {
      with: 'word-break / overflow-wrap',
      diff: '那两个解决的是「一个长单词放不下时从哪里断」，管的是溢出；text-wrap: balance 不改变断词规则，只是重新分配每行放几个词。',
    },
    {
      with: '手写 br',
      diff: 'br 把换行位置写死，换个容器宽度就错位；balance 由浏览器按当前宽度重新计算，宽度变了它会重排。',
    },
  ],
  pitfalls: [
    '只对短文本有意义：Chromium 最多平衡 6 行，超了就静默退回普通折行，正文段落加它没有效果还多花排版时间。',
    '中英文表现不同：中文逐字换行，balance 只能微调每行字数，效果远不如英文标题明显，别指望它把中文排成对称。',
    '容器得有确定的宽度上限，文字根本不折行，就没有可平衡的东西。',
    'Safari 17.5 之前的版本会直接忽略这条声明，所以基础样式必须是可读的普通折行，不能只靠 balance。',
  ],
  keywords: ['text-wrap: balance', 'text-wrap: pretty', 'orphan', 'widow', 'ch', 'max-width', 'line breaking'],
  spec: [
    { label: '属性', value: 'text-wrap: balance' },
    { label: '适用行数', value: '≤ 6 行（Chromium 上限）' },
    { label: '容器宽度', value: '20–40ch' },
    { label: '降级', value: 'text-wrap: pretty，或者不写' },
  ],
  reducedMotion: '纯排版属性，和动态效果无关，不需要降级。',
  refs: [
    { label: 'MDN · text-wrap', url: 'https://developer.mozilla.org/docs/Web/CSS/text-wrap' },
    { label: 'MDN · CSS 文本模块', url: 'https://developer.mozilla.org/docs/Web/CSS/CSS_text' },
  ],
  related: ['fluid-type', 'char-reveal', 'variable-font'],
  scenes: ['text', 'card', 'page'],
  feel: ['calm', 'soft'],
  intent: ['hierarchy'],
  controls: [
    { kind: 'range', id: 'width', label: '容器宽度', min: 10, max: 26, step: 1, def: 16, unit: 'ch', hint: 'ch 是数字 0 的宽度，16ch 上下就是一行标题的常见长度' },
    {
      kind: 'select',
      id: 'sample',
      label: '文本',
      def: 'en-heading',
      options: [
        { value: 'en-heading', label: '英文标题' },
        { value: 'zh-heading', label: '中文标题' },
        { value: 'en-long', label: '英文长句' },
      ],
    },
    {
      kind: 'select',
      id: 'mode',
      label: '下方启用',
      def: 'balance',
      options: [
        { value: 'wrap', label: 'wrap（普通折行）' },
        { value: 'pretty', label: 'pretty（只防孤字）' },
        { value: 'balance', label: 'balance（拉平每行）' },
      ],
    },
  ],
  prompt: (values: ControlValues) => {
    const width = Number(values.width)
    const sample = String(values.sample)
    const mode = String(values.mode)
    const sampleText = sample === 'zh-heading' ? '中文标题' : sample === 'en-long' ? '英文长句' : '英文标题'
    const modeNote =
      mode === 'balance'
        ? '它会把每行长度拉平，消除最后一行只有一个词的孤行，注意只用在六行以内的短文本上。'
        : mode === 'pretty'
          ? '它主要避免最后一行留孤字，可以安全用在正文上。'
          : '先在普通折行下看它怎么断句，再切换对比。'
    return {
      zh: '把这段' + sampleText + '的容器宽度限制在 ' + width + 'ch，然后给文本加上 text-wrap: ' + mode + '。' + modeNote,
      en: 'text-wrap: ' + mode + ', max-width: ' + width + 'ch, headline line balancing, avoid orphan/widow, only for short text (Chromium caps balance at 6 lines), graceful fallback, no manual br',
    }
  },
}

export default entry
