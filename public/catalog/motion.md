# 前端设计博物馆 · 动效与节奏 / Motion & Timing（M 厅）

> 元素怎么进场、怎么随时间变化

> 本厅 9 条词条。全量目录见 https://publieople.github.io/design-museum/catalog.md（锚点与本文一致），分片索引见 https://publieople.github.io/design-museum/catalog/index.json。

## 词条

<a id="stagger"></a>

### M-01 交错进场 · Stagger

- 地址：https://publieople.github.io/design-museum/entry/stagger/
- 展厅：motion · 标签：css-only, composited, motion-heavy, stable · 形态：stage
- 一句话：一组元素不是同时出现，而是按顺序一个接一个进来。
- 别名：错峰动画、依次出现、级联出现、逐条入场、cascading entrance、staggered animation
- 关键词：stagger, animation-delay, transition-delay, transform: translateY, cascading entrance
- 什么时候用：列表、卡片组、导航项首次出现时，想让视线按顺序扫过 / 想让一组元素显得「有编排」而不是「啪一下全出来」 / 页面初次加载，用一次统一的进场序列建立节奏
- 别搞混 · 延迟动画：单个元素延迟进场只是「晚点出现」；交错进场的重点是项与项之间的固定间隔（stagger），读者能数出顺序。
- 别搞混 · 逐个播放的轮播：轮播会一直循环；交错进场通常只在首次出现时播放一次，之后不再重复。
- 坑：间隔超过 120ms、元素又多，最后一项要等很久，页面像卡住
- 坑：列表很长时只给前 8–10 项加间隔，其余直接显示，否则总时长失控
- 坑：不要用 left/top/margin 做位移，用 transform + opacity，才不会触发重排
- 坑：进场动画属于非必要动效，prefers-reduced-motion 下要直接显示最终态
- 推荐取值：单项时长=300–500ms；项间隔=60–100ms；位移距离=8–24px；缓动=ease-out / cubic-bezier(0.22, 1, 0.36, 1)
- 控件默认值：duration(单项时长)=420ms；stagger(项间隔)=80ms；distance(位移距离)=16px；easing(缓动)=cubic-bezier(0.22, 1, 0.36, 1)
- 无障碍降级：prefers-reduced-motion: reduce 时不播放位移与淡入，直接以最终状态渲染整组元素。
- 提给 AI（中文）：给这组列表项做交错进场（stagger）动画：每项从下方 16px、opacity 0 进入最终位置，单项时长 420ms，缓动 cubic-bezier(0.22, 1, 0.36, 1)，相邻两项间隔 80ms。只在首次出现时播放一次，用 transform 和 opacity 实现。系统开启「减少动态效果」时直接显示最终状态。
- Ask for it (English keywords): staggered entrance, animation-delay: index * 80ms, each item fades in with opacity 0 → 1 and translateY(16px) → 0, duration 420ms, easing cubic-bezier(0.22, 1, 0.36, 1), play once on first view, animate transform/opacity only, respect prefers-reduced-motion
- 相关：scroll-reveal, easing, spring
- 参考：[MDN · animation-delay](https://developer.mozilla.org/docs/Web/CSS/animation-delay) · [web.dev · 用 transform 和 opacity 做动画](https://web.dev/articles/animations-guide)

<a id="easing"></a>

### M-02 缓动曲线 · Easing

- 地址：https://publieople.github.io/design-museum/entry/easing/
- 展厅：motion · 标签：css-only, modern-css, composited, check-support · 形态：stage
- 一句话：决定动画快慢怎么分配：起步快还是收尾慢，全在这条曲线上。
- 别名：缓动函数、时间曲线、速度曲线、贝塞尔曲线、timing function、easing curve、cubic-bezier
- 关键词：animation-timing-function, cubic-bezier(), transition-timing-function, linear(), steps(), easing curve
- 什么时候用：想让动画有「加速度」而不是全程匀速平移 / 入场要收得干净（快进慢停），退场要果断（慢起快走） / 排一排按钮或卡片时，让动效的手感保持一致
- 别搞混 · 时长 duration：时长只管「多久走完」，缓动曲线管「时间怎么分配」。两条时长相同的动画，换一条曲线，前 100ms 里走完的路程能差好几倍。
- 别搞混 · 过渡 transition 本身：transition 只是声明「哪个属性要动、动多久」；缓动是其中的 timing-function 参数。transition 写了 ease 不等于做了缓动，ease 只是默认曲线而已。
- 坑：一整套界面全用默认 ease：什么都在慢慢爬，界面显得没精神
- 坑：cubic-bezier 的控制点超出 0–1 会冲出范围（也就是回弹），用得过量会像坏掉的弹簧
- 坑：给用户主动触发的操作调缓动，别把 ease-in 放在点击反馈上，起手慢会让人觉得卡
- 坑：缓动不改动画的物理路径，只改时间轴；位移、缩放交给 transform，别指望曲线解决布局抖动
- 推荐取值：进场（快进慢停）=cubic-bezier(0.22, 1, 0.36, 1)；退场=cubic-bezier(0.4, 0, 1, 1)；标准 / 两头缓=cubic-bezier(0.4, 0, 0.2, 1)；时长范围=150–400ms；回弹幅度=控制点 y 值 1.2–1.6，再多就油腻
- 控件默认值：duration(动画时长)=900ms；distance(行进距离)=100%；delay(每轮停顿时长)=300ms；easing(重点对照)=cubic-bezier(0.22, 1, 0.36, 1)
- 无障碍降级：缓动只是时间分配，在 prefers-reduced-motion: reduce 下应把时长压到接近 0（或直接改成 opacity 渐变），保留状态变化、去掉速度感。
- 提给 AI（中文）：帮我调一下动效的缓动曲线：入场用 cubic-bezier(0.22, 1, 0.36, 1)，动画时长 900ms，每轮结束后停 300ms。位移幅度大概 100% 的可用宽度，用 transform 走，不要动 left/top。同一批元素（按钮、卡片）必须用同一条曲线，手感才统一；缓动只改时间分配，不要顺手把路径也改了。
- Ask for it (English keywords): animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1), transition-timing-function, cubic-bezier() easing curve, duration 900ms, delay 300ms, travel 100%, animate transform only (no left/top), keep one shared easing across buttons and cards, respect prefers-reduced-motion
- 相关：spring, stagger, scroll-driven
- 参考：[MDN · cubic-bezier()](https://developer.mozilla.org/docs/Web/CSS/easing-function/cubic-bezier) · [MDN · animation-timing-function](https://developer.mozilla.org/docs/Web/CSS/animation-timing-function)

<a id="spring"></a>

### M-03 弹簧动画 · Spring Physics

- 地址：https://publieople.github.io/design-museum/entry/spring/
- 展厅：motion · 标签：js, modern-css, composited, main-thread, motion-heavy, stable · 形态：stage
- 一句话：元素像挂了弹簧一样冲向目标：可能冲过头，再弹回来停住。
- 别名：弹性动画、回弹、物理动画、弹性缓动、spring animation、overshoot、bouncy
- 关键词：spring physics, stiffness, damping, mass, overshoot, requestAnimationFrame, linear() easing approximation
- 什么时候用：拖拽松手、开关切换、卡片滑出，想让收尾自然而不是硬停 / 想要一点「有性格」的反馈，但又不能拖慢操作 / 弹出层、气泡、跟随手指的元素，需要「被拉住再放开」的手感
- 别搞混 · 回弹缓动 back-out：回弹缓动是一条固定的三次贝塞尔曲线，只负责冲过头再回来；弹簧是「刚度 + 阻尼 + 质量」三个参数算出来的运动轨迹，冲几次、冲多远都能调。
- 别搞混 · 兜底动画 keyframes：关键帧是写死的路径，改速度就得重写一堆关键帧；弹簧是每次运行现算，被拖拽打断（中断后也说得通）也能接着算下去。
- 坑：参数调软了（刚度低、阻尼小）会左右晃好几秒，用户只想点一下却要等它停下来
- 坑：弹簧靠不断重算数值驱动，别在每一帧里改 width/height 或触发 React 状态更新，用 transform 和 requestAnimationFrame 或动画库做
- 坑：不同库的参数互不通用：Framer Motion 的 stiffness/damping/mass 和 react-spring 的 tension/friction 量纲不一样，不能照抄数值
- 坑：prefers-reduced-motion 下要直接落到终点、删掉回弹，别让晕动的用户看它弹三下
- 推荐取值：刚度 stiffness=170–300（越高越快）；阻尼 damping=20–35（临界阻尼附近最稳）；质量 mass=1；超调量=不超过 8%–10%；稳定时间=200–400ms 内停稳
- 控件默认值：stiffness(刚度)=260；damping(阻尼)=18；mass(质量)=1x
- 无障碍降级：prefers-reduced-motion: reduce 时把弹簧换成 150ms 的线性或用 opacity 淡入，直接跳到最终位置，不播回弹。
- 提给 AI（中文）：给这个元素做弹簧动画（spring physics）：用 stiffness 260、damping 18、mass 1 三个参数驱动，目标位置是右侧终点，允许轻微超调但不能晃超过两下，300ms 内停稳。只动 transform，用 requestAnimationFrame 或动画库的 spring 实现，不要每帧改 width/height。prefers-reduced-motion 下直接落到终点。
- Ask for it (English keywords): spring animation, stiffness 260, damping 18, mass 1, overshoot allowed but settle within ~300ms, animate transform: translateX only, driven by requestAnimationFrame or a spring library (Framer Motion / react-spring), no layout-thrashing properties, respect prefers-reduced-motion
- 相关：easing, hover-lift, press-feedback
- 参考：[MDN · CSS 缓动函数（spring 近似写法）](https://developer.mozilla.org/docs/Web/CSS/easing-function) · [Chrome for Developers · CSS 动画](https://developer.chrome.com/docs/css-ui/animation)

<a id="scroll-reveal"></a>

### M-04 滚动揭示 · Scroll Reveal

- 地址：https://publieople.github.io/design-museum/entry/scroll-reveal/
- 展厅：motion · 标签：js, browser-api, scroll-linked, composited, motion-heavy, stable · 形态：scroll
- 一句话：内容滚进视口时才淡入上移，没滚到的先藏着。
- 别名：滚动出现、滚动淡入、进入视口出现、滚动加载动画、reveal on scroll、fade in on scroll、view enter
- 关键词：IntersectionObserver, threshold, rootMargin, reveal on scroll, fade in on scroll, unobserve, translateY + opacity
- 什么时候用：长落地页的分段内容，一次进来太多会显得糊成一片 / 图文混排的营销页、案例列表，想让阅读节奏被一段段接上 / 列表首屏之外的项目，滚到了再出现，首屏渲染更轻
- 别搞混 · 滚动驱动动画 scroll-driven：滚动揭示是「进入视口触发一次」——元素自己动，触发后就把自己从观察列表里摘掉；滚动驱动动画是每一帧的进度都绑定滚动位置，往回滚还会倒着播。
- 别搞混 · 懒加载 lazy loading：懒加载省的是网络和图片解码，元素位置早就占好了；滚动揭示动的是 opacity 和 transform，内容本来就在页面里，只是先看不见。
- 坑：触发一次之后要 unobserve 或断开观察器，否则来回滚动会反复淡入淡出
- 坑：IntersectionObserver 的 threshold 写成 1，短视口里的长元素永远达不到，永远不出现
- 坑：在滚动事件里直接读 scrollTop 会让布局反复重算，用 IntersectionObserver 或 requestAnimationFrame 节流
- 坑：元素先设成 opacity: 0 时确认内容仍在 DOM 里，别让禁用脚本或爬虫拿到一个空页面
- 推荐取值：位移距离=12–32px，再大就像东西从下面掉出来；淡入时长=400–700ms；缓动=cubic-bezier(0.22, 1, 0.36, 1)；触发阈值=元素露出 15%–25%
- 控件默认值：distance(上移距离)=24px；duration(淡入时长)=550ms；threshold(触发阈值)=20%；delay(项间隔)=60ms
- 无障碍降级：prefers-reduced-motion: reduce 时不要观察也不要位移，内容直接以最终状态渲染（本 demo 走的就是这条路径）。
- 提给 AI（中文）：给这些内容块加滚动揭示（reveal on scroll）：用 IntersectionObserver 监听，threshold 0.2，元素露出后播放 opacity 0 → 1、translateY(24px) → 0 的过渡，时长 550ms、cubic-bezier(0.22, 1, 0.36, 1)，相邻块错开 60ms，播完立刻 unobserve。只动 transform 和 opacity。prefers-reduced-motion 下不要观察，内容直接显示。
- Ask for it (English keywords): reveal on scroll, IntersectionObserver with threshold 0.2, add class when isIntersecting, transition: opacity 550ms cubic-bezier(0.22, 1, 0.36, 1), transform translateY(24px) to 0, stagger 60ms, unobserve after first intersection, opacity + transform only, respect prefers-reduced-motion
- 相关：scroll-driven, stagger, parallax
- 参考：[MDN · IntersectionObserver](https://developer.mozilla.org/docs/Web/API/IntersectionObserver) · [MDN · IntersectionObserverEntry](https://developer.mozilla.org/docs/Web/API/IntersectionObserverEntry)

<a id="parallax"></a>

### M-05 视差滚动 · Parallax

- 地址：https://publieople.github.io/design-museum/entry/parallax/
- 展厅：motion · 标签：js, modern-css, scroll-linked, paint-heavy, motion-heavy, stable · 形态：scroll
- 一句话：滚动时前景和后景走不同速度，画面因此有了纵深。
- 别名：视差、层叠滚动、分层滚动、视差效果、parallax scrolling、multi-layer scroll、scroll depth
- 关键词：parallax scrolling, transform: translate3d, will-change: transform, animation-timeline: scroll(), background-attachment: fixed, scroll-linked
- 什么时候用：首屏头图想比正文走得慢一点，制造「往里走」的感觉 / 多图层插画、品牌页、活动页，想用层次代替真 3D / 卡片列表滚过时让背景或图片轻微错位，增加质感
- 别搞混 · fixed 背景：background-attachment: fixed 是背景相对视口钉住不动，只有一层；视差是每一层用各自的 transform 速度移动，可以有三四层，而且能被 JS 控制。
- 别搞混 · 滚动驱动动画 scroll-driven：视差只管「位移随滚动线性变化」；滚动驱动动画可以把滚动进度映射到任意属性（旋转、缩放、颜色），还能用 animation-range 控制起止区间。
- 坑：位移距离给太大会让人晕，前后景速度差控制在 20%–50% 就够，超过就没法读内容
- 坑：scroll 监听里直接读 scrollY 会抖动，用 requestAnimationFrame 节流或 CSS 的 animation-timeline: scroll()
- 坑：移动端和 prefers-reduced-motion 下最好直接关掉，iOS 的滚动回弹会让视差明显跳一下
- 坑：给它加 will-change: transform 只在动画期间加，常驻会一直占着合成层显存
- 推荐取值：前后景速度比=0.3–0.6（背景慢、前景快）；单层最大位移=不超过容器高度的 50%；层级数量=2–4 层，再多看不出区别；驱动方式=requestAnimationFrame 或 animation-timeline: scroll()
- 控件默认值：speed(视差强度)=0.45x；distance(基准位移)=60px；reverse(反方向)=false
- 无障碍降级：prefers-reduced-motion: reduce 时把位移速度全部置 0，让所有图层停在原位，页面照常可读。
- 提给 AI（中文）：给这个滚动容器做视差滚动（parallax）：背景层按滚动距离乘 0.45 偏移，中景和前景各按不同系数偏移，基准位移 60px。用 transform: translate3d 实现，scroll 里用 requestAnimationFrame 节流，只在滚动期间加 will-change: transform。prefers-reduced-motion 下把系数归零。
- Ask for it (English keywords): parallax scrolling, multi-layer scroll depth, each layer translate3d(0, scrollY * 0.45 + 60px, 0), background slower than foreground, driven by requestAnimationFrame inside a passive scroll listener, will-change: transform only while scrolling, respect prefers-reduced-motion
- 相关：scroll-driven, scroll-reveal, frosted-glass
- 参考：[MDN · translate3d()](https://developer.mozilla.org/docs/Web/CSS/transform-function/translate3d) · [MDN · animation-timeline](https://developer.mozilla.org/docs/Web/CSS/animation-timeline)

<a id="scroll-driven"></a>

### M-06 滚动驱动动画 · Scroll-Driven Animation

- 地址：https://publieople.github.io/design-museum/entry/scroll-driven/
- 展厅：motion · 标签：modern-css, scroll-linked, composited, motion-heavy, check-support · 形态：scroll
- 一句话：滚动条就是进度条：滚到哪一帧由滚动位置决定。
- 别名：滚动时间线、滚动进度动画、滚动联动动画、scroll timeline、scroll-driven animations、animation-timeline
- 关键词：animation-timeline, scroll(), view(), animation-range, scroll-driven animations, scroll progress, requestAnimationFrame fallback
- 什么时候用：阅读进度条、章节指示条，天然就是「滚多少走多少」 / 卡片滚进画面时同时旋转、放大、改变饱和度 / 希望动画跟手指位置严格对应，来回滚也要能正反播
- 别搞混 · 滚动揭示 scroll reveal：揭示是进视口触发一次就播完，之后和滚动位置无关；滚动驱动动画的每一帧都绑在滚动位置，同一个位置永远是同一帧，往回滚会倒着播。
- 别搞混 · 用 scroll 事件写 JS 动画：scroll 事件在合成线程之外触发，滚快了会掉帧；animation-timeline 由合成器驱动，不占主线程，但要现代浏览器（Chrome 115+）才支持。
- 坑：animation-range 不写就用默认值，动画可能在元素刚露头时就播完，看着像没生效
- 坑：用 JS 在 scroll 事件里读 scrollTop 再写样式，每帧同步读写会掉帧，交给 CSS 或 rAF 节流
- 坑：animation-timeline 在 Safari 和 Firefox 上的支持还不完整，必须准备不用动画也能看的静态版本（本 demo 里有降级指示）
- 坑：进度条用 scaleX 做，别改 width，后者每帧都要重排
- 推荐取值：时间线函数=animation-timeline: scroll() 或 view()；动画区间=animation-range: entry 0% cover 40%；进度条实现=transform: scaleX()，不用 width；旋转幅度=15–45deg，超过就喧宾夺主
- 控件默认值：rotate(最大旋转)=30deg；range(动画区间)=60%；duration(降级时长)=600ms
- 无障碍降级：prefers-reduced-motion: reduce 时把时间线换成普通的固定时长动画，或让元素直接停在进度终点，进度条这类指示物保留但不跟着滚。
- 提给 AI（中文）：用 CSS 滚动驱动动画（scroll-driven animations）做这个效果：卡片用 animation-timeline: view()、animation-range: entry 0% cover 60%，把滚动进度映射到 rotateZ(30deg) 和 opacity 上；顶部进度条用 animation-timeline: scroll() 配 transform: scaleX()。滚动事件里不要写 JS。Safari / Firefox 不支持时，用 intersection 触发一段 600ms 的普通动画兜底，并给出「不支持」的提示。
- Ask for it (English keywords): scroll-driven animations, animation-timeline: view(), animation-range: entry 0% cover 60%, keyframes on rotateZ(30deg) and opacity, scroll progress bar via animation-timeline: scroll() with transform: scaleX(), no scroll event listeners, feature-detect with CSS.supports('animation-timeline: scroll()'), fallback to a 600ms reveal with IntersectionObserver, respect prefers-reduced-motion
- 相关：scroll-reveal, parallax, sticky-header
- 参考：[Chrome for Developers · 滚动驱动动画](https://developer.chrome.com/docs/css-ui/scroll-driven-animations) · [MDN · animation-timeline](https://developer.mozilla.org/docs/Web/CSS/animation-timeline)

<a id="view-transitions"></a>

### M-07 视图过渡 · View Transitions

- 地址：https://publieople.github.io/design-museum/entry/view-transitions/
- 展厅：motion · 标签：browser-api, js, composited, motion-heavy, check-support · 形态：page
- 一句话：页面切换时，浏览器把新旧两屏接起来，补出中间那一下过渡。
- 别名：页面转场、跨页面过渡、共享元素过渡、view transition、view-transition、page transition
- 关键词：View Transition API, document.startViewTransition, view-transition-name, ::view-transition-old, ::view-transition-new, shared element transition, cross-document view transition
- 什么时候用：列表点进详情：被点的那张卡片原地放大成详情页的头图 / 同一个应用里换标签页或换主题，希望两屏连起来而不是硬切 / 导航栏在多个页面里都一样，想让人看出它是同一个元素
- 别搞混 · CSS transition：CSS transition 只能让同一个元素自己变；视图过渡是浏览器给整屏拍新旧两张快照再做动画，所以能把旧界面里的某个元素平滑接到新界面的对应元素上。
- 别搞混 · 入场动画：入场动画是新页面自己在播，旧界面已经消失；视图过渡的动画发生在两屏之间，旧屏要一起参与，所以改 DOM 的那一步必须放进 startViewTransition 的回调里。
- 坑：同一时刻 view-transition-name 必须唯一：列表里给每张卡片都写死一个名字会直接报错，要在点击时只给被点的那张临时加上
- 坑：改 DOM 的代码必须在 document.startViewTransition(() => …) 的回调里执行，写在回调外面拍到的还是旧界面
- 坑：过渡期间会有一层伪元素盖在页面上，指针事件被短暂挡住，别在过渡里做点击判断
- 坑：不支持这个 API 的浏览器要有兜底：直接切换即可，不要留一屏空白等过渡
- 坑：跨文档（多页应用）要写 @view-transition { navigation: auto }，而且必须同源
- 推荐取值：时长=200–400ms；缓动=cubic-bezier(0.22, 1, 0.36, 1)；共享元素命名=view-transition-name: card-3（同一时刻唯一）；降级=不支持时瞬间切换，不留空白
- 控件默认值：duration(过渡时长)=300ms；easing(缓动)=cubic-bezier(0.22, 1, 0.36, 1)；shared(共享元素过渡)=true
- 无障碍降级：prefers-reduced-motion 下不要调用 startViewTransition（或把 ::view-transition-group 的 animation-duration 设成 0），页面瞬间切换，功能完全一样。
- 提给 AI（中文）：做一个视图过渡（view transition）：点击列表卡片时用 document.startViewTransition 包住 DOM 更新，给被点的那张卡片加 view-transition-name，让它在详情页放大成头图，过渡 300ms、缓动 cubic-bezier(0.22, 1, 0.36, 1)。同一时刻 view-transition-name 只能有一个；不支持这个 API 的浏览器直接切换，不要留空白。
- Ask for it (English keywords): view transition, document.startViewTransition wrapping the DOM update, view-transition-name on the shared element so it morphs into the detail header, ::view-transition-old / ::view-transition-new pseudo elements, 300ms cubic-bezier(0.22, 1, 0.36, 1), instant fallback when unsupported
- 相关：stagger, sticky-header
- 参考：[MDN · View Transition API](https://developer.mozilla.org/docs/Web/API/View_Transitions_API) · [Chrome Developers · View Transitions](https://developer.chrome.com/docs/web-platform/view-transitions)

<a id="cursor-follower"></a>

### M-08 光标跟随 · Cursor Follower

- 地址：https://publieople.github.io/design-museum/entry/cursor-follower/
- 展厅：motion · 标签：js, browser-api, composited, main-thread, pointer-dependent · 形态：interactive
- 一句话：一个圆点慢半拍地跟在指针后面，把系统鼠标指针换掉。
- 别名：跟随鼠标、指针跟随、鼠标尾巴、custom cursor、cursor follower、mouse follower、pointer follower
- 关键词：cursor follower, custom cursor, pointermove, transform: translate3d, requestAnimationFrame, mix-blend-mode: difference, pointer-events: none, cursor: none
- 什么时候用：作品集、品牌页这类要「有手感」的页面，想让指针变成设计的一部分 / 需要一个大一点的指针指示当前可交互区域（比如画布、画廊） / 配合聚光、磁吸这类指针驱动的效果，做统一的指针语言
- 别搞混 · 磁吸按钮：磁吸按钮是按钮朝指针靠过来，指针本身不动；光标跟随是替代指针的位置，元素永远慢半拍追着指针跑。
- 别搞混 · 光标拖尾：拖尾会在后面留一串残影（几十个点或一条流线）；跟随只有一到两个点，重点是「滞后感」而不是「痕迹」。
- 坑：把系统光标藏了，就必须保证键盘用户还能看清焦点：:focus-visible 的样式不能省
- 坑：pointermove 里每帧 setState 会掉帧，用 requestAnimationFrame 或直接改元素的 transform
- 坑：跟随元素要 pointer-events: none，否则它会挡住底下的点击
- 坑：触屏没有指针，要在触屏或粗指针设备上直接关掉跟随
- 坑：指针移出窗口时要归位或淡出，别让圆点卡在角落不动
- 推荐取值：跟随延迟=60–150ms（越小越跟手，越大越飘）；圆点直径=12–32px；混合模式=mix-blend-mode: difference（深浅背景都看得见）；跟随元素=pointer-events: none; position: fixed；触屏与降级=粗指针设备直接关掉，保留系统光标
- 控件默认值：lag(跟随延迟)=90ms；size(圆点直径)=20px；blend(混合模式)=difference；hideNative(隐藏系统光标)=true
- 无障碍降级：prefers-reduced-motion 下不要藏系统光标、也不要做跟随（跟随本身就是持续运动），直接保留默认指针。
- 提给 AI（中文）：做一个光标跟随（cursor follower）：用一个 20px 的圆点代替鼠标指针，在容器上设 cursor: none 把系统光标藏掉，圆点用 requestAnimationFrame 平滑追向 pointermove 的位置，延迟约 90ms，mix-blend-mode: difference，pointer-events: none；指针移出容器就淡出。触屏和 prefers-reduced-motion 下关掉跟随，保留系统光标，并保证键盘焦点可见。
- Ask for it (English keywords): custom cursor follower, 20px dot, cursor: none on the container, pointermove + requestAnimationFrame smooth follow with 90ms lag, transform: translate3d, mix-blend-mode: difference, pointer-events: none, fade out on pointer leave, disabled on touch and under prefers-reduced-motion, keep focus-visible styles
- 相关：magnetic-button, spotlight-glow
- 参考：[MDN · pointermove 事件](https://developer.mozilla.org/docs/Web/API/Element/pointermove_event) · [MDN · mix-blend-mode](https://developer.mozilla.org/docs/Web/CSS/mix-blend-mode)

<a id="scroll-progress"></a>

### M-09 滚动进度条 · Scroll Progress Bar

- 地址：https://publieople.github.io/design-museum/entry/scroll-progress/
- 展厅：motion · 标签：modern-css, js, composited, check-support · 形态：scroll
- 一句话：页面顶部一条细线，跟着阅读进度走，告诉读者还剩多少。
- 别名：阅读进度条、滚动进度、进度条、阅读条、scroll progress、scroll progress bar、reading progress、reading progress bar
- 关键词：scroll progress, reading progress, animation-timeline: scroll(), transform: scaleX(), document.scrollingElement, requestAnimationFrame, progress indicator
- 什么时候用：长文、文档、教程：读者随时知道读了多远、还剩多少 / 单页长落地页：把进度条当成章节指示器 / 分步表单或长列表：让「滚到底才出现」的动作有预期
- 别搞混 · 滚动驱动动画 scroll-driven：进度条只是把滚动位置压成 0–100% 的一条指示物；滚动驱动动画是把任意属性（旋转、透明度、颜色）绑到滚动上的时间线机制。进度条可以用 scroll-driven 实现，但前者是 UI 部件，后者是机制，不能互相替代。
- 别搞混 · 浏览器自带的滚动条：原生滚动条贴着滚动容器、每个系统长得不一样，还会随滚动消失；进度条固定在视口顶部、只有几像素高、全站统一，是设计选择而不是系统 UI。
- 坑：用 width 改进度：每帧都要重排。用 transform: scaleX() 配 transform-origin: left，走合成层
- 坑：把进度条放在滚动容器外面却写 animation-timeline: scroll()：时间线取的是元素自己的滚动祖先，取不到就不动，得放在容器内或显式指定 target
- 坑：固定在顶部却不给正文留等价 padding：第一行标题永远被压住
- 坑：让读屏软件读进度条：它每秒变化几十次，是噪音；进度条一般 aria-hidden，需要的话另给一条静态的「已读 60%」文本
- 推荐取值：高度=桌面 2–4px，移动端 3–6px；颜色=强调色实心条 + 当前文字色 8–12% 的底槽；实现=transform: scaleX(0 → 1) + transform-origin: left；时间线=animation-timeline: scroll(root block)；不支持时 rAF 读 scrollTop
- 控件默认值：height(进度条粗细)=3px；track(显示底槽)=true；mode(实现方式)=auto
- 无障碍降级：进度条是指示物，可以保留；去掉平滑追赶（不要用 0.2s 过渡逐帧追随），在 prefers-reduced-motion: reduce 下直接把滚动位置映射成 scaleX，不做额外动画。
- 提给 AI（中文）：在页面顶部固定一条 3px 高的阅读进度条，用 transform: scaleX() 从 0 到 1 跟随页面滚动（transform-origin: left），底槽用当前文字色 10% 透明铺满。优先用 animation-timeline: scroll(root block)，CSS.supports 检测不到时退回 requestAnimationFrame 读取滚动位置；进度条 aria-hidden，不要让读屏软件反复播报。prefers-reduced-motion 下不做平滑追赶，直接把滚动位置映射成进度。
- Ask for it (English keywords): scroll progress bar, fixed to the top of the page, 3px tall, driven by transform: scaleX() from 0 to 1 with transform-origin: left, visible track at 10% currentColor. Drive it with animation-timeline: scroll(root block), falling back to requestAnimationFrame when CSS.supports() says no. Keep it aria-hidden, and under prefers-reduced-motion map the scroll position straight to scaleX without smoothing.
- 相关：scroll-driven, scroll-reveal, sticky-header
- 参考：[MDN · animation-timeline](https://developer.mozilla.org/docs/Web/CSS/animation-timeline) · [Chrome for Developers · 滚动驱动动画](https://developer.chrome.com/docs/css-ui/scroll-driven-animations)
