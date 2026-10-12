// 起一个 middleware 模式的 vite，用 SSR 加载器读站点数据，再关掉它。
// 维护者脚本（new:entry / find / gen:meta / 预渲染）都走这一条路：
// 数据的唯一真源是 src/data/ 里的 TypeScript，脚本不去解析源码文本。
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

/**
 * @template T
 * @param {(load: (id: string) => Promise<any>) => Promise<T>} run
 * @returns {Promise<T>}
 */
export async function withSite(run) {
  const server = await createServer({
    root,
    server: { middlewareMode: true },
    appType: 'custom',
    logLevel: 'error',
  })
  try {
    return await run((id) => server.ssrLoadModule(id))
  } finally {
    await server.close()
  }
}

export { root }
