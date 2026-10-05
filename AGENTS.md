# 给 AI 编码代理的仓库规则

人类贡献者的完整流程见 [CONTRIBUTING.md](CONTRIBUTING.md)。这里是硬约束，改代码前先读完。

## 项目

前端设计博物馆：纯静态站点（Vite 8 + React 19 + TypeScript + Tailwind v4），零后端、零外部请求。教学目标是让人查到前端效果的**名字**，复制成给 AI 的设计需求。

## 命令

```fish
pnpm typecheck && pnpm lint && pnpm test && pnpm build
```

四项必须全绿才算改完。测试是唯一门槛，覆盖：30 条词条的内容校验、检索、参数 URL、偏好、i18n、提示词生成、页面渲染冒烟。改视觉也要人眼验收（截图），测试看不出好不好看。

## 硬规矩

- **不新增运行时依赖**。刻意不引路由库（`src/lib/router.tsx` 是四十来行的 hash 路由）、不引检索库、不引状态库、不引 UI 组件库
- UI 文案只放 `src/i18n/strings.ts`，`zh`/`en` 都不能空；组件里不写死字符串
- `src/demos/*.tsx` 里的示例文案按 `locale` 切换；测试会检查英文模式下渲染结果不含中文字符
- 会动的效果走 `usePrefersReducedMotion()`
- demo 不写死颜色：用 `var(--stage-ink)` / `var(--stage-muted)`；需要不透明底用 `color-mix(in srgb, var(--stage-ink) 10%, var(--stage-bg, transparent))`
- 不提交 `dist/`（已在 `.gitignore`）
- 不引入外部字体 CDN、外链图片、埋点脚本
- 改 `src/lib/**`、`src/components/**`、构建配置前先说明原因——这些文件影响全站

## 新增词条

按 README「新增一条词条」5 步走：文件名 = slug，同时写 `src/demos/<slug>.tsx`；`refs` 至少一条 MDN / web.dev / W3C；`loop` 按演示的实际行为选，不按名字猜；缺字段、编号不连续、`related` 死链都会被测试拦下。

## 许可

代码 MIT，内容 CC BY 4.0，范围见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。**不要粘贴来源不明的代码或图片。**

## 提交

Conventional Commits + 中文描述（`feat`/`fix`/`style`/`refactor`/`docs`/`test`/`chore`/`perf`），一条提交一件事。分支名 `feat/…`、`fix/…`、`docs/…`、`chore/…`。不要直接改 `main`。
