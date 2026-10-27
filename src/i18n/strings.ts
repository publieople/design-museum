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
  'site.license': {
    zh: '代码 MIT · 内容 CC BY 4.0',
    en: 'Code MIT · content CC BY 4.0',
  },

  // 预渲染写进 <meta name="description"> 的文案（爬虫不跑 JS，这些必须静态存在）
  'seo.home.desc': {
    zh: '用 AI 做网页时最难的一步是把想要的效果说清楚。这里把 {n} 个常见效果做成可交互标本：看得到、摸得着、调得了参数，然后复制一句 AI 听得懂的需求。',
    en: 'The hardest part of building with AI is saying what you want. {n} common effects as interactive specimens: look, touch, tune the parameters, then copy a request AI understands.',
  },
  'seo.browse.desc': {
    zh: '按展厅浏览全部 {n} 条词条：动效与节奏、交互反馈、布局结构、视觉质感、文字排版。每条都含可交互演示、参数滑块与 CSS 参数。',
    en: 'Browse all {n} entries by gallery: motion, feedback, layout, visual and typography. Each one comes with an interactive demo, parameter sliders and CSS values.',
  },
  'seo.feel.desc': {
    zh: '只说感觉也能找到名字：从「轻快」「稳重」「顺滑」这类形容词反查效果的英文术语和 CSS 属性。',
    en: 'Find the name from a feeling: turn adjectives like light, steady or smooth into the English term and CSS property behind an effect.',
  },
  'seo.cheatsheet.desc': {
    zh: '一页速查表：{n} 条效果的中英文名称、CSS 属性名与关键参数，方便整体对照和复制给 AI。',
    en: 'One-page cheat sheet: Chinese and English names, CSS properties and key parameters for all {n} effects, ready to copy into a request.',
  },
  'seo.about.desc': {
    zh: '怎么用这份词典：从找到名字、调参数，到复制成 AI 能执行的需求；页尾是许可与致谢。',
    en: 'How to use this museum: find the name, tune the parameters, copy a request AI can execute — plus licenses and credits.',
  },
  'seo.reverse.desc': {
    zh: '粘贴一段 CSS 或一句口语描述，反查它叫什么。{n} 条词条的关键词、CSS 属性和描述都参与匹配，结果附命中理由，可跳到词条或复制成给 AI 的需求。',
    en: 'Paste a CSS declaration or a fuzzy description and reverse it into a name. Keywords, CSS properties and descriptions of {n} entries all count, with reasons, entry links and ready-to-copy briefs.',
  },
  'seo.aliases.desc': {
    zh: '全站俗称总表：把「磨砂」「果冻」「磁吸」这些口语说法和正式术语对起来，点一下进入词条。',
    en: 'Every nickname on one page: plain-language names such as frosted, jelly or magnetic, matched to their formal terms and entries.',
  },
  'seo.entry.desc': {
    zh: '{name}（{code}）：{oneLiner} 含可交互演示、参数滑块与 CSS 参数，可直接复制成给 AI 的需求。',
    en: '{name} ({code}): {oneLiner} Interactive demo, parameter sliders and CSS values you can copy into a request for AI.',
  },

  'nav.browse': { zh: '词条库', en: 'Browse' },
  'nav.reverse': { zh: '反查', en: 'Reverse' },
  'nav.aliases': { zh: '俗称总表', en: 'Aliases' },
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
  'home.reverseTitle': { zh: '有代码或一句描述？反查名字', en: 'Have code or a description? Reverse it' },
  'home.reverseDesc': {
    zh: '粘贴 backdrop-filter: blur(20px)，或写「半透明磨砂玻璃」，看看它对应哪件展品。',
    en: 'Paste a CSS snippet or describe the effect in plain words and see which entry it maps to.',
  },
  'home.aliasTitle': { zh: '俗称总表 · 口语说法一页查完', en: 'Alias index · every nickname, one page' },
  'home.aliasDesc': {
    zh: '磨砂、果冻、磁吸、数字滚动……按俗称直接跳到词条，也能提议新别名。',
    en: 'Frosted, jelly, magnetic, count-up — jump straight to the entry, or suggest a new alias.',
  },
  'home.categoriesRef': { zh: '展品分类参考：', en: 'Halls:' },

  'browse.title': { zh: '词条库', en: 'Browse' },
  'browse.count': { zh: '{a} / {b} 件', en: '{a} / {b}' },
  'browse.hall': { zh: '展厅', en: 'Hall' },
  'browse.scene': { zh: '用在哪', en: 'Where' },
  'browse.feel': { zh: '什么感觉', en: 'Feel' },
  'browse.tags': { zh: '标签', en: 'Tags' },
  'browse.all': { zh: '全部', en: 'All' },
  'browse.clear': { zh: '清空筛选', en: 'Clear filters' },
  'browse.empty': { zh: '这一组筛选下没有展品。', en: 'No specimens match this combination.' },
  'browse.tryFeel': { zh: '试试按感觉找 →', en: 'Try find by feel →' },

  'search.placeholder': {
    zh: '试试「毛玻璃」「maoboli」「backdrop blur」…',
    en: 'Try “frosted glass”, “maoboli”, “backdrop blur”…',
  },
  'search.pinyinHint': {
    zh: '支持拼音与首字母：maoboli / mbl 都能找到毛玻璃',
    en: 'Pinyin and initials work too: maoboli or mbl finds frosted glass',
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
  // 这一档里既有滚动驱动也有点击/拖拽驱动，文案要对两者都成立
  'stage.needsScroll': { zh: '↕ 自己动手试试', en: '↕ Try it yourself' },
  // 卡片缩略图定格时用：这一档在卡片里缩着看没意义，点开才是正经演示
  'stage.tapToTry': { zh: '点开自己动手', en: 'Open to try it' },
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

  'reverse.eyebrow': { zh: '反查 · REVERSE LOOKUP', en: 'REVERSE LOOKUP' },
  'reverse.title': { zh: '反查', en: 'Reverse lookup' },
  'reverse.lede': {
    zh: '粘贴一段 CSS（比如 backdrop-filter: blur(20px)），或者用口语描述你看到的效果。系统会按 CSS 属性、关键词和描述相似度给词条打分。',
    en: 'Paste a CSS snippet such as backdrop-filter: blur(20px), or describe the effect in plain language. Entries are scored by CSS properties, keywords and description similarity.',
  },
  'reverse.inputLabel': { zh: 'CSS 代码或描述', en: 'CSS or description' },
  'reverse.placeholder': {
    zh: 'backdrop-filter: blur(20px) saturate(140%);\n或者：卡片背后半透明磨砂玻璃',
    en: 'backdrop-filter: blur(20px) saturate(140%);\nor: a frosted translucent panel behind the card',
  },
  'reverse.exampleCss': { zh: '示例 CSS', en: 'Example CSS' },
  'reverse.exampleText': { zh: '示例描述', en: 'Example description' },
  'reverse.submit': { zh: '反查', en: 'Look up' },
  'reverse.clear': { zh: '清空', en: 'Clear' },
  'reverse.empty': {
    zh: '贴上代码或描述，这里会列出最可能的效果。',
    en: 'Paste code or a description and the most likely effects will appear here.',
  },
  'reverse.noMatch': {
    zh: '没找到匹配。只保留关键属性试试，或者去俗称总表按口语说法找。',
    en: 'No match. Try just the key property, or browse the alias index by nickname.',
  },
  'reverse.results': { zh: '最可能的 {n} 条', en: 'Top {n} matches' },
  'reverse.score': { zh: '匹配度 {n}%', en: '{n}% match' },
  'reverse.detected': { zh: '识别到 {n} 个 CSS 属性', en: '{n} CSS properties recognised' },
  'reverse.whyCss': { zh: 'CSS 属性：{x}', en: 'CSS property: {x}' },
  'reverse.whyKeyword': { zh: '关键词：{x}', en: 'Keyword: {x}' },
  'reverse.whyText': { zh: '描述相近：{x}', en: 'Description: {x}' },
  'reverse.open': { zh: '打开词条', en: 'Open entry' },
  'reverse.aliasLink': { zh: '浏览俗称总表 →', en: 'Browse the alias index →' },

  'aliases.eyebrow': { zh: '俗称总表 · ALIAS INDEX', en: 'ALIAS INDEX' },
  'aliases.title': { zh: '俗称总表', en: 'Alias index' },
  'aliases.lede': {
    zh: '同一个效果常有好几种叫法。这里是全站的俗称、口语说法和英文术语——按名字搜，或者直接扫一遍。',
    en: 'One effect often has many names. Every nickname, plain-language phrase and English term on the site — search them or scan the list.',
  },
  'aliases.search': { zh: '搜索俗称、术语或词条', en: 'Search aliases, terms or entries' },
  'aliases.count': { zh: '{a} 个俗称，来自 {b} 条词条', en: '{a} aliases from {b} entries' },
  'aliases.empty': {
    zh: '没有匹配的俗称。换个说法试试，或者去词条库搜。',
    en: 'No aliases match. Try another phrase, or search the collection.',
  },
  'aliases.clear': { zh: '清空', en: 'Clear' },
  'aliases.contribute': { zh: '发现新的俗称？去 GitHub 提一条 →', en: 'Found a new nickname? Suggest it on GitHub →' },
  'aliases.browseLink': { zh: '去词条库 →', en: 'Browse all entries →' },

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
  'titles.reverse': { zh: '反查', en: 'Reverse lookup' },
  'titles.aliases': { zh: '俗称总表', en: 'Alias index' },
  'titles.feel': { zh: '感觉导航', en: 'Find by feel' },
  'titles.cheatsheet': { zh: '速查表', en: 'Cheat sheet' },
  'titles.about': { zh: '怎么用', en: 'How to use' },
  'titles.entry': { zh: '展品', en: 'Specimen' },
  'titles.debug': { zh: '冒烟测试', en: 'Smoke test' },
  // ── INDEX 重设计新增 ─────────────────────────────────────────
  'common.copy': { zh: '复制', en: 'Copy' },
  'common.copied': { zh: '已复制', en: 'Copied' },
  'common.close': { zh: '关闭', en: 'Close' },
  'common.clear': { zh: '清空', en: 'Clear' },
  'common.reset': { zh: '重置', en: 'Reset' },
  'common.all': { zh: '全部', en: 'All' },
  'common.more': { zh: '更多', en: 'More' },
  'common.open': { zh: '打开', en: 'Open' },
  'common.back': { zh: '返回', en: 'Back' },

  'nav.search': { zh: '搜索', en: 'Search' },
  'nav.menu': { zh: '菜单', en: 'Menu' },
  'nav.close': { zh: '关闭菜单', en: 'Close menu' },
  'nav.skip': { zh: '跳到正文', en: 'Skip to content' },
  'footer.index': { zh: '索引', en: 'Index' },
  'footer.tools': { zh: '工具', en: 'Tools' },
  'footer.source': { zh: '源码与许可', en: 'Source & license' },

  'search.dialogTitle': { zh: '搜索标本', en: 'Search specimens' },
  'search.dialogHint': {
    zh: '按名字、俗称、拼音或英文术语搜。↑↓ 选择，Enter 打开，Esc 关闭。',
    en: 'Search names, nicknames, pinyin or English terms. ↑↓ to choose, Enter to open, Esc to close.',
  },
  'search.examples': { zh: '试试这些', en: 'Try these' },
  'search.noResults': { zh: '没有匹配的标本', en: 'No specimens match' },
  'search.noResultsHint': {
    zh: '换个说法，或者从索引或感觉导航进去。',
    en: 'Try another phrase, or go through the index or find by feel.',
  },
  'search.browseAll': { zh: '浏览全部 {n} 件', en: 'Browse all {n}' },
  'search.open': { zh: '打开词条', en: 'Open entry' },
  'search.hot': { zh: '热门搜索', en: 'Popular' },
  'search.esc': { zh: '关闭', en: 'close' },

  'home.kicker': { zh: '索引档案', en: 'Index archive' },
  'home.hot': { zh: '热门标本', en: 'Popular specimens' },
  'home.toolsTitle': { zh: '四件工具', en: 'Four tools' },
  'home.browseAll': { zh: '浏览全部 {n} 件', en: 'Browse all {n}' },
  'home.howTitle': { zh: '怎么用', en: 'How it works' },
  'home.step1Title': { zh: '找到名字', en: 'Name it' },
  'home.step1Desc': {
    zh: '知道名字就搜名字；不知道就搜口语（「磨砂」「果冻」）、拼音（maoboli）或走感觉导航。',
    en: 'Search the name if you know it; otherwise search a nickname (frosted, jelly), pinyin, or use find by feel.',
  },
  'home.step2Title': { zh: '调到满意', en: 'Tune it' },
  'home.step2Desc': {
    zh: '每条都有可交互演示和参数滑块，时长、缓动、模糊半径滑一遍就有数。',
    en: 'Every entry has a live demo and sliders — drag once to feel duration, easing and blur radius.',
  },
  'home.step3Title': { zh: '交给 AI', en: 'Brief the AI' },
  'home.step3Desc': {
    zh: '复制带参数的中文需求句或英文术语，或去速查表把几个效果整段导出。',
    en: 'Copy a brief with your values or the English terms, or export several effects from the cheat sheet.',
  },

  'browse.lede': {
    zh: '全部 {n} 件标本。用展厅、用法、感觉和标签交叉筛选，也可以直接搜。',
    en: 'All {n} specimens. Cross-filter by hall, usage, feel and tags, or just search.',
  },
  'browse.sort': { zh: '排序', en: 'Sort' },
  'browse.sortCode': { zh: '按编号', en: 'By code' },
  'browse.sortName': { zh: '按名称', en: 'By name' },
  'browse.filters': { zh: '筛选', en: 'Filters' },
  'browse.active': { zh: '{n} 个条件', en: '{n} active' },
  'browse.results': { zh: '结果', en: 'Results' },
  'browse.railHalls': { zh: '展厅', en: 'Halls' },
  'browse.allHalls': { zh: '全部展厅', en: 'All halls' },
  'browse.railHint': { zh: '展厅索引', en: 'Hall index' },

  'aliases.jump': { zh: '跳到展厅', en: 'Jump to hall' },
  'aliases.groupCount': { zh: '{n} 个俗称', en: '{n} aliases' },
  'aliases.highlightHint': { zh: '朱红编号为搜索命中的词条', en: 'Red codes mark matching entries' },

  'entry.output': { zh: '输出给 AI', en: 'Output for AI' },
  'entry.tabZh': { zh: '中文需求句', en: 'Brief (Chinese)' },
  'entry.tabEn': { zh: '英文术语', en: 'English terms' },
  'entry.tabLink': { zh: '分享链接', en: 'Share link' },
  'entry.copyPrompt': { zh: '复制给 AI', en: 'Copy for AI' },
  'entry.resetParams': { zh: '恢复默认参数', en: 'Reset parameters' },
  'entry.params': { zh: '参数', en: 'Parameters' },
  'entry.compareTo': { zh: '容易混的', en: 'Confused with' },
  'entry.openCompare': { zh: '去看「{x}」', en: 'Open “{x}”' },
  'entry.metaShape': { zh: '形态', en: 'Shape' },
  'entry.metaLoop': { zh: '播放', en: 'Playback' },
  'entry.hallLabel': { zh: '展厅', en: 'Hall' },
  'loop.replay': { zh: '重播', en: 'Replay' },
  'loop.continuous': { zh: '常驻循环', en: 'Loop' },
  'loop.manual': { zh: '手动触发', en: 'Manual' },
  'entry.code': { zh: '编号', en: 'No.' },

  'reverse.matches': { zh: '匹配 {n} 条', en: '{n} matches' },
  'reverse.rank': { zh: '按匹配度', en: 'Ranked by match' },
  'reverse.hint': {
    zh: '说明：反查是启发式打分，不是语义理解。只保留关键属性通常更准。',
    en: 'Note: this is heuristic scoring, not semantic understanding. Keeping only the key property usually helps.',
  },
  'reverse.tryBrowse': { zh: '去词条库翻一遍', en: 'Browse the collection' },
  'reverse.tryFeel': { zh: '按感觉找', en: 'Find by feel' },

  'sheet.export': { zh: '导出', en: 'Export' },
  'sheet.langZh': { zh: '中文', en: 'Chinese' },
  'sheet.langEn': { zh: '英文', en: 'English' },

  'about.title': { zh: '怎么用这份词典', en: 'How to use this glossary' },
  'about.lede': {
    zh: '这个站不为教你写代码，为的是解决一件事：把「我想要那个……嗯……就是那个效果」变成一句 AI 一次就能做对的需求。',
    en: 'This site is not here to teach you to code. It exists to close one gap: turning "I want that thing... you know, that effect" into a brief your AI gets right the first time.',
  },
  'about.stepsTitle': { zh: '三步', en: 'Three steps' },
  'about.step1': {
    zh: '找到它。知道名字就直接搜；不知道就按口语说法搜（「磨砂」「果冻」「卡片飘起来」），或者走感觉导航。',
    en: 'Find it. Search the name if you know it; if you do not, search a plain-language phrase ("frosted", "jelly", "card floats up"), or use find by feel.',
  },
  'about.step2': {
    zh: '调到你要的样子。每个词条都有可交互演示和参数滑块。时长、缓动、模糊半径这些数值不是玄学，滑一遍就知道差异在哪；顺带也能换背景，因为毛玻璃、发光这类效果离开背景就不成立。',
    en: 'Tune it. Every entry has a live demo and sliders. Duration, easing and blur radius are not mysticism — drag once and the difference is obvious. You can also switch the backdrop, because glass and glow effects do not exist without one.',
  },
  'about.step3': {
    zh: '复制过去。词条页给你两版：中文需求句（带当前参数）和英文关键词（AI 最容易认的术语）。一次要加好几个效果，就去速查表勾选后整段导出。',
    en: 'Copy it. Each entry gives you two versions: a brief in Chinese with your current values, and English keywords using the terms models recognise best. Adding several effects at once? Tick them on the cheat sheet and export one block.',
  },
  'about.whyTitle': { zh: '为什么术语比形容词管用', en: 'Why terms beat adjectives' },
  'about.whyBody': {
    zh: '「高级一点的卡片」是形容词，「悬停抬升 + 12px 柔和投影 + 200ms ease-out」是名词和数值。前者要 AI 猜，后者 AI 能直接对上它训练过的实现。所以每条词条都同时给出中文名、英文术语、CSS 属性名和推荐取值——你负责挑，AI 负责落。',
    en: '"A classier card" is an adjective. "Hover lift + 12px soft shadow + 200ms ease-out" is a noun plus numbers. The first forces a guess; the second maps straight onto implementations the model has seen. That is why every entry carries a Chinese name, an English term, the CSS properties and suggested values — you choose, the model builds.',
  },
  'about.mistakesTitle': { zh: '两个常见误区', en: 'Two common mistakes' },
  'about.mistake1': {
    zh: '把「别搞混」当废话。这一栏专门写两个容易混的效果差在哪——它通常也是 AI 最容易做错的地方。',
    en: 'Skipping "Not to be confused with". That section exists because it is usually exactly where the model gets it wrong.',
  },
  'about.mistake2': {
    zh: '只要关键词不要参数。同一个效果在 150ms 和 600ms 下是两种气质，参数才是你那次审美判断的落点。',
    en: 'Taking the keywords but dropping the values. The same effect at 150ms and 600ms reads as two different products — the numbers are where your judgement actually lands.',
  },
  'about.templateTitle': { zh: '提示词模板', en: 'Prompt template' },
  'about.catalogTitle': { zh: '让 AI 自己查', en: 'Let the AI look it up' },
  'about.catalogBody': {
    zh: '这个站还给机器发布了一份目录：AI 可以自己查，不用你把内容一段段复制进对话框。索引（别名、关键词、标签、控件默认值、现成需求句）在 catalog.json，逐条全文（什么时候用、别搞混、踩坑、推荐取值）在 catalog.md。',
    en: 'This site also publishes its catalogue for machines, so an agent can search it itself instead of you pasting paragraphs into a chat. The index (aliases, keywords, tags, control defaults and ready-to-use briefs) lives in catalog.json; the full text of every entry (when to use, confusions, pitfalls, values) lives in catalog.md.',
  },
  'about.catalogNote': {
    zh: '目录与页面同源，不会各说各话：这里的每条词条、别名、易混项与推荐取值，目录里都有。',
    en: 'The catalogue is generated from the same data as these pages, so it cannot drift: every entry, alias, confusion and value you see here is in there too.',
  },
  'about.nextTitle': { zh: '继续走', en: 'Keep going' },
  'about.nextBefore': { zh: '直接', en: 'Head into ' },
  'about.nextBrowse': { zh: '进词条库', en: 'the collection' },
  'about.nextMiddle': { zh: '，或者回到', en: 'or go back ' },
  'about.nextHome': { zh: '首页', en: 'home' },
  'about.nextAfter': {
    zh: '搜一个你现在正缺的效果。',
    en: 'and search for the effect you are missing right now.',
  },
  'about.licenseTitle': { zh: '许可与致谢', en: 'License and credits' },
  'about.licenseCode': {
    zh: '代码按 MIT 授权，文字内容按 CC BY 4.0 授权。',
    en: 'Code is MIT, the written content is CC BY 4.0. ',
  },
  'about.licenseFonts': {
    zh: '字体本地打包、不请求外部 CDN：JetBrains Mono 与 Space Grotesk，均为 SIL Open Font License 1.1。',
    en: 'Fonts are bundled locally, no external CDN: JetBrains Mono and Space Grotesk, both under the SIL Open Font License 1.1. ',
  },
  'about.licenseEntries': {
    zh: '词条正文是原创归纳，只链接到 MDN、web.dev 与 W3C 规范，那些页面的版权归各自所有者。',
    en: 'Entries are our own summaries that link out to MDN, web.dev and the W3C specs — those pages stay with their owners.',
  },
  'about.licenseThirdParty': {
    zh: '第三方组件与素材清单：',
    en: 'Full list of third-party components: ',
  },

  'notFound.search': { zh: '去搜索', en: 'Search instead' },

  // ── 现场页（/live，整页演示）────────────────────────────────
  'titles.live': { zh: '现场演示', en: 'Live demos' },
  'seo.live.desc': {
    zh: '有些效果离开整页就不成立：滚动驱动、视差、虚拟滚动、粘性堆叠、页面过渡、全屏浮层、光标跟随。这里每个效果都占满整页，页面本身就是演示，共 {n} 个现场。',
    en: 'Some effects do not survive a box: scroll-driven animation, parallax, virtual scrolling, sticky stacking, page transitions, full-screen overlays, cursor followers. Each effect takes over the whole page here — the page is the demo. {n} live demos.',
  },
  'seo.liveEntry.desc': {
    zh: '{name} 的整页现场演示：{oneLiner} 向下滚动，页面本身就是效果的一部分。',
    en: 'A full-page live demo of {name}: {oneLiner} Scroll — the page itself is part of the effect.',
  },
  'live.lede': {
    zh: '有些效果在展台里演不出来：它们要的是整页滚动、整个视口或者真实的指针。这里不给盒子——页面本身就是演示。',
    en: 'Some effects cannot be staged in a box: they need the whole page scrolling, the whole viewport or a real pointer. No boxes here — the page itself is the demo.',
  },
  'live.indexLede': {
    zh: '每个效果占满一整页，你正常滚动、移动指针就行。看完从浮动条回词条，或者接着看下一个。',
    en: 'Each effect takes over a full page — just scroll and move the pointer. Use the floating bar to go back to the entry or on to the next one.',
  },
  'live.count': { zh: '{n} 个现场演示', en: '{n} live demos' },
  'live.badge': { zh: '现场演示', en: 'Live demo' },
  'live.backEntry': { zh: '返回词条', en: 'Back to entry' },
  'live.index': { zh: '全部现场', en: 'All live demos' },
  'live.prev': { zh: '上一个现场', en: 'Previous live demo' },
  'live.next': { zh: '下一个现场', en: 'Next live demo' },
  'live.loading': { zh: '正在布置展台…', en: 'Setting up the specimen…' },
  'live.closeHint': { zh: 'Esc 返回词条', en: 'Esc to go back' },
  'live.reduced': { zh: '已按系统设置减少动态', en: 'Reduced motion is on' },
  'live.scrollHint': { zh: '向下滚动', en: 'Scroll down' },
  'live.open': { zh: '进入现场', en: 'Open live demo' },
  'live.group.scroll': { zh: '滚动时间线', en: 'Scroll timeline' },
  'live.group.layout': { zh: '布局与堆叠', en: 'Layout & stacking' },
  'live.group.pointer': { zh: '指针与视口', en: 'Pointer & viewport' },
  'live.group.navigation': { zh: '页面切换', en: 'Page transitions' },
  'live.group.overlay': { zh: '浮层与提示', en: 'Overlays & notices' },
  'live.note.scroll-driven': {
    zh: '页面滚到哪，动画就走到哪：进度条、卡片转正与入场都由滚动位置驱动，没有演示框。',
    en: 'Scroll position is the animation: the progress bar and the cards entering and straightening up are all driven by where the page is scrolled. No demo box.',
  },
  'live.note.scroll-reveal': {
    zh: '每一段内容进入视口时自己浮上来。往下滚，看整页的节奏而不是一个盒子里的循环。',
    en: 'Each block rises into place as it enters the viewport. Scroll to feel the rhythm of a whole page instead of a loop inside a box.',
  },
  'live.note.parallax': {
    zh: '前景、中景、背景以不同速度移动。纵深感只有在整页滚动、整块视口里才成立。',
    en: 'Foreground, middle ground and background move at different speeds. That sense of depth only works across a whole page and viewport.',
  },
  'live.note.sticky-stack': {
    zh: '一张卡片粘住，下一张压上来。整页滚动时，卡片堆叠才有真正的重量。',
    en: 'One card sticks, the next covers it. Stacking only carries weight when it happens across a whole page.',
  },
  'live.note.cursor-follower': {
    zh: '圆点跟着指针慢半拍。这里跟随的是整页的指针，不再局限在某个演示框里。',
    en: 'A dot trails behind the pointer. Here it follows the pointer across the entire page, not inside a demo box.',
  },
  'live.note.virtual-scrolling': {
    zh: '一万行全部铺在整页里滚，只渲染视口附近那几十行。行数不够多，就看不出省掉了什么。',
    en: 'Ten thousand rows scroll in the page while only the few dozen near the viewport are rendered. With too few rows you cannot see what is being saved.',
  },
  'live.note.scroll-progress': {
    zh: '顶部那条线跟着整页的阅读进度走。放在盒子里，它只是盒子的进度。',
    en: 'The line at the top tracks how far you have read the whole page. Inside a box it would only measure the box.',
  },
  'live.note.sticky-header': {
    zh: '头部钉在视口顶部，往下滚时收起、往上滚时回来。只有整页滚动才有「往上滚」这件事。',
    en: 'The header pins to the top of the viewport, hides as you scroll down and returns as you scroll up. Only whole-page scrolling has an “up”.',
  },
  'live.note.view-transitions': {
    zh: '两块页面在同一次导航里交叉，共享元素从旧位置长到新位置。没有整页导航，过渡就没有起点和终点。',
    en: 'Two pages cross-fade in one navigation while a shared element grows from its old place to its new one. Without a real page navigation there is no start or end to transition between.',
  },
  'live.note.command-palette': {
    zh: '覆盖整个视口的搜索面板，⌘K 随时唤出，背后的页面还在。只有全屏才有那种「整个页面都被接管」的压力。',
    en: 'A search panel over the entire viewport, summoned with ⌘K while the page stays behind it. Only full screen gives it that sense of taking over.',
  },
  'live.note.toast': {
    zh: '从视口角落弹出的提示，不打断你正在做的事。位置、堆叠顺序与安全区，只有整页空间才说得清。',
    en: 'A notice that rises from a viewport corner without interrupting what you are doing. Position, stacking order and safe areas only make sense against a whole page.',
  },
} as const

export type StringKey = keyof typeof STRINGS
