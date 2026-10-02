import { useCallback, useState } from 'react'

/**
 * 展示用 demo 的重播计数器：DemoStage 的循环定时器会调用 replay()，
 * demo 侧只需要把它当成 key 就能重新播放。
 */
export function useReplayKey(): [number, () => void] {
  const [replayKey, setReplayKey] = useState(0)
  const replay = useCallback(() => setReplayKey((key) => key + 1), [])
  return [replayKey, replay]
}
