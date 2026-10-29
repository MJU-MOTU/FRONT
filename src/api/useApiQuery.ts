import { useEffect, useState } from 'react'

type Result<T> = { key: string; data?: T; error?: unknown }

// deps가 바뀌면 다시 불러온다. 응답이 늦게 와도 지금 deps에 해당하는 결과만 보여 준다
export function useApiQuery<T>(load: () => Promise<T>, deps: readonly unknown[]) {
  const key = JSON.stringify(deps)
  const [result, setResult] = useState<Result<T> | null>(null)

  useEffect(() => {
    let cancelled = false
    load()
      .then((data) => {
        if (!cancelled) setResult({ key, data })
      })
      .catch((error: unknown) => {
        if (!cancelled) setResult({ key, error })
      })
    return () => {
      cancelled = true
    }
    // load는 매 렌더마다 새로 만들어지므로 deps(key)로만 다시 부른다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const current = result?.key === key ? result : null
  return { loading: current === null, data: current?.data, error: current?.error }
}
