/**
 * 界面文案表。所有 UI 文字都从这里取，组件里不再出现硬编码字符串。
 * 词条正文不走这里——它在各自的词条文件里以 en 覆盖层的形式存在。
 */
export const STRINGS = {
  'site.name': { zh: '前端设计博物馆', en: 'Frontend Design Museum' },
  'site.latin': { zh: 'DESIGN MUSEUM', en: 'DESIGN MUSEUM' },
  'site.tagline': {
    zh: '先给效果起个名字，再让 AI 实现它。',
    en: 'Name the effect first, then let AI build it.',
  },
  'site.footer': {
    zh: '先给效果起个名字，再让 AI 实现它。词条内容参考 MDN 与 web.dev，欢迎补充。',
    en: 'Name the effect first, then let AI build it. Entries reference MDN and web.dev — corrections welcome.',
  },

  'nav.browse': { zh: '词条库', en: 'Browse' },
  'nav.feel': { zh: '感觉导航', en: 'Find by feel' },
  'nav.cheatsheet': { zh: '速查表', en: 'Cheat sheet' },
  'nav.about': { zh: '怎么用', en: 'How to use' },

  'settings.open': { zh: '设置', en: 'Settings' },
  'settings.title': { zh: '设置', en: 'Settings' },
  'settings.close': { zh: '收起设置', en: 'Close settings' },
  'settings.theme': { zh: '站点主题', en: 'Site theme' },
  'settings.theme.light': { zh: '浅色', en: 'Light' },
  'settings.theme.dark': { zh: '深色', en: 'Dark' },
  'settings.theme.system': { zh: '跟随系统', en: 'System' },
  'settings.locale': { zh: '界面语言', en: 'Language' },
  'settings.locale.zh': { zh: '中文', en: '中文' },
  'settings.locale.en': { zh: 'English', en: 'English' },
  'settings.stage': { zh: '展品背景', en: 'Demo backdrop' },
  'settings.stage.auto': { zh: '按展品自动', en: 'Auto per entry' },
  'settings.motion': { zh: '演示', en: 'Playback' },
  'settings.loop': { zh: '循环重播', en: 'Loop' },
  'settings.loop.hint': { zh: '演示会自动一遍遍重播', en: 'Replay demos on repeat' },
  'settings.slow': { zh: '慢放', en: 'Slow motion' },
  'settings.slow.hint': { zh: '约 1/3 速度，方便看清缓动与弹簧', en: 'About 1/3 speed, for reading easing and springs' },
  'settings.reset': { zh: '恢复默认设置', en: 'Reset all settings' },
  'settings.hint': {
    zh: '站点主题和展品背景是分开记录的，改一个不会影响另一个。',
    en: 'Site theme and demo backdrop are stored separately — changing one leaves the other alone.',
  },

  'home.eyebrow': { zh: '前端设计博物馆 · FRONTEND DESIGN MUSEUM · {n} 件标本', en: 'FRONTEND DESIGN MUSEUM · {n} specimens' },
  'home.lede': {
    zh: '用 AI 做网页时最卡的一步，往往不是不会做，而是不知道那个效果叫什么。这里把常见效果都做成活的标本：看到、摸到、把参数调到满意，然后复制成一句 AI 听得懂的需求。',
    en: 'The hardest step when building with AI is rarely the building — it is not knowing what the effect is called. Every entry here is a live specimen: look at it, touch it, tune the numbers until it feels right, then copy a sentence your AI can act on.',
  },
  'home.h1a': { zh: '先给效果起个名字，', en: 'Name the effect first,' },
  'home.h1b': { zh: '再让 AI 实现它。', en: 'then let AI build it.' },
  'home.hits': { zh: '命中 {n} 条', en: '{n} matches' },
  'home.noHits': {
    zh: '没有找到——试试口语说法，比如「毛玻璃」「果冻」',
    en: 'Nothing found — try a plain-language phrase like “frosted glass” or “jelly”',
  },
  'home.nowShowing': { zh: '正在展出', en: 'Now showing' },
  'home.seeAll': { zh: '看全部 {n} 件 →', en: 'See all {n} →' },
  'home.halls': { zh: '五个展厅', en: 'Five halls' },
  'home.unit': { zh: '{n} 件', en: '{n}' },
  'home.feelTitle': { zh: '描述不出来？按感觉找', en: 'Cannot describe it? Find by feel' },
  'home.feelDesc': {
    zh: '回答三个问题（用在哪、什么感觉、想达到什么效果），从候选里挑一个。',
    en: 'Answer three questions — where it goes, how it should feel, what it should do — then pick from the shortlist.',
  },
  'home.sheetTitle': { zh: '速查表 · 整段复制给 AI', en: 'Cheat sheet · paste a whole brief' },
  'home.sheetDesc': {
    zh: '勾选这次要用的几个效果，导出一段带中英术语和参数的需求清单。',
    en: 'Tick the effects this page needs and export one brief with terms, parameters and technical requirements.',
  },
  'home.categoriesRef': { zh: '展品分类参考：', en: 'Halls:' },

  'browse.title': { zh: '词条库', en: 'Browse' },
  'browse.count': { zh: '{a} / {b} 件', en: '{a} / {b}' },
  'browse.hall': { zh: '展厅', en: 'Hall' },
  'browse.scene': { zh: '用在哪', en: 'Where' },
  'browse.feel': { zh: '什么感觉', en: 'Feel' },
  'browse.all': { zh: '全部', en: 'All' },
  'browse.clear': { zh: '清空筛选', en: 'Clear filters' },
  'browse.empty': { zh: '这一组筛选下没有展品。', en: 'No specimens match this combination.' },
  'browse.tryFeel': { zh: '试试按感觉找 →', en: 'Try find by feel →' },

  'search.placeholder': {
    zh: '试试「毛玻璃」「磨砂」「backdrop blur」…',
    en: 'Try “毛玻璃”, “frosted glass”, “backdrop blur”…',
  },
  'search.aria': { zh: '搜索效果', en: 'Search effects' },
  'search.clear': { zh: '清空搜索', en: 'Clear search' },
  'search.suggest': { zh: '建议', en: 'Suggestions' },
  'search.hint': {
    zh: '按 / 聚焦 · ↑↓ 选择 · Enter 打开 · Esc 清空',
    en: 'Press / to focus · ↑↓ to choose · Enter to open · Esc to clear',
  },

  'entry.browse': { zh: '词条库', en: 'Browse' },
  'entry.notFound': { zh: '没有这件展品', en: 'No such specimen' },
  'entry.notFoundDesc': {
    zh: '可能是链接过期了。全馆共 {n} 件展品，回词条库看看。',
    en: 'The link may be stale. There are {n} specimens — head back to the collection.',
  },
  'entry.aliases': { zh: '又叫：', en: 'Also called:' },
  'entry.whenToUse': { zh: '什么时候用', en: 'When to use it' },
  'entry.scenes': { zh: '适用场景：', en: 'Where it fits:' },
  'entry.unlimited': { zh: '不限', en: 'any' },
  'entry.spec': { zh: '推荐取值', en: 'Suggested values' },
  'entry.confusions': { zh: '别搞混', en: 'Not to be confused with' },
  'entry.confusionWith': { zh: '和「{x}」的区别', en: 'Versus “{x}”' },
  'entry.pitfalls': { zh: '容易踩的坑', en: 'Common traps' },
  'entry.reducedMotion': { zh: '无障碍降级', en: 'Reduced motion' },
  'entry.keywords': { zh: '关键词', en: 'Keywords' },
  'entry.refs': { zh: '参考', en: 'References' },
  'entry.related': { zh: '相关展品', en: 'Related' },
  'entry.demoMissing': { zh: '这件展品的演示还没做好。', en: 'This specimen has no demo yet.' },
  'entry.stageGroup': { zh: '演示背景', en: 'Demo backdrop' },

  'prompt.title': { zh: '复制给 AI', en: 'Copy for your AI' },
  'prompt.live': { zh: '随参数实时更新', en: 'Updates with the controls' },
  'prompt.fixed': { zh: '固定文案', en: 'Fixed text' },
  'prompt.zh': { zh: '需求句（中文）', en: 'Brief (Chinese)' },
  'prompt.en': { zh: '关键词（英文术语）', en: 'Keywords (English terms)' },
  'prompt.copyZh': { zh: '复制需求句', en: 'Copy brief' },
  'prompt.copyEn': { zh: '复制关键词', en: 'Copy keywords' },
  'prompt.copyLink': { zh: '复制分享链接', en: 'Copy share link' },
  'prompt.shareHint': { zh: '链接带着你调好的参数', en: 'The link carries your tuned values' },
  'prompt.toastZh': { zh: '需求句已复制', en: 'Brief copied' },
  'prompt.toastEn': { zh: '关键词已复制', en: 'Keywords copied' },
  'prompt.toastLink': { zh: '分享链接已复制', en: 'Share link copied' },

  'control.title': { zh: '参数工作台', en: 'Controls' },
  'control.reset': { zh: '恢复默认', en: 'Reset' },

  'stage.replay': { zh: '重播', en: 'Replay' },
  'stage.loop': { zh: '循环', en: 'Loop' },
  'stage.slow': { zh: '慢放', en: 'Slow' },

  'feel.title': { zh: '感觉导航', en: 'Find by feel' },
  'feel.lede': {
    zh: '不知道叫什么，就从感觉开始。三个问题都是可选的，选得越多候选越少。',
    en: 'If you do not know the name, start from the feeling. All three questions are optional — the more you pick, the shorter the list.',
  },
  'feel.q1': { zh: '用在哪里', en: 'Where it goes' },
  'feel.q2': { zh: '想要什么感觉', en: 'How it should feel' },
  'feel.q3': { zh: '想达到什么', en: 'What it should do' },
  'feel.reset': { zh: '重新回答', en: 'Start over' },
  'feel.candidates': { zh: '候选展品', en: 'Shortlist' },
  'feel.all': { zh: '全部展品', en: 'All specimens' },
  'feel.empty': { zh: '这个组合下没有展品，去掉一个条件试试。', en: 'Nothing matches this combination — drop one condition.' },

  'sheet.title': { zh: '速查表', en: 'Cheat sheet' },
  'sheet.lede': {
    zh: '勾选这次页面要用到的效果，导出一段需求清单。「中文说法 → 英文术语 → 参数 → 技术要求」一次给全，AI 不用猜。',
    en: 'Tick the effects this page needs and export a single brief: plain-language name → English term → parameters → technical requirement. Nothing left for the AI to guess.',
  },
  'sheet.selected': { zh: '选展品（{a} / {b}）', en: 'Specimens ({a} / {b})' },
  'sheet.selectAll': { zh: '全选', en: 'Select all' },
  'sheet.clear': { zh: '清空', en: 'Clear' },
  'sheet.preview': { zh: '导出预览', en: 'Export preview' },
  'sheet.copyAll': { zh: '复制整段', en: 'Copy brief' },
  'sheet.empty': {
    zh: '左边勾几个效果，这里会生成可以整段粘给 AI 的需求清单。',
    en: 'Tick a few effects on the left and a paste-ready brief appears here.',
  },
  'sheet.tuned': { zh: '已带上你在词条页调过的参数', en: 'Using the values you tuned on each entry' },
  'sheet.defaults': { zh: '用的是默认参数', en: 'Using default values' },
  'sheet.resetTuned': { zh: '改回默认参数', en: 'Reset to defaults' },
  'sheet.toast': { zh: '需求清单已复制', en: 'Brief copied' },

  'notFound.title': { zh: '这里没有展品', en: 'Nothing here' },
  'notFound.desc': { zh: '地址可能写错了。回首页重新开始。', en: 'That address looks wrong. Head back home.' },
  'notFound.home': { zh: '首页', en: 'Home' },

  'debug.title': { zh: '冒烟测试 · 全部 demo', en: 'Smoke test · every demo' },
  'debug.stats': {
    zh: '词条 {entries} 件 · demo {demos} 个 · 缺 demo {missing} 件 · 孤儿 demo {orphans} 个',
    en: '{entries} entries · {demos} demos · {missing} missing · {orphans} orphaned',
  },
  'debug.missing': { zh: '缺 demo：', en: 'Missing demos:' },
  'debug.orphans': { zh: '孤儿 demo：', en: 'Orphaned demos:' },

  'toast.copied': { zh: '已复制到剪贴板', en: 'Copied to clipboard' },
  'copy.manual': {
    zh: '复制失败，请手动选择文本复制',
    en: 'Copy failed — select the text and copy manually',
  },

  'error.renderFailed': { zh: '渲染失败', en: 'failed to render' },
  'demo.untitled': { zh: '演示', en: 'Demo' },

  'sheet.exportTitle': {
    zh: '# 设计需求清单（来自「前端设计博物馆」）',
    en: '# Design brief (from the Frontend Design Museum)',
  },
  'sheet.exportIntro': {
    zh: '下面每条效果都已经有公认的名字。请按这些术语的标准做法实现，不要用相近但不同的做法替代；参数按给出的取值来。',
    en: 'Every effect below already has an established name. Implement the standard technique for that term — do not substitute a similar-looking one — and use the given values.',
  },
  'sheet.fx.effect': { zh: '效果', en: 'What it is' },
  'sheet.fx.where': { zh: '用在', en: 'Where' },
  'sheet.fx.params': { zh: '参数', en: 'Values' },
  'sheet.fx.tech': { zh: '技术要求', en: 'Technical requirement' },
  'sheet.fx.keywords': { zh: '关键词', en: 'Keywords' },
  'sheet.exportFooter': {
    zh: '共 {n} 条。如果有不理解的名字，按括号里的英文术语去查标准实现。',
    en: '{n} entries. If a name is unfamiliar, look up the English term in brackets for the standard implementation.',
  },

  'titles.browse': { zh: '词条库', en: 'Browse' },
  'titles.feel': { zh: '感觉导航', en: 'Find by feel' },
  'titles.cheatsheet': { zh: '速查表', en: 'Cheat sheet' },
  'titles.about': { zh: '怎么用', en: 'How to use' },
  'titles.entry': { zh: '展品', en: 'Specimen' },
  'titles.debug': { zh: '冒烟测试', en: 'Smoke test' },
} as const

export type StringKey = keyof typeof STRINGS
