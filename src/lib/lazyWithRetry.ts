import { lazy, type ComponentType } from 'react'

export const RELOAD_FLAG = 'design-museum:chunk-reloaded'

/* eslint-disable @typescript-eslint/no-explicit-any */
// 和 React.lazy 自己的签名保持一致：组件的 props 类型在这里不需要被约束
type AnyComponent = ComponentType<any>
type Loader<T> = () => Promise<{ default: T }>

/**
 * 给加载器套一层自愈。
 *
 * 部署之后浏览器缓存里可能还是上一份 index.html，而它引用的那些带 hash 的
 * chunk 已经被新构建整批换掉——动态 import 于是 404，页面直接白屏。
 * 部署后十几分钟内回访的浏览器都会撞上（本项目的 CI 上真实发生过）。
 *
 * 处理方式：import 失败就刷新一次。用 sessionStorage 标记防止死循环；
 * 一旦加载成功就把标记清掉，所以下一次部署还能再自愈一次。
 */
export function retryingLoader<T>(loader: Loader<T>): Loader<T> {
  return () =>
    loader().then(
      (module) => {
        try {
          window.sessionStorage.removeItem(RELOAD_FLAG)
        } catch {
          // 隐私模式下拿不到 sessionStorage，不影响正常加载
        }
        return module
      },
      (error: unknown) => {
        let alreadyReloaded = true
        try {
          alreadyReloaded = window.sessionStorage.getItem(RELOAD_FLAG) === '1'
          if (!alreadyReloaded) window.sessionStorage.setItem(RELOAD_FLAG, '1')
        } catch {
          // 拿不到 sessionStorage 就不刷新，宁可见到报错也不要可能死循环
        }
        if (!alreadyReloaded) {
          window.location.reload()
          // 刷新期间挂住，别再往下抛错
          return new Promise<{ default: T }>(() => {})
        }
        throw error
      },
    )
}

export function lazyWithRetry<T extends AnyComponent>(loader: Loader<T>) {
  return lazy(retryingLoader(loader))
}
