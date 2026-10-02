import { Link } from '../lib/router'

const TEMPLATE = `请用 <技术栈> 实现下面这个效果，按术语的标准做法来，不要用相近但不同的做法替代：

- 效果名称：毛玻璃（Frosted Glass / backdrop blur）
- 参数：模糊半径 12px，饱和度 180%
- 技术要求：backdrop-filter: blur(12px) saturate(180%)，面板背景 rgba(255,255,255,0.08)，
  1px 半透明白描边，面板必须叠在有内容的背景上
- 不要：用纯色半透明代替（那是「半透明」，不是毛玻璃）`

export function AboutPage() {
  return (
    <article className="flex max-w-2xl flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-2xl font-semibold tracking-tight">怎么用这份词典</h1>
        <p className="text-muted">
          这个站不为教你写代码，为的是解决一件事：把「我想要那个……嗯……就是那个效果」
          变成一句 AI 一次就能做对的需求。
        </p>
      </header>

      <section className="flex flex-col gap-3 border-t border-line pt-5">
        <h2 className="label-mono">三步</h2>
        <ol className="flex list-decimal flex-col gap-3 pl-5">
          <li>
            <p className="font-medium">找到它。</p>
            <p className="text-sm text-muted">
              知道名字就直接搜；不知道就按口语说法搜（「磨砂」「果冻」「卡片飘起来」），
              或者走
              <Link to="/feel" className="mx-1 text-accent no-underline">
                感觉导航
              </Link>
              。
            </p>
          </li>
          <li>
            <p className="font-medium">调到你要的样子。</p>
            <p className="text-sm text-muted">
              每个词条都有可交互演示和参数滑块。时长、缓动、模糊半径这些数值不是玄学，
              滑一遍就知道差异在哪；顺带也能换背景，因为毛玻璃、发光这类效果离开背景就不成立。
            </p>
          </li>
          <li>
            <p className="font-medium">复制过去。</p>
            <p className="text-sm text-muted">
              词条页给你两版：中文需求句（带当前参数）和英文关键词（AI 最容易认的术语）。
              一次要加好几个效果，就去
              <Link to="/cheatsheet" className="mx-1 text-accent no-underline">
                速查表
              </Link>
              勾选后整段导出。
            </p>
          </li>
        </ol>
      </section>

      <section className="flex flex-col gap-3 border-t border-line pt-5">
        <h2 className="label-mono">为什么术语比形容词管用</h2>
        <p className="text-sm text-muted">
          「高级一点的卡片」是形容词，「悬停抬升 + 12px 柔和投影 + 200ms ease-out」是名词和数值。
          前者要 AI 猜，后者 AI 能直接对上它训练过的实现。所以每条词条都同时给出中文名、英文术语、
          CSS 属性名和推荐取值——你负责挑，AI 负责落。
        </p>
      </section>

      <section className="flex flex-col gap-3 border-t border-line pt-5">
        <h2 className="label-mono">提示词模板</h2>
        <pre className="overflow-x-auto rounded-lg border border-line bg-raised p-4 font-mono text-xs leading-relaxed">
          {TEMPLATE}
        </pre>
      </section>

      <section className="flex flex-col gap-3 border-t border-line pt-5">
        <h2 className="label-mono">两个常见误区</h2>
        <ul className="flex list-disc flex-col gap-2 pl-5 text-sm">
          <li>
            <span className="font-medium">把「别搞混」当废话。</span>
            这一栏专门写两个容易混的效果差在哪——它通常也是 AI 最容易做错的地方。
          </li>
          <li>
            <span className="font-medium">只要关键词不要参数。</span>
            同一个效果在 150ms 和 600ms 下是两种气质，参数才是你那次审美判断的落点。
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3 border-t border-line pt-5">
        <h2 className="label-mono">继续走</h2>
        <p className="text-sm text-muted">
          直接
          <Link to="/browse" className="mx-1 text-accent no-underline">
            进词条库
          </Link>
          ，或者回到
          <Link to="/" className="mx-1 text-accent no-underline">
            首页
          </Link>
          搜一个你现在正缺的效果。
        </p>
      </section>
    </article>
  )
}
