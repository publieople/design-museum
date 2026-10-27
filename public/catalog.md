# 前端设计博物馆 · 词条目录 v1

> 41 条前端效果词条，中英双语名字 + 口语别名 + 易混项 + 踩坑 + 推荐取值 + 控件默认值 + 可直接提给 AI 的中英需求句。
> 站点：https://publieople.github.io/design-museum/ · 机器可读版：https://publieople.github.io/design-museum/catalog.json

## 怎么用它

1. 用户用「人话」描述想要的效果时，先拿他的话去匹配 aliases / keywords / oneLiner / names，命中即定位词条。
2. 需要按维度筛：tags（facet 见下）、category（展厅）、demo.shape（演示形态）、scenes / feel / intent。
3. 给用户交付设计需求时，优先用该词条的 prompt.zh（中文）与 prompt.en（英文关键词），并把 controls 的当前取值写进句子。
4. 拿不准两个概念的区别时看 confusions；容易翻车的地方看 pitfalls；无障碍降级看 reducedMotion。

## 词表

- **怎么实现 / Mechanism**（纯 CSS，还是要写 JS / 用浏览器 API）：css-only=纯 CSS、js=需要 JS、browser-api=浏览器 API、modern-css=新 CSS 特性、filter-blend=滤镜与混合、gradient=渐变、font-feature=字体特性、scroll-linked=随滚动变化、stateful=有状态
- **什么代价 / Cost**（性能上要付出什么）：composited=合成层动画、paint-heavy=重绘开销、layout-triggering=会引发重排、main-thread=主线程每帧
- **无障碍 / Accessibility**（谁用不了，怎么补）：motion-heavy=动效较多、keyboard-operable=键盘可用、pointer-dependent=只能指针操作
- **兼容性 / Support**（能不能直接用，还是得先查兼容表）：stable=可以直接用、check-support=先查兼容
- **展厅 / gallery**：motion=动效与节奏、feedback=交互反馈、layout=布局与结构、visual=视觉质感、type=排版与文字
- **演示形态 / demo shape**：stage=固定舞台、interactive=指针交互、scroll=自带滚动、sequence=分步推进、page=整页对比
- **用在什么界面 / scenes**：button=按钮、card=卡片、list=列表、page=页面、scroll=滚动、text=文字、form=表单、nav=导航
- **什么感觉 / feel**：crisp=利落、calm=沉稳、playful=活泼、soft=柔和
- **什么目的 / intent**：attention=吸引注意、hierarchy=表达层级、affordance=暗示可操作、waiting=缓解等待

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

<a id="hover-lift"></a>

### F-01 悬停抬升 · Hover Lift

- 地址：https://publieople.github.io/design-museum/entry/hover-lift/
- 展厅：feedback · 标签：css-only, composited, pointer-dependent, stable · 形态：stage
- 一句话：指针移到卡片上，它轻轻上浮、阴影变大，暗示这块可以点。
- 别名：悬停浮起、鼠标移上去抬起来、卡片上浮、hover 抬高、hover lift、card hover elevation
- 关键词：transform: translateY, box-shadow, transition, :hover, elevation, will-change: transform
- 什么时候用：可点击的卡片、商品卡、文章列表项，需要让指针的位置得到回应 / 一排并列的卡片里，想突出当前指到的那一张 / 按钮或图标已经够清楚，只差一点「它活着」的暗示
- 别搞混 · 按压反馈（press feedback）：悬停抬升是指针停留在上面期间持续存在的状态，用 :hover；按压反馈是按下和松开那一瞬的反馈，用 :active。两者经常叠着用，但触发时机完全不同。
- 别搞混 · 滚动视差（parallax）：悬停抬升只由指针驱动，鼠标进出才动；视差由滚动驱动，鼠标不动、只滚页面它也会移动。
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
- 别搞混 · 悬停抬升（hover lift）：悬停是移入之后一直保持的状态，用 :hover；按压只在按住那一瞬出现、松开就结束，用 :active。按住不放时两者会同时成立。
- 别搞混 · 加载状态（loading）：按压反馈是几十毫秒内的即时回应，请求还没发出去；loading 要持续到请求返回。正确的顺序是先按压、再 loading，而不是同时出现。
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
- 别搞混 · 悬停抬升（hover lift）：抬升的方向是固定的，永远垂直向上；磁吸会朝指针方向做二维偏移，指针在左下方就往左下方走。
- 别搞混 · 指针视差（pointer parallax）：视差是整个容器跟着指针大范围移动，几十像素起步；磁吸只在按钮附近的小范围内移动几像素到十几像素。
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
- 相关：optimistic-ui, skeleton-shimmer, sticky-header
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

