# 前端设计博物馆 · 交互反馈 / Interaction & Feedback（F 厅）

> 用户动手之后，界面怎么回应

> 本厅 9 条词条。全量目录见 https://publieople.github.io/design-museum/catalog.md（锚点与本文一致），分片索引见 https://publieople.github.io/design-museum/catalog/index.json。

## 词条

<a id="hover-lift"></a>

### F-01 悬停抬升 · Hover Lift

- 地址：https://publieople.github.io/design-museum/entry/hover-lift/
- 展厅：feedback · 标签：css-only, composited, pointer-dependent, stable · 形态：stage
- 一句话：指针移到卡片上，它轻轻上浮、阴影变大，暗示这块可以点。
- 别名：悬停浮起、鼠标移上去抬起来、卡片上浮、hover 抬高、hover lift、card hover elevation
- 关键词：transform: translateY, box-shadow, transition, :hover, elevation, will-change: transform
- 什么时候用：可点击的卡片、商品卡、文章列表项，需要让指针的位置得到回应 / 一排并列的卡片里，想突出当前指到的那一张 / 按钮或图标已经够清楚，只差一点「它活着」的暗示
- 别搞混 · 按压反馈：悬停抬升是指针停留在上面期间持续存在的状态，用 :hover；按压反馈是按下和松开那一瞬的反馈，用 :active。两者经常叠着用，但触发时机完全不同。
- 别搞混 · 滚动视差（parallax）：悬停抬升只由指针驱动，鼠标进出才动；视差由滚动驱动，鼠标不动、只滚页面它也会移动。
- 别搞混 · 磁吸按钮：悬停抬升只沿固定方向（通常 translateY(-4px)）位移，指针位置不影响方向；磁吸按钮把指针相对按钮中心的偏移乘一个系数，方向跟着指针走，指针离开才弹回。
- 别搞混 · 停靠栏放大：悬停抬升只有指针进出两个状态，一次只抬起被指的那个元素；停靠栏放大按指针到每个图标的距离连续算缩放，整排图标一起起伏，指针停在两个图标之间时两边都会变大。
- 坑：只加位移不加阴影，元素会像一张贴纸飘起来，没有重量感；位移和阴影要一起变
- 坑：触摸设备没有 hover，点完 :hover 可能粘住不消失，所以静止态本身必须完整可读
- 坑：位移超过 8px 会显得轻浮、像在跳，2–6px 通常刚好
- 坑：用 top 或 margin 做位移会触发重排，要用 transform: translateY()；也不要改 width/height
- 推荐取值：抬升距离=2–6px；过渡时长=150–250ms；缓动=ease-out / cubic-bezier(0.22, 1, 0.36, 1)；阴影=0 8px 24px rgba(0, 0, 0, 0.14)；缩放=1.01–1.03（可选）
- 控件默认值：lift(抬升距离)=6px；duration(过渡时长)=200ms；shadow(阴影强度)=45%；easing(缓动)=cubic-bezier(0.22, 1, 0.36, 1)
- 无障碍降级：prefers-reduced-motion: reduce 下去掉位移和缩放，只保留阴影加深或底色变化来表示悬停，过渡时长可以直接设为 0ms。
- 提给 AI（中文）：给卡片加悬停抬升（hover lift）：指针移上去时用 transform: translateY(-6px) scale(1.02) 抬起，阴影加深到约 45% 的强度（如 0 10px 28px rgba(0,0,0,0.10)），过渡 200ms、缓动 cubic-bezier(0.22, 1, 0.36, 1)；指针移开立刻回到原位。位移只用 transform，不要改 top 或 margin。触摸设备没有 hover，静止态必须完整可读。
- Ask for it (English keywords): hover lift micro-interaction, :hover { transform: translateY(-6px) scale(1.02); box-shadow: 0 10px 28px rgba(0,0,0,0.10); transition: transform 200ms cubic-bezier(0.22, 1, 0.36, 1) }, transform-only, no top/margin, reset on pointer leave, touch devices keep a static readable state
- 相关：press-feedback, magnetic-button, spotlight-glow
- 参考：[MDN · :hover](https://developer.mozilla.org/docs/Web/CSS/:hover) · [MDN · box-shadow](https://developer.mozilla.org/docs/Web/CSS/box-shadow) · [MDN · transition](https://developer.mozilla.org/docs/Web/CSS/transition)

<a id="press-feedback"></a>

### F-02 按压反馈 · Press Feedback

- 地址：https://publieople.github.io/design-museum/entry/press-feedback/
- 展厅：feedback · 标签：css-only, composited, keyboard-operable, stable · 形态：stage
- 一句话：手指按下的瞬间按钮缩小、变暗，松开立刻弹回，确认这一下点到了。
- 别名：按下缩放、点击回弹、按压态、按下反馈、button press effect、active state scale
- 关键词：:active, transform: scale(), transition, touch-action, press state, :focus-visible
- 什么时候用：按钮、图标按钮需要即时确认，别让人怀疑刚才点没点到 / 提交类按钮想减少连点，先用按下反馈把动作锁住一下 / 移动端点击区域小，用触感替代的视觉反馈补足
- 别搞混 · 悬停抬升：悬停是移入之后一直保持的状态，用 :hover；按压只在按住那一瞬出现、松开就结束，用 :active。按住不放时两者会同时成立。
- 别搞混 · 加载状态（loading）：按压反馈是几十毫秒内的即时回应，请求还没发出去；loading 要持续到请求返回。正确的顺序是先按压、再 loading，而不是同时出现。
- 别搞混 · 涟漪反馈：涟漪从按下的坐标点向外扩散，能看出「点在哪」；按压反馈作用于整个控件，按键整体缩小或变暗，和落点无关。按住不放时两者常同时存在。
- 坑：:active 只在按住期间生效；键盘用空格或回车触发的是 click，不会走 :active，别把按压态当成键盘反馈
- 坑：iOS Safari 上 :active 需要元素可交互才会稳定触发，给按钮加 touch 事件监听或 cursor: pointer 更保险
- 坑：用 width/height 缩小会重排，要用 transform: scale()
- 坑：回弹过冲太大（明显超过 1.0）会显得廉价，回到 1.0 附近就够
- 推荐取值：按下缩放=0.94–0.97；按下时长=80–150ms；回弹时长=150–200ms；缓动=ease-out；回弹用 cubic-bezier(0.34, 1.56, 0.64, 1)
- 控件默认值：scale(按下缩放)=0.96x；duration(按下/回弹时长)=110ms；spring(松开时回弹)=true
- 无障碍降级：prefers-reduced-motion: reduce 下去掉缩放过渡，按下时只改底色或亮度并瞬时切换，回弹取消。
- 提给 AI（中文）：给按钮加按压反馈（press feedback）：按住时用 transform: scale(0.96) 缩小，过渡 110ms；松开回到 scale(1)，缓动 cubic-bezier(0.34, 1.56, 0.64, 1)。回弹可以轻微过冲，但别超过 1.0 太多。按下用 :active 或 pointerdown，同时给键盘用户保留 :focus-visible 描边。按钮不能因此改变尺寸。
- Ask for it (English keywords): button press feedback, :active { transform: scale(0.96); transition: transform 110ms }, release back to scale(1) with cubic-bezier(0.34, 1.56, 0.64, 1), slight overshoot spring, transform-only, keep :focus-visible ring, touch-action: manipulation
- 相关：hover-lift, spring, magnetic-button
- 参考：[MDN · :active](https://developer.mozilla.org/docs/Web/CSS/:active) · [MDN · transform](https://developer.mozilla.org/docs/Web/CSS/transform) · [MDN · touch-action](https://developer.mozilla.org/docs/Web/CSS/touch-action)

<a id="magnetic-button"></a>

### F-03 磁吸按钮 · Magnetic Button

- 地址：https://publieople.github.io/design-museum/entry/magnetic-button/
- 展厅：feedback · 标签：js, browser-api, main-thread, pointer-dependent, stable · 形态：interactive
- 一句话：指针靠近时按钮被吸过去一点点，移开又弹回原位。
- 别名：磁力按钮、跟随鼠标的按钮、吸附光标、magnetic hover、cursor-following button、magnetic pull
- 关键词：pointermove, transform: translate3d, getBoundingClientRect, CSS custom property, requestAnimationFrame, magnetic hover
- 什么时候用：首屏主 CTA 想抓一下注意力，又不适合做大动效 / 按钮数量很少的展示页或作品集，允许一个有个性的主操作 / 想暗示「这个按钮在等你」，让指针和它产生关系
- 别搞混 · 悬停抬升：抬升的方向是固定的，永远垂直向上；磁吸会朝指针方向做二维偏移，指针在左下方就往左下方走。
- 别搞混 · 指针视差（pointer parallax）：视差是整个容器跟着指针大范围移动，几十像素起步；磁吸只在按钮附近的小范围内移动几像素到十几像素。
- 别搞混 · 光标跟随：光标跟随替换的是指针本身：一个元素追着指针满屏跑，指针的可见性由它接管；磁吸按钮仍用原生指针，只是按钮朝指针方向偏移几像素，指针一离开按钮就回弹。
- 别搞混 · 停靠栏放大：磁吸按钮朝指针方向整体位移，追的是指针坐标；停靠栏放大的图标位置不动，只按距离从底边中心缩放，指针不需要落在任何图标上也能改变一排的大小。
- 坑：触发半径开太大（超过按钮尺寸两倍）会满屏乱飘，1–1.5 倍按钮宽高就够
- 坑：位移不设上限会让按钮躲开指针、点不中，最多 6–16px
- 坑：每次 pointermove 都 setState 会掉帧，用 requestAnimationFrame 节流，或直接改 CSS 变量和 element.style
- 坑：触摸设备没有指针悬停，要直接给静止态；算中心点用 getBoundingClientRect，别忘了页面滚动的影响
- 推荐取值：触发半径=按钮宽高的 1–1.5 倍；最大位移=6–16px；跟随系数=0.2–0.4；复位时长=300–500ms；复位缓动=cubic-bezier(0.22, 1, 0.36, 1)
- 控件默认值：strength(跟随系数)=0.3；maxDistance(最大位移)=12px；radius(触发半径)=1.6倍；duration(复位时长)=350ms
- 无障碍降级：prefers-reduced-motion: reduce 下完全关闭指针跟随，按钮原地不动，悬停反馈改成底色或描边变化。
- 提给 AI（中文）：做一个磁吸按钮（magnetic button）：监听容器的 pointermove，用 getBoundingClientRect 算出按钮中心，指针进入按钮宽高 1.6 倍范围内时，让按钮朝指针方向偏移，偏移量 = 指针到中心的距离 × 0.30，并限制在 12px 以内；指针离开就复位，复位过渡 350ms cubic-bezier(0.22, 1, 0.36, 1)。用 transform: translate3d 移动，pointermove 里用 requestAnimationFrame 节流。系统减少动态效果时完全不跟随。
- Ask for it (English keywords): magnetic button, pointermove + getBoundingClientRect, offset = (pointer - center) * 0.30, clamp to 12px, activation radius 1.6x button size, return with transition 350ms cubic-bezier(0.22, 1, 0.36, 1), transform: translate3d, throttle with requestAnimationFrame, disable under prefers-reduced-motion
- 相关：hover-lift, press-feedback, spotlight-glow
- 参考：[MDN · pointermove 事件](https://developer.mozilla.org/docs/Web/API/Element/pointermove_event) · [MDN · getBoundingClientRect](https://developer.mozilla.org/docs/Web/API/Element/getBoundingClientRect) · [MDN · transform](https://developer.mozilla.org/docs/Web/CSS/transform)

<a id="skeleton-shimmer"></a>

### F-04 骨架屏微光 · Skeleton Shimmer

- 地址：https://publieople.github.io/design-museum/entry/skeleton-shimmer/
- 展厅：feedback · 标签：css-only, gradient, paint-heavy, motion-heavy, stable · 形态：stage
- 一句话：灰色占位块上有一道亮光反复扫过，表示内容还在加载。
- 别名：骨架屏、微光扫过、加载占位、shimmer loading、skeleton screen、content placeholder
- 关键词：skeleton screen, @keyframes shimmer, linear-gradient, transform: translateX, content placeholder, CLS
- 什么时候用：列表或卡片的数据还没到，先用占位块把布局占住 / 图片加载前的占位，避免内容一到位整页跳动 / 想比转圈更明确地预告「这里马上会出现什么」
- 别搞混 · 转圈 loading（spinner）：spinner 不透露内容形状，只表示忙；骨架屏按最终布局摆好占位块，内容换了位置也不跳。
- 别搞混 · 进度条（progress bar）：进度条表示可量化的进度（比如 30%）；骨架屏表示时长未知的等待，只能靠反复扫光暗示还在动。
- 别搞混 · 乐观更新：乐观更新渲染的是真实数据（只是尚未确认），失败要撤回并提示；骨架屏渲染的是没有内容的灰块，数据一到就整体替换，不存在回滚。
- 坑：扫光用 background-position 或 width 动画会不停重绘，用覆盖层做 transform: translateX 更省
- 坑：骨架停留超过 5–8 秒还没内容，用户会以为坏了，要有超时文案或兜底
- 坑：骨架的圆角、间距、行数和真实内容差太远，内容一进来整页会跳
- 坑：高光带太宽或对比太强会很吵，宽度取容器的 20%–40%，多条骨架共用同一个 animation 保持同步
- 推荐取值：单次扫过=1.2–1.8s；高光带宽=容器的 20%–40%；骨架底色=当前文字色 8%–12%；高光=当前文字色 40%–55%；占位圆角=与真实内容一致
- 控件默认值：duration(扫过一次的时长)=1400ms；highlight(高光带宽)=32%；rows(文本占位行数)=3条
- 无障碍降级：prefers-reduced-motion: reduce 下去掉扫光动画，只留静态占位块；如果要保留一点动静，改成不移动的透明度呼吸并拉长周期。
- 提给 AI（中文）：做一个骨架屏微光（skeleton shimmer）：按最终布局摆好占位块，灰色底用 color-mix(in srgb, currentColor 12%, transparent)。再加一层覆盖的 linear-gradient 高光带，宽度约 32%，用 transform: translateX 从 -100% 平移到 100%，1400ms linear infinite 循环，不要动 width 或 background-position。头像圆加 3 行文本占位。系统减少动态效果时去掉扫光，只留静态占位。
- Ask for it (English keywords): skeleton screen with shimmer, placeholder blocks at currentColor 8-12%, overlay linear-gradient highlight band 32% wide, @keyframes shimmer { from { transform: translateX(-100%) } to { transform: translateX(100%) } }, 1400ms linear infinite, 3 text rows + avatar circle, animate transform only (never width/background-position), static under prefers-reduced-motion
- 相关：optimistic-ui, toast, stagger
- 参考：[MDN · linear-gradient](https://developer.mozilla.org/docs/Web/CSS/gradient/linear-gradient) · [MDN · @keyframes](https://developer.mozilla.org/docs/Web/CSS/@keyframes) · [web.dev · 累计布局偏移 CLS](https://web.dev/articles/cls)

<a id="optimistic-ui"></a>

### F-05 乐观更新 · Optimistic UI

- 地址：https://publieople.github.io/design-museum/entry/optimistic-ui/
- 展厅：feedback · 标签：js, stateful, keyboard-operable, stable · 形态：stage
- 一句话：点下去界面立刻变成成功的样子，请求在后台跑，失败了再退回去。
- 别名：乐观更新、先改后存、点了立刻变、optimistic update、rollback on failure、immediate UI
- 关键词：optimistic UI, rollback, useOptimistic, race condition, pending state, reconcile
- 什么时候用：点赞、收藏、关注这类高频、低风险、可重复的操作 / 发送消息或评论，希望它立刻出现在列表里，而不是等服务器回声 / 网络慢的时候想减少等待感，把结果先摆出来
- 别搞混 · 加载中（loading / disabled）：loading 明确说「正在提交，先等一下」，还会把按钮锁住；乐观更新反过来，先显示结果、把等待藏起来，只在失败时才提示并回滚。
- 别搞混 · 本地缓存（local cache）：乐观更新只改当前这一次的界面状态，刷新就没了；缓存是真正存下来的数据，下次打开还在。
- 别搞混 · 骨架屏微光：骨架屏出现在数据还没回来时，用占位块撑住布局、明示「正在加载」；乐观更新是数据还没确认就先按成功渲染真实内容，失败再回滚，等待被藏起来而不是画出来。
- 坑：支付、下单、删除账号这类不能重放的操作不能乐观，必须等服务器确认
- 坑：失败必须回滚并给出提示（toast 或内联错误），只回滚不提示，用户会以为自己成功了
- 坑：快速连点会产生竞态，给请求编号或声明「最后一次为准」，别让旧响应覆盖新状态
- 坑：回滚要按 id 定位那一条，不要按数组下标，否则列表并发更新时会改错行
- 推荐取值：界面更新延迟=0ms（点击即变）；失败提示停留=2–4s；请求超时=5–10s；回滚过渡=200–300ms
- 控件默认值：latency(模拟服务器延迟)=1200ms；failureRate(失败概率)=30%；optimistic(乐观更新)=true
- 无障碍降级：回滚的颜色和位移过渡在 prefers-reduced-motion 下取消，状态直接切换，但「已撤销」的文字或图标提示必须保留。
- 提给 AI（中文）：做一个乐观更新（optimistic UI）的点赞列表：点击后立刻把这一条改成已赞、计数 +1，同时标记 pending，不等接口返回。模拟请求延迟 1200ms，失败概率 30%，失败时按 id 回滚到原状态并在那一条上显示「失败，已撤销」的提示。用 useOptimistic 或本地 state 实现，注意快速连点的竞态。
- Ask for it (English keywords): optimistic UI like button, update state immediately on click and mark pending, no await, simulated latency 1200ms, failure rate 30%, rollback by id on error with an inline error message, handle race conditions (last write wins), useOptimistic, aria-live polite for the error
- 相关：toast, press-feedback, skeleton-shimmer
- 参考：[React · useOptimistic](https://react.dev/reference/react/useOptimistic) · [MDN · ARIA live regions](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/ARIA_Live_Regions)

<a id="toast"></a>

### F-06 轻提示 · Toast

- 地址：https://publieople.github.io/design-museum/entry/toast/
- 展厅：feedback · 标签：js, stateful, composited, stable · 形态：stage
- 一句话：一条短消息从屏幕边缘滑进来，几秒后自己消失，不打断当前操作。
- 别名：轻提示、消息提示条、浮层提示、自动消失的提示、toast notification、snackbar
- 关键词：toast, snackbar, aria-live, role="status", auto-dismiss, transform: translateY
- 什么时候用：一次操作成功或失败，给一句话的确认，不用用户做决定 / 配合撤销（undo），比如「已删除 · 撤销」 / 后台任务完成时提醒一下，用户当时可能在别处
- 别搞混 · 模态弹窗（modal）：modal 挡住页面、必须处理才能继续；toast 不阻塞、会自动消失，所以不能把必须被看到的严重错误只放进 toast。
- 别搞混 · 字段内联校验：表单错误要贴在出错字段旁边并保持可见，直到用户改对；toast 在角落且会消失，不适合报字段级错误。
- 坑：自动消失的提示不能用 aria-live="assertive"，会打断读屏；用 role="status" 或 aria-live="polite"
- 坑：停留时间少于 3 秒读不完，超过 6 秒又挡视线，3–5 秒比较合适
- 坑：多条 toast 要堆叠并限制数量（最多 3–4 条），否则会铺满屏幕
- 坑：不能只靠颜色区分成功和失败，要有图标或文案；也不能让 toast 成为唯一的信息来源
- 推荐取值：停留时长=3–5s；入场时长=200–300ms；同时最多=3 条；宽度=280–420px；位置=底部居中或右上角
- 控件默认值：duration(停留时长)=3000ms；position(出现位置)=bottom；distance(滑入距离)=12px
- 无障碍降级：prefers-reduced-motion: reduce 下取消入场和退场的位移与淡出，直接出现、直接消失，停留时长保持不变。
- 提给 AI（中文）：做一个轻提示（toast）组件：触发后从底部居中滑入，滑入距离 12px，入场 220ms ease-out，停留 3000ms 后自动消失。容器用 role="status" 和 aria-live="polite"，多条时纵向堆叠、最多同时 3 条。动画只用 transform: translateY 和 opacity，禁用状态别遮挡页面操作。系统减少动态效果时直接出现和消失。
- Ask for it (English keywords): toast / snackbar component, slides in from 底部居中, translateY(12px) with 220ms ease-out, auto-dismiss after 3000ms, role="status" aria-live="polite", stack up to 3 toasts, animate transform + opacity only, non-blocking, no entry/exit animation under prefers-reduced-motion
- 相关：optimistic-ui, skeleton-shimmer, sticky-header, command-palette
- 参考：[MDN · ARIA live regions](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/ARIA_Live_Regions) · [MDN · role="status"](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Roles/status_role) · [MDN · transition](https://developer.mozilla.org/docs/Web/CSS/transition)

<a id="ripple"></a>

### F-07 涟漪反馈 · Ripple

- 地址：https://publieople.github.io/design-museum/entry/ripple/
- 展厅：feedback · 标签：js, gradient, composited, keyboard-operable, stable · 形态：stage
- 一句话：点下去的地方荡开一圈水波，告诉用户这一下收到了。
- 别名：水波纹、点击涟漪、波纹扩散、ripple effect、material ripple、touch ripple
- 关键词：ripple effect, Material ripple, pointerdown, radial-gradient, transform: scale(), overflow: hidden, animation-play-state, ::after
- 什么时候用：按钮、列表项、开关这类要明确「点到了」的控件 / 触屏上没有 hover，需要让人看出这一下点在哪、有没有生效 / 整套界面想要统一的点击反馈语言（Material 风格的基础件）
- 别搞混 · 按压反馈：按压反馈让整个控件缩放或变暗，是「整体」的状态；涟漪从落点扩散，能看出点在哪一下，两者经常叠在一起用。
- 别搞混 · 进度条：涟漪只是「按下收到了」，不表示进度；别让它一直扩下去或循环，否则用户会以为在加载。
- 坑：波纹用 transform: scale() + opacity 扩散，别去改 width/height，否则每一帧都要重排
- 坑：每个波纹节点动画结束就要移除，手指长按会连着生成，不管就会堆出上百个节点
- 坑：要按落点扩散就得用 pointerdown 的坐标减去元素盒子的位置，写死从中心扩散会丢掉「点在哪」的信息
- 坑：控件要 overflow: hidden 才裁得出边界，否则波纹会溢出到外面
- 坑：键盘 Enter/Space 触发时没有坐标，退化成从中心扩散，别让它什么都不发生
- 坑：prefers-reduced-motion 下改成一个短促的底色变化，功能不变
- 推荐取值：扩散时长=300–600ms；起始透明度=0.25–0.4；直径=不小于元素对角线，从落点算起；缓动=ease-out；裁剪=overflow: hidden
- 控件默认值：duration(扩散时长)=450ms；opacity(起始透明度)=30%；fromPoint(从落点扩散)=true
- 无障碍降级：prefers-reduced-motion 下不放涟漪，改成 80–150ms 的底色或描边变化，按下反馈依然存在。
- 提给 AI（中文）：做点击涟漪反馈（ripple）：在按钮 pointerdown 时按落点坐标生成一个圆形波纹，直径覆盖整块按钮，用 transform: scale(0) → scale(1) 扩散、不透明度 30% 渐隐到 0，时长 450ms、ease-out，按钮 overflow: hidden 裁出边界，动画结束后把波纹节点移除。键盘 Enter/Space 触发时从中心扩散；prefers-reduced-motion 下改成短促的底色变化。
- Ask for it (English keywords): material ripple feedback, circle spawned at the pointerdown coordinates, scaled from 0 to 1 with opacity fading from 30% to 0 over 450ms ease-out, button has overflow: hidden, remove the ripple node on animationend, centered ripple for Enter/Space, short background-color change under prefers-reduced-motion
- 相关：press-feedback, spotlight-glow
- 参考：[MDN · scale()](https://developer.mozilla.org/docs/Web/CSS/transform-function/scale) · [MDN · pointerdown 事件](https://developer.mozilla.org/docs/Web/API/Element/pointerdown_event)

<a id="command-palette"></a>

### F-08 命令面板 · Command Palette

- 地址：https://publieople.github.io/design-museum/entry/command-palette/
- 展厅：feedback · 标签：js, stateful, layout-triggering, keyboard-operable, stable · 形态：interactive
- 一句话：按一个快捷键弹出一个搜索框，敲几个字就能跳到任何功能。
- 别名：命令面板、快捷搜索框、⌘K 面板、command palette、command menu、quick switcher、spotlight search
- 关键词：command palette, command menu, role="listbox", aria-activedescendant, meta+k, fuzzy filter, focus trap, z-index overlay
- 什么时候用：功能多到侧栏或顶部导航塞不下的后台、编辑器、工具型产品 / 想让熟练用户完全不离开键盘就能跳转（⌘K / Ctrl+K） / 需要把「命令」和「跳转」放在同一个入口里检索
- 别搞混 · 搜索框：搜索框在页面里占位置、搜的是内容；命令面板是浮层、搜的是动作与位置，选中就直接执行或跳转，还会把快捷键写在行尾。
- 别搞混 · 下拉选择：下拉选择是「从有限选项里挑一个」；命令面板的结果是动态过滤出来的，而且键盘导航（上下键选中、回车确认、Esc 关闭）是它的核心而不是附加功能。
- 坑：键盘导航不能省：上下键移动、回车确认、Esc 关闭，否则命令面板就只是个搜索框
- 坑：打开时立刻把焦点放进输入框，关闭后要把焦点还给触发它的按钮，不然键盘用户会迷路
- 坑：结果列表要限制条数（8–12 条）并高亮当前项，用 aria-activedescendant 或 aria-selected 标出来
- 坑：⌘K / Ctrl+K 要自己监听 keydown（preventDefault，别让浏览器抢走），忘记绑定就会出现「快捷键没反应」
- 坑：浮层要用 z-index 与位置锚定拿住层级，别让页面里的 sticky 元素盖在上面
- 坑：prefers-reduced-motion 下关掉进出场缩放，只做透明度切换
- 推荐取值：快捷键=⌘K（macOS）/ Ctrl+K（Windows、Linux），同时支持 /；结果条数=8–12 条，超出就滚动而不是全塞；过滤=按输入实时过滤，空格分词做模糊匹配；键盘=↑↓ 移动、Enter 确认、Esc 关闭、Tab 不离开面板；进出场=120–200ms，缩放到 0.96 → 1 加透明度
- 控件默认值：results(最多显示条数)=6；withShortcut(显示快捷键)=true；fuzzy(模糊过滤)=true
- 无障碍降级：prefers-reduced-motion 下不要做缩放与位移，只保留 100ms 以内的透明度切换。
- 提给 AI（中文）：做一个命令面板（command palette）：按 ⌘K / Ctrl+K（同时支持 /）打开浮层搜索框，输入时做模糊过滤，最多显示 6 条，上下键移动高亮、回车确认并执行、Esc 关闭，打开时焦点进输入框、关闭后还给触发按钮；当前项用 aria-selected 或 aria-activedescendant 标出，进出场 150ms 缩放加淡入；prefers-reduced-motion 下只做透明度切换。
- Ask for it (English keywords): command palette overlay, meta+k / ctrl+k plus / shortcut, live fuzzy filter over commands, top 6 results, arrow keys move the highlight, Enter runs the command, Escape closes, focus moves into the input on open and back to the trigger on close, aria-selected / aria-activedescendant on the active row, 150ms scale and fade in and out, opacity only under prefers-reduced-motion
- 相关：accordion, toast
- 参考：[MDN · role="listbox"](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Roles/listbox_role) · [MDN · aria-activedescendant](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Attributes/aria-activedescendant)

<a id="dock-magnify"></a>

### F-09 停靠栏放大 · Dock Magnification

- 地址：https://publieople.github.io/design-museum/entry/dock-magnify/
- 展厅：feedback · 标签：js, composited, pointer-dependent, motion-heavy · 形态：stage
- 一句话：指针越靠近图标，图标放得越大，像 macOS 的 Dock。
- 别名：Dock 放大、图标放大、靠近放大、dock magnification、icon magnification、proximity scale、magnify on hover
- 关键词：dock magnification, pointer distance, scale(), transform-origin, pointermove, getBoundingClientRect, falloff
- 什么时候用：底部或侧边的图标导航，想让「现在指着哪个」一眼可见 / 工具条、表情选择器这类图标密集、放不下文字标签的地方 / 想要一点活泼的手感，又不想让整排图标一起跳舞
- 别搞混 · 悬停抬升：悬停抬升只判断指针进没进去，一个元素整体上浮加阴影，邻居完全不动；停靠栏放大是按指针到每个图标中心的距离连续算缩放，越近越大，还会把左右邻居一起带起来。
- 别搞混 · 磁吸按钮：磁吸按钮是元素朝指针方向位移，像被吸过去；停靠栏放大的图标位置不动，只是围绕自己的底边变大，指针不需要按下去。
- 别搞混 · 光标跟随：光标跟随有一个独立的光斑或自定义光标跟着指针跑；停靠栏放大没有跟随物，只有一排固定位置的图标按距离改变尺寸。
- 坑：别用 width/height 做放大，那是在每帧触发布局；用 transform: scale()，并把 transform-origin 设成底边中心，图标才像从托盘里长出来。
- 坑：缩放过渡超过 200ms 时，指针快速划过会拖出一串跟不上手的「果冻」；控制在 60–120ms，或干脆按帧直接写 transform。
- 坑：放大后的图标会盖住邻居或顶出容器，给整排留出上方空间（padding-top 或 overflow: visible），别让最大的那颗被裁掉。
- 坑：最大缩放别超过 2 倍、影响半径别超过整排宽度的一半，否则一次只看得清一个图标，导航反而变慢。
- 坑：触屏没有 hover；粗指针设备或 prefers-reduced-motion 下保持原始大小，不要用点击去模拟悬停。
- 推荐取值：最大缩放=1.5–1.8 倍；影响半径=100–160px；相邻缩放差=不超过 0.35 倍；缩放过渡=60–120ms
- 控件默认值：maxScale(最大缩放)=1.55x；radius(影响半径)=120px；labels(显示名称)=true
- 无障碍降级：prefers-reduced-motion: reduce 时整排图标保持原始尺寸，不做缩放和上浮，只用文字说明指针在哪一颗上。
- 提给 AI（中文）：做一个停靠栏放大（dock magnification）的图标条：一排同尺寸图标，监听 pointermove，用 getBoundingClientRect 算出指针到每个图标中心的水平距离 d，缩放 = 1 + (1.55 - 1) × max(0, 1 - d / 120)²，transform-origin 设为 bottom center，过渡 80ms 线性，只动 transform；指针离开后回到 1 倍。图标下方保留名称标签。prefers-reduced-motion 时不做缩放，粗指针设备保持原始大小。
- Ask for it (English keywords): dock magnification icon bar: a row of equally sized icons, listen to pointermove, measure the horizontal distance d from the pointer to each icon centre with getBoundingClientRect, scale = 1 + (1.55 - 1) * max(0, 1 - d / 120) squared, transform-origin bottom center, transition transform 80ms linear, animate transform only, reset to 1x on pointer leave. Keep a visible label under each icon. Keep icons at their natural size under prefers-reduced-motion and on coarse pointers.
- 相关：magnetic-button, hover-lift, cursor-follower
- 参考：[MDN · Pointer events](https://developer.mozilla.org/docs/Web/API/Pointer_events) · [MDN · scale()](https://developer.mozilla.org/docs/Web/CSS/scale) · [web.dev · 用 transform 和 opacity 做动画](https://web.dev/articles/animations-guide)
