import '@fontsource-variable/space-grotesk'
import '@fontsource-variable/jetbrains-mono'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { normalizeLegacyHash } from './lib/router'
import './styles/global.css'

// 老链接（#/entry/frosted-glass）在挂载前归一化成 /entry/frosted-glass/，
// 免得路由先按 hash 渲染一遍、地址栏再跳一次。
normalizeLegacyHash()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