<a id="frosted-glass"></a>

### V-01 毛玻璃 · Frosted Glass

- 地址：https://publieople.github.io/design-museum/entry/frosted-glass/
- 展厅：visual · 标签：css-only, modern-css, filter-blend, paint-heavy, stable · 形态：stage
- 一句话：面板背后的内容被真的模糊掉，像隔着一层磨砂玻璃看过去。
- 别名：磨砂玻璃、磨砂、毛玻璃效果、backdrop blur、backdrop-filter、glass blur
- 关键词：backdrop-filter, blur(), saturate(), frosted glass, backdrop blur, translucent panel
- 什么时候用：导航栏、浮层压在滚动内容或照片上，既要有层次又要透出底下 / 卡片叠在图片或彩色背景上，希望它属于这个画面而不是贴上去 / 需要让人一眼看出「这块浮在上面」，又不想用实心色块把背景挡死
- 别搞混 · 半透明：半透明只是让面板变淡，背后内容依然清晰；毛玻璃会把背后内容真的糊掉。只调 opacity 或 rgba 做不出毛玻璃。
- 别搞混 · 模糊滤镜 blur()：filter: blur() 模糊的是元素自己（连它的文字一起糊）；backdrop-filter: blur() 模糊的是它背后的东西，元素自身内容保持清晰。
- 坑：背后必须有内容：纯色背景上加 backdrop-filter 看不出任何变化
- 坑：父级带 overflow: hidden 或 transform 时，部分浏览器会失效或裁切异常
- 坑：模糊半径超过 20px 就会糊成一片，文字对比度下降，8–16px 通常够用
- 坑：Safari 需要 -webkit-backdrop-filter 前缀，且要给不支持的浏览器留可读底色
- 推荐取值：模糊半径=8–16px；饱和度=140%–200%；面板底色=rgba(255,255,255,0.06–0.12)；描边=1px rgba(255,255,255,0.18)
- 控件默认值：blur(模糊半径)=12px；saturate(饱和度)=115%；alpha(面板底色不透明度)=8%；radius(圆角)=14px
- 无障碍降级：毛玻璃是静态效果，本身不需要降级；如果配合入场动画，在 prefers-reduced-motion 下应直接呈现最终状态。
- 提给 AI（中文）：做一个毛玻璃（Frosted Glass）面板：用 backdrop-filter: blur(12px) saturate(115%) 把面板背后的内容模糊掉，面板底色 rgba(255,255,255,0.08)，圆角 14px，1px rgba(255,255,255,0.18) 描边勾出玻璃边缘。面板必须叠在有内容的背景上（照片或彩色渐变），不要用半透明纯色糊弄，那不是毛玻璃。
- Ask for it (English keywords): frosted glass panel, backdrop-filter: blur(12px) saturate(115%), -webkit-backdrop-filter fallback, background: rgba(255,255,255,0.08), border: 1px solid rgba(255,255,255,0.18), border-radius: 14px, must sit over visible content behind
- 相关：glassmorphism, gradient-border, grain-noise
- 参考：[MDN · backdrop-filter](https://developer.mozilla.org/docs/Web/CSS/backdrop-filter) · [web.dev · backdrop-filter](https://web.dev/articles/backdrop-filter)

<a id="glassmorphism"></a>

### V-02 玻璃拟态 · Glassmorphism

- 地址：https://publieople.github.io/design-museum/entry/glassmorphism/
- 展厅：visual · 标签：css-only, modern-css, filter-blend, paint-heavy, stable · 形态：stage
- 一句话：半透明面板 + 亮边 + 柔影叠在彩色背景上，像一块玻璃浮在画面里。
- 别名：玻璃态、玻璃质感、玻璃卡片、glass UI、glass card、glassmorphic
- 关键词：glassmorphism, backdrop-filter, translucent panel, 1px highlight border, inset box-shadow, saturate(180%)
- 什么时候用：登录页、定价卡、数据卡想显得轻透精致，又不想整页铺实心色块 / 面板压在彩色渐变或照片上，希望底下的颜色透一点上来 / 浮层、侧栏要和主内容拉开层级，同时不切断和背景的联系
- 别搞混 · 毛玻璃：毛玻璃只说「背后被模糊」这一件事（backdrop-filter: blur）；玻璃拟态是一整套外观：模糊 + 半透明白色斜向渐变 + 1px 亮描边 + inset 顶部高光 + 外投影，而且几乎都压在彩色背景上。只加一个 blur 不叫玻璃拟态。
- 别搞混 · 半透明卡片：半透明只是把底色设成 rgba，边缘是平的；玻璃拟态的边界靠那圈亮描边勾出来，高光和投影一起把面板从背景里托起来。
- 坑：必须压在彩色渐变或照片上；纯色背景加 backdrop-filter 几乎看不出变化
- 坑：亮描边和 inset 高光是玻璃感的命根子，省掉就只剩一块半透明矩形
- 坑：面板上的文字对比度会随背景变色：深色背景用白字加一点 text-shadow，别指望浅色底能托住黑字
- 坑：backdrop-filter 每次都要重新合成背景，一屏十几块玻璃会明显掉帧，长列表项里不要用
- 坑：Safari 要写 -webkit-backdrop-filter，并给不支持的浏览器留一个够不透明的兜底色
- 推荐取值：模糊半径=10–20px；面板底色=linear-gradient(160deg, rgba(255,255,255,0.16), rgba(255,255,255,0.06))；描边=1px solid rgba(255,255,255,0.30)；投影=0 8px 32px rgba(0,0,0,0.30)；内高光=inset 0 1px 0 rgba(255,255,255,0.50)；圆角=12–24px
- 控件默认值：blur(模糊半径)=16px；border(描边不透明度)=30%；shadow(投影强度)=30%；radius(圆角)=18px
- 无障碍降级：玻璃拟态是静态观感，本身不需要降级；如果给它加了入场或悬浮位移，prefers-reduced-motion: reduce 下直接呈现最终状态，只留静态的玻璃层。
- 提给 AI（中文）：做一块玻璃拟态（Glassmorphism）卡片：backdrop-filter: blur(16px) saturate(160%)，面板底色 linear-gradient(160deg, rgba(255,255,255,0.16), rgba(255,255,255,0.06))，1px 描边 rgba(255,255,255,0.30)，外投影 0 8px 32px rgba(0,0,0,0.30)，再补 inset 0 1px 0 rgba(255,255,255,0.5) 当顶部高光，圆角 18px。卡片必须压在彩色渐变或照片上，并写 -webkit-backdrop-filter 和够不透明的兜底色。
- Ask for it (English keywords): glassmorphism card, backdrop-filter: blur(16px) saturate(160%), -webkit-backdrop-filter, background: linear-gradient(160deg, rgba(255,255,255,0.16), rgba(255,255,255,0.06)), border: 1px solid rgba(255,255,255,0.30), box-shadow: 0 8px 32px rgba(0,0,0,0.30) and inset 0 1px 0 rgba(255,255,255,0.5), border-radius: 18px, translucent frosted panel over colorful gradient, fallback background for unsupported browsers
- 相关：frosted-glass, gradient-border, spotlight-glow
- 参考：[MDN · backdrop-filter](https://developer.mozilla.org/docs/Web/CSS/backdrop-filter) · [MDN · box-shadow](https://developer.mozilla.org/docs/Web/CSS/box-shadow)

<a id="mesh-gradient"></a>

### V-03 渐变网格 · Mesh Gradient

- 地址：https://publieople.github.io/design-museum/entry/mesh-gradient/
- 展厅：visual · 标签：css-only, gradient, filter-blend, paint-heavy, stable · 形态：stage
- 一句话：多个径向渐变叠在一起，颜色朝任意方向过渡，没有一条直线的渐变轴。
- 别名：网格渐变、弥散渐变、多色渐变背景、mesh gradient、diffuse gradient、aurora background
- 关键词：radial-gradient, layered backgrounds, transparent color stops, filter: blur(), hue-rotate(), mesh gradient, diffuse gradient
- 什么时候用：落地页 Hero 想要有颜色的纵深，又不想加载一张大图 / 把品牌主色柔和地铺满一整块区域，做卡片或弹窗底板 / 没有真实图片时的默认封面、头像底色，让占位也有内容 / 需要跟着主题色换一整套配色，用 filter 转个色相就能换
- 别搞混 · 线性渐变 / 锥形渐变：linear-gradient 只有一条渐变轴，conic-gradient 只有一个圆心，颜色沿一条线或一个角走；渐变网格是好几层 radial-gradient 各自带中心点叠起来，颜色在二维上互相混合。注意 CSS 里没有 mesh-gradient 这个属性，都是叠出来的。
- 别搞混 · 网格背景（grid 线）：网格背景是重复的等距线条，是规则图案；渐变网格是色场，没有线条，颜色之间连续过渡。中文名字里的「网格」指色控点的连线，不是画格子。
- 别搞混 · 毛玻璃：毛玻璃是把背后已有的内容糊掉；渐变网格是自己画出一片颜色。两者常一起用（网格背景 + 玻璃面板），但一个负责背景，一个负责面板。
- 坑：radial-gradient 的透明端直接写 transparent，在部分浏览器会和黑混出灰边，要写同一个颜色的 rgba(...,0)
- 坑：色标停到 100% 会露出硬边，提前在 50%–70% 结束，色斑才会自然融合
- 坑：叠超过 7–8 层背景重绘会变慢，再叠加 filter: blur 更明显，4–6 层够用
- 坑：给整层加 blur 时要把它 scale 放大到 1.2 以上，否则元素边缘会透出模糊的透明边
- 坑：纯 CSS 渐变在宽色域显示器上容易出现色带，叠一层 3%–8% 的颗粒噪点能压掉
- 坑：色相旋转用的是 filter: hue-rotate，它作用在整层上，别把文字也放进这一层
- 推荐取值：色斑层数=4–6 层；色标停靠=50%–70% 处提前淡出；整层模糊=0–40px；放大倍数=scale(1.2)–scale(1.5)；底色=#101018 之类的深中性色
- 控件默认值：spread(色斑扩散)=55%；softness(弥散模糊)=0px；hue(色相旋转)=0deg；drift(色斑缓慢漂移)=true
- 无障碍降级：静态的渐变网格不需要降级；如果让色斑缓慢缩放漂移，prefers-reduced-motion: reduce 下暂停动画，固定在一个构图上。
- 提给 AI（中文）：铺一块渐变网格（Mesh Gradient）背景：用 5 层 radial-gradient(circle at ...) 叠出来，每层色标在 55% 处提前淡出，透明端写成同色的 rgba(...,0)；底色 #101018。整层加 filter: blur(0px) hue-rotate(0deg)，再 scale(1.3) 放大避免模糊露边。让色斑用 18s ease-in-out 无限缓慢缩放旋转，注意 CSS 没有 mesh-gradient 属性，只能这样叠。
- Ask for it (English keywords): mesh gradient background, 5 layered radial-gradient() color blobs, transparent color stops at 55% using rgba(r,g,b,0), base color #101018, filter: blur(0px) hue-rotate(0deg), transform: scale(1.3) to hide blur edges, 18s ease-in-out infinite drift animation, no native mesh-gradient property in CSS
- 相关：grain-noise, gradient-border, frosted-glass
- 参考：[MDN · radial-gradient()](https://developer.mozilla.org/docs/Web/CSS/gradient/radial-gradient) · [MDN · filter](https://developer.mozilla.org/docs/Web/CSS/filter)

<a id="grain-noise"></a>

### V-04 颗粒噪点 · Grain Noise

- 地址：https://publieople.github.io/design-museum/entry/grain-noise/
- 展厅：visual · 标签：css-only, filter-blend, paint-heavy, stable · 形态：stage
- 一句话：在画面上撒一层随机像素，给纯色和渐变加质感，顺手压掉色带。
- 别名：噪点、颗粒感、胶片颗粒、杂色、film grain、noise texture、grain overlay
- 关键词：feTurbulence, fractalNoise, baseFrequency, stitchTiles, mix-blend-mode, SVG filter, data URI
- 什么时候用：大面积渐变或深色背景出现一圈圈色带（banding）时，用噪点把它打散 / 卡片、插画、缩略图想有一点胶片或纸张的颗粒，不再干净到发假 / 不同来源的图片材质不统一，铺一层颗粒把它们拉进同一个世界 / 深色界面里加一点质感，比再加一层投影更轻
- 别搞混 · 半透明黑色遮罩：蒙一层黑是整体压暗，亮度往下走；噪点让每个像素随机变亮或变暗，平均亮度不变，所以画面不黑，只是有了颗粒。
- 别搞混 · 重复纹理贴图：平铺一张 png 会看到重复单元和接缝，放大后尤其明显；feTurbulence 生成的是程序化噪声，配合 stitchTiles="stitch" 几乎看不出重复，颗粒粗细还能随参数调。
- 别搞混 · 抖动 dithering：抖动是渲染器为了压制色带自己做的，粒度跟像素对齐；颗粒噪点是你手动叠的一层材质，可以调大小、强度和混合模式。
- 坑：baseFrequency 低于 0.3 会变成大块云雾，不像颗粒；0.5–0.9 之间才是细砂
- 坑：噪点层必须 pointer-events: none，不然整块区域都点不动
- 坑：不透明度超过 15% 画面会发脏，文字对比度也跟着掉，3%–10% 通常刚好
- 坑：深色背景上用 overlay 混合几乎看不见，换 normal 或提高强度
- 坑：feTurbulence 是实时算的，SVG 尺寸给太大会拖慢首帧，用 120–200px 的小瓦片平铺
- 坑：给噪点层加抖动动画时用 steps() 而不是线性缓动，线性看起来像在飘
- 推荐取值：baseFrequency=0.5–0.9；numOctaves=2–4；颗粒直径=1–2px；不透明度=3%–10%；混合模式=overlay / soft-light / normal；瓦片尺寸=120–200px
- 控件默认值：grain(颗粒大小)=1.5px；opacity(噪点不透明度)=10%；blend(混合模式)=overlay；flicker(颗粒抖动)=true
- 无障碍降级：颗粒是静态材质，不需要降级；如果做了模拟胶片跳动的逐帧位移，prefers-reduced-motion: reduce 下停掉抖动，只留静止的颗粒层。
- 提给 AI（中文）：给这块深色渐变面板加一层颗粒噪点（grain noise）：把一张 160x160 的 SVG feTurbulence data URI 当 background-image 平铺，baseFrequency="0.67"（约 1.5px 颗粒）、type="fractalNoise"、numOctaves="3"、stitchTiles="stitch"；噪点层 opacity: 10%、mix-blend-mode: overlay、pointer-events: none；再补一个 <feColorMatrix type="saturate" values="0"/> 把噪声转成中性灰（feTurbulence 连 alpha 都是随机的，不转灰叠上去会发彩）。再用 steps() 的 transform 位移做胶片跳动，目的是压住渐变色带，不是把画面搞脏。
- Ask for it (English keywords): film grain noise overlay, SVG feTurbulence fractalNoise baseFrequency="0.67" numOctaves="3" stitchTiles="stitch", data URI background-image repeated 160px tile, opacity: 10%, mix-blend-mode: overlay, pointer-events: none, feColorMatrix saturate 0 to keep the grain neutral, steps(6) transform jitter keyframes, dithering to hide gradient banding
- 相关：mesh-gradient, frosted-glass, gradient-border
- 参考：[MDN · feTurbulence](https://developer.mozilla.org/docs/Web/SVG/Element/feTurbulence) · [MDN · mix-blend-mode](https://developer.mozilla.org/docs/Web/CSS/mix-blend-mode)

<a id="spotlight-glow"></a>

### V-05 光晕聚光 · Spotlight Glow

- 地址：https://publieople.github.io/design-museum/entry/spotlight-glow/
- 展厅：visual · 标签：js, browser-api, gradient, filter-blend, main-thread, pointer-dependent · 形态：interactive
- 一句话：一块柔光跟着指针在卡片表面移动，像有人拿手电照上去。
- 别名：聚光灯、鼠标光晕、光标跟随光、spotlight card、cursor glow、radial highlight
- 关键词：radial-gradient, pointermove, CSS custom properties, transform: translate3d, mix-blend-mode: screen, overflow: hidden, spotlight card
- 什么时候用：深色卡片想让用户意识到鼠标正停在这里，比整块变色更有空间感 / 定价卡、功能卡里突出「正在看的那一张」 / Hero 区要一束光追着指针走，给静态页面一点氛围 / 按钮的 hover 高亮想含蓄一点，用一层径向光代替纯色填充
- 别搞混 · box-shadow 阴影：box-shadow 是元素轮廓外的一圈均匀柔光，跟着盒子形状走，不会移动；聚光光晕是一个有圆心坐标的光斑，位置随指针变。
- 别搞混 · hover 换底色：hover 是把整块背景色换掉，边界是硬切；聚光有衰减，越靠圆心越亮，越往外越淡。
- 别搞混 · 跟随指针的拖尾：拖尾装饰的是鼠标本身，跟着指针满屏幕跑；聚光被裁在元素内部（overflow: hidden 或 mask），是打在表面的一层。
- 坑：别在 pointermove 里 setState，一帧多次重渲染会卡；把坐标直接写进元素的 style.transform 或 CSS 变量
- 坑：光斑要 overflow: hidden 裁在卡片里，否则看起来是飘在旁边的一个圆
- 坑：触屏没有 hover，必须给一个默认居中或居下的静态光斑，否则移动端一片死黑
- 坑：光太亮会把内容吃掉，峰值不透明度 0.10–0.25 就够，配 mix-blend-mode: screen 或 soft-light
- 坑：在长条卡片上用百分比尺寸算光斑会被拉成椭圆，改用固定 px 直径
- 坑：pointermove 里每次都读 getBoundingClientRect 会触发布局，缓存 rect 或只在 resize 时更新
- 推荐取值：光斑直径=320–560px；峰值不透明度=0.10–0.25；位置过渡=transform 80–160ms ease-out；混合模式=screen / soft-light；移出淡出=150–250ms
- 控件默认值：radius(光斑半径)=220px；intensity(峰值不透明度)=22%；hue(光斑色相)=40deg；follow(跟随指针)=true
- 无障碍降级：光斑是直接改 transform，本来就没有缓动；prefers-reduced-motion: reduce 下把 transform 的 transition 去掉，光斑瞬间跳到指针位置，不再有跟不上的拖影。
- 提给 AI（中文）：做卡片聚光（spotlight glow）：卡片 overflow: hidden，里面放一个 440px 的圆形光斑，背景 radial-gradient(circle, hsla(40, 95%, 70%, 0.22) 0%, hsla(40, 95%, 70%, 0) 70%)，mix-blend-mode: screen，pointer-events: none。用 pointermove 把指针坐标换算成光斑的 transform: translate3d()，直接改元素 style 不要 setState，并加 120ms 的 transform 过渡；指针移出回到卡片中心。默认位置就要好看，因为触屏没有 hover。
- Ask for it (English keywords): spotlight card glow, 440px circle, radial-gradient(circle, hsla(40, 95%, 70%, 0.22), transparent 70%), mix-blend-mode: screen, pointer-events: none, overflow: hidden, follow cursor with pointermove, write transform: translate3d directly to the element (no React state), 120ms ease-out transition on transform, recenter on pointerleave, static fallback for touch devices
- 相关：glassmorphism, gradient-border, hover-lift
- 参考：[MDN · radial-gradient()](https://developer.mozilla.org/docs/Web/CSS/gradient/radial-gradient) · [MDN · Element: pointermove 事件](https://developer.mozilla.org/docs/Web/API/Element/pointermove_event) · [MDN · mix-blend-mode](https://developer.mozilla.org/docs/Web/CSS/mix-blend-mode)

<a id="gradient-border"></a>

### V-06 渐变描边 · Gradient Border

- 地址：https://publieople.github.io/design-museum/entry/gradient-border/
- 展厅：visual · 标签：css-only, gradient, modern-css, check-support · 形态：stage
- 一句话：描边不是一种颜色，而是一条渐变沿着元素轮廓走一圈。
- 别名：渐变边框、彩色描边、渐变边、border gradient、gradient stroke、rainbow border
- 关键词：background-clip: padding-box, background-clip: border-box, border: transparent, linear-gradient, conic-gradient, @property, border-image
- 什么时候用：卡片、按钮要用品牌色勾一圈边，比纯色描边更有层次 / 突出「当前选中」的那一项，一圈亮边比填满整块更克制 / 深色背景上把元素边界画清楚，一条亮边就能顶替投影 / 想要随主题换色的描边，改几个 hsl 值就行
- 别搞混 · border-image：border-image 是最直觉的写法，但它不认 border-radius，圆角会被切成直角，而且 border-style 不能是 none。要圆角就得用两层 background 配 padding-box / border-box，或者 ::before 加 mask。
- 别搞混 · 外发光 box-shadow：外发光落在元素外面，边缘是糊的、没有明确边界；渐变描边是一条实线贴着边界，颜色沿线变化。
- 别搞混 · 渐变背景：渐变背景铺满整个面，渐变描边只画那一圈线；同一个渐变值，一个当底一个当边。
- 坑：border 必须设成 transparent 且有宽度，否则渐变没有地方画
- 坑：只写 background-clip: border-box 会把整块底色都铺满，必须两层：padding-box 一层实底，border-box 一层渐变
- 坑：长条元素上 45deg 的渐变两端颜色会不一样，因为角度按盒子尺寸算；两端想要同色就用 90deg 或 conic-gradient
- 坑：用 mask-composite 的写法在 Safari 要补 -webkit-mask-composite: xor，否则会变成一整块
- 坑：描边超过 2px、颜色又亮，就会盖过内容，1–2px 最稳
- 坑：border-image 和 border-radius 同时写不会报错，只是圆角静默失效，很难查
- 推荐取值：描边宽度=1–2px；渐变角度=90–160deg；圆角=8–20px；色标数量=2–3 个；流动周期=4–8s 一圈
- 控件默认值：width(描边宽度)=2px；angle(渐变角度)=135deg；hue(起始色相)=14deg；radius(圆角)=14px
- 无障碍降级：渐变描边是静态装饰，不需要降级；如果让它用 @property 角度动画流动，prefers-reduced-motion: reduce 下停掉动画，固定在起始角度的渐变。
- 提给 AI（中文）：给卡片做渐变描边（gradient border）：不要用 border-image，它不支持圆角。写成 border: 2px solid transparent，再叠两层背景——padding-box 一层实底盖住内部，border-box 一层 linear-gradient(135deg, hsl(14, 82%, 70%), hsl(104, 84%, 64%), hsl(194, 80%, 68%))，配 border-radius: 14px。再用 @property 注册一个角度变量，让描边 6s 线性无限慢慢转。
- Ask for it (English keywords): gradient border, border: 2px solid transparent, background: linear-gradient(...) padding-box, linear-gradient(135deg, hsl(14, 82%, 70%), hsl(104, 84%, 64%), hsl(194, 80%, 68%)) border-box, background-clip: padding-box / border-box, border-radius: 14px, @property registered angle, 6s linear infinite rotation, avoid border-image since it ignores border-radius
- 相关：glassmorphism, mesh-gradient, spotlight-glow
- 参考：[MDN · border-image](https://developer.mozilla.org/docs/Web/CSS/border-image) · [MDN · background-clip](https://developer.mozilla.org/docs/Web/CSS/background-clip) · [MDN · @property](https://developer.mozilla.org/docs/Web/CSS/@property)

<a id="aurora-gradient"></a>

### V-07 极光渐变 · Aurora Gradient

- 地址：https://publieople.github.io/design-museum/entry/aurora-gradient/
- 展厅：visual · 标签：css-only, gradient, filter-blend, paint-heavy, motion-heavy, stable · 形态：stage
- 一句话：几团彩色光斑在底色上慢慢游动，像极光一样铺满整屏。
- 别名：极光背景、流动渐变、光晕背景、aurora background、aurora gradient、animated gradient background
- 关键词：aurora gradient, animated gradient, radial-gradient, filter: blur(), mix-blend-mode: screen, transform: translate3d, hue-rotate(), saturate()
- 什么时候用：落地页、产品首屏的大背景，要氛围但不要具体图形 / 深色界面想要一块会呼吸的底色 / 发布页、活动页需要持续流动感，又不想用视频或图片
- 别搞混 · 网格渐变：网格渐变是多个径向渐变叠出来的静态柔光；极光是这些光团在位移（translate + blur + 饱和度），重点在「慢慢游动」。
- 别搞混 · 聚光卡片：聚光跟着指针走，是人给的反馈；极光自己漂，有没有人都一样。
- 坑：大面积模糊很贵：光斑要放在独立图层里用 transform 位移，别每帧改 background-position
- 坑：光斑 3–5 团就够，堆多了只会糊成一片，看不出「极光」
- 坑：动画要慢（一轮 20–40s），快了像故障闪烁
- 坑：深色底效果好；浅色底上要压低饱和度，否则显脏
- 坑：文字压在上面要留对比度兜底（暗罩或压到暗部），别让正文落在最亮的光上
- 坑：prefers-reduced-motion 下停住动画，静态渐变仍然好看
- 推荐取值：光斑数量=3–5 团；模糊半径=60–100px；一轮时长=20–40s；混合模式=mix-blend-mode: screen（深色底）；对比度=正文 ≥ 4.5:1，必要时加暗罩
- 控件默认值：blobs(光斑数量)=4；blur(模糊半径)=80px；duration(一轮时长)=30s；palette(配色)=aurora
- 无障碍降级：prefers-reduced-motion 下把光斑的位移动画停掉，保留静态渐变，氛围还在但不再动。
- 提给 AI（中文）：做一个极光渐变背景（aurora gradient）：深色底上放 4 团大的 radial-gradient 光斑（配色 aurora），每团 filter: blur(80px)、mix-blend-mode: screen，用 transform: translate3d 让它们以各自不同的速度慢慢漂移，一轮约 30s、linear 循环。光斑放独立图层，不要每帧改 background-position；正文压在上面时留暗罩保证对比度。prefers-reduced-motion 下停住动画，只留静态渐变。
- Ask for it (English keywords): aurora gradient background, 4 large radial-gradient blobs (aurora palette) on a dark base, each with filter: blur(80px) and mix-blend-mode: screen, drifting at slightly different speeds with transform: translate3d in a 30s linear loop, kept on their own layers instead of animating background-position, dark scrim behind body text for contrast, animation paused under prefers-reduced-motion
- 相关：mesh-gradient, spotlight-glow
- 参考：[MDN · radial-gradient()](https://developer.mozilla.org/docs/Web/CSS/gradient/radial-gradient) · [MDN · filter: blur()](https://developer.mozilla.org/docs/Web/CSS/filter-function/blur)

<a id="mask-fade"></a>

### V-08 边缘渐隐 · Mask Fade

- 地址：https://publieople.github.io/design-museum/entry/mask-fade/
- 展厅：visual · 标签：css-only, modern-css, gradient, paint-heavy, stable · 形态：stage
- 一句话：内容在边缘渐渐淡掉，暗示这一头还能继续滑。
- 别名：渐隐遮罩、边缘淡出、两端渐隐、mask fade、fade mask、gradient mask、edge fade
- 关键词：mask-image, -webkit-mask-image, linear-gradient mask, mask-composite, edge fade, fade mask, scroll hint, CSS masking
- 什么时候用：横向卡片列表、标签流的边缘，提示后面还有内容 / 固定高度的滚动区，顶部或底部用渐隐代替一条生硬的分割线 / 跑马灯、logo 墙的两端，让循环看不出接缝
- 别搞混 · overflow: hidden：overflow 是硬切，内容到边就断；mask 是淡出，边缘逐渐透明。想暗示「还能滑」用 mask，想干脆截断用 overflow。
- 别搞混 · 渐变色盖层：盖一层同色渐变只是「看起来像」，一旦底色不是纯色（图片、渐变、深色模式）就露馅；mask 直接改内容的可见性，跟底色无关。
- 坑：渐隐长度要够（约容器宽度的 8–15%），太短看起来像脏边
- 坑：旧版 Safari 需要 -webkit-mask-image 前缀，写两份最稳
- 坑：mask 会让被遮住的区域真的看不见，但那部分仍然可点击、可聚焦——不要用 mask 当「隐藏」
- 坑：mask 与 backdrop-filter 同时用在同一个元素上，某些 Chrome 版本会渲染异常（毛玻璃会被切断）
- 坑：纵向滚动区做上下渐隐时，滚到顶部/底部要淡出对应的那侧，否则永远是「下面还有」的错觉
- 坑：两端用同一条线性渐变对称处理，别只做一边
- 推荐取值：渐隐长度=容器宽/高的 8–15%，或 16–32px；写法=mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)；兼容=同时写 -webkit-mask-image；注意=别和 backdrop-filter 用在同一元素
- 控件默认值：fade(渐隐长度)=12%；axis(方向)=x；hardEdge(对照：硬切（不用 mask）)=false
- 无障碍降级：边缘渐隐本身是静态的，不需要降级；只有配合滚动的动态提示在 prefers-reduced-motion 下才改成静态可见。
- 提给 AI（中文）：给这个横向可滚动区域加边缘渐隐：linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)，同时写 -webkit-mask-image 兼容旧版 Safari，让内容在两端渐渐淡掉、暗示还能继续滑。渐隐长度占容器 12%，两端对称；注意 mask 会让被遮住的部分真的看不见（但仍然可以点击），也不要和 backdrop-filter 用在同一元素上。
- Ask for it (English keywords): fade the edges of this scrollable area with mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent) (plus -webkit-mask-image), so 12% of each end fades out and hints that there is more to scroll, applied symmetrically on both ends, not combined with backdrop-filter on the same element
- 相关：marquee, scroll-snap
- 参考：[MDN · mask-image](https://developer.mozilla.org/docs/Web/CSS/mask-image) · [MDN · CSS masking](https://developer.mozilla.org/docs/Web/CSS/CSS_masking)

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
- 别搞混 · 交错进场 stagger：stagger 作用在一组独立元素上（列表项、卡片），逐字显现是先把一句话拆成单字，再对这串字套用同样的错峰逻辑，而且要额外处理读屏。
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
