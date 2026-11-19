# 前端设计博物馆 · 布局与结构 / Layout & Structure（L 厅）

> 内容怎么排布、滚动时怎么变化

> 本厅 8 条词条。全量目录见 https://publieople.github.io/design-museum/catalog.md（锚点与本文一致），分片索引见 https://publieople.github.io/design-museum/catalog/index.json。

## 词条

<a id="sticky-header"></a>

### L-01 粘性头部 · Sticky Header

- 地址：https://publieople.github.io/design-museum/entry/sticky-header/
- 展厅：layout · 标签：js, scroll-linked, composited, stable · 形态：scroll
- 一句话：页面滚动时头部留在顶部，常配合「下滑隐藏、上滑出现」。
- 别名：吸顶导航、固定顶栏、滚动吸顶、sticky nav、fixed header、hide on scroll
- 关键词：position: sticky, scroll direction, hide on scroll down, sticky nav, will-change: transform
- 什么时候用：长页面里希望导航和主要操作始终可用 / 需要随时让用户看到购物车、搜索或当前章节 / 内容很长又不想一直占着一条顶栏时，用下滑隐藏换回阅读空间
- 别搞混 · 固定定位 fixed：position: fixed 的元素脱离文档流，需要手动给下方内容补 padding；position: sticky 仍占位，滚到阈值才吸附，父容器一结束就跟着离开。
- 别搞混 · 悬浮按钮：悬浮按钮一直在同一个位置，和滚动无关；粘性头部是「先跟着文档走，到阈值才停住」。
- 坑：父级任意一层有 overflow: hidden/auto，sticky 就会失效或只在那个容器里吸附
- 坑：sticky 元素必须有 top（或 bottom）值，否则不会吸附
- 坑：下滑隐藏要设阈值，刚滚一两个像素就藏起来会显得页面在抖
- 坑：隐藏用的是 transform: translateY(-100%)，不要用 display: none，否则没有动画
- 推荐取值：吸附阈值=60–120px 滚动距离；出现/隐藏时长=200–300ms；吸顶后底色=半透明 + backdrop blur；滚动判定=比较当前与上一次 scrollY
- 控件默认值：threshold(吸顶阈值)=60px；hide(下滑时隐藏)=true；blur(吸顶后背景模糊)=8px
- 无障碍降级：隐藏/出现的位移动画在 prefers-reduced-motion 下改为瞬间切换，或干脆常驻显示不做隐藏。
- 提给 AI（中文）：做粘性头部（sticky header）：用 position: sticky; top: 0 吸顶，滚动超过 60px 后给头部加半透明底色和 backdrop-filter: blur(8px) 与一条下边框。向下滚动时用 transform: translateY(-100%) 收起头部，向上滚动立刻显示，判定用当前 scrollY 与上一次 scrollY 比较，动画 250ms ease-out。
- Ask for it (English keywords): sticky header, position: sticky; top: 0, add backdrop-filter: blur(8px) and border-bottom after 60px scroll, hide on scroll down / reveal on scroll up via transform: translateY(-100%) with 250ms ease-out, compare current vs previous scrollY, animate transform only, throttle scroll handler with requestAnimationFrame
- 相关：sticky-stack, frosted-glass, scroll-snap
- 参考：[MDN · position: sticky](https://developer.mozilla.org/docs/Web/CSS/position) · [MDN · scroll 事件](https://developer.mozilla.org/docs/Web/API/Document/scroll_event)

<a id="sticky-stack"></a>

### L-02 粘性堆叠卡片 · Sticky Stacking Cards

- 地址：https://publieople.github.io/design-museum/entry/sticky-stack/
- 展厅：layout · 标签：css-only, scroll-linked, composited, motion-heavy, stable · 形态：scroll
- 一句话：滚动时后面的卡片一张张压上来，前一张缩小留在底下。
- 别名：卡片堆叠、叠卡片、滚动叠卡、sticky stacking cards、stacking cards、card stack on scroll
- 关键词：position: sticky, stacking cards, z-index, transform: scale(), sticky offset, scroll container
- 什么时候用：教程、步骤、结账流程：一张卡讲一件事，滚完一张再翻下一张 / 长页面里想做出「一摞卡片」的实感，而不是一条平铺的列表 / 卡片需要依次进入视野，同时把上一张留在原位当上下文
- 别搞混 · 粘性头部：粘性头部只有一条栏吸附在顶部；粘性堆叠是一叠卡片共用同一个吸附位置，后滚上来的那张盖住先来的那张。
- 别搞混 · 轮播 carousel：轮播会自己定时切页、靠左右方向推进；粘性堆叠完全由页面上下滚动驱动，不动手就不换。
- 别搞混 · 视差 parallax：视差是各层以不同速度移动，元素之间并不会停住；堆叠卡片会真的吸附在固定位置并互相覆盖。
- 坑：每张卡片都要有各自的 top（第 i 张用 i × 露头高度），全给 0 就变成严丝合缝的一摞，看不出层数
- 坑：后面的卡片 z-index 必须比前面的高，否则新卡片会被旧卡片盖住
- 坑：滚动容器自己可以有 overflow: auto，但它的任意一层祖先带了 overflow: hidden，sticky 就失效
- 坑：用 transform: scale() 压小已堆叠的卡片时，缩放原点设 top center，否则底部会露出下一张的边
- 坑：卡片总高度要明显超过滚动容器，内容不够长就没有可滚的余量，堆叠也演不出来
- 推荐取值：每张露头高度=12–24px；已堆叠卡片缩到=92%–97%；卡片圆角=12–16px；卡片间距=8–12px；z-index=按索引递增 1、2、3…
- 控件默认值：offset(露头高度)=18px；count(卡片数量)=6张；shrink(后层缩到)=5%；radius(圆角)=14px
- 无障碍降级：堆叠由滚动位置驱动，不是时间动画，可以保留；压在后面的缩放属于装饰，prefers-reduced-motion: reduce 时去掉缩放，只留吸附堆叠。
- 提给 AI（中文）：做一组滚动堆叠卡片（sticky stacking cards）：共 6 张，每张用 position: sticky，top 依次是「索引 × 18px」，后面的卡片 z-index 更高、滚上来时盖住前一张；被压住的卡片用 transform: scale() 缩到 95%，transform-origin 设 top center，圆角 14px。整组放在一个 overflow-y: auto 的容器里，容器外面的祖先不要加 overflow: hidden。系统开启「减少动态效果」时取消缩放。
- Ask for it (English keywords): sticky stacking cards, position: sticky with top: index * 18px, 6 cards, increasing z-index 1 2 3, previous card scales down to 95% via transform: scale() with transform-origin: top center, border-radius: 14px, inside an overflow-y: auto scroll container, no overflow: hidden on ancestors, disable the scale under prefers-reduced-motion
- 相关：sticky-header, scroll-driven, parallax
- 参考：[MDN · position（sticky 定位）](https://developer.mozilla.org/docs/Web/CSS/position) · [MDN · CSS 滚动驱动动画](https://developer.mozilla.org/docs/Web/CSS/CSS_scroll-driven_animations)

<a id="masonry"></a>

### L-03 瀑布流 · Masonry

- 地址：https://publieople.github.io/design-museum/entry/masonry/
- 展厅：layout · 标签：css-only, stable · 形态：stage
- 一句话：卡片高度不齐，自动落进最短的那一列，底部不留大洞。
- 别名：瀑布流布局、瀑布流排版、长短卡片错落、masonry layout、pinterest layout、waterfall layout
- 关键词：CSS multi-column, column-count, break-inside: avoid, masonry layout, shortest column, grid-auto-rows
- 什么时候用：图片墙、作品集、商品流，每个条目高度参差不齐 / 想在一屏里多塞几条内容，又不想把每张图都裁成同一高度 / 信息流按列填充比按行排列更省竖向空间
- 别搞混 · 普通网格 grid：grid 的行是所有列共享的，同一行的卡片从同一条水平线开始，矮卡片下方留空；瀑布流每列各自堆叠，下一张紧接上一张下面，列与列之间不共享行线。
- 别搞混 · 等高等宽卡片墙：那种是规则网格，看上去整整齐齐；瀑布流的看点恰恰是高度参差、按列填充。
- 坑：CSS 多列（column-count）是列优先填充：内容先填满第一列再进第二列，做无限滚动时新内容会全挤在最后一列，需要改成用 JS 每次插入当前最短的那一列
- 坑：多列布局里每个条目要写 break-inside: avoid，否则卡片会被从中间劈开、跨到下一列去
- 坑：不要为了对齐给卡片固定高度，那样就退化成普通网格了
- 坑：列数只在断点处切换，不要跟着容器宽度实时变，否则拖动窗口时卡片会来回跳
- 推荐取值：列数=2 列（窄屏）/ 3 列（≥1024px）；列间距=12–24px；条目下间距=与列间距保持一致；防止跨列=break-inside: avoid
- 控件默认值：columns(列数)=3列；gap(间距)=10px；base(卡片基准高度)=64px；mode(布局方式)=masonry
- 无障碍降级：瀑布流是静态排版，不产生动效；若条目带入场动画，prefers-reduced-motion: reduce 时直接以最终排布出现。
- 提给 AI（中文）：做一个瀑布流（masonry）列表：3 列，列间距 10px，条目高度围绕 64px 参差排布，每个条目加 break-inside: avoid，别让卡片被从中间劈开跨列；顺序按列从上往下填，窄屏自动降到 2 列。不要用固定高度把每格拉齐，那就不是瀑布流了。
- Ask for it (English keywords): masonry layout, CSS multi-column with column-count: 3, column-gap: 10px, items of varying height around 64px with break-inside: avoid, fill columns top-to-bottom, collapse to 2 columns on narrow screens, do not equalize item heights
- 相关：bento-grid, scroll-reveal, skeleton-shimmer
- 参考：[MDN · CSS 多列布局](https://developer.mozilla.org/docs/Web/CSS/CSS_multicol_layout) · [MDN · break-inside](https://developer.mozilla.org/docs/Web/CSS/break-inside)

<a id="bento-grid"></a>

### L-04 Bento 网格 · Bento Grid

- 地址：https://publieople.github.io/design-museum/entry/bento-grid/
- 展厅：layout · 标签：css-only, stable · 形态：stage
- 一句话：大小不一的方块拼成一整块，边线对齐，主次一眼分得清。
- 别名：便当盒布局、便当网格、大小格拼贴、bento layout、bento box grid、feature grid
- 关键词：CSS grid, grid-column: span, grid-row: span, grid-auto-rows, grid-template-areas, dashboard layout
- 什么时候用：首页或仪表盘，几块功能有大小之分，想用版式直接排出主次 / 一屏里同时要塞下一张主图、几个指标和若干快捷入口 / 产品介绍页用一块拼贴代替一长串等大的卡片列表
- 别搞混 · 瀑布流：瀑布流每列各自独立、卡片高度随便，列与列不共享行线；bento 网格有统一的行高和列线，每块只是跨几格，所有边缘必须对齐。
- 别搞混 · 等分网格：等分网格每块一样大，没有主次；bento 靠 2×2、2×1 这类跨格把视觉重量拉开。
- 坑：跨格数量要和列数匹配：4 列的网格里放 span 3 会留出一条尴尬的空边，改列数时跨格要跟着重算
- 坑：所有格子一样大就退化成普通网格，bento 的看点就是有大有小
- 坑：自动排布默认不回头填空洞（grid-auto-flow: row），想要紧凑可以设 dense，但那会打乱视觉顺序
- 坑：行高写死后，格子里文字一多就溢出，宁可加行高也别裁字
- 推荐取值：列数=4 列（桌面）/ 2 列（移动）；行高=48–72px；格子间距=8–16px；跨格=1×1 / 2×1 / 2×2 三种就够；圆角=14–20px
- 控件默认值：columns(列数)=4列；gap(格子间距)=8px；rowHeight(行高)=46px；radius(圆角)=14px
- 无障碍降级：bento 是静态版式，本身不播动画；给格子加入场或 hover 效果时，prefers-reduced-motion: reduce 下只保留透明度变化。
- 提给 AI（中文）：做一个 Bento 网格首页：CSS grid，4 列，grid-auto-rows: 46px，gap: 8px，格子圆角 14px。用 grid-column: span 与 grid-row: span 混排 1×1、2×1、2×2 三种尺寸，让主图占 2×2、指标和快捷入口占小格，所有边缘对齐同一条列线。窄屏降到 2 列，跨格跟着重算，别留空边。
- Ask for it (English keywords): bento grid layout, CSS grid, grid-template-columns: repeat(4, minmax(0, 1fr)), grid-auto-rows: 46px, gap: 8px, tiles with grid-column: span / grid-row: span mixing 1x1 2x1 2x2 sizes, border-radius: 14px, all edges aligned to the same column lines, collapse to 2 columns on mobile
- 相关：masonry, gradient-border, spotlight-glow
- 参考：[MDN · CSS grid 布局](https://developer.mozilla.org/docs/Web/CSS/CSS_grid_layout) · [MDN · grid-template-areas](https://developer.mozilla.org/docs/Web/CSS/grid-template-areas)

<a id="scroll-snap"></a>

### L-05 滚动捕捉 · Scroll Snap

- 地址：https://publieople.github.io/design-museum/entry/scroll-snap/
- 展厅：layout · 标签：css-only, scroll-linked, stable · 形态：scroll
- 一句话：滚动停下来时自动对齐到某一张卡片，不会卡在半路上。
- 别名：滚动吸附、滑动吸附、对齐滚动、scroll snapping、snap scrolling、scroll-snap-type
- 关键词：scroll-snap-type, scroll-snap-align, scroll-snap-stop, scroll-padding, overscroll-behavior, mandatory vs proximity
- 什么时候用：横向轮播、图片画廊，每次滑一张 / 全屏分页的落地页，一屏一段内容 / 移动端的步骤条、日期选择器、卡片选择器，要「滑到哪个就是哪个」
- 别搞混 · 轮播 carousel：轮播用 JS 定时切页，用户只能点箭头；scroll-snap 用的是原生滚动容器，惯性、拖动、触控板、键盘全都交给浏览器，代码只规定「停在哪」。
- 别搞混 · scroll-behavior: smooth：smooth 管的是「跳转过程怎么滑过去」；snap 管的是「滑完最终停在哪里」，两者互不替代。
- 坑：scroll-snap-type 要写在滚动容器上，scroll-snap-align 写在子项上，写反了完全没反应
- 坑：容器必须有确定的尺寸和 overflow，内容比容器还短就没有可滚动的余量，自然也谈不上吸附
- 坑：mandatory 用在内容高于视口的纵向区域会「锁屏」，用户滚不到底部，长内容要用 proximity
- 坑：子项比容器还大时，align: start 会让尾部内容永远露不出来
- 坑：吸附位置的内边距靠容器的 scroll-padding，给子项加 margin 不算数
- 推荐取值：容器=scroll-snap-type: x mandatory；子项=scroll-snap-align: start；内边距=scroll-padding-inline: 12–24px；防止连跳=scroll-snap-stop: always；子项宽度=容器宽度的 75%–100%
- 控件默认值：snap(吸附强度)=x mandatory；padding(吸附内边距)=12px；align(对齐位置)=start；stop(防止一次跳多张)=true
- 无障碍降级：吸附本身不是动画，不用关；但用 scroll-behavior: smooth 滚到某一张时，prefers-reduced-motion: reduce 下应改回 auto，直接跳过去。
- 提给 AI（中文）：做一个横向滚动的卡片选择器：滚动容器用 scroll-snap-type: x mandatory，子项用 scroll-snap-align: start，容器加 scroll-padding: 12px，子项加 scroll-snap-stop: always，防止一次滑动跳过好几张。容器自身要有固定高度和 overflow-x: auto，让原生惯性和键盘滚动都可用。系统开启「减少动态效果」时 scroll-behavior 用 auto。
- Ask for it (English keywords): horizontal snap slider, scroll container with scroll-snap-type: x mandatory, items with scroll-snap-align: start, scroll-padding: 12px, scroll-snap-stop: always to prevent skipping multiple slides, overflow-x: auto container with fixed height, native momentum scrolling and keyboard support, scroll-behavior: auto under prefers-reduced-motion
- 相关：scroll-driven, sticky-header, masonry
- 参考：[MDN · CSS scroll snap](https://developer.mozilla.org/docs/Web/CSS/CSS_scroll_snap) · [MDN · scroll-snap-type](https://developer.mozilla.org/docs/Web/CSS/scroll-snap-type)

<a id="accordion"></a>

### L-06 折叠面板 · Accordion

- 地址：https://publieople.github.io/design-museum/entry/accordion/
- 展厅：layout · 标签：css-only, stateful, layout-triggering, keyboard-operable, stable · 形态：stage
- 一句话：点标题展开内容，同一组里通常只开一个，标题一直在。
- 别名：手风琴、展开收起、折叠展开、collapsible panel、collapse、disclosure
- 关键词：accordion, collapsible, aria-expanded, details/summary, grid-template-rows: 0fr, disclosure pattern
- 什么时候用：FAQ、帮助文档，一屏要放十几条问题 / 表单里的高级设置，默认收起，需要的人再展开 / 移动端详情页，把长说明折起来省空间
- 别搞混 · 选项卡 tabs：tabs 是对内容做横向切换，切走的那块完全消失；手风琴所有标题始终纵向排在一起，展开的内容还在标题下面，只是把下面的内容推下去。
- 别搞混 · 弹层 popover：弹层浮在页面上方、会遮住别的内容；手风琴在文档流里撑开，不做遮挡。
- 坑：不要对 height: auto 做过渡，浏览器不会对 auto 补间动画；改用 grid-template-rows: 0fr → 1fr，或先量出内容高度再写像素值
- 坑：折叠部分要包一层 overflow: hidden，否则收起来时文字还露在外面
- 坑：标题要用真正的 button（或 details/summary），并带上 aria-expanded，键盘和读屏才用得了
- 坑：一旦允许多项同时展开，面板就成了长列表，这种场景该换 tabs 或分页
- 推荐取值：展开时长=200–300ms；缓动=ease-out / cubic-bezier(0.22, 1, 0.36, 1)；标题高度=40–48px；展开动画=grid-template-rows: 0fr → 1fr（配内层 overflow: hidden）；图标=同一枚箭头旋转 180°
- 控件默认值：mode(展开模式)=single；duration(展开时长)=260ms；easing(缓动)=cubic-bezier(0.22, 1, 0.36, 1)；rotate(箭头旋转 180°)=true
- 无障碍降级：prefers-reduced-motion: reduce 时把展开时长设为 0，内容直接显隐，箭头也不旋转。
- 提给 AI（中文）：做一个折叠面板（accordion）：同一组里同时只展开一项（单开手风琴），展开和收起时长 260ms，缓动 cubic-bezier(0.22, 1, 0.36, 1)；标题用真正的 <button> 并带 aria-expanded，箭头图标展开时旋转 180°。动画不要碰 height: auto（浏览器不会过渡），用 grid-template-rows: 0fr → 1fr 配一层 overflow: hidden。系统开启「减少动态效果」时时长设成 0。
- Ask for it (English keywords): accordion disclosure pattern, single-open, only one panel expanded at a time, expand and collapse duration 260ms with easing cubic-bezier(0.22, 1, 0.36, 1), header is a real button with aria-expanded and a chevron that rotates 180deg when open, animate grid-template-rows: 0fr → 1fr inside overflow: hidden instead of height: auto, set duration to 0 under prefers-reduced-motion
- 相关：scroll-reveal, stagger, easing
- 参考：[MDN · details 元素](https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/details) · [MDN · aria-expanded](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Attributes/aria-expanded)

<a id="virtual-scrolling"></a>

### L-07 虚拟滚动 · Virtual Scrolling

- 地址：https://publieople.github.io/design-museum/entry/virtual-scrolling/
- 展厅：layout · 标签：js, browser-api, composited, layout-triggering, main-thread, stable · 形态：scroll
- 一句话：列表只渲染看得见的那几行，一万条也能滚得顺。
- 别名：虚拟列表、长列表优化、窗口化渲染、virtual list、windowing、virtualized list
- 关键词：virtual scrolling, windowing, virtual list, overscan, item height, scrollTop, transform: translateY, aria-setsize
- 什么时候用：几百到几万行的列表、日志、表格，全渲染会让页面卡死 / 聊天记录、时间线这类只往两头长的数据 / 可视区高度固定的面板里展示很长的候选列表
- 别搞混 · 无限滚动：无限滚动管「什么时候再取一批数据」，虚拟滚动管「一屏只渲染几行」；一个解决数据量，一个解决 DOM 量，经常一起用。
- 别搞混 · 分页：分页把数据切成页、用户翻页；虚拟滚动数据一次拿全，只是把可视区外的行不渲染，滚动条仍然是连续的一整条。
- 坑：行高固定才好算区间；高度不定就得逐行测量并缓存，成本随之上升
- 坑：滚动容器要有撑满总高度的占位（spacer 或 padding），否则滚动条与位置全不对
- 坑：scroll 事件里直接 setState 会掉帧，用 requestAnimationFrame 节流，或者只在可视区间变化时才更新
- 坑：可视区外多渲染几行做缓冲（overscan），否则快速滚动会看到空白
- 坑：复用 DOM 时要清掉上一行的动画与展开状态，别让第 500 行的状态串到第 12 行
- 坑：读屏软件看不到没渲染的行：用 aria-setsize / aria-posinset 报出总数与位置，或提供「跳到第 N 条」
- 推荐取值：行高=固定 40–64px 最省事；缓冲行数=前后各 3–6 行；滚动处理=requestAnimationFrame 节流，或只监听可视区间变化；占位高度=总行数 × 行高；无障碍=aria-setsize / aria-posinset 报出总数与序号
- 控件默认值：itemHeight(行高)=44px；total(总条数)=10000；overscan(缓冲行数)=4
- 无障碍降级：虚拟滚动本身不播动画；只有「滚到第 N 条」这类平滑滚动在 prefers-reduced-motion 下要改成瞬间定位。
- 提给 AI（中文）：做一个虚拟滚动列表（virtual scrolling）：总条数 10000，每行固定 44px，容器内放一个 10000 × 44px 的占位撑出滚动条，只渲染可视区行数加上前后各 4 行，用 transform: translateY 把渲染块定位到对应位置。scroll 里用 requestAnimationFrame 节流，只在可视区间变化时才更新；行用 aria-setsize / aria-posinset 报出总数与序号。
- Ask for it (English keywords): virtual scrolling list, 10000 rows of 44px fixed height, spacer of total x itemHeight to keep the scrollbar honest, render only the visible window plus 4 overscan rows, position the window with transform: translateY, throttle scroll with requestAnimationFrame and only re-render when the window changes, aria-setsize / aria-posinset on rows
- 相关：marquee, masonry
- 参考：[MDN · Element.scrollTop](https://developer.mozilla.org/docs/Web/API/Element/scrollTop) · [web.dev · Virtualize long lists](https://web.dev/articles/virtualize-long-lists-react-window)

<a id="marquee"></a>

### L-08 跑马灯 · Marquee

- 地址：https://publieople.github.io/design-museum/entry/marquee/
- 展厅：layout · 标签：js, gradient, composited, motion-heavy, stable · 形态：stage
- 一句话：一排内容不停地横向滑过，首尾相接，看不出接缝。
- 别名：无缝滚动、横向滚动条、循环滚动、marquee、infinite marquee、ticker、scrolling text
- 关键词：marquee, infinite marquee, ticker, @keyframes translateX, transform: translate3d, animation-play-state, mask-image, aria-hidden duplicate
- 什么时候用：客户 logo 墙、合作方列表这类「多到放不下但每条都很短」的内容 / 公告、注意事项这类要一直提醒但不值得占一整屏的信息 / 标签流、作品缩略图做背景装饰，让画面一直在动
- 别搞混 · 自动轮播：轮播是分页的：一屏一屏地翻，还有指示点；跑马灯是匀速连续滚动，没有「第几屏」的概念。
- 别搞混 · 滚动捕捉：滚动捕捉是用户自己滑、停下时吸附到某一项；跑马灯是自己走、用户只读，停下来只是因为悬停。
- 坑：无缝要复制一份内容并整体平移 50%（或正好一整份的宽度），否则会看到「唰」地跳回起点
- 坑：用 transform: translate3d 做位移，别用 margin-left / left，后者每帧都要重排
- 坑：悬停或聚焦时暂停是惯例，最好再给一个暂停按钮，否则读屏和慢读的用户永远读不完
- 坑：复制出来的那一份要 aria-hidden，不然读屏软件会把内容念两遍
- 坑：离屏时动画还在烧电：用 IntersectionObserver 或 animation-play-state 停掉
- 坑：内容比容器短时不要循环，会出现空档；长度不够就复制到足够长
- 推荐取值：速度=20–60px/s（约等于阅读速度的一半）；无缝=复制一份内容，整体平移 50%；暂停=悬停暂停 + 明确的暂停按钮；两端=加渐隐遮罩（mask-image）避免硬切；降级=prefers-reduced-motion 下不自动滚动
- 控件默认值：speed(滚动速度)=40px/s；pauseOnHover(悬停暂停)=true；edgeMask(两端渐隐)=true
- 无障碍降级：prefers-reduced-motion 下不要自动滚动：把内容静态换行展示，或改成用户可以自己横向滑动的区域。
- 提给 AI（中文）：做一个无缝跑马灯（marquee）：内容复制一份首尾相接，用 transform: translate3d 横向匀速平移 50% 循环，速度约 40px/s、linear 匀速；指针悬停或键盘聚焦时暂停，两端加渐隐遮罩（mask-image）避免硬切，复制的那一份设 aria-hidden 免得读屏念两遍；内容比容器短时要先复制到足够长。prefers-reduced-motion 下停住，改成静态换行展示。
- Ask for it (English keywords): seamless horizontal marquee, content duplicated and translated 50% in a linear infinite loop with transform: translate3d, about 40px/s, pauses on hover and keyboard focus, faded edges via mask-image, duplicate marked aria-hidden, duplicated until the track is longer than the container, animation stops under prefers-reduced-motion
- 相关：scroll-snap, parallax
- 参考：[MDN · animation-play-state](https://developer.mozilla.org/docs/Web/CSS/animation-play-state) · [MDN · mask-image](https://developer.mozilla.org/docs/Web/CSS/mask-image)
