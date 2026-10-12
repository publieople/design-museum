/**
 * 自动生成，请勿手改：改了词条或 src/data/metaOf.ts 之后跑 npm run gen:meta。
 * 首屏只加载这份 meta；完整词条（spec/refs/related/reducedMotion/controls/prompt/en）
 * 留在 src/data/index.ts，只被详情页等懒加载路由引用。
 */
import type { EntryMeta } from './types'

export const ENTRY_META: EntryMeta[] = [
  {
    "slug": "stagger",
    "code": "M-01",
    "nameZh": "交错进场",
    "nameEn": "Stagger",
    "aliases": [
      "错峰动画",
      "依次出现",
      "级联出现",
      "逐条入场",
      "cascading entrance",
      "staggered animation"
    ],
    "category": "motion",
    "oneLiner": "一组元素不是同时出现，而是按顺序一个接一个进来。",
    "whenToUse": [
      "列表、卡片组、导航项首次出现时，想让视线按顺序扫过",
      "想让一组元素显得「有编排」而不是「啪一下全出来」",
      "页面初次加载，用一次统一的进场序列建立节奏"
    ],
    "confusions": [
      {
        "with": "延迟动画",
        "diff": "单个元素延迟进场只是「晚点出现」；交错进场的重点是项与项之间的固定间隔（stagger），读者能数出顺序。"
      },
      {
        "with": "逐个播放的轮播",
        "diff": "轮播会一直循环；交错进场通常只在首次出现时播放一次，之后不再重复。"
      }
    ],
    "pitfalls": [
      "间隔超过 120ms、元素又多，最后一项要等很久，页面像卡住",
      "列表很长时只给前 8–10 项加间隔，其余直接显示，否则总时长失控",
      "不要用 left/top/margin 做位移，用 transform + opacity，才不会触发重排",
      "进场动画属于非必要动效，prefers-reduced-motion 下要直接显示最终态"
    ],
    "keywords": [
      "stagger",
      "animation-delay",
      "transition-delay",
      "transform: translateY",
      "cascading entrance"
    ],
    "scenes": [
      "list",
      "page",
      "nav"
    ],
    "feel": [
      "crisp",
      "playful"
    ],
    "intent": [
      "hierarchy",
      "attention"
    ],
    "tags": [
      "css-only",
      "composited",
      "motion-heavy",
      "stable"
    ],
    "demo": {
      "shape": "stage"
    },
    "loop": "replay",
    "en": {
      "oneLiner": "A group of elements enters one after another on a fixed interval, not all at once."
    },
    "defaults": {
      "duration": 420,
      "stagger": 80,
      "distance": 16,
      "easing": "cubic-bezier(0.22, 1, 0.36, 1)"
    }
  },
  {
    "slug": "easing",
    "code": "M-02",
    "nameZh": "缓动曲线",
    "nameEn": "Easing",
    "aliases": [
      "缓动函数",
      "时间曲线",
      "速度曲线",
      "贝塞尔曲线",
      "timing function",
      "easing curve",
      "cubic-bezier"
    ],
    "category": "motion",
    "oneLiner": "决定动画快慢怎么分配：起步快还是收尾慢，全在这条曲线上。",
    "whenToUse": [
      "想让动画有「加速度」而不是全程匀速平移",
      "入场要收得干净（快进慢停），退场要果断（慢起快走）",
      "排一排按钮或卡片时，让动效的手感保持一致"
    ],
    "confusions": [
      {
        "with": "时长 duration",
        "diff": "时长只管「多久走完」，缓动曲线管「时间怎么分配」。两条时长相同的动画，换一条曲线，前 100ms 里走完的路程能差好几倍。"
      },
      {
        "with": "过渡 transition 本身",
        "diff": "transition 只是声明「哪个属性要动、动多久」；缓动是其中的 timing-function 参数。transition 写了 ease 不等于做了缓动，ease 只是默认曲线而已。"
      }
    ],
    "pitfalls": [
      "一整套界面全用默认 ease：什么都在慢慢爬，界面显得没精神",
      "cubic-bezier 的控制点超出 0–1 会冲出范围（也就是回弹），用得过量会像坏掉的弹簧",
      "给用户主动触发的操作调缓动，别把 ease-in 放在点击反馈上，起手慢会让人觉得卡",
      "缓动不改动画的物理路径，只改时间轴；位移、缩放交给 transform，别指望曲线解决布局抖动"
    ],
    "keywords": [
      "animation-timing-function",
      "cubic-bezier()",
      "transition-timing-function",
      "linear()",
      "steps()",
      "easing curve"
    ],
    "scenes": [
      "button",
      "card",
      "page"
    ],
    "feel": [
      "crisp",
      "playful"
    ],
    "intent": [
      "affordance",
      "hierarchy"
    ],
    "tags": [
      "css-only",
      "modern-css",
      "composited",
      "check-support"
    ],
    "demo": {
      "shape": "stage"
    },
    "loop": "continuous",
    "en": {
      "oneLiner": "How an animation spends its time: fast off the line or soft on arrival, all in one curve."
    },
    "defaults": {
      "duration": 900,
      "distance": 100,
      "delay": 300,
      "easing": "cubic-bezier(0.22, 1, 0.36, 1)"
    }
  },
  {
    "slug": "spring",
    "code": "M-03",
    "nameZh": "弹簧动画",
    "nameEn": "Spring Physics",
    "aliases": [
      "弹性动画",
      "回弹",
      "物理动画",
      "弹性缓动",
      "spring animation",
      "overshoot",
      "bouncy"
    ],
    "category": "motion",
    "oneLiner": "元素像挂了弹簧一样冲向目标：可能冲过头，再弹回来停住。",
    "whenToUse": [
      "拖拽松手、开关切换、卡片滑出，想让收尾自然而不是硬停",
      "想要一点「有性格」的反馈，但又不能拖慢操作",
      "弹出层、气泡、跟随手指的元素，需要「被拉住再放开」的手感"
    ],
    "confusions": [
      {
        "with": "回弹缓动 back-out",
        "diff": "回弹缓动是一条固定的三次贝塞尔曲线，只负责冲过头再回来；弹簧是「刚度 + 阻尼 + 质量」三个参数算出来的运动轨迹，冲几次、冲多远都能调。"
      },
      {
        "with": "兜底动画 keyframes",
        "diff": "关键帧是写死的路径，改速度就得重写一堆关键帧；弹簧是每次运行现算，被拖拽打断（中断后也说得通）也能接着算下去。"
      }
    ],
    "pitfalls": [
      "参数调软了（刚度低、阻尼小）会左右晃好几秒，用户只想点一下却要等它停下来",
      "弹簧靠不断重算数值驱动，别在每一帧里改 width/height 或触发 React 状态更新，用 transform 和 requestAnimationFrame 或动画库做",
      "不同库的参数互不通用：Framer Motion 的 stiffness/damping/mass 和 react-spring 的 tension/friction 量纲不一样，不能照抄数值",
      "prefers-reduced-motion 下要直接落到终点、删掉回弹，别让晕动的用户看它弹三下"
    ],
    "keywords": [
      "spring physics",
      "stiffness",
      "damping",
      "mass",
      "overshoot",
      "requestAnimationFrame",
      "linear() easing approximation"
    ],
    "scenes": [
      "button",
      "card",
      "page"
    ],
    "feel": [
      "playful",
      "soft"
    ],
    "intent": [
      "affordance",
      "attention"
    ],
    "tags": [
      "js",
      "modern-css",
      "composited",
      "main-thread",
      "motion-heavy",
      "stable"
    ],
    "demo": {
      "shape": "stage"
    },
    "loop": "replay",
    "en": {
      "oneLiner": "An element driven at its target like it is on a spring, overshooting and settling back."
    },
    "defaults": {
      "stiffness": 260,
      "damping": 18,
      "mass": 1
    }
  },
  {
    "slug": "scroll-reveal",
    "code": "M-04",
    "nameZh": "滚动揭示",
    "nameEn": "Scroll Reveal",
    "aliases": [
      "滚动出现",
      "滚动淡入",
      "进入视口出现",
      "滚动加载动画",
      "reveal on scroll",
      "fade in on scroll",
      "view enter"
    ],
    "category": "motion",
    "oneLiner": "内容滚进视口时才淡入上移，没滚到的先藏着。",
    "whenToUse": [
      "长落地页的分段内容，一次进来太多会显得糊成一片",
      "图文混排的营销页、案例列表，想让阅读节奏被一段段接上",
      "列表首屏之外的项目，滚到了再出现，首屏渲染更轻"
    ],
    "confusions": [
      {
        "with": "滚动驱动动画 scroll-driven",
        "diff": "滚动揭示是「进入视口触发一次」——元素自己动，触发后就把自己从观察列表里摘掉；滚动驱动动画是每一帧的进度都绑定滚动位置，往回滚还会倒着播。"
      },
      {
        "with": "懒加载 lazy loading",
        "diff": "懒加载省的是网络和图片解码，元素位置早就占好了；滚动揭示动的是 opacity 和 transform，内容本来就在页面里，只是先看不见。"
      }
    ],
    "pitfalls": [
      "触发一次之后要 unobserve 或断开观察器，否则来回滚动会反复淡入淡出",
      "IntersectionObserver 的 threshold 写成 1，短视口里的长元素永远达不到，永远不出现",
      "在滚动事件里直接读 scrollTop 会让布局反复重算，用 IntersectionObserver 或 requestAnimationFrame 节流",
      "元素先设成 opacity: 0 时确认内容仍在 DOM 里，别让禁用脚本或爬虫拿到一个空页面"
    ],
    "keywords": [
      "IntersectionObserver",
      "threshold",
      "rootMargin",
      "reveal on scroll",
      "fade in on scroll",
      "unobserve",
      "translateY + opacity"
    ],
    "scenes": [
      "scroll",
      "page",
      "list"
    ],
    "feel": [
      "calm",
      "soft"
    ],
    "intent": [
      "attention",
      "hierarchy"
    ],
    "tags": [
      "js",
      "browser-api",
      "scroll-linked",
      "composited",
      "motion-heavy",
      "stable"
    ],
    "demo": {
      "shape": "scroll",
      "thumb": "still"
    },
    "loop": "manual",
    "en": {
      "oneLiner": "Content fades in and slides up only once it scrolls into view; off-screen items stay hidden."
    },
    "defaults": {
      "distance": 24,
      "duration": 550,
      "threshold": 20,
      "delay": 60
    }
  },
  {
    "slug": "parallax",
    "code": "M-05",
    "nameZh": "视差滚动",
    "nameEn": "Parallax",
    "aliases": [
      "视差",
      "层叠滚动",
      "分层滚动",
      "视差效果",
      "parallax scrolling",
      "multi-layer scroll",
      "scroll depth"
    ],
    "category": "motion",
    "oneLiner": "滚动时前景和后景走不同速度，画面因此有了纵深。",
    "whenToUse": [
      "首屏头图想比正文走得慢一点，制造「往里走」的感觉",
      "多图层插画、品牌页、活动页，想用层次代替真 3D",
      "卡片列表滚过时让背景或图片轻微错位，增加质感"
    ],
    "confusions": [
      {
        "with": "fixed 背景",
        "diff": "background-attachment: fixed 是背景相对视口钉住不动，只有一层；视差是每一层用各自的 transform 速度移动，可以有三四层，而且能被 JS 控制。"
      },
      {
        "with": "滚动驱动动画 scroll-driven",
        "diff": "视差只管「位移随滚动线性变化」；滚动驱动动画可以把滚动进度映射到任意属性（旋转、缩放、颜色），还能用 animation-range 控制起止区间。"
      }
    ],
    "pitfalls": [
      "位移距离给太大会让人晕，前后景速度差控制在 20%–50% 就够，超过就没法读内容",
      "scroll 监听里直接读 scrollY 会抖动，用 requestAnimationFrame 节流或 CSS 的 animation-timeline: scroll()",
      "移动端和 prefers-reduced-motion 下最好直接关掉，iOS 的滚动回弹会让视差明显跳一下",
      "给它加 will-change: transform 只在动画期间加，常驻会一直占着合成层显存"
    ],
    "keywords": [
      "parallax scrolling",
      "transform: translate3d",
      "will-change: transform",
      "animation-timeline: scroll()",
      "background-attachment: fixed",
      "scroll-linked"
    ],
    "scenes": [
      "scroll",
      "page",
      "card"
    ],
    "feel": [
      "calm",
      "soft"
    ],
    "intent": [
      "attention",
      "hierarchy"
    ],
    "tags": [
      "js",
      "modern-css",
      "scroll-linked",
      "paint-heavy",
      "motion-heavy",
      "stable"
    ],
    "demo": {
      "shape": "scroll",
      "thumb": "still"
    },
    "loop": "manual",
    "en": {
      "oneLiner": "Foreground and background move at different speeds as you scroll, which gives the scene depth."
    },
    "defaults": {
      "speed": 0.45,
      "distance": 60,
      "reverse": false
    }
  },
  {
    "slug": "scroll-driven",
    "code": "M-06",
    "nameZh": "滚动驱动动画",
    "nameEn": "Scroll-Driven Animation",
    "aliases": [
      "滚动时间线",
      "滚动进度动画",
      "滚动联动动画",
      "scroll timeline",
      "scroll-driven animations",
      "animation-timeline"
    ],
    "category": "motion",
    "oneLiner": "滚动条就是进度条：滚到哪一帧由滚动位置决定。",
    "whenToUse": [
      "阅读进度条、章节指示条，天然就是「滚多少走多少」",
      "卡片滚进画面时同时旋转、放大、改变饱和度",
      "希望动画跟手指位置严格对应，来回滚也要能正反播"
    ],
    "confusions": [
      {
        "with": "滚动揭示 scroll reveal",
        "diff": "揭示是进视口触发一次就播完，之后和滚动位置无关；滚动驱动动画的每一帧都绑在滚动位置，同一个位置永远是同一帧，往回滚会倒着播。"
      },
      {
        "with": "用 scroll 事件写 JS 动画",
        "diff": "scroll 事件在合成线程之外触发，滚快了会掉帧；animation-timeline 由合成器驱动，不占主线程，但要现代浏览器（Chrome 115+）才支持。"
      }
    ],
    "pitfalls": [
      "animation-range 不写就用默认值，动画可能在元素刚露头时就播完，看着像没生效",
      "用 JS 在 scroll 事件里读 scrollTop 再写样式，每帧同步读写会掉帧，交给 CSS 或 rAF 节流",
      "animation-timeline 在 Safari 和 Firefox 上的支持还不完整，必须准备不用动画也能看的静态版本（本 demo 里有降级指示）",
      "进度条用 scaleX 做，别改 width，后者每帧都要重排"
    ],
    "keywords": [
      "animation-timeline",
      "scroll()",
      "view()",
      "animation-range",
      "scroll-driven animations",
      "scroll progress",
      "requestAnimationFrame fallback"
    ],
    "scenes": [
      "scroll",
      "page",
      "nav"
    ],
    "feel": [
      "crisp",
      "calm"
    ],
    "intent": [
      "attention",
      "affordance"
    ],
    "tags": [
      "modern-css",
      "scroll-linked",
      "composited",
      "motion-heavy",
      "check-support"
    ],
    "demo": {
      "shape": "scroll",
      "thumb": "still"
    },
    "loop": "manual",
    "en": {
      "oneLiner": "The scrollbar is the timeline: the scroll position decides exactly which frame is shown."
    },
    "defaults": {
      "rotate": 30,
      "range": 60,
      "duration": 600
    }
  },
  {
    "slug": "view-transitions",
    "code": "M-07",
    "nameZh": "视图过渡",
    "nameEn": "View Transitions",
    "aliases": [
      "页面转场",
      "跨页面过渡",
      "共享元素过渡",
      "view transition",
      "view-transition",
      "page transition"
    ],
    "category": "motion",
    "oneLiner": "页面切换时，浏览器把新旧两屏接起来，补出中间那一下过渡。",
    "whenToUse": [
      "列表点进详情：被点的那张卡片原地放大成详情页的头图",
      "同一个应用里换标签页或换主题，希望两屏连起来而不是硬切",
      "导航栏在多个页面里都一样，想让人看出它是同一个元素"
    ],
    "confusions": [
      {
        "with": "CSS transition",
        "diff": "CSS transition 只能让同一个元素自己变；视图过渡是浏览器给整屏拍新旧两张快照再做动画，所以能把旧界面里的某个元素平滑接到新界面的对应元素上。"
      },
      {
        "with": "入场动画",
        "diff": "入场动画是新页面自己在播，旧界面已经消失；视图过渡的动画发生在两屏之间，旧屏要一起参与，所以改 DOM 的那一步必须放进 startViewTransition 的回调里。"
      }
    ],
    "pitfalls": [
      "同一时刻 view-transition-name 必须唯一：列表里给每张卡片都写死一个名字会直接报错，要在点击时只给被点的那张临时加上",
      "改 DOM 的代码必须在 document.startViewTransition(() => …) 的回调里执行，写在回调外面拍到的还是旧界面",
      "过渡期间会有一层伪元素盖在页面上，指针事件被短暂挡住，别在过渡里做点击判断",
      "不支持这个 API 的浏览器要有兜底：直接切换即可，不要留一屏空白等过渡",
      "跨文档（多页应用）要写 @view-transition { navigation: auto }，而且必须同源"
    ],
    "keywords": [
      "View Transition API",
      "document.startViewTransition",
      "view-transition-name",
      "::view-transition-old",
      "::view-transition-new",
      "shared element transition",
      "cross-document view transition"
    ],
    "scenes": [
      "page",
      "card",
      "nav"
    ],
    "feel": [
      "crisp",
      "calm"
    ],
    "intent": [
      "hierarchy",
      "attention"
    ],
    "tags": [
      "browser-api",
      "js",
      "composited",
      "motion-heavy",
      "check-support"
    ],
    "demo": {
      "shape": "page",
      "minHeight": 320,
      "thumb": "still"
    },
    "loop": "manual",
    "en": {
      "oneLiner": "When the view changes, the browser stitches the old and new screens together and animates the gap between them."
    },
    "defaults": {
      "duration": 300,
      "easing": "cubic-bezier(0.22, 1, 0.36, 1)",
      "shared": true
    }
  },
  {
    "slug": "cursor-follower",
    "code": "M-08",
    "nameZh": "光标跟随",
    "nameEn": "Cursor Follower",
    "aliases": [
      "跟随鼠标",
      "指针跟随",
      "鼠标尾巴",
      "custom cursor",
      "cursor follower",
      "mouse follower",
      "pointer follower"
    ],
    "category": "motion",
    "oneLiner": "一个圆点慢半拍地跟在指针后面，把系统鼠标指针换掉。",
    "whenToUse": [
      "作品集、品牌页这类要「有手感」的页面，想让指针变成设计的一部分",
      "需要一个大一点的指针指示当前可交互区域（比如画布、画廊）",
      "配合聚光、磁吸这类指针驱动的效果，做统一的指针语言"
    ],
    "confusions": [
      {
        "with": "磁吸按钮",
        "diff": "磁吸按钮是按钮朝指针靠过来，指针本身不动；光标跟随是替代指针的位置，元素永远慢半拍追着指针跑。"
      },
      {
        "with": "光标拖尾",
        "diff": "拖尾会在后面留一串残影（几十个点或一条流线）；跟随只有一到两个点，重点是「滞后感」而不是「痕迹」。"
      }
    ],
    "pitfalls": [
      "把系统光标藏了，就必须保证键盘用户还能看清焦点：:focus-visible 的样式不能省",
      "pointermove 里每帧 setState 会掉帧，用 requestAnimationFrame 或直接改元素的 transform",
      "跟随元素要 pointer-events: none，否则它会挡住底下的点击",
      "触屏没有指针，要在触屏或粗指针设备上直接关掉跟随",
      "指针移出窗口时要归位或淡出，别让圆点卡在角落不动"
    ],
    "keywords": [
      "cursor follower",
      "custom cursor",
      "pointermove",
      "transform: translate3d",
      "requestAnimationFrame",
      "mix-blend-mode: difference",
      "pointer-events: none",
      "cursor: none"
    ],
    "scenes": [
      "page",
      "button",
      "card"
    ],
    "feel": [
      "playful",
      "crisp"
    ],
    "intent": [
      "attention",
      "affordance"
    ],
    "tags": [
      "js",
      "browser-api",
      "composited",
      "main-thread",
      "pointer-dependent"
    ],
    "demo": {
      "shape": "interactive",
      "minHeight": 320,
      "thumb": "still"
    },
    "loop": "manual",
    "en": {
      "oneLiner": "A dot trails the pointer with a slight delay, replacing the system cursor."
    },
    "defaults": {
      "lag": 90,
      "size": 20,
      "blend": "difference",
      "hideNative": true
    }
  },
  {
    "slug": "hover-lift",
    "code": "F-01",
    "nameZh": "悬停抬升",
    "nameEn": "Hover Lift",
    "aliases": [
      "悬停浮起",
      "鼠标移上去抬起来",
      "卡片上浮",
      "hover 抬高",
      "hover lift",
      "card hover elevation"
    ],
    "category": "feedback",
    "oneLiner": "指针移到卡片上，它轻轻上浮、阴影变大，暗示这块可以点。",
    "whenToUse": [
      "可点击的卡片、商品卡、文章列表项，需要让指针的位置得到回应",
      "一排并列的卡片里，想突出当前指到的那一张",
      "按钮或图标已经够清楚，只差一点「它活着」的暗示"
    ],
    "confusions": [
      {
        "with": "按压反馈（press feedback）",
        "diff": "悬停抬升是指针停留在上面期间持续存在的状态，用 :hover；按压反馈是按下和松开那一瞬的反馈，用 :active。两者经常叠着用，但触发时机完全不同。"
      },
      {
        "with": "滚动视差（parallax）",
        "diff": "悬停抬升只由指针驱动，鼠标进出才动；视差由滚动驱动，鼠标不动、只滚页面它也会移动。"
      }
    ],
    "pitfalls": [
      "只加位移不加阴影，元素会像一张贴纸飘起来，没有重量感；位移和阴影要一起变",
      "触摸设备没有 hover，点完 :hover 可能粘住不消失，所以静止态本身必须完整可读",
      "位移超过 8px 会显得轻浮、像在跳，2–6px 通常刚好",
      "用 top 或 margin 做位移会触发重排，要用 transform: translateY()；也不要改 width/height"
    ],
    "keywords": [
      "transform: translateY",
      "box-shadow",
      "transition",
      ":hover",
      "elevation",
      "will-change: transform"
    ],
    "scenes": [
      "card",
      "list",
      "button"
    ],
    "feel": [
      "soft",
      "crisp"
    ],
    "intent": [
      "affordance",
      "attention"
    ],
    "tags": [
      "css-only",
      "composited",
      "pointer-dependent",
      "stable"
    ],
    "demo": {
      "shape": "stage"
    },
    "loop": "manual",
    "en": {
      "oneLiner": "When the pointer moves onto a card, it rises slightly and the shadow deepens, hinting that it is clickable."
    },
    "defaults": {
      "lift": 6,
      "duration": 200,
      "shadow": 45,
      "easing": "cubic-bezier(0.22, 1, 0.36, 1)"
    }
  },
  {
    "slug": "press-feedback",
    "code": "F-02",
    "nameZh": "按压反馈",
    "nameEn": "Press Feedback",
    "aliases": [
      "按下缩放",
      "点击回弹",
      "按压态",
      "按下反馈",
      "button press effect",
      "active state scale"
    ],
    "category": "feedback",
    "oneLiner": "手指按下的瞬间按钮缩小、变暗，松开立刻弹回，确认这一下点到了。",
    "whenToUse": [
      "按钮、图标按钮需要即时确认，别让人怀疑刚才点没点到",
      "提交类按钮想减少连点，先用按下反馈把动作锁住一下",
      "移动端点击区域小，用触感替代的视觉反馈补足"
    ],
    "confusions": [
      {
        "with": "悬停抬升（hover lift）",
        "diff": "悬停是移入之后一直保持的状态，用 :hover；按压只在按住那一瞬出现、松开就结束，用 :active。按住不放时两者会同时成立。"
      },
      {
        "with": "加载状态（loading）",
        "diff": "按压反馈是几十毫秒内的即时回应，请求还没发出去；loading 要持续到请求返回。正确的顺序是先按压、再 loading，而不是同时出现。"
      }
    ],
    "pitfalls": [
      ":active 只在按住期间生效；键盘用空格或回车触发的是 click，不会走 :active，别把按压态当成键盘反馈",
      "iOS Safari 上 :active 需要元素可交互才会稳定触发，给按钮加 touch 事件监听或 cursor: pointer 更保险",
      "用 width/height 缩小会重排，要用 transform: scale()",
      "回弹过冲太大（明显超过 1.0）会显得廉价，回到 1.0 附近就够"
    ],
    "keywords": [
      ":active",
      "transform: scale()",
      "transition",
      "touch-action",
      "press state",
      ":focus-visible"
    ],
    "scenes": [
      "button",
      "form",
      "nav"
    ],
    "feel": [
      "crisp",
      "playful"
    ],
    "intent": [
      "affordance",
      "attention"
    ],
    "tags": [
      "css-only",
      "composited",
      "keyboard-operable",
      "stable"
    ],
    "demo": {
      "shape": "stage"
    },
    "loop": "manual",
    "en": {
      "oneLiner": "The moment a finger presses down the button shrinks and darkens, then snaps back on release to confirm the tap."
    },
    "defaults": {
      "scale": 0.96,
      "duration": 110,
      "spring": true
    }
  },
  {
    "slug": "magnetic-button",
    "code": "F-03",
    "nameZh": "磁吸按钮",
    "nameEn": "Magnetic Button",
    "aliases": [
      "磁力按钮",
      "跟随鼠标的按钮",
      "吸附光标",
      "magnetic hover",
      "cursor-following button",
      "magnetic pull"
    ],
    "category": "feedback",
    "oneLiner": "指针靠近时按钮被吸过去一点点，移开又弹回原位。",
    "whenToUse": [
      "首屏主 CTA 想抓一下注意力，又不适合做大动效",
      "按钮数量很少的展示页或作品集，允许一个有个性的主操作",
      "想暗示「这个按钮在等你」，让指针和它产生关系"
    ],
    "confusions": [
      {
        "with": "悬停抬升（hover lift）",
        "diff": "抬升的方向是固定的，永远垂直向上；磁吸会朝指针方向做二维偏移，指针在左下方就往左下方走。"
      },
      {
        "with": "指针视差（pointer parallax）",
        "diff": "视差是整个容器跟着指针大范围移动，几十像素起步；磁吸只在按钮附近的小范围内移动几像素到十几像素。"
      }
    ],
    "pitfalls": [
      "触发半径开太大（超过按钮尺寸两倍）会满屏乱飘，1–1.5 倍按钮宽高就够",
      "位移不设上限会让按钮躲开指针、点不中，最多 6–16px",
      "每次 pointermove 都 setState 会掉帧，用 requestAnimationFrame 节流，或直接改 CSS 变量和 element.style",
      "触摸设备没有指针悬停，要直接给静止态；算中心点用 getBoundingClientRect，别忘了页面滚动的影响"
    ],
    "keywords": [
      "pointermove",
      "transform: translate3d",
      "getBoundingClientRect",
      "CSS custom property",
      "requestAnimationFrame",
      "magnetic hover"
    ],
    "scenes": [
      "button",
      "nav",
      "page"
    ],
    "feel": [
      "playful",
      "crisp"
    ],
    "intent": [
      "attention",
      "affordance"
    ],
    "tags": [
      "js",
      "browser-api",
      "main-thread",
      "pointer-dependent",
      "stable"
    ],
    "demo": {
      "shape": "interactive",
      "thumb": "still"
    },
    "loop": "manual",
    "en": {
      "oneLiner": "The button drifts a little toward the pointer as it approaches, then springs back to its resting spot."
    },
    "defaults": {
      "strength": 0.3,
      "maxDistance": 12,
      "radius": 1.6,
      "duration": 350
    }
  },
  {
    "slug": "skeleton-shimmer",
    "code": "F-04",
    "nameZh": "骨架屏微光",
    "nameEn": "Skeleton Shimmer",
    "aliases": [
      "骨架屏",
      "微光扫过",
      "加载占位",
      "shimmer loading",
      "skeleton screen",
      "content placeholder"
    ],
    "category": "feedback",
    "oneLiner": "灰色占位块上有一道亮光反复扫过，表示内容还在加载。",
    "whenToUse": [
      "列表或卡片的数据还没到，先用占位块把布局占住",
      "图片加载前的占位，避免内容一到位整页跳动",
      "想比转圈更明确地预告「这里马上会出现什么」"
    ],
    "confusions": [
      {
        "with": "转圈 loading（spinner）",
        "diff": "spinner 不透露内容形状，只表示忙；骨架屏按最终布局摆好占位块，内容换了位置也不跳。"
      },
      {
        "with": "进度条（progress bar）",
        "diff": "进度条表示可量化的进度（比如 30%）；骨架屏表示时长未知的等待，只能靠反复扫光暗示还在动。"
      }
    ],
    "pitfalls": [
      "扫光用 background-position 或 width 动画会不停重绘，用覆盖层做 transform: translateX 更省",
      "骨架停留超过 5–8 秒还没内容，用户会以为坏了，要有超时文案或兜底",
      "骨架的圆角、间距、行数和真实内容差太远，内容一进来整页会跳",
      "高光带太宽或对比太强会很吵，宽度取容器的 20%–40%，多条骨架共用同一个 animation 保持同步"
    ],
    "keywords": [
      "skeleton screen",
      "@keyframes shimmer",
      "linear-gradient",
      "transform: translateX",
      "content placeholder",
      "CLS"
    ],
    "scenes": [
      "list",
      "card",
      "page"
    ],
    "feel": [
      "calm",
      "soft"
    ],
    "intent": [
      "waiting"
    ],
    "tags": [
      "css-only",
      "gradient",
      "paint-heavy",
      "motion-heavy",
      "stable"
    ],
    "demo": {
      "shape": "stage"
    },
    "loop": "continuous",
    "en": {
      "oneLiner": "A grey placeholder block with a light band sweeping across it, showing that the content is still loading."
    },
    "defaults": {
      "duration": 1400,
      "highlight": 32,
      "rows": 3
    }
  },
  {
    "slug": "optimistic-ui",
    "code": "F-05",
    "nameZh": "乐观更新",
    "nameEn": "Optimistic UI",
    "aliases": [
      "乐观更新",
      "先改后存",
      "点了立刻变",
      "optimistic update",
      "rollback on failure",
      "immediate UI"
    ],
    "category": "feedback",
    "oneLiner": "点下去界面立刻变成成功的样子，请求在后台跑，失败了再退回去。",
    "whenToUse": [
      "点赞、收藏、关注这类高频、低风险、可重复的操作",
      "发送消息或评论，希望它立刻出现在列表里，而不是等服务器回声",
      "网络慢的时候想减少等待感，把结果先摆出来"
    ],
    "confusions": [
      {
        "with": "加载中（loading / disabled）",
        "diff": "loading 明确说「正在提交，先等一下」，还会把按钮锁住；乐观更新反过来，先显示结果、把等待藏起来，只在失败时才提示并回滚。"
      },
      {
        "with": "本地缓存（local cache）",
        "diff": "乐观更新只改当前这一次的界面状态，刷新就没了；缓存是真正存下来的数据，下次打开还在。"
      }
    ],
    "pitfalls": [
      "支付、下单、删除账号这类不能重放的操作不能乐观，必须等服务器确认",
      "失败必须回滚并给出提示（toast 或内联错误），只回滚不提示，用户会以为自己成功了",
      "快速连点会产生竞态，给请求编号或声明「最后一次为准」，别让旧响应覆盖新状态",
      "回滚要按 id 定位那一条，不要按数组下标，否则列表并发更新时会改错行"
    ],
    "keywords": [
      "optimistic UI",
      "rollback",
      "useOptimistic",
      "race condition",
      "pending state",
      "reconcile"
    ],
    "scenes": [
      "list",
      "button",
      "form"
    ],
    "feel": [
      "crisp",
      "calm"
    ],
    "intent": [
      "affordance",
      "waiting"
    ],
    "tags": [
      "js",
      "stateful",
      "keyboard-operable",
      "stable"
    ],
    "demo": {
      "shape": "stage"
    },
    "loop": "manual",
    "en": {
      "oneLiner": "The UI flips to the success state the moment you click, while the request runs and rolls back on failure."
    },
    "defaults": {
      "latency": 1200,
      "failureRate": 30,
      "optimistic": true
    }
  },
  {
    "slug": "toast",
    "code": "F-06",
    "nameZh": "轻提示",
    "nameEn": "Toast",
    "aliases": [
      "轻提示",
      "消息提示条",
      "浮层提示",
      "自动消失的提示",
      "toast notification",
      "snackbar"
    ],
    "category": "feedback",
    "oneLiner": "一条短消息从屏幕边缘滑进来，几秒后自己消失，不打断当前操作。",
    "whenToUse": [
      "一次操作成功或失败，给一句话的确认，不用用户做决定",
      "配合撤销（undo），比如「已删除 · 撤销」",
      "后台任务完成时提醒一下，用户当时可能在别处"
    ],
    "confusions": [
      {
        "with": "模态弹窗（modal）",
        "diff": "modal 挡住页面、必须处理才能继续；toast 不阻塞、会自动消失，所以不能把必须被看到的严重错误只放进 toast。"
      },
      {
        "with": "字段内联校验",
        "diff": "表单错误要贴在出错字段旁边并保持可见，直到用户改对；toast 在角落且会消失，不适合报字段级错误。"
      }
    ],
    "pitfalls": [
      "自动消失的提示不能用 aria-live=\"assertive\"，会打断读屏；用 role=\"status\" 或 aria-live=\"polite\"",
      "停留时间少于 3 秒读不完，超过 6 秒又挡视线，3–5 秒比较合适",
      "多条 toast 要堆叠并限制数量（最多 3–4 条），否则会铺满屏幕",
      "不能只靠颜色区分成功和失败，要有图标或文案；也不能让 toast 成为唯一的信息来源"
    ],
    "keywords": [
      "toast",
      "snackbar",
      "aria-live",
      "role=\"status\"",
      "auto-dismiss",
      "transform: translateY"
    ],
    "scenes": [
      "button",
      "form",
      "page"
    ],
    "feel": [
      "calm",
      "soft"
    ],
    "intent": [
      "waiting",
      "affordance"
    ],
    "tags": [
      "js",
      "stateful",
      "composited",
      "stable"
    ],
    "demo": {
      "shape": "stage"
    },
    "loop": "manual",
    "en": {
      "oneLiner": "A short message slides in from the screen edge and dismisses itself after a few seconds, without blocking."
    },
    "defaults": {
      "duration": 3000,
      "position": "bottom",
      "distance": 12
    }
  },
  {
    "slug": "ripple",
    "code": "F-07",
    "nameZh": "涟漪反馈",
    "nameEn": "Ripple",
    "aliases": [
      "水波纹",
      "点击涟漪",
      "波纹扩散",
      "ripple effect",
      "material ripple",
      "touch ripple"
    ],
    "category": "feedback",
    "oneLiner": "点下去的地方荡开一圈水波，告诉用户这一下收到了。",
    "whenToUse": [
      "按钮、列表项、开关这类要明确「点到了」的控件",
      "触屏上没有 hover，需要让人看出这一下点在哪、有没有生效",
      "整套界面想要统一的点击反馈语言（Material 风格的基础件）"
    ],
    "confusions": [
      {
        "with": "按压反馈",
        "diff": "按压反馈让整个控件缩放或变暗，是「整体」的状态；涟漪从落点扩散，能看出点在哪一下，两者经常叠在一起用。"
      },
      {
        "with": "进度条",
        "diff": "涟漪只是「按下收到了」，不表示进度；别让它一直扩下去或循环，否则用户会以为在加载。"
      }
    ],
    "pitfalls": [
      "波纹用 transform: scale() + opacity 扩散，别去改 width/height，否则每一帧都要重排",
      "每个波纹节点动画结束就要移除，手指长按会连着生成，不管就会堆出上百个节点",
      "要按落点扩散就得用 pointerdown 的坐标减去元素盒子的位置，写死从中心扩散会丢掉「点在哪」的信息",
      "控件要 overflow: hidden 才裁得出边界，否则波纹会溢出到外面",
      "键盘 Enter/Space 触发时没有坐标，退化成从中心扩散，别让它什么都不发生",
      "prefers-reduced-motion 下改成一个短促的底色变化，功能不变"
    ],
    "keywords": [
      "ripple effect",
      "Material ripple",
      "pointerdown",
      "radial-gradient",
      "transform: scale()",
      "overflow: hidden",
      "animation-play-state",
      "::after"
    ],
    "scenes": [
      "button",
      "list",
      "card"
    ],
    "feel": [
      "crisp",
      "playful"
    ],
    "intent": [
      "affordance",
      "attention"
    ],
    "tags": [
      "js",
      "gradient",
      "composited",
      "keyboard-operable",
      "stable"
    ],
    "demo": {
      "shape": "stage"
    },
    "loop": "replay",
    "en": {
      "oneLiner": "A ripple spreads from where you pressed, confirming that the tap registered."
    },
    "defaults": {
      "duration": 450,
      "opacity": 30,
      "fromPoint": true
    }
  },
  {
    "slug": "command-palette",
    "code": "F-08",
    "nameZh": "命令面板",
    "nameEn": "Command Palette",
    "aliases": [
      "命令面板",
      "快捷搜索框",
      "⌘K 面板",
      "command palette",
      "command menu",
      "quick switcher",
      "spotlight search"
    ],
    "category": "feedback",
    "oneLiner": "按一个快捷键弹出一个搜索框，敲几个字就能跳到任何功能。",
    "whenToUse": [
      "功能多到侧栏或顶部导航塞不下的后台、编辑器、工具型产品",
      "想让熟练用户完全不离开键盘就能跳转（⌘K / Ctrl+K）",
      "需要把「命令」和「跳转」放在同一个入口里检索"
    ],
    "confusions": [
      {
        "with": "搜索框",
        "diff": "搜索框在页面里占位置、搜的是内容；命令面板是浮层、搜的是动作与位置，选中就直接执行或跳转，还会把快捷键写在行尾。"
      },
      {
        "with": "下拉选择",
        "diff": "下拉选择是「从有限选项里挑一个」；命令面板的结果是动态过滤出来的，而且键盘导航（上下键选中、回车确认、Esc 关闭）是它的核心而不是附加功能。"
      }
    ],
    "pitfalls": [
      "键盘导航不能省：上下键移动、回车确认、Esc 关闭，否则命令面板就只是个搜索框",
      "打开时立刻把焦点放进输入框，关闭后要把焦点还给触发它的按钮，不然键盘用户会迷路",
      "结果列表要限制条数（8–12 条）并高亮当前项，用 aria-activedescendant 或 aria-selected 标出来",
      "⌘K / Ctrl+K 要自己监听 keydown（preventDefault，别让浏览器抢走），忘记绑定就会出现「快捷键没反应」",
      "浮层要用 z-index 与位置锚定拿住层级，别让页面里的 sticky 元素盖在上面",
      "prefers-reduced-motion 下关掉进出场缩放，只做透明度切换"
    ],
    "keywords": [
      "command palette",
      "command menu",
      "role=\"listbox\"",
      "aria-activedescendant",
      "meta+k",
      "fuzzy filter",
      "focus trap",
      "z-index overlay"
    ],
    "scenes": [
      "nav",
      "page",
      "form"
    ],
    "feel": [
      "crisp",
      "calm"
    ],
    "intent": [
      "affordance",
      "hierarchy"
    ],
    "tags": [
      "js",
      "stateful",
      "layout-triggering",
      "keyboard-operable",
      "stable"
    ],
    "demo": {
      "shape": "interactive",
      "minHeight": 320,
      "thumb": "still"
    },
    "loop": "manual",
    "en": {
      "oneLiner": "One shortcut opens a search box where a few keystrokes reach any command."
    },
    "defaults": {
      "results": 6,
      "withShortcut": true,
      "fuzzy": true
    }
  },
  {
    "slug": "sticky-header",
    "code": "L-01",
    "nameZh": "粘性头部",
    "nameEn": "Sticky Header",
    "aliases": [
      "吸顶导航",
      "固定顶栏",
      "滚动吸顶",
      "sticky nav",
      "fixed header",
      "hide on scroll"
    ],
    "category": "layout",
    "oneLiner": "页面滚动时头部留在顶部，常配合「下滑隐藏、上滑出现」。",
    "whenToUse": [
      "长页面里希望导航和主要操作始终可用",
      "需要随时让用户看到购物车、搜索或当前章节",
      "内容很长又不想一直占着一条顶栏时，用下滑隐藏换回阅读空间"
    ],
    "confusions": [
      {
        "with": "固定定位 fixed",
        "diff": "position: fixed 的元素脱离文档流，需要手动给下方内容补 padding；position: sticky 仍占位，滚到阈值才吸附，父容器一结束就跟着离开。"
      },
      {
        "with": "悬浮按钮",
        "diff": "悬浮按钮一直在同一个位置，和滚动无关；粘性头部是「先跟着文档走，到阈值才停住」。"
      }
    ],
    "pitfalls": [
      "父级任意一层有 overflow: hidden/auto，sticky 就会失效或只在那个容器里吸附",
      "sticky 元素必须有 top（或 bottom）值，否则不会吸附",
      "下滑隐藏要设阈值，刚滚一两个像素就藏起来会显得页面在抖",
      "隐藏用的是 transform: translateY(-100%)，不要用 display: none，否则没有动画"
    ],
    "keywords": [
      "position: sticky",
      "scroll direction",
      "hide on scroll down",
      "sticky nav",
      "will-change: transform"
    ],
    "scenes": [
      "nav",
      "page",
      "scroll"
    ],
    "feel": [
      "calm",
      "crisp"
    ],
    "intent": [
      "affordance"
    ],
    "tags": [
      "js",
      "scroll-linked",
      "composited",
      "stable"
    ],
    "demo": {
      "shape": "scroll",
      "thumb": "still"
    },
    "loop": "manual",
    "en": {
      "oneLiner": "A page header that stays pinned on scroll and often hides on the way down."
    },
    "defaults": {
      "threshold": 60,
      "hide": true,
      "blur": 8
    }
  },
  {
    "slug": "sticky-stack",
    "code": "L-02",
    "nameZh": "粘性堆叠卡片",
    "nameEn": "Sticky Stacking Cards",
    "aliases": [
      "卡片堆叠",
      "叠卡片",
      "滚动叠卡",
      "sticky stacking cards",
      "stacking cards",
      "card stack on scroll"
    ],
    "category": "layout",
    "oneLiner": "滚动时后面的卡片一张张压上来，前一张缩小留在底下。",
    "whenToUse": [
      "教程、步骤、结账流程：一张卡讲一件事，滚完一张再翻下一张",
      "长页面里想做出「一摞卡片」的实感，而不是一条平铺的列表",
      "卡片需要依次进入视野，同时把上一张留在原位当上下文"
    ],
    "confusions": [
      {
        "with": "粘性头部",
        "diff": "粘性头部只有一条栏吸附在顶部；粘性堆叠是一叠卡片共用同一个吸附位置，后滚上来的那张盖住先来的那张。"
      },
      {
        "with": "轮播 carousel",
        "diff": "轮播会自己定时切页、靠左右方向推进；粘性堆叠完全由页面上下滚动驱动，不动手就不换。"
      },
      {
        "with": "视差 parallax",
        "diff": "视差是各层以不同速度移动，元素之间并不会停住；堆叠卡片会真的吸附在固定位置并互相覆盖。"
      }
    ],
    "pitfalls": [
      "每张卡片都要有各自的 top（第 i 张用 i × 露头高度），全给 0 就变成严丝合缝的一摞，看不出层数",
      "后面的卡片 z-index 必须比前面的高，否则新卡片会被旧卡片盖住",
      "滚动容器自己可以有 overflow: auto，但它的任意一层祖先带了 overflow: hidden，sticky 就失效",
      "用 transform: scale() 压小已堆叠的卡片时，缩放原点设 top center，否则底部会露出下一张的边",
      "卡片总高度要明显超过滚动容器，内容不够长就没有可滚的余量，堆叠也演不出来"
    ],
    "keywords": [
      "position: sticky",
      "stacking cards",
      "z-index",
      "transform: scale()",
      "sticky offset",
      "scroll container"
    ],
    "scenes": [
      "scroll",
      "page",
      "card"
    ],
    "feel": [
      "calm",
      "crisp"
    ],
    "intent": [
      "hierarchy",
      "attention"
    ],
    "tags": [
      "css-only",
      "scroll-linked",
      "composited",
      "motion-heavy",
      "stable"
    ],
    "demo": {
      "shape": "scroll",
      "thumb": "still"
    },
    "loop": "manual",
    "en": {
      "oneLiner": "Cards scroll up one by one and stack on top of each other as the earlier ones shrink behind."
    },
    "defaults": {
      "offset": 18,
      "count": 6,
      "shrink": 5,
      "radius": 14
    }
  },
  {
    "slug": "masonry",
    "code": "L-03",
    "nameZh": "瀑布流",
    "nameEn": "Masonry",
    "aliases": [
      "瀑布流布局",
      "瀑布流排版",
      "长短卡片错落",
      "masonry layout",
      "pinterest layout",
      "waterfall layout"
    ],
    "category": "layout",
    "oneLiner": "卡片高度不齐，自动落进最短的那一列，底部不留大洞。",
    "whenToUse": [
      "图片墙、作品集、商品流，每个条目高度参差不齐",
      "想在一屏里多塞几条内容，又不想把每张图都裁成同一高度",
      "信息流按列填充比按行排列更省竖向空间"
    ],
    "confusions": [
      {
        "with": "普通网格 grid",
        "diff": "grid 的行是所有列共享的，同一行的卡片从同一条水平线开始，矮卡片下方留空；瀑布流每列各自堆叠，下一张紧接上一张下面，列与列之间不共享行线。"
      },
      {
        "with": "等高等宽卡片墙",
        "diff": "那种是规则网格，看上去整整齐齐；瀑布流的看点恰恰是高度参差、按列填充。"
      }
    ],
    "pitfalls": [
      "CSS 多列（column-count）是列优先填充：内容先填满第一列再进第二列，做无限滚动时新内容会全挤在最后一列，需要改成用 JS 每次插入当前最短的那一列",
      "多列布局里每个条目要写 break-inside: avoid，否则卡片会被从中间劈开、跨到下一列去",
      "不要为了对齐给卡片固定高度，那样就退化成普通网格了",
      "列数只在断点处切换，不要跟着容器宽度实时变，否则拖动窗口时卡片会来回跳"
    ],
    "keywords": [
      "CSS multi-column",
      "column-count",
      "break-inside: avoid",
      "masonry layout",
      "shortest column",
      "grid-auto-rows"
    ],
    "scenes": [
      "list",
      "card",
      "page"
    ],
    "feel": [
      "calm",
      "soft"
    ],
    "intent": [
      "hierarchy",
      "attention"
    ],
    "tags": [
      "css-only",
      "stable"
    ],
    "demo": {
      "shape": "stage"
    },
    "loop": "manual",
    "en": {
      "oneLiner": "Cards of uneven height drop into the shortest column, so no large gaps open at the bottom."
    },
    "defaults": {
      "columns": 3,
      "gap": 10,
      "base": 64,
      "mode": "masonry"
    }
  },
  {
    "slug": "bento-grid",
    "code": "L-04",
    "nameZh": "Bento 网格",
    "nameEn": "Bento Grid",
    "aliases": [
      "便当盒布局",
      "便当网格",
      "大小格拼贴",
      "bento layout",
      "bento box grid",
      "feature grid"
    ],
    "category": "layout",
    "oneLiner": "大小不一的方块拼成一整块，边线对齐，主次一眼分得清。",
    "whenToUse": [
      "首页或仪表盘，几块功能有大小之分，想用版式直接排出主次",
      "一屏里同时要塞下一张主图、几个指标和若干快捷入口",
      "产品介绍页用一块拼贴代替一长串等大的卡片列表"
    ],
    "confusions": [
      {
        "with": "瀑布流",
        "diff": "瀑布流每列各自独立、卡片高度随便，列与列不共享行线；bento 网格有统一的行高和列线，每块只是跨几格，所有边缘必须对齐。"
      },
      {
        "with": "等分网格",
        "diff": "等分网格每块一样大，没有主次；bento 靠 2×2、2×1 这类跨格把视觉重量拉开。"
      }
    ],
    "pitfalls": [
      "跨格数量要和列数匹配：4 列的网格里放 span 3 会留出一条尴尬的空边，改列数时跨格要跟着重算",
      "所有格子一样大就退化成普通网格，bento 的看点就是有大有小",
      "自动排布默认不回头填空洞（grid-auto-flow: row），想要紧凑可以设 dense，但那会打乱视觉顺序",
      "行高写死后，格子里文字一多就溢出，宁可加行高也别裁字"
    ],
    "keywords": [
      "CSS grid",
      "grid-column: span",
      "grid-row: span",
      "grid-auto-rows",
      "grid-template-areas",
      "dashboard layout"
    ],
    "scenes": [
      "page",
      "card"
    ],
    "feel": [
      "crisp",
      "calm"
    ],
    "intent": [
      "hierarchy",
      "attention"
    ],
    "tags": [
      "css-only",
      "stable"
    ],
    "demo": {
      "shape": "stage"
    },
    "loop": "manual",
    "en": {
      "oneLiner": "Tiles of different sizes lock into one block with aligned edges, so the hierarchy reads at a glance."
    },
    "defaults": {
      "columns": 4,
      "gap": 8,
      "rowHeight": 46,
      "radius": 14
    }
  },
  {
    "slug": "scroll-snap",
    "code": "L-05",
    "nameZh": "滚动捕捉",
    "nameEn": "Scroll Snap",
    "aliases": [
      "滚动吸附",
      "滑动吸附",
      "对齐滚动",
      "scroll snapping",
      "snap scrolling",
      "scroll-snap-type"
    ],
    "category": "layout",
    "oneLiner": "滚动停下来时自动对齐到某一张卡片，不会卡在半路上。",
    "whenToUse": [
      "横向轮播、图片画廊，每次滑一张",
      "全屏分页的落地页，一屏一段内容",
      "移动端的步骤条、日期选择器、卡片选择器，要「滑到哪个就是哪个」"
    ],
    "confusions": [
      {
        "with": "轮播 carousel",
        "diff": "轮播用 JS 定时切页，用户只能点箭头；scroll-snap 用的是原生滚动容器，惯性、拖动、触控板、键盘全都交给浏览器，代码只规定「停在哪」。"
      },
      {
        "with": "scroll-behavior: smooth",
        "diff": "smooth 管的是「跳转过程怎么滑过去」；snap 管的是「滑完最终停在哪里」，两者互不替代。"
      }
    ],
    "pitfalls": [
      "scroll-snap-type 要写在滚动容器上，scroll-snap-align 写在子项上，写反了完全没反应",
      "容器必须有确定的尺寸和 overflow，内容比容器还短就没有可滚动的余量，自然也谈不上吸附",
      "mandatory 用在内容高于视口的纵向区域会「锁屏」，用户滚不到底部，长内容要用 proximity",
      "子项比容器还大时，align: start 会让尾部内容永远露不出来",
      "吸附位置的内边距靠容器的 scroll-padding，给子项加 margin 不算数"
    ],
    "keywords": [
      "scroll-snap-type",
      "scroll-snap-align",
      "scroll-snap-stop",
      "scroll-padding",
      "overscroll-behavior",
      "mandatory vs proximity"
    ],
    "scenes": [
      "scroll",
      "nav",
      "card"
    ],
    "feel": [
      "crisp",
      "calm"
    ],
    "intent": [
      "affordance",
      "hierarchy"
    ],
    "tags": [
      "css-only",
      "scroll-linked",
      "stable"
    ],
    "demo": {
      "shape": "scroll",
      "thumb": "still"
    },
    "loop": "manual",
    "en": {
      "oneLiner": "Scrolling comes to rest on a card instead of stopping halfway between two of them."
    },
    "defaults": {
      "snap": "x mandatory",
      "padding": 12,
      "align": "start",
      "stop": true
    }
  },
  {
    "slug": "accordion",
    "code": "L-06",
    "nameZh": "折叠面板",
    "nameEn": "Accordion",
    "aliases": [
      "手风琴",
      "展开收起",
      "折叠展开",
      "collapsible panel",
      "collapse",
      "disclosure"
    ],
    "category": "layout",
    "oneLiner": "点标题展开内容，同一组里通常只开一个，标题一直在。",
    "whenToUse": [
      "FAQ、帮助文档，一屏要放十几条问题",
      "表单里的高级设置，默认收起，需要的人再展开",
      "移动端详情页，把长说明折起来省空间"
    ],
    "confusions": [
      {
        "with": "选项卡 tabs",
        "diff": "tabs 是对内容做横向切换，切走的那块完全消失；手风琴所有标题始终纵向排在一起，展开的内容还在标题下面，只是把下面的内容推下去。"
      },
      {
        "with": "弹层 popover",
        "diff": "弹层浮在页面上方、会遮住别的内容；手风琴在文档流里撑开，不做遮挡。"
      }
    ],
    "pitfalls": [
      "不要对 height: auto 做过渡，浏览器不会对 auto 补间动画；改用 grid-template-rows: 0fr → 1fr，或先量出内容高度再写像素值",
      "折叠部分要包一层 overflow: hidden，否则收起来时文字还露在外面",
      "标题要用真正的 button（或 details/summary），并带上 aria-expanded，键盘和读屏才用得了",
      "一旦允许多项同时展开，面板就成了长列表，这种场景该换 tabs 或分页"
    ],
    "keywords": [
      "accordion",
      "collapsible",
      "aria-expanded",
      "details/summary",
      "grid-template-rows: 0fr",
      "disclosure pattern"
    ],
    "scenes": [
      "form",
      "page",
      "list"
    ],
    "feel": [
      "calm",
      "crisp"
    ],
    "intent": [
      "affordance",
      "hierarchy"
    ],
    "tags": [
      "css-only",
      "stateful",
      "layout-triggering",
      "keyboard-operable",
      "stable"
    ],
    "demo": {
      "shape": "stage"
    },
    "loop": "manual",
    "en": {
      "oneLiner": "Clicking a heading reveals its panel, usually one at a time, and the headings never move."
    },
    "defaults": {
      "mode": "single",
      "duration": 260,
      "easing": "cubic-bezier(0.22, 1, 0.36, 1)",
      "rotate": true
    }
  },
  {
    "slug": "virtual-scrolling",
    "code": "L-07",
    "nameZh": "虚拟滚动",
    "nameEn": "Virtual Scrolling",
    "aliases": [
      "虚拟列表",
      "长列表优化",
      "窗口化渲染",
      "virtual list",
      "windowing",
      "virtualized list"
    ],
    "category": "layout",
    "oneLiner": "列表只渲染看得见的那几行，一万条也能滚得顺。",
    "whenToUse": [
      "几百到几万行的列表、日志、表格，全渲染会让页面卡死",
      "聊天记录、时间线这类只往两头长的数据",
      "可视区高度固定的面板里展示很长的候选列表"
    ],
    "confusions": [
      {
        "with": "无限滚动",
        "diff": "无限滚动管「什么时候再取一批数据」，虚拟滚动管「一屏只渲染几行」；一个解决数据量，一个解决 DOM 量，经常一起用。"
      },
      {
        "with": "分页",
        "diff": "分页把数据切成页、用户翻页；虚拟滚动数据一次拿全，只是把可视区外的行不渲染，滚动条仍然是连续的一整条。"
      }
    ],
    "pitfalls": [
      "行高固定才好算区间；高度不定就得逐行测量并缓存，成本随之上升",
      "滚动容器要有撑满总高度的占位（spacer 或 padding），否则滚动条与位置全不对",
      "scroll 事件里直接 setState 会掉帧，用 requestAnimationFrame 节流，或者只在可视区间变化时才更新",
      "可视区外多渲染几行做缓冲（overscan），否则快速滚动会看到空白",
      "复用 DOM 时要清掉上一行的动画与展开状态，别让第 500 行的状态串到第 12 行",
      "读屏软件看不到没渲染的行：用 aria-setsize / aria-posinset 报出总数与位置，或提供「跳到第 N 条」"
    ],
    "keywords": [
      "virtual scrolling",
      "windowing",
      "virtual list",
      "overscan",
      "item height",
      "scrollTop",
      "transform: translateY",
      "aria-setsize"
    ],
    "scenes": [
      "list",
      "scroll",
      "page"
    ],
    "feel": [
      "crisp",
      "calm"
    ],
    "intent": [
      "affordance",
      "hierarchy"
    ],
    "tags": [
      "js",
      "browser-api",
      "composited",
      "layout-triggering",
      "main-thread",
      "stable"
    ],
    "demo": {
      "shape": "scroll",
      "minHeight": 320,
      "thumb": "still"
    },
    "loop": "manual",
    "en": {
      "oneLiner": "Only the rows you can see are rendered, so ten thousand items still scroll smoothly."
    },
    "defaults": {
      "itemHeight": 44,
      "total": 10000,
      "overscan": 4
    }
  },
  {
    "slug": "marquee",
    "code": "L-08",
    "nameZh": "跑马灯",
    "nameEn": "Marquee",
    "aliases": [
      "无缝滚动",
      "横向滚动条",
      "循环滚动",
      "marquee",
      "infinite marquee",
      "ticker",
      "scrolling text"
    ],
    "category": "layout",
    "oneLiner": "一排内容不停地横向滑过，首尾相接，看不出接缝。",
    "whenToUse": [
      "客户 logo 墙、合作方列表这类「多到放不下但每条都很短」的内容",
      "公告、注意事项这类要一直提醒但不值得占一整屏的信息",
      "标签流、作品缩略图做背景装饰，让画面一直在动"
    ],
    "confusions": [
      {
        "with": "自动轮播",
        "diff": "轮播是分页的：一屏一屏地翻，还有指示点；跑马灯是匀速连续滚动，没有「第几屏」的概念。"
      },
      {
        "with": "滚动捕捉",
        "diff": "滚动捕捉是用户自己滑、停下时吸附到某一项；跑马灯是自己走、用户只读，停下来只是因为悬停。"
      }
    ],
    "pitfalls": [
      "无缝要复制一份内容并整体平移 50%（或正好一整份的宽度），否则会看到「唰」地跳回起点",
      "用 transform: translate3d 做位移，别用 margin-left / left，后者每帧都要重排",
      "悬停或聚焦时暂停是惯例，最好再给一个暂停按钮，否则读屏和慢读的用户永远读不完",
      "复制出来的那一份要 aria-hidden，不然读屏软件会把内容念两遍",
      "离屏时动画还在烧电：用 IntersectionObserver 或 animation-play-state 停掉",
      "内容比容器短时不要循环，会出现空档；长度不够就复制到足够长"
    ],
    "keywords": [
      "marquee",
      "infinite marquee",
      "ticker",
      "@keyframes translateX",
      "transform: translate3d",
      "animation-play-state",
      "mask-image",
      "aria-hidden duplicate"
    ],
    "scenes": [
      "list",
      "page",
      "scroll"
    ],
    "feel": [
      "calm",
      "playful"
    ],
    "intent": [
      "attention",
      "hierarchy"
    ],
    "tags": [
      "js",
      "gradient",
      "composited",
      "motion-heavy",
      "stable"
    ],
    "demo": {
      "shape": "stage"
    },
    "loop": "continuous",
    "en": {
      "oneLiner": "A row of content slides sideways forever, joined end to end with no visible seam."
    },
    "defaults": {
      "speed": 40,
      "pauseOnHover": true,
      "edgeMask": true
    }
  },
  {
    "slug": "frosted-glass",
    "code": "V-01",
    "nameZh": "毛玻璃",
    "nameEn": "Frosted Glass",
    "aliases": [
      "磨砂玻璃",
      "磨砂",
      "毛玻璃效果",
      "backdrop blur",
      "backdrop-filter",
      "glass blur"
    ],
    "category": "visual",
    "oneLiner": "面板背后的内容被真的模糊掉，像隔着一层磨砂玻璃看过去。",
    "whenToUse": [
      "导航栏、浮层压在滚动内容或照片上，既要有层次又要透出底下",
      "卡片叠在图片或彩色背景上，希望它属于这个画面而不是贴上去",
      "需要让人一眼看出「这块浮在上面」，又不想用实心色块把背景挡死"
    ],
    "confusions": [
      {
        "with": "半透明",
        "diff": "半透明只是让面板变淡，背后内容依然清晰；毛玻璃会把背后内容真的糊掉。只调 opacity 或 rgba 做不出毛玻璃。"
      },
      {
        "with": "模糊滤镜 blur()",
        "diff": "filter: blur() 模糊的是元素自己（连它的文字一起糊）；backdrop-filter: blur() 模糊的是它背后的东西，元素自身内容保持清晰。"
      }
    ],
    "pitfalls": [
      "背后必须有内容：纯色背景上加 backdrop-filter 看不出任何变化",
      "父级带 overflow: hidden 或 transform 时，部分浏览器会失效或裁切异常",
      "模糊半径超过 20px 就会糊成一片，文字对比度下降，8–16px 通常够用",
      "Safari 需要 -webkit-backdrop-filter 前缀，且要给不支持的浏览器留可读底色"
    ],
    "keywords": [
      "backdrop-filter",
      "blur()",
      "saturate()",
      "frosted glass",
      "backdrop blur",
      "translucent panel"
    ],
    "scenes": [
      "card",
      "nav",
      "page"
    ],
    "feel": [
      "soft",
      "calm"
    ],
    "intent": [
      "hierarchy"
    ],
    "tags": [
      "css-only",
      "modern-css",
      "filter-blend",
      "paint-heavy",
      "stable"
    ],
    "demo": {
      "shape": "stage"
    },
    "loop": "continuous",
    "en": {
      "oneLiner": "A panel blurs the content behind it, like looking through ground glass."
    },
    "defaults": {
      "blur": 12,
      "saturate": 115,
      "alpha": 8,
      "radius": 14
    }
  },
  {
    "slug": "glassmorphism",
    "code": "V-02",
    "nameZh": "玻璃拟态",
    "nameEn": "Glassmorphism",
    "aliases": [
      "玻璃态",
      "玻璃质感",
      "玻璃卡片",
      "glass UI",
      "glass card",
      "glassmorphic"
    ],
    "category": "visual",
    "oneLiner": "半透明面板 + 亮边 + 柔影叠在彩色背景上，像一块玻璃浮在画面里。",
    "whenToUse": [
      "登录页、定价卡、数据卡想显得轻透精致，又不想整页铺实心色块",
      "面板压在彩色渐变或照片上，希望底下的颜色透一点上来",
      "浮层、侧栏要和主内容拉开层级，同时不切断和背景的联系"
    ],
    "confusions": [
      {
        "with": "毛玻璃",
        "diff": "毛玻璃只说「背后被模糊」这一件事（backdrop-filter: blur）；玻璃拟态是一整套外观：模糊 + 半透明白色斜向渐变 + 1px 亮描边 + inset 顶部高光 + 外投影，而且几乎都压在彩色背景上。只加一个 blur 不叫玻璃拟态。"
      },
      {
        "with": "半透明卡片",
        "diff": "半透明只是把底色设成 rgba，边缘是平的；玻璃拟态的边界靠那圈亮描边勾出来，高光和投影一起把面板从背景里托起来。"
      }
    ],
    "pitfalls": [
      "必须压在彩色渐变或照片上；纯色背景加 backdrop-filter 几乎看不出变化",
      "亮描边和 inset 高光是玻璃感的命根子，省掉就只剩一块半透明矩形",
      "面板上的文字对比度会随背景变色：深色背景用白字加一点 text-shadow，别指望浅色底能托住黑字",
      "backdrop-filter 每次都要重新合成背景，一屏十几块玻璃会明显掉帧，长列表项里不要用",
      "Safari 要写 -webkit-backdrop-filter，并给不支持的浏览器留一个够不透明的兜底色"
    ],
    "keywords": [
      "glassmorphism",
      "backdrop-filter",
      "translucent panel",
      "1px highlight border",
      "inset box-shadow",
      "saturate(180%)"
    ],
    "scenes": [
      "card",
      "page",
      "nav"
    ],
    "feel": [
      "soft",
      "playful"
    ],
    "intent": [
      "hierarchy",
      "attention"
    ],
    "tags": [
      "css-only",
      "modern-css",
      "filter-blend",
      "paint-heavy",
      "stable"
    ],
    "demo": {
      "shape": "stage"
    },
    "loop": "continuous",
    "en": {
      "oneLiner": "A translucent panel with a bright edge and soft shadow, floating over a colorful background."
    },
    "defaults": {
      "blur": 16,
      "border": 30,
      "shadow": 30,
      "radius": 18
    }
  },
  {
    "slug": "mesh-gradient",
    "code": "V-03",
    "nameZh": "渐变网格",
    "nameEn": "Mesh Gradient",
    "aliases": [
      "网格渐变",
      "弥散渐变",
      "多色渐变背景",
      "mesh gradient",
      "diffuse gradient",
      "aurora background"
    ],
    "category": "visual",
    "oneLiner": "多个径向渐变叠在一起，颜色朝任意方向过渡，没有一条直线的渐变轴。",
    "whenToUse": [
      "落地页 Hero 想要有颜色的纵深，又不想加载一张大图",
      "把品牌主色柔和地铺满一整块区域，做卡片或弹窗底板",
      "没有真实图片时的默认封面、头像底色，让占位也有内容",
      "需要跟着主题色换一整套配色，用 filter 转个色相就能换"
    ],
    "confusions": [
      {
        "with": "线性渐变 / 锥形渐变",
        "diff": "linear-gradient 只有一条渐变轴，conic-gradient 只有一个圆心，颜色沿一条线或一个角走；渐变网格是好几层 radial-gradient 各自带中心点叠起来，颜色在二维上互相混合。注意 CSS 里没有 mesh-gradient 这个属性，都是叠出来的。"
      },
      {
        "with": "网格背景（grid 线）",
        "diff": "网格背景是重复的等距线条，是规则图案；渐变网格是色场，没有线条，颜色之间连续过渡。中文名字里的「网格」指色控点的连线，不是画格子。"
      },
      {
        "with": "毛玻璃",
        "diff": "毛玻璃是把背后已有的内容糊掉；渐变网格是自己画出一片颜色。两者常一起用（网格背景 + 玻璃面板），但一个负责背景，一个负责面板。"
      }
    ],
    "pitfalls": [
      "radial-gradient 的透明端直接写 transparent，在部分浏览器会和黑混出灰边，要写同一个颜色的 rgba(...,0)",
      "色标停到 100% 会露出硬边，提前在 50%–70% 结束，色斑才会自然融合",
      "叠超过 7–8 层背景重绘会变慢，再叠加 filter: blur 更明显，4–6 层够用",
      "给整层加 blur 时要把它 scale 放大到 1.2 以上，否则元素边缘会透出模糊的透明边",
      "纯 CSS 渐变在宽色域显示器上容易出现色带，叠一层 3%–8% 的颗粒噪点能压掉",
      "色相旋转用的是 filter: hue-rotate，它作用在整层上，别把文字也放进这一层"
    ],
    "keywords": [
      "radial-gradient",
      "layered backgrounds",
      "transparent color stops",
      "filter: blur()",
      "hue-rotate()",
      "mesh gradient",
      "diffuse gradient"
    ],
    "scenes": [
      "page",
      "card"
    ],
    "feel": [
      "soft",
      "playful"
    ],
    "intent": [
      "attention",
      "hierarchy"
    ],
    "tags": [
      "css-only",
      "gradient",
      "filter-blend",
      "paint-heavy",
      "stable"
    ],
    "demo": {
      "shape": "stage"
    },
    "loop": "continuous",
    "en": {
      "oneLiner": "Several radial gradients stacked so color flows in any direction, with no single gradient axis."
    },
    "defaults": {
      "spread": 55,
      "softness": 0,
      "hue": 0,
      "drift": true
    }
  },
  {
    "slug": "grain-noise",
    "code": "V-04",
    "nameZh": "颗粒噪点",
    "nameEn": "Grain Noise",
    "aliases": [
      "噪点",
      "颗粒感",
      "胶片颗粒",
      "杂色",
      "film grain",
      "noise texture",
      "grain overlay"
    ],
    "category": "visual",
    "oneLiner": "在画面上撒一层随机像素，给纯色和渐变加质感，顺手压掉色带。",
    "whenToUse": [
      "大面积渐变或深色背景出现一圈圈色带（banding）时，用噪点把它打散",
      "卡片、插画、缩略图想有一点胶片或纸张的颗粒，不再干净到发假",
      "不同来源的图片材质不统一，铺一层颗粒把它们拉进同一个世界",
      "深色界面里加一点质感，比再加一层投影更轻"
    ],
    "confusions": [
      {
        "with": "半透明黑色遮罩",
        "diff": "蒙一层黑是整体压暗，亮度往下走；噪点让每个像素随机变亮或变暗，平均亮度不变，所以画面不黑，只是有了颗粒。"
      },
      {
        "with": "重复纹理贴图",
        "diff": "平铺一张 png 会看到重复单元和接缝，放大后尤其明显；feTurbulence 生成的是程序化噪声，配合 stitchTiles=\"stitch\" 几乎看不出重复，颗粒粗细还能随参数调。"
      },
      {
        "with": "抖动 dithering",
        "diff": "抖动是渲染器为了压制色带自己做的，粒度跟像素对齐；颗粒噪点是你手动叠的一层材质，可以调大小、强度和混合模式。"
      }
    ],
    "pitfalls": [
      "baseFrequency 低于 0.3 会变成大块云雾，不像颗粒；0.5–0.9 之间才是细砂",
      "噪点层必须 pointer-events: none，不然整块区域都点不动",
      "不透明度超过 15% 画面会发脏，文字对比度也跟着掉，3%–10% 通常刚好",
      "深色背景上用 overlay 混合几乎看不见，换 normal 或提高强度",
      "feTurbulence 是实时算的，SVG 尺寸给太大会拖慢首帧，用 120–200px 的小瓦片平铺",
      "给噪点层加抖动动画时用 steps() 而不是线性缓动，线性看起来像在飘"
    ],
    "keywords": [
      "feTurbulence",
      "fractalNoise",
      "baseFrequency",
      "stitchTiles",
      "mix-blend-mode",
      "SVG filter",
      "data URI"
    ],
    "scenes": [
      "page",
      "card"
    ],
    "feel": [
      "calm",
      "soft"
    ],
    "intent": [
      "hierarchy"
    ],
    "tags": [
      "css-only",
      "filter-blend",
      "paint-heavy",
      "stable"
    ],
    "demo": {
      "shape": "stage"
    },
    "loop": "continuous",
    "en": {
      "oneLiner": "A layer of random pixels over the surface that adds texture and hides banding in gradients."
    },
    "defaults": {
      "grain": 1.5,
      "opacity": 10,
      "blend": "overlay",
      "flicker": true
    }
  },
  {
    "slug": "spotlight-glow",
    "code": "V-05",
    "nameZh": "光晕聚光",
    "nameEn": "Spotlight Glow",
    "aliases": [
      "聚光灯",
      "鼠标光晕",
      "光标跟随光",
      "spotlight card",
      "cursor glow",
      "radial highlight"
    ],
    "category": "visual",
    "oneLiner": "一块柔光跟着指针在卡片表面移动，像有人拿手电照上去。",
    "whenToUse": [
      "深色卡片想让用户意识到鼠标正停在这里，比整块变色更有空间感",
      "定价卡、功能卡里突出「正在看的那一张」",
      "Hero 区要一束光追着指针走，给静态页面一点氛围",
      "按钮的 hover 高亮想含蓄一点，用一层径向光代替纯色填充"
    ],
    "confusions": [
      {
        "with": "box-shadow 阴影",
        "diff": "box-shadow 是元素轮廓外的一圈均匀柔光，跟着盒子形状走，不会移动；聚光光晕是一个有圆心坐标的光斑，位置随指针变。"
      },
      {
        "with": "hover 换底色",
        "diff": "hover 是把整块背景色换掉，边界是硬切；聚光有衰减，越靠圆心越亮，越往外越淡。"
      },
      {
        "with": "跟随指针的拖尾",
        "diff": "拖尾装饰的是鼠标本身，跟着指针满屏幕跑；聚光被裁在元素内部（overflow: hidden 或 mask），是打在表面的一层。"
      }
    ],
    "pitfalls": [
      "别在 pointermove 里 setState，一帧多次重渲染会卡；把坐标直接写进元素的 style.transform 或 CSS 变量",
      "光斑要 overflow: hidden 裁在卡片里，否则看起来是飘在旁边的一个圆",
      "触屏没有 hover，必须给一个默认居中或居下的静态光斑，否则移动端一片死黑",
      "光太亮会把内容吃掉，峰值不透明度 0.10–0.25 就够，配 mix-blend-mode: screen 或 soft-light",
      "在长条卡片上用百分比尺寸算光斑会被拉成椭圆，改用固定 px 直径",
      "pointermove 里每次都读 getBoundingClientRect 会触发布局，缓存 rect 或只在 resize 时更新"
    ],
    "keywords": [
      "radial-gradient",
      "pointermove",
      "CSS custom properties",
      "transform: translate3d",
      "mix-blend-mode: screen",
      "overflow: hidden",
      "spotlight card"
    ],
    "scenes": [
      "card",
      "button",
      "page"
    ],
    "feel": [
      "playful",
      "crisp"
    ],
    "intent": [
      "attention",
      "affordance"
    ],
    "tags": [
      "js",
      "browser-api",
      "gradient",
      "filter-blend",
      "main-thread",
      "pointer-dependent"
    ],
    "demo": {
      "shape": "interactive",
      "thumb": "still"
    },
    "loop": "manual",
    "en": {
      "oneLiner": "A soft pool of light that follows the pointer across a card, like a flashlight held to it."
    },
    "defaults": {
      "radius": 220,
      "intensity": 22,
      "hue": 40,
      "follow": true
    }
  },
  {
    "slug": "gradient-border",
    "code": "V-06",
    "nameZh": "渐变描边",
    "nameEn": "Gradient Border",
    "aliases": [
      "渐变边框",
      "彩色描边",
      "渐变边",
      "border gradient",
      "gradient stroke",
      "rainbow border"
    ],
    "category": "visual",
    "oneLiner": "描边不是一种颜色，而是一条渐变沿着元素轮廓走一圈。",
    "whenToUse": [
      "卡片、按钮要用品牌色勾一圈边，比纯色描边更有层次",
      "突出「当前选中」的那一项，一圈亮边比填满整块更克制",
      "深色背景上把元素边界画清楚，一条亮边就能顶替投影",
      "想要随主题换色的描边，改几个 hsl 值就行"
    ],
    "confusions": [
      {
        "with": "border-image",
        "diff": "border-image 是最直觉的写法，但它不认 border-radius，圆角会被切成直角，而且 border-style 不能是 none。要圆角就得用两层 background 配 padding-box / border-box，或者 ::before 加 mask。"
      },
      {
        "with": "外发光 box-shadow",
        "diff": "外发光落在元素外面，边缘是糊的、没有明确边界；渐变描边是一条实线贴着边界，颜色沿线变化。"
      },
      {
        "with": "渐变背景",
        "diff": "渐变背景铺满整个面，渐变描边只画那一圈线；同一个渐变值，一个当底一个当边。"
      }
    ],
    "pitfalls": [
      "border 必须设成 transparent 且有宽度，否则渐变没有地方画",
      "只写 background-clip: border-box 会把整块底色都铺满，必须两层：padding-box 一层实底，border-box 一层渐变",
      "长条元素上 45deg 的渐变两端颜色会不一样，因为角度按盒子尺寸算；两端想要同色就用 90deg 或 conic-gradient",
      "用 mask-composite 的写法在 Safari 要补 -webkit-mask-composite: xor，否则会变成一整块",
      "描边超过 2px、颜色又亮，就会盖过内容，1–2px 最稳",
      "border-image 和 border-radius 同时写不会报错，只是圆角静默失效，很难查"
    ],
    "keywords": [
      "background-clip: padding-box",
      "background-clip: border-box",
      "border: transparent",
      "linear-gradient",
      "conic-gradient",
      "@property",
      "border-image"
    ],
    "scenes": [
      "card",
      "button",
      "form"
    ],
    "feel": [
      "crisp",
      "playful"
    ],
    "intent": [
      "attention",
      "hierarchy"
    ],
    "tags": [
      "css-only",
      "gradient",
      "modern-css",
      "check-support"
    ],
    "demo": {
      "shape": "stage"
    },
    "loop": "continuous",
    "en": {
      "oneLiner": "The border is not one color but a gradient running once around the element outline."
    },
    "defaults": {
      "width": 2,
      "angle": 135,
      "hue": 14,
      "radius": 14
    }
  },
  {
    "slug": "aurora-gradient",
    "code": "V-07",
    "nameZh": "极光渐变",
    "nameEn": "Aurora Gradient",
    "aliases": [
      "极光背景",
      "流动渐变",
      "光晕背景",
      "aurora background",
      "aurora gradient",
      "animated gradient background"
    ],
    "category": "visual",
    "oneLiner": "几团彩色光斑在底色上慢慢游动，像极光一样铺满整屏。",
    "whenToUse": [
      "落地页、产品首屏的大背景，要氛围但不要具体图形",
      "深色界面想要一块会呼吸的底色",
      "发布页、活动页需要持续流动感，又不想用视频或图片"
    ],
    "confusions": [
      {
        "with": "网格渐变",
        "diff": "网格渐变是多个径向渐变叠出来的静态柔光；极光是这些光团在位移（translate + blur + 饱和度），重点在「慢慢游动」。"
      },
      {
        "with": "聚光卡片",
        "diff": "聚光跟着指针走，是人给的反馈；极光自己漂，有没有人都一样。"
      }
    ],
    "pitfalls": [
      "大面积模糊很贵：光斑要放在独立图层里用 transform 位移，别每帧改 background-position",
      "光斑 3–5 团就够，堆多了只会糊成一片，看不出「极光」",
      "动画要慢（一轮 20–40s），快了像故障闪烁",
      "深色底效果好；浅色底上要压低饱和度，否则显脏",
      "文字压在上面要留对比度兜底（暗罩或压到暗部），别让正文落在最亮的光上",
      "prefers-reduced-motion 下停住动画，静态渐变仍然好看"
    ],
    "keywords": [
      "aurora gradient",
      "animated gradient",
      "radial-gradient",
      "filter: blur()",
      "mix-blend-mode: screen",
      "transform: translate3d",
      "hue-rotate()",
      "saturate()"
    ],
    "scenes": [
      "page",
      "card"
    ],
    "feel": [
      "soft",
      "playful"
    ],
    "intent": [
      "attention",
      "hierarchy"
    ],
    "tags": [
      "css-only",
      "gradient",
      "filter-blend",
      "paint-heavy",
      "motion-heavy",
      "stable"
    ],
    "demo": {
      "shape": "stage",
      "minHeight": 320
    },
    "loop": "continuous",
    "en": {
      "oneLiner": "A few coloured blobs drift slowly across the background, like an aurora spread over the screen."
    },
    "defaults": {
      "blobs": 4,
      "blur": 80,
      "duration": 30,
      "palette": "aurora"
    }
  },
  {
    "slug": "mask-fade",
    "code": "V-08",
    "nameZh": "边缘渐隐",
    "nameEn": "Mask Fade",
    "aliases": [
      "渐隐遮罩",
      "边缘淡出",
      "两端渐隐",
      "mask fade",
      "fade mask",
      "gradient mask",
      "edge fade"
    ],
    "category": "visual",
    "oneLiner": "内容在边缘渐渐淡掉，暗示这一头还能继续滑。",
    "whenToUse": [
      "横向卡片列表、标签流的边缘，提示后面还有内容",
      "固定高度的滚动区，顶部或底部用渐隐代替一条生硬的分割线",
      "跑马灯、logo 墙的两端，让循环看不出接缝"
    ],
    "confusions": [
      {
        "with": "overflow: hidden",
        "diff": "overflow 是硬切，内容到边就断；mask 是淡出，边缘逐渐透明。想暗示「还能滑」用 mask，想干脆截断用 overflow。"
      },
      {
        "with": "渐变色盖层",
        "diff": "盖一层同色渐变只是「看起来像」，一旦底色不是纯色（图片、渐变、深色模式）就露馅；mask 直接改内容的可见性，跟底色无关。"
      }
    ],
    "pitfalls": [
      "渐隐长度要够（约容器宽度的 8–15%），太短看起来像脏边",
      "旧版 Safari 需要 -webkit-mask-image 前缀，写两份最稳",
      "mask 会让被遮住的区域真的看不见，但那部分仍然可点击、可聚焦——不要用 mask 当「隐藏」",
      "mask 与 backdrop-filter 同时用在同一个元素上，某些 Chrome 版本会渲染异常（毛玻璃会被切断）",
      "纵向滚动区做上下渐隐时，滚到顶部/底部要淡出对应的那侧，否则永远是「下面还有」的错觉",
      "两端用同一条线性渐变对称处理，别只做一边"
    ],
    "keywords": [
      "mask-image",
      "-webkit-mask-image",
      "linear-gradient mask",
      "mask-composite",
      "edge fade",
      "fade mask",
      "scroll hint",
      "CSS masking"
    ],
    "scenes": [
      "list",
      "scroll",
      "page"
    ],
    "feel": [
      "calm",
      "crisp"
    ],
    "intent": [
      "affordance",
      "hierarchy"
    ],
    "tags": [
      "css-only",
      "modern-css",
      "gradient",
      "paint-heavy",
      "stable"
    ],
    "demo": {
      "shape": "stage"
    },
    "loop": "continuous",
    "en": {
      "oneLiner": "Content fades out at the edges, hinting that there is more to scroll."
    },
    "defaults": {
      "fade": 12,
      "axis": "x",
      "hardEdge": false
    }
  },
  {
    "slug": "fluid-type",
    "code": "T-01",
    "nameZh": "流体排版",
    "nameEn": "Fluid Type",
    "aliases": [
      "流式字号",
      "自适应字号",
      "弹性排版",
      "fluid typography",
      "fluid type scale",
      "responsive font-size"
    ],
    "category": "type",
    "oneLiner": "字号随容器宽度连续变化，不会在断点上突然跳一档。",
    "whenToUse": [
      "大标题在小屏和大屏之间跨度很大，用媒体查询会看到字号一级一级地跳",
      "想让标题、间距、圆角共用一个比例，跟着屏幕一起放大缩小",
      "需要给字号设上下限，避免手机上一行放不下、超宽屏上又大得荒唐"
    ],
    "confusions": [
      {
        "with": "媒体查询断点",
        "diff": "断点是「到某个宽度就换一套值」，两个断点之间字号是平的，跨过临界点会突然跳一下；流体排版把中间值写成带 vw 或 cqw 的 calc()，宽度一变字号就跟着连续变。"
      },
      {
        "with": "rem 固定字号",
        "diff": "rem 只跟根元素字号走，和屏幕宽度无关；rem 仍然要用，但想让文字跟着屏幕流起来，必须把 rem 和 vw 或 cqw 混进同一个 clamp() 里。"
      }
    ],
    "pitfalls": [
      "纯 vw 字号不跟浏览器的默认字号设置走：用户在浏览器里调大文字，vw 那一段不会跟着变大，而无障碍要求文字能放大到 200%。中间值要掺 rem，写成 clamp(1rem, 1rem + 2vw, 2.5rem)。",
      "vw 是视口宽度，不是父容器宽度。把流体标题放进窄卡片时会算出偏大的字号，这种场景要改用容器查询单位 cqw，并给父级加 container-type: inline-size。",
      "min 写成比 max 还大时 clamp() 不会报错，会直接取 min，页面上看起来完全没变化。",
      "只流 font-size 不管 line-height，大标题会挤在一起或者行与行散开；行高要用无单位倍数，或者跟着一起 clamp。"
    ],
    "keywords": [
      "clamp()",
      "vw",
      "cqw",
      "calc()",
      "fluid typography",
      "responsive font-size",
      "container query units"
    ],
    "scenes": [
      "text",
      "page",
      "card"
    ],
    "feel": [
      "calm",
      "crisp"
    ],
    "intent": [
      "hierarchy"
    ],
    "tags": [
      "css-only",
      "modern-css",
      "layout-triggering",
      "check-support"
    ],
    "demo": {
      "shape": "stage"
    },
    "loop": "continuous",
    "en": {
      "oneLiner": "Font size scales continuously with the container width, so it never jumps a step at a breakpoint."
    },
    "defaults": {
      "minSize": 16,
      "maxSize": 44,
      "growth": 3,
      "boxWidth": 100
    }
  },
  {
    "slug": "text-balance",
    "code": "T-02",
    "nameZh": "平衡折行",
    "nameEn": "Text Balance",
    "aliases": [
      "平衡换行",
      "折行平衡",
      "标题不孤字",
      "text-wrap balance",
      "balanced headline",
      "balanced text wrapping"
    ],
    "category": "type",
    "oneLiner": "多行标题的每行长度被拉齐，最后一行不再只剩一个孤字。",
    "whenToUse": [
      "一两个短语的标题在窄容器里折行，最后一行只掉下一个字，很难看",
      "卡片标题、引言、按钮文案这类短文本，想让每行长短匀称",
      "同一块文字要在不同宽度下都保持平衡，又不想手写 br 把位置写死"
    ],
    "confusions": [
      {
        "with": "text-wrap: pretty",
        "diff": "pretty 主要盯正文最后一行，避免段落末尾只留一个孤字，代价是排版时间略微增加；balance 是把所有行拉成一样长，只适合短文本，Chromium 超过六行就不再做平衡。"
      },
      {
        "with": "word-break / overflow-wrap",
        "diff": "那两个解决的是「一个长单词放不下时从哪里断」，管的是溢出；text-wrap: balance 不改变断词规则，只是重新分配每行放几个词。"
      },
      {
        "with": "手写 br",
        "diff": "br 把换行位置写死，换个容器宽度就错位；balance 由浏览器按当前宽度重新计算，宽度变了它会重排。"
      }
    ],
    "pitfalls": [
      "只对短文本有意义：Chromium 最多平衡 6 行，超了就静默退回普通折行，正文段落加它没有效果还多花排版时间。",
      "中英文表现不同：中文逐字换行，balance 只能微调每行字数，效果远不如英文标题明显，别指望它把中文排成对称。",
      "容器得有确定的宽度上限，文字根本不折行，就没有可平衡的东西。",
      "Safari 17.5 之前的版本会直接忽略这条声明，所以基础样式必须是可读的普通折行，不能只靠 balance。"
    ],
    "keywords": [
      "text-wrap: balance",
      "text-wrap: pretty",
      "orphan",
      "widow",
      "ch",
      "max-width",
      "line breaking"
    ],
    "scenes": [
      "text",
      "card",
      "page"
    ],
    "feel": [
      "calm",
      "soft"
    ],
    "intent": [
      "hierarchy"
    ],
    "tags": [
      "css-only",
      "modern-css",
      "layout-triggering",
      "check-support"
    ],
    "demo": {
      "shape": "stage"
    },
    "loop": "continuous",
    "en": {
      "oneLiner": "Line lengths in a multi-line heading are evened out, so the last line no longer holds one orphaned word."
    },
    "defaults": {
      "width": 16,
      "sample": "en-heading",
      "mode": "balance"
    }
  },
  {
    "slug": "gradient-text",
    "code": "T-03",
    "nameZh": "渐变文字",
    "nameEn": "Gradient Text",
    "aliases": [
      "渐变字体",
      "文字渐变",
      "彩色文字",
      "gradient text",
      "background-clip text",
      "text gradient"
    ],
    "category": "type",
    "oneLiner": "把文字当成蒙版，露出来的不是单色而是背后的渐变。",
    "whenToUse": [
      "首屏大标题想有一点彩色，又不想引入图片或 SVG",
      "强调品牌名、数字、少量关键词，不覆盖整段正文",
      "深色页面上做霓虹或金属质感的标题"
    ],
    "confusions": [
      {
        "with": "逐字上色",
        "diff": "用 span 给每个字单独设色，颜色是一段一段拼出来的；background-clip: text 是一整条渐变连续铺满整个文字盒子，每个字落在渐变的哪一段由盒子的宽度和字的位置决定。"
      },
      {
        "with": "text-shadow 外发光",
        "diff": "text-shadow 只在字形外面加一层光，字身仍然是单色；渐变文字是把背景裁进字形里面，颜色出现在字的内部。"
      }
    ],
    "pitfalls": [
      "一定要同时写 background-clip: text（配 -webkit- 前缀）和 color: transparent，否则会看到文字后面压着一整块背景色。",
      "color: transparent 在 Windows 高对比度（forced-colors）模式下会让文字整体消失，要加 @media (forced-colors: active) 退回实色。",
      "渐变两端都要和背景有足够对比：浅色那一端压在浅背景上会直接糊掉，正文级别至少保证 4.5:1。",
      "背景是铺在元素盒子上的，文字换行以后渐变会跨整个盒子，不是每一行重来一遍。",
      "整段正文都上渐变会明显掉可读性，一般只给一到两行标题用。"
    ],
    "keywords": [
      "background-clip: text",
      "-webkit-background-clip",
      "color: transparent",
      "-webkit-text-fill-color",
      "linear-gradient",
      "forced-colors",
      "background-size"
    ],
    "scenes": [
      "text",
      "page",
      "card"
    ],
    "feel": [
      "playful",
      "crisp"
    ],
    "intent": [
      "attention",
      "hierarchy"
    ],
    "tags": [
      "css-only",
      "gradient",
      "paint-heavy",
      "stable"
    ],
    "demo": {
      "shape": "stage"
    },
    "loop": "continuous",
    "en": {
      "oneLiner": "The text acts as a mask, so what shows through is the gradient behind it instead of a single color."
    },
    "defaults": {
      "angle": 120,
      "palette": "sunset",
      "startStop": 0,
      "hue": false
    }
  },
  {
    "slug": "char-reveal",
    "code": "T-04",
    "nameZh": "逐字显现",
    "nameEn": "Character Reveal",
    "aliases": [
      "逐字动画",
      "字符入场",
      "逐字出现",
      "character reveal",
      "split text animation",
      "per-character animation"
    ],
    "category": "type",
    "oneLiner": "标题里的字一个接一个落到位，像被逐字写出来。",
    "whenToUse": [
      "首屏主标题第一次出现，想让目光按顺序读过去",
      "标语、口号、产品名这类二三十字以内的短文本",
      "想强调半句话，让前半句先出现，后半句再接上"
    ],
    "confusions": [
      {
        "with": "打字机",
        "diff": "打字机是一个字符一个字符「被敲出来」，常配光标和等宽字体，文本长度在一点点变长；逐字显现是所有字已经站在排版位置上，只是依次从透明和偏移回到原位。"
      },
      {
        "with": "交错进场 stagger",
        "diff": "stagger 作用在一组独立元素上（列表项、卡片），逐字显现是先把一句话拆成单字，再对这串字套用同样的错峰逻辑，而且要额外处理读屏。"
      }
    ],
    "pitfalls": [
      "拆成单字 span 后读屏会一个字一个字念，必须给可视文字加 aria-hidden=\"true\"，再放一份完整文本（sr-only 或 aria-label）给读屏。",
      "英文按字母拆会打断单词、连字和字偶距，英文应该按词拆，或者用 Intl.Segmenter 按 grapheme 或 word 切。",
      "每个字一个 DOM 节点，长文本会撑出上百个节点，总延迟也会拉到几秒；只给前 20–30 字加动画，其余直接显示。",
      "字间隔乘字数就是最后一个字的等待时间：40 字乘 50ms 已经两秒，别让读者干等。",
      "prefers-reduced-motion 下要跳过延迟和位移，整句一次显示。"
    ],
    "keywords": [
      "split text",
      "per-character animation",
      "animation-delay",
      "translateY",
      "opacity",
      "sr-only",
      "prefers-reduced-motion"
    ],
    "scenes": [
      "text",
      "page"
    ],
    "feel": [
      "playful",
      "crisp"
    ],
    "intent": [
      "attention",
      "hierarchy"
    ],
    "tags": [
      "js",
      "composited",
      "motion-heavy",
      "stable"
    ],
    "demo": {
      "shape": "stage"
    },
    "loop": "replay",
    "en": {
      "oneLiner": "The characters of a headline drop into place one after another, as if written out letter by letter."
    },
    "defaults": {
      "duration": 480,
      "stagger": 45,
      "distance": 14,
      "easing": "cubic-bezier(0.22, 1, 0.36, 1)"
    }
  },
  {
    "slug": "variable-font",
    "code": "T-05",
    "nameZh": "可变字体",
    "nameEn": "Variable Font",
    "aliases": [
      "可变字重",
      "轴字体",
      "可变字体动画",
      "variable font",
      "font-variation-settings",
      "weight axis"
    ],
    "category": "type",
    "oneLiner": "一个字体文件里带着连续的字重轴，可以停在任意粗细。",
    "whenToUse": [
      "标题需要在细和粗之间平滑过渡，而不是只有 400 和 700 两档",
      "想用同一套字体兼顾正文和超粗标题，少加载几个字体文件",
      "随交互或滚动慢慢改变字重，做一个不靠颜色和位移的强调"
    ],
    "confusions": [
      {
        "with": "多字重静态字体",
        "diff": "静态字体每一档是一个独立文件，只加载了 400 和 700 时，font-weight: 550 会被四舍五入到其中一档；可变字体在轴范围内任意数值都能真正插值。"
      },
      {
        "with": "font-weight 和 font-variation-settings",
        "diff": "两个都能调字重。font-weight 是标准属性，会正常继承，也能让不支持可变字体的 fallback 生效；font-variation-settings 是底层开关，用来访问 wdth、slnt 这些没有专门属性的轴，写 wght 时会盖过 font-weight，MDN 建议 wght 优先走 font-weight。"
      }
    ],
    "pitfalls": [
      "字体里没有的轴，调了完全没反应。先用字体工具查清它有哪些轴、范围多少，超出范围的值会被夹到边界。",
      "font-variation-settings 的值是字符串，轴名必须带引号：font-variation-settings: \"wght\" 550, \"wdth\" 90。少写引号整条声明失效。",
      "改轴值会触发文字重新排版，不是 GPU 合成的，长时间无限循环容易掉帧，而且要尊重 prefers-reduced-motion。",
      "Web 字体还没下载完时会先落到系统字体，轴不生效还会跳一下；用 font-display: swap，并让 fallback 的字重尽量接近。"
    ],
    "keywords": [
      "font-variation-settings",
      "variable font",
      "wght",
      "wdth",
      "opsz",
      "slnt",
      "@font-face",
      "font-weight"
    ],
    "scenes": [
      "text",
      "page"
    ],
    "feel": [
      "crisp",
      "calm"
    ],
    "intent": [
      "hierarchy",
      "attention"
    ],
    "tags": [
      "css-only",
      "font-feature",
      "stable"
    ],
    "demo": {
      "shape": "stage"
    },
    "loop": "continuous",
    "en": {
      "oneLiner": "A single font file carries a continuous weight axis, so it can stop at any weight."
    },
    "defaults": {
      "wght": 450,
      "steps": 1,
      "family": "display",
      "ruler": true
    }
  },
  {
    "slug": "count-up",
    "code": "T-06",
    "nameZh": "数字滚动",
    "nameEn": "Count Up",
    "aliases": [
      "数字递增",
      "数值动画",
      "计数动画",
      "count up",
      "number counter",
      "animated counter"
    ],
    "category": "type",
    "oneLiner": "数字从 0 快速滚到目标值，然后停住。",
    "whenToUse": [
      "数据面板的关键指标第一次出现，想让数字有涨上去的感觉",
      "首屏用一两个大数字当主角，给一个短促的入场",
      "想让数字滚动在进入视口后再开始，而不是页面一打开就已经跳完"
    ],
    "confusions": [
      {
        "with": "机械翻牌 odometer",
        "diff": "odometer 是每一位数字上下滚动或翻页，位与位之间有物理位移；数字滚动只是数值在变，字形本身不动。"
      },
      {
        "with": "CSS @property 数值动画",
        "diff": "@property 可以注册一个整数自定义属性再交给 counter() 渲染，纯 CSS 就能跑，但插值交给浏览器，格式和缓动不好控；要精确控制格式、缓动和重播，用 requestAnimationFrame 手写更稳。"
      }
    ],
    "pitfalls": [
      "位数变化会撑动布局（9 变 10、99 变 100），给容器预留宽度，并用 font-variant-numeric: tabular-nums 让每位数字等宽。",
      "requestAnimationFrame 循环要在组件卸载时 cancel，否则组件没了还在 setState。",
      "rAF 回调拿到的是高精度时间戳，用它减去开始时间；不要和 Date.now() 混算，也不要拿 setInterval 每帧加固定值，掉帧时会越走越慢。",
      "服务端渲染和首次客户端渲染必须渲染同一个值（通常是 0），否则 hydration 对不上；挂载之后再开始跑。",
      "prefers-reduced-motion 下直接显示最终值，别让数字再滚一遍。"
    ],
    "keywords": [
      "requestAnimationFrame",
      "tabular-nums",
      "font-variant-numeric",
      "easeOutExpo",
      "count up animation",
      "IntersectionObserver"
    ],
    "scenes": [
      "page",
      "card",
      "list"
    ],
    "feel": [
      "crisp",
      "playful"
    ],
    "intent": [
      "attention",
      "waiting"
    ],
    "tags": [
      "js",
      "browser-api",
      "font-feature",
      "main-thread",
      "stable"
    ],
    "demo": {
      "shape": "stage"
    },
    "loop": "replay",
    "en": {
      "oneLiner": "A number races from 0 up to its target value and then holds still."
    },
    "defaults": {
      "target": 12800,
      "duration": 1200,
      "easing": "easeOutExpo",
      "grouping": true
    }
  },
  {
    "slug": "text-stroke",
    "code": "T-07",
    "nameZh": "描边文字",
    "nameEn": "Text Stroke",
    "aliases": [
      "空心字",
      "描边字",
      "轮廓文字",
      "text stroke",
      "outlined text",
      "hollow text",
      "text outline"
    ],
    "category": "type",
    "oneLiner": "文字只留一圈轮廓、里面是空的，大标题一下就硬起来了。",
    "whenToUse": [
      "首屏大标题、封面字，想要比实心字更轻的体量",
      "深色或图片背景上，需要文字有明确的轮廓边界",
      "做「描边 + 实心」两层排版，一虚一实叠出层次"
    ],
    "confusions": [
      {
        "with": "文字阴影",
        "diff": "text-shadow 画在字形外面，字本身的分量不变；text-stroke 是沿字形轮廓描一圈，笔画会被描边吃掉一半，字看起来更细。"
      },
      {
        "with": "渐变文字",
        "diff": "渐变文字填充的是字形内部；描边字内部是空的。想要「渐变填充 + 描边」就把两者叠加。"
      }
    ],
    "pitfalls": [
      "-webkit-text-stroke 是非标准属性（三大引擎都支持），它从轮廓中线向两侧画：小字号加粗描边会把细笔画糊掉，所以只给大字号用",
      "描边宽度用 px 固定，别用 em 跟着字号放大，否则大标题上的笔画全被吃掉",
      "只描边不填充时必须保证对比度：空心字放在浅色底上几乎看不见",
      "加 paint-order: stroke fill 能让描边先画、填充后画，避免描边压住字面",
      "描边色和填充色相同时，效果等于把字加粗，容易显得脏",
      "不要为了描边去用 SVG path 假字：读屏和文本选择都会坏掉"
    ],
    "keywords": [
      "-webkit-text-stroke",
      "text-stroke",
      "paint-order",
      "outlined text",
      "hollow text",
      "color: transparent",
      "@supports",
      "stroke-width"
    ],
    "scenes": [
      "text",
      "page",
      "card"
    ],
    "feel": [
      "crisp",
      "playful"
    ],
    "intent": [
      "attention",
      "hierarchy"
    ],
    "tags": [
      "css-only",
      "modern-css",
      "stable"
    ],
    "demo": {
      "shape": "stage"
    },
    "loop": "continuous",
    "en": {
      "oneLiner": "The glyphs keep only an outline with a hollow centre, which stiffens a big heading."
    },
    "defaults": {
      "width": 2,
      "size": 56,
      "fill": false
    }
  },
  {
    "slug": "tabular-numbers",
    "code": "T-08",
    "nameZh": "等宽数字",
    "nameEn": "Tabular Numbers",
    "aliases": [
      "等宽数字",
      "数字不跳",
      "表格数字",
      "tabular figures",
      "tabular-nums",
      "monospaced digits",
      "lining figures"
    ],
    "category": "type",
    "oneLiner": "让每个数字占一样宽，数值变化时整行不会左右抖。",
    "whenToUse": [
      "倒计时、计时器、播放进度这类数字一直在变的组件",
      "实时统计、价格、余额，数字跳动时会牵动整行宽度",
      "表格里要让小数点或个位对齐成一条竖线"
    ],
    "confusions": [
      {
        "with": "数字滚动",
        "diff": "数字滚动管的是数值怎么从 A 变到 B；等宽数字管的是每个数字占多宽。两者经常一起用——滚动时行宽不变，看起来才稳。"
      },
      {
        "with": "默认比例数字",
        "diff": "默认是比例数字（proportional）：1 比 8 窄，正文里更好看；一旦数字要纵向对齐或持续变化，就该切成等宽。"
      }
    ],
    "pitfalls": [
      "tabular-nums 需要字体支持这个 OpenType 特性，艺术字体可能没有，会悄悄退化成默认比例数字",
      "只加等宽还不够：位数变化（9 → 10）时整块仍会变宽，要给 min-width 或预留宽度并右对齐",
      "表格里要配合 text-align: right 且小数位数统一，否则照样对不齐",
      "font-feature-settings: \"tnum\" 是等价的旧写法，优先用 font-variant-numeric，可读性更好",
      "不要为了数字把整站换成等宽字体：只给需要的片段加这个特性"
    ],
    "keywords": [
      "font-variant-numeric",
      "tabular-nums",
      "font-feature-settings tnum",
      "lining-nums",
      "tabular figures",
      "text-align: right",
      "min-width",
      "OpenType feature"
    ],
    "scenes": [
      "text",
      "list",
      "page"
    ],
    "feel": [
      "crisp",
      "calm"
    ],
    "intent": [
      "hierarchy",
      "affordance"
    ],
    "tags": [
      "css-only",
      "font-feature",
      "stable"
    ],
    "demo": {
      "shape": "stage"
    },
    "loop": "continuous",
    "en": {
      "oneLiner": "Every digit takes the same width, so a changing number never shifts the line."
    },
    "defaults": {
      "tabular": true,
      "compare": true,
      "interval": 700
    }
  }
]
