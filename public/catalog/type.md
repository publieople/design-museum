# 前端设计博物馆 · 排版与文字 / Typography & Text（T 厅）

> 文字本身的形态与呈现方式

> 本厅 8 条词条。全量目录见 https://publieople.github.io/design-museum/catalog.md（锚点与本文一致），分片索引见 https://publieople.github.io/design-museum/catalog/index.json。

## 词条

<a id="fluid-type"></a>

### T-01 流体排版 · Fluid Type

- 地址：https://publieople.github.io/design-museum/entry/fluid-type/
- 展厅：type · 标签：css-only, modern-css, layout-triggering, check-support · 形态：stage
- 一句话：字号随容器宽度连续变化，不会在断点上突然跳一档。
- 别名：流式字号、自适应字号、弹性排版、fluid typography、fluid type scale、responsive font-size
- 关键词：clamp(), vw, cqw, calc(), fluid typography, responsive font-size, container query units
- 什么时候用：大标题在小屏和大屏之间跨度很大，用媒体查询会看到字号一级一级地跳 / 想让标题、间距、圆角共用一个比例，跟着屏幕一起放大缩小 / 需要给字号设上下限，避免手机上一行放不下、超宽屏上又大得荒唐
- 别搞混 · 媒体查询断点：断点是「到某个宽度就换一套值」，两个断点之间字号是平的，跨过临界点会突然跳一下；流体排版把中间值写成带 vw 或 cqw 的 calc()，宽度一变字号就跟着连续变。
- 别搞混 · rem 固定字号：rem 只跟根元素字号走，和屏幕宽度无关；rem 仍然要用，但想让文字跟着屏幕流起来，必须把 rem 和 vw 或 cqw 混进同一个 clamp() 里。
- 别搞混 · 平衡折行：平衡折行不改字号，只在当前宽度下重新分配每行放几个词，让各行长度接近；流体排版改的是字号本身，随视口宽度连续缩放。一个管「行怎么分」，一个管「字多大」。
- 坑：纯 vw 字号不跟浏览器的默认字号设置走：用户在浏览器里调大文字，vw 那一段不会跟着变大，而无障碍要求文字能放大到 200%。中间值要掺 rem，写成 clamp(1rem, 1rem + 2vw, 2.5rem)。
- 坑：vw 是视口宽度，不是父容器宽度。把流体标题放进窄卡片时会算出偏大的字号，这种场景要改用容器查询单位 cqw，并给父级加 container-type: inline-size。
- 坑：min 写成比 max 还大时 clamp() 不会报错，会直接取 min，页面上看起来完全没变化。
- 坑：只流 font-size 不管 line-height，大标题会挤在一起或者行与行散开；行高要用无单位倍数，或者跟着一起 clamp。
- 推荐取值：字号公式=clamp(1rem, 0.75rem + 1.2vw, 2.5rem)；正文字号下限=16px（不要低于 14px）；字号标度比=1.125–1.333；行高=标题 1.1–1.2，正文 1.5–1.6（无单位）
- 控件默认值：minSize(最小字号)=16px；maxSize(最大字号)=44px；growth(增长速率)=3cqw；boxWidth(容器宽度)=100%
- 无障碍降级：流体排版是静态排版，和 prefers-reduced-motion 无关。如果有人把它做成随滚动缩放字号，用户开启减少动态效果时应停在基准字号。
- 提给 AI（中文）：做一个流体排版（fluid type）的标题，font-size 写成 clamp(16px, calc(16px + 3cqw), 44px)，随容器宽度连续变化，不要用媒体查询断点。父容器加 container-type: inline-size，让 cqw 跟卡片宽度而不是视口走。行高用无单位倍数，保证字放大后不挤。
- Ask for it (English keywords): fluid type scale, font-size: clamp(16px, calc(16px + 3cqw), 44px), container-type: inline-size, cqw container query units, no media query breakpoints, unitless line-height, responsive typography
- 相关：variable-font, text-balance, char-reveal
- 参考：[MDN · clamp()](https://developer.mozilla.org/docs/Web/CSS/clamp) · [MDN · length（vw / cqw 等单位）](https://developer.mozilla.org/docs/Web/CSS/length)

<a id="text-balance"></a>

### T-02 平衡折行 · Text Balance

- 地址：https://publieople.github.io/design-museum/entry/text-balance/
- 展厅：type · 标签：css-only, modern-css, layout-triggering, check-support · 形态：stage
- 一句话：多行标题的每行长度被拉齐，最后一行不再只剩一个孤字。
- 别名：平衡换行、折行平衡、标题不孤字、text-wrap balance、balanced headline、balanced text wrapping
- 关键词：text-wrap: balance, text-wrap: pretty, orphan, widow, ch, max-width, line breaking
- 什么时候用：一两个短语的标题在窄容器里折行，最后一行只掉下一个字，很难看 / 卡片标题、引言、按钮文案这类短文本，想让每行长短匀称 / 同一块文字要在不同宽度下都保持平衡，又不想手写 br 把位置写死
- 别搞混 · text-wrap: pretty：pretty 主要盯正文最后一行，避免段落末尾只留一个孤字，代价是排版时间略微增加；balance 是把所有行拉成一样长，只适合短文本，Chromium 超过六行就不再做平衡。
- 别搞混 · word-break / overflow-wrap：那两个解决的是「一个长单词放不下时从哪里断」，管的是溢出；text-wrap: balance 不改变断词规则，只是重新分配每行放几个词。
- 别搞混 · 手写 br：br 把换行位置写死，换个容器宽度就错位；balance 由浏览器按当前宽度重新计算，宽度变了它会重排。
- 别搞混 · 流体排版：流体排版让字号随视口连续变化，折行位置只是结果；平衡折行完全不碰字号，只调整换行点。标题在窄屏缩小该用 clamp()，而不是靠 balance。
- 坑：只对短文本有意义：Chromium 最多平衡 6 行，超了就静默退回普通折行，正文段落加它没有效果还多花排版时间。
- 坑：中英文表现不同：中文逐字换行，balance 只能微调每行字数，效果远不如英文标题明显，别指望它把中文排成对称。
- 坑：容器得有确定的宽度上限，文字根本不折行，就没有可平衡的东西。
- 坑：Safari 17.5 之前的版本会直接忽略这条声明，所以基础样式必须是可读的普通折行，不能只靠 balance。
- 推荐取值：属性=text-wrap: balance；适用行数=≤ 6 行（Chromium 上限）；容器宽度=20–40ch；降级=text-wrap: pretty，或者不写
- 控件默认值：width(容器宽度)=16ch；sample(文本)=en-heading；mode(下方启用)=balance
- 无障碍降级：纯排版属性，和动态效果无关，不需要降级。
- 提给 AI（中文）：把这段英文标题的容器宽度限制在 16ch，然后给文本加上 text-wrap: balance。它会把每行长度拉平，消除最后一行只有一个词的孤行，注意只用在六行以内的短文本上。
- Ask for it (English keywords): text-wrap: balance, max-width: 16ch, headline line balancing, avoid orphan/widow, only for short text (Chromium caps balance at 6 lines), graceful fallback, no manual br
- 相关：fluid-type, char-reveal, variable-font
- 参考：[MDN · text-wrap](https://developer.mozilla.org/docs/Web/CSS/text-wrap) · [MDN · CSS 文本模块](https://developer.mozilla.org/docs/Web/CSS/CSS_text)

<a id="gradient-text"></a>

### T-03 渐变文字 · Gradient Text

- 地址：https://publieople.github.io/design-museum/entry/gradient-text/
- 展厅：type · 标签：css-only, gradient, paint-heavy, stable · 形态：stage
- 一句话：把文字当成蒙版，露出来的不是单色而是背后的渐变。
- 别名：渐变字体、文字渐变、彩色文字、gradient text、background-clip text、text gradient
- 关键词：background-clip: text, -webkit-background-clip, color: transparent, -webkit-text-fill-color, linear-gradient, forced-colors, background-size
- 什么时候用：首屏大标题想有一点彩色，又不想引入图片或 SVG / 强调品牌名、数字、少量关键词，不覆盖整段正文 / 深色页面上做霓虹或金属质感的标题
- 别搞混 · 逐字上色：用 span 给每个字单独设色，颜色是一段一段拼出来的；background-clip: text 是一整条渐变连续铺满整个文字盒子，每个字落在渐变的哪一段由盒子的宽度和字的位置决定。
- 别搞混 · text-shadow 外发光：text-shadow 只在字形外面加一层光，字身仍然是单色；渐变文字是把背景裁进字形里面，颜色出现在字的内部。
- 别搞混 · 描边文字：描边文字只画字形的轮廓线（-webkit-text-stroke），字内部通常是透明或单色；渐变文字是把渐变背景裁进字形填充（background-clip: text），颜色在字内部，轮廓本身不加线。
- 别搞混 · 渐变描边：渐变描边只出现在容器边缘，元素内部的背景不受影响；渐变文字要求文字本身透明、把背景裁进字形，渐变贯穿的是笔画内部。
- 坑：一定要同时写 background-clip: text（配 -webkit- 前缀）和 color: transparent，否则会看到文字后面压着一整块背景色。
- 坑：color: transparent 在 Windows 高对比度（forced-colors）模式下会让文字整体消失，要加 @media (forced-colors: active) 退回实色。
- 坑：渐变两端都要和背景有足够对比：浅色那一端压在浅背景上会直接糊掉，正文级别至少保证 4.5:1。
- 坑：背景是铺在元素盒子上的，文字换行以后渐变会跨整个盒子，不是每一行重来一遍。
- 坑：整段正文都上渐变会明显掉可读性，一般只给一到两行标题用。
- 推荐取值：渐变角度=90–135deg；色标数量=2–3 个；对比度=正文至少 4.5:1；降级=@supports 不支持时退回实色
- 控件默认值：angle(渐变角度)=120deg；palette(配色)=sunset；startStop(首色位置)=0%；hue(色相缓慢流动)=false
- 无障碍降级：渐变本身是静态的；如果加了背景流动或者色相旋转这类动效，prefers-reduced-motion 下要停掉动画，只保留静态渐变。
- 提给 AI（中文）：做一个渐变文字（gradient text）标题：background-image 用 linear-gradient(120deg, 首色停在 0%，#c9382a → #b8721c)，再写 background-clip: text 和 color: transparent，Safari 补 -webkit-background-clip: text。记得给 forced-colors 模式退回实色，保证高对比度下文字不会消失。
- Ask for it (English keywords): gradient text, background-image: linear-gradient(120deg, #c9382a → #b8721c), background-clip: text, -webkit-background-clip: text, color: transparent, -webkit-text-fill-color: transparent, forced-colors fallback, contrast at least 4.5:1
- 相关：mesh-gradient, gradient-border, variable-font
- 参考：[MDN · background-clip](https://developer.mozilla.org/docs/Web/CSS/background-clip) · [MDN · linear-gradient()](https://developer.mozilla.org/docs/Web/CSS/gradient/linear-gradient)

<a id="char-reveal"></a>

### T-04 逐字显现 · Character Reveal

- 地址：https://publieople.github.io/design-museum/entry/char-reveal/
- 展厅：type · 标签：js, composited, motion-heavy, stable · 形态：stage
- 一句话：标题里的字一个接一个落到位，像被逐字写出来。
- 别名：逐字动画、字符入场、逐字出现、character reveal、split text animation、per-character animation
- 关键词：split text, per-character animation, animation-delay, translateY, opacity, sr-only, prefers-reduced-motion
- 什么时候用：首屏主标题第一次出现，想让目光按顺序读过去 / 标语、口号、产品名这类二三十字以内的短文本 / 想强调半句话，让前半句先出现，后半句再接上
- 别搞混 · 打字机：打字机是一个字符一个字符「被敲出来」，常配光标和等宽字体，文本长度在一点点变长；逐字显现是所有字已经站在排版位置上，只是依次从透明和偏移回到原位。
- 别搞混 · 交错进场：stagger 作用在一组独立元素上（列表项、卡片），逐字显现是先把一句话拆成单字，再对这串字套用同样的错峰逻辑，而且要额外处理读屏。
- 坑：拆成单字 span 后读屏会一个字一个字念，必须给可视文字加 aria-hidden="true"，再放一份完整文本（sr-only 或 aria-label）给读屏。
- 坑：英文按字母拆会打断单词、连字和字偶距，英文应该按词拆，或者用 Intl.Segmenter 按 grapheme 或 word 切。
- 坑：每个字一个 DOM 节点，长文本会撑出上百个节点，总延迟也会拉到几秒；只给前 20–30 字加动画，其余直接显示。
- 坑：字间隔乘字数就是最后一个字的等待时间：40 字乘 50ms 已经两秒，别让读者干等。
- 坑：prefers-reduced-motion 下要跳过延迟和位移，整句一次显示。
- 推荐取值：单字时长=300–600ms；字间隔=20–50ms；位移=0.4–0.8em；缓动=cubic-bezier(0.22, 1, 0.36, 1)；字数上限=20–30 字
- 控件默认值：duration(单字时长)=480ms；stagger(字间隔)=45ms；distance(位移距离)=14px；easing(缓动)=cubic-bezier(0.22, 1, 0.36, 1)
- 无障碍降级：prefers-reduced-motion: reduce 时去掉逐字延迟和位移，整句以最终状态一次渲染。
- 提给 AI（中文）：做一个逐字显现（character reveal）的标题：把「把一句话拆成字再依次落位」按字拆成 span，每个字从下方 14px、opacity 0 进入原位，单字时长 480ms，缓动 cubic-bezier(0.22, 1, 0.36, 1)，相邻两字间隔 45ms，12 个字总时长约 975ms。只用 transform 和 opacity 实现；给可视文字加 aria-hidden，另放一份完整文本给读屏；系统开启减少动态效果时整句一次显示。
- Ask for it (English keywords): character reveal, split text into per-character spans, each char animates opacity 0 to 1 and translateY(14px) to 0, duration 480ms, per-char delay 45ms, easing cubic-bezier(0.22, 1, 0.36, 1), animate transform/opacity only, aria-hidden on visual text plus sr-only copy, respect prefers-reduced-motion
- 相关：stagger, scroll-reveal, fluid-type
- 参考：[MDN · animation-delay](https://developer.mozilla.org/docs/Web/CSS/animation-delay) · [web.dev · 用 transform 和 opacity 做动画](https://web.dev/articles/animations-guide)

<a id="variable-font"></a>

### T-05 可变字体 · Variable Font

- 地址：https://publieople.github.io/design-museum/entry/variable-font/
- 展厅：type · 标签：css-only, font-feature, stable · 形态：stage
- 一句话：一个字体文件里带着连续的字重轴，可以停在任意粗细。
- 别名：可变字重、轴字体、可变字体动画、variable font、font-variation-settings、weight axis
- 关键词：font-variation-settings, variable font, wght, wdth, opsz, slnt, @font-face, font-weight
- 什么时候用：标题需要在细和粗之间平滑过渡，而不是只有 400 和 700 两档 / 想用同一套字体兼顾正文和超粗标题，少加载几个字体文件 / 随交互或滚动慢慢改变字重，做一个不靠颜色和位移的强调
- 别搞混 · 多字重静态字体：静态字体每一档是一个独立文件，只加载了 400 和 700 时，font-weight: 550 会被四舍五入到其中一档；可变字体在轴范围内任意数值都能真正插值。
- 别搞混 · font-weight 和 font-variation-settings：两个都能调字重。font-weight 是标准属性，会正常继承，也能让不支持可变字体的 fallback 生效；font-variation-settings 是底层开关，用来访问 wdth、slnt 这些没有专门属性的轴，写 wght 时会盖过 font-weight，MDN 建议 wght 优先走 font-weight。
- 坑：字体里没有的轴，调了完全没反应。先用字体工具查清它有哪些轴、范围多少，超出范围的值会被夹到边界。
- 坑：font-variation-settings 的值是字符串，轴名必须带引号：font-variation-settings: "wght" 550, "wdth" 90。少写引号整条声明失效。
- 坑：改轴值会触发文字重新排版，不是 GPU 合成的，长时间无限循环容易掉帧，而且要尊重 prefers-reduced-motion。
- 坑：Web 字体还没下载完时会先落到系统字体，轴不生效还会跳一下；用 font-display: swap，并让 fallback 的字重尽量接近。
- 推荐取值：字重范围=300–800（以字体实际轴范围为准）；常见轴=wght / wdth / opsz / slnt；插值时长=400–900ms；缓动=ease-in-out
- 控件默认值：wght(字重轴 wght)=450；steps(档位数)=1档；family(字体)=display；ruler(显示 300–700 对照尺)=true
- 无障碍降级：可变字体本身是静态能力。如果用它做来回脉动的字重动画，prefers-reduced-motion 下应停在最终字重，不做插值。
- 提给 AI（中文）：用可变字体（variable font）做一个字重可调的文字块，字体是 Space Grotesk，轴范围大约 300–700。font-variation-settings 写成 "wght" 450，字重取连续值，任意数字都要真正插值，不是就近跳到某一档。旁边放一行 300–700 的对照尺。给不支持可变字体的浏览器留一个接近的静态字重兜底。
- Ask for it (English keywords): variable font, font-variation-settings: "wght" 450, continuous weight interpolation, wght axis, @font-face font-weight range, font-display: swap fallback, weight ruler 300-700, respect prefers-reduced-motion
- 相关：fluid-type, gradient-text, char-reveal
- 参考：[MDN · font-variation-settings](https://developer.mozilla.org/docs/Web/CSS/font-variation-settings) · [MDN · 可变字体指南](https://developer.mozilla.org/docs/Web/CSS/CSS_fonts/Variable_fonts_guide)

<a id="count-up"></a>

### T-06 数字滚动 · Count Up

- 地址：https://publieople.github.io/design-museum/entry/count-up/
- 展厅：type · 标签：js, browser-api, font-feature, main-thread, stable · 形态：stage
- 一句话：数字从 0 快速滚到目标值，然后停住。
- 别名：数字递增、数值动画、计数动画、count up、number counter、animated counter
- 关键词：requestAnimationFrame, tabular-nums, font-variant-numeric, easeOutExpo, count up animation, IntersectionObserver
- 什么时候用：数据面板的关键指标第一次出现，想让数字有涨上去的感觉 / 首屏用一两个大数字当主角，给一个短促的入场 / 想让数字滚动在进入视口后再开始，而不是页面一打开就已经跳完
- 别搞混 · 机械翻牌 odometer：odometer 是每一位数字上下滚动或翻页，位与位之间有物理位移；数字滚动只是数值在变，字形本身不动。
- 别搞混 · CSS @property 数值动画：@property 可以注册一个整数自定义属性再交给 counter() 渲染，纯 CSS 就能跑，但插值交给浏览器，格式和缓动不好控；要精确控制格式、缓动和重播，用 requestAnimationFrame 手写更稳。
- 别搞混 · 等宽数字：等宽数字只是把每个数字字形固定成同一宽度（font-variant-numeric: tabular-nums），数值本身不变；数字滚动是数值在时间上从旧值增长到新值，通常还要配合等宽数字防止宽度抖动。
- 坑：位数变化会撑动布局（9 变 10、99 变 100），给容器预留宽度，并用 font-variant-numeric: tabular-nums 让每位数字等宽。
- 坑：requestAnimationFrame 循环要在组件卸载时 cancel，否则组件没了还在 setState。
- 坑：rAF 回调拿到的是高精度时间戳，用它减去开始时间；不要和 Date.now() 混算，也不要拿 setInterval 每帧加固定值，掉帧时会越走越慢。
- 坑：服务端渲染和首次客户端渲染必须渲染同一个值（通常是 0），否则 hydration 对不上；挂载之后再开始跑。
- 坑：prefers-reduced-motion 下直接显示最终值，别让数字再滚一遍。
- 推荐取值：时长=800–1500ms；缓动=easeOutExpo / easeOutCubic；数字排版=font-variant-numeric: tabular-nums；触发=IntersectionObserver，threshold 0.3；终值停留=滚完至少 300ms 不再变化
- 控件默认值：target(目标值)=12800人；duration(时长)=1200ms；easing(缓动)=easeOutExpo；grouping(千分位)=true
- 无障碍降级：prefers-reduced-motion: reduce 时不跑帧循环，直接把目标值一次性渲染出来。
- 提给 AI（中文）：做一个数字滚动（count up）：数字在 1200ms 内用 easeOutExpo 缓动从 0 滚到 12800，每三位加千分位，用 requestAnimationFrame 按时间戳算进度，不要用 setInterval。容器用 font-variant-numeric: tabular-nums 并预留宽度，避免位数变化时抖动；系统开启减少动态效果时直接显示 12800。
- Ask for it (English keywords): count up animation, animate number from 0 to 12800 in 1200ms with easeOutExpo easing, requestAnimationFrame with timestamp-based progress, font-variant-numeric: tabular-nums, thousands separator, reserve width to avoid layout shift, respect prefers-reduced-motion (render final value)
- 相关：stagger, scroll-reveal, skeleton-shimmer
- 参考：[MDN · requestAnimationFrame](https://developer.mozilla.org/docs/Web/API/Window/requestAnimationFrame) · [MDN · font-variant-numeric](https://developer.mozilla.org/docs/Web/CSS/font-variant-numeric)

<a id="text-stroke"></a>

### T-07 描边文字 · Text Stroke

- 地址：https://publieople.github.io/design-museum/entry/text-stroke/
- 展厅：type · 标签：css-only, modern-css, stable · 形态：stage
- 一句话：文字只留一圈轮廓、里面是空的，大标题一下就硬起来了。
- 别名：空心字、描边字、轮廓文字、text stroke、outlined text、hollow text、text outline
- 关键词：-webkit-text-stroke, text-stroke, paint-order, outlined text, hollow text, color: transparent, @supports, stroke-width
- 什么时候用：首屏大标题、封面字，想要比实心字更轻的体量 / 深色或图片背景上，需要文字有明确的轮廓边界 / 做「描边 + 实心」两层排版，一虚一实叠出层次
- 别搞混 · 文字阴影：text-shadow 画在字形外面，字本身的分量不变；text-stroke 是沿字形轮廓描一圈，笔画会被描边吃掉一半，字看起来更细。
- 别搞混 · 渐变文字：渐变文字填充的是字形内部；描边字内部是空的。想要「渐变填充 + 描边」就把两者叠加。
- 坑：-webkit-text-stroke 是非标准属性（三大引擎都支持），它从轮廓中线向两侧画：小字号加粗描边会把细笔画糊掉，所以只给大字号用
- 坑：描边宽度用 px 固定，别用 em 跟着字号放大，否则大标题上的笔画全被吃掉
- 坑：只描边不填充时必须保证对比度：空心字放在浅色底上几乎看不见
- 坑：加 paint-order: stroke fill 能让描边先画、填充后画，避免描边压住字面
- 坑：描边色和填充色相同时，效果等于把字加粗，容易显得脏
- 坑：不要为了描边去用 SVG path 假字：读屏和文本选择都会坏掉
- 推荐取值：描边宽度=1–3px（大字号）；建议字号=≥ 32px；绘制顺序=paint-order: stroke fill；空心写法=color: transparent + -webkit-text-stroke；对比度=正文级别的文字 ≥ 4.5:1
- 控件默认值：width(描边宽度)=2px；size(字号)=56px；fill(实心填充)=false
- 无障碍降级：描边文字是静态的，不需要降级；如果给它加了进出场描边动画，prefers-reduced-motion 下直接显示最终态。
- 提给 AI（中文）：做一个描边标题：字号 56px，用 -webkit-text-stroke: 2px 描边，填充设为 transparent，做成空心字，并加 paint-order: stroke fill 让描边先画。描边宽度用 px 固定别用 em；只描边不填充时保证对比度，小字号不要用这个效果。
- Ask for it (English keywords): outlined heading, font-size 56px, -webkit-text-stroke: 2px, color: transparent for a hollow face, paint-order: stroke fill, px stroke width instead of em, contrast kept when hollow, avoided at small sizes
- 相关：gradient-text, fluid-type
- 参考：[MDN · -webkit-text-stroke](https://developer.mozilla.org/docs/Web/CSS/-webkit-text-stroke) · [MDN · paint-order](https://developer.mozilla.org/docs/Web/CSS/paint-order)

<a id="tabular-numbers"></a>

### T-08 等宽数字 · Tabular Numbers

- 地址：https://publieople.github.io/design-museum/entry/tabular-numbers/
- 展厅：type · 标签：css-only, font-feature, stable · 形态：stage
- 一句话：让每个数字占一样宽，数值变化时整行不会左右抖。
- 别名：等宽数字、数字不跳、表格数字、tabular figures、tabular-nums、monospaced digits、lining figures
- 关键词：font-variant-numeric, tabular-nums, font-feature-settings tnum, lining-nums, tabular figures, text-align: right, min-width, OpenType feature
- 什么时候用：倒计时、计时器、播放进度这类数字一直在变的组件 / 实时统计、价格、余额，数字跳动时会牵动整行宽度 / 表格里要让小数点或个位对齐成一条竖线
- 别搞混 · 数字滚动：数字滚动管的是数值怎么从 A 变到 B；等宽数字管的是每个数字占多宽。两者经常一起用——滚动时行宽不变，看起来才稳。
- 别搞混 · 默认比例数字：默认是比例数字（proportional）：1 比 8 窄，正文里更好看；一旦数字要纵向对齐或持续变化，就该切成等宽。
- 坑：tabular-nums 需要字体支持这个 OpenType 特性，艺术字体可能没有，会悄悄退化成默认比例数字
- 坑：只加等宽还不够：位数变化（9 → 10）时整块仍会变宽，要给 min-width 或预留宽度并右对齐
- 坑：表格里要配合 text-align: right 且小数位数统一，否则照样对不齐
- 坑：font-feature-settings: "tnum" 是等价的旧写法，优先用 font-variant-numeric，可读性更好
- 坑：不要为了数字把整站换成等宽字体：只给需要的片段加这个特性
- 推荐取值：现代写法=font-variant-numeric: tabular-nums；旧写法=font-feature-settings: "tnum"；对齐=配合 text-align: right；位宽变化=给 min-width 或等宽容器，别让行宽跟着跳；使用范围=只给需要对齐的数字片段，正文保持默认比例数字
- 控件默认值：tabular(启用等宽数字)=true；compare(对照：默认比例数字)=true；interval(数字变化间隔)=700ms
- 无障碍降级：等宽数字是静态特性，不需要降级；只有配合数字滚动时，prefers-reduced-motion 下直接显示终值。
- 提给 AI（中文）：给这个会变数字的组件加 font-variant-numeric: tabular-nums（等宽数字，旧写法 font-feature-settings: "tnum"），每 700ms 更新一次数值时整行宽度不要变。位数会变化的话（9 → 10）再给 min-width 或固定宽度容器并右对齐，表格里的数字统一 text-align: right。
- Ask for it (English keywords): counter with font-variant-numeric: tabular-nums (legacy font-feature-settings: "tnum"), updated every 700ms without the row width shifting, right-aligned inside a min-width column so 9 to 10 does not resize the block, numbers in tables aligned with text-align: right
- 相关：count-up, variable-font
- 参考：[MDN · font-variant-numeric](https://developer.mozilla.org/docs/Web/CSS/font-variant-numeric) · [MDN · font-feature-settings](https://developer.mozilla.org/docs/Web/CSS/font-feature-settings)
