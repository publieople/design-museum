import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

interface ToastItem {
  id: number
  message: string
  tone: 'ok' | 'error'
}

interface ToastApi {
  notify: (message: string, tone?: 'ok' | 'error') => void
}

const ToastContext = createContext<ToastApi>({ notify: () => {} })

export function useToast(): ToastApi {
  return useContext(ToastContext)
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const nextId = useRef(1)

  const notify = useCallback((message: string, tone: 'ok' | 'error' = 'ok') => {
    const id = nextId.current
    nextId.current += 1
    setItems((prev) => [...prev, { id, message, tone }])
    window.setTimeout(() => {
      setItems((prev) => prev.filter((item) => item.id !== id))
    }, 2200)
  }, [])

  const api = useMemo(() => ({ notify }), [notify])

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex flex-col items-center gap-2"
      >
        {items.map((item) => (
          <div
            key={item.id}
            className={`rounded-full border px-4 py-1.5 text-sm shadow-sm ${
              item.tone === 'error'
                ? 'border-accent/40 bg-raised text-accent'
                : 'border-line bg-raised text-ink'
            }`}
          >
            {item.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
