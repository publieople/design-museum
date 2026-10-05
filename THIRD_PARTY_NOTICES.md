# 第三方声明与许可范围

本仓库采用**双许可**：代码走 MIT，内容走 CC BY 4.0。两者的适用路径见下表；第三方组件与字体的许可见后文。

## 1. 本项目自身

| 许可 | 适用路径 | 全文 |
|---|---|---|
| **MIT** | 其余全部内容：`src/**`（除下表列出的数据与文案）、`index.html`、构建与配置文件、`.github/**`、`.oxlintrc.json`、`tsconfig*.json`、`vite.config.ts` | [LICENSE](LICENSE) |
| **CC BY 4.0** | 教学与文案内容：`src/data/entries/**`、`src/data/taxonomy.ts`、`src/i18n/strings.ts`、`README.md`、`CONTRIBUTING.md`、`CODE_OF_CONDUCT.md`、本文件、`public/og.png` | [LICENSE-CONTENT](LICENSE-CONTENT) |

CC BY 4.0 要求署名：转载或改编内容时请注明「前端设计博物馆 · https://publieople.github.io/design-museum/」并保留许可声明。代码部分保留 `LICENSE` 中的版权声明即可。

## 2. 第三方组件

以下是构建产物中实际包含其代码的依赖（版本以 `pnpm-lock.yaml` 为准，此处列出当前安装版本）：

| 组件 | 版本 | 许可 |
|---|---|---|
| [react](https://github.com/facebook/react) | 19.3.0 | MIT |
| [react-dom](https://github.com/facebook/react) | 19.3.0 | MIT |
| [tailwindcss](https://github.com/tailwindlabs/tailwindcss) | 4.3.3 | MIT |
| [@tailwindcss/vite](https://github.com/tailwindlabs/tailwindcss) | 4.3.3 | MIT |
| [vite](https://github.com/vitejs/vite) | 8.3.1 | MIT |
| [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react) | 6.1.1 | MIT |
| [typescript](https://github.com/microsoft/TypeScript) | 6.0.3 | Apache-2.0 |
| [vitest](https://github.com/vitest-dev/vitest) | 5.0.3 | MIT |
| [oxlint](https://github.com/oxc-project/oxc) | 1.86.0 | MIT |

开发期依赖（`vitest`、`oxlint`、`typescript`、`@vitejs/plugin-react`）不会进入发布产物；其余组件会随构建结果分发，其许可全文见各自仓库的 `LICENSE` 文件。

## 3. 字体

站点**不请求外部字体 CDN**，两个可变字体以 `@fontsource-variable` 打包，构建后作为 `.woff2` 随站点分发。二者均为 **SIL Open Font License 1.1**：

| 字体 | 上游 | 版权行 | 许可全文 |
|---|---|---|---|
| JetBrains Mono Variable | [JetBrains/JetBrainsMono](https://github.com/JetBrains/JetBrainsMono) | Copyright 2020 The JetBrains Mono Project Authors | [public/licenses/OFL-1.1-JetBrainsMono.txt](public/licenses/OFL-1.1-JetBrainsMono.txt) |
| Space Grotesk Variable | [floriankarsten/space-grotesk](https://github.com/floriankarsten/space-grotesk) | Copyright 2020 The Space Grotesk Project Authors | [public/licenses/OFL-1.1-SpaceGrotesk.txt](public/licenses/OFL-1.1-SpaceGrotesk.txt) |

这两份文本放在 `public/` 下，因此会跟着构建进入 `dist/`，即**许可声明与字体文件一起分发**（OFL 的要求）。线上地址形如 `https://publieople.github.io/design-museum/licenses/OFL-1.1-JetBrainsMono.txt`；站点「怎么用」页也给了可见入口。

OFL 允许自由使用、修改、再分发（包括商用），但**不得单独售卖字体本身**，且修改后的版本不得继续使用保留字体名（Reserved Font Name）。

## 4. 内容引用政策

30 条词条的正文是**原创改写**，只做链接引用，不复制原文：

- 参考链接指向 [MDN Web Docs](https://developer.mozilla.org/)、[web.dev](https://web.dev/)、[W3C](https://www.w3.org/) 与 [Chrome for Developers](https://developer.chrome.com/) 的规范与文档页；这些页面的版权归各自所有者，本项目只提供引用地址。
- 演示（`src/demos/*.tsx`）全部为本仓库自行实现，未拷贝第三方组件库源码或示例代码。
- 站内没有引入任何第三方图片；`public/og.png` 与 `public/favicon.svg` 为本站自制。

## 5. 新增素材的规则

添加依赖、字体、图片或任何拷贝自他处的代码时：

1. 先确认许可允许在 MIT / CC BY 4.0 的项目中使用（禁止引入 GPL/AGPL 代码进 `src/`，除非全项目换许可）。
2. 把组件/字体/素材登记进本文件的对应表格。
3. 需要随产物分发许可全文的（如 OFL 字体），把全文放进 `public/licenses/`。
4. 不引入外部字体 CDN、分析脚本、埋点或任何运行时外部请求（本站是纯静态、零外部请求的产物）。
