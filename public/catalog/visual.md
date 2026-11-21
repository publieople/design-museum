# 前端设计博物馆 · 视觉质感 / Visual & Material（V 厅）

> 表面、材质、光与色彩的观感

> 本厅 8 条词条。全量目录见 https://publieople.github.io/design-museum/catalog.md（锚点与本文一致），分片索引见 https://publieople.github.io/design-museum/catalog/index.json。

## 词条

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
- 别搞混 · 玻璃拟态：毛玻璃只做一件事：把背后内容模糊掉（backdrop-filter: blur），面板本身可以完全透明；玻璃拟态是在这层模糊上再叠半透明白渐变、1px 亮描边、inset 高光和投影，是一整套面板外观。
- 别搞混 · 渐变网格：渐变网格是自己用多层 radial-gradient 画出的彩色背景，不依赖背后有什么；毛玻璃是消费背后已有内容的面板材质。正确用法是网格当背景、毛玻璃当面板，反过来没有东西可模糊。
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
- 别搞混 · 极光渐变：渐变网格的色标本身不动，色团只有单独加动画才会移；极光渐变的核心是持续漂移（translate 加色相或饱和度变化），同样几团颜色在慢慢游动。静态截图看不出差别，要看动起来。
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
- 别搞混 · 极光渐变：极光渐变是整片背景自己缓慢漂移，和指针无关；聚光光晕有一个跟随指针的圆心，被裁在元素内部，指针不动它就停住。
- 别搞混 · 光标跟随：光标跟随的元素在元素外部跟着指针满屏移动，是独立的光标替代品；聚光光晕被 overflow: hidden 或 mask 裁在卡片内部，只是卡片表面的一层光，不能跑出边界。
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
- 别搞混 · 渐变文字：渐变描边画的是盒子边界那一圈，内部留空或另填底色；渐变文字是把渐变裁进字形（background-clip: text），渐变铺满的是文字笔画而不是边框。两者都用 background，但裁切目标不同。
- 别搞混 · 边缘渐隐：边缘渐隐是用 mask 让内容的透明度在边缘衰减到 0，内容本身逐渐消失；渐变描边是沿边界画一条实线，线的颜色变、透明度不变，内容在边界内完整可见。
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
- 别搞混 · 光晕聚光：聚光跟着指针走，是人给的反馈；极光自己漂，有没有人都一样。
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
- 别搞混 · 渐变描边：渐变描边只画边框那一圈，内容到边仍是硬边、不被淡化；边缘渐隐不画线，靠 mask 把内容本身在边缘变透明。想让内容化开用 mask，想画一圈线用 border。
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
