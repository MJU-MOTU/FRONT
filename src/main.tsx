import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// 새로 배포하면 이전 빌드의 청크 파일이 사라진다. 열어 둔 탭이 지연 로딩(차트)에 실패하면 새로고침해 새 빌드를 받는다.
// 새로고침해도 또 실패하면(파일이 정말 없는 경우) 계속 새로고침하지 않도록 10초 안에는 한 번만 한다
const CHUNK_RELOAD_KEY = 'motu:chunk-reload-at'
window.addEventListener('vite:preloadError', (event) => {
  const last = Number(sessionStorage.getItem(CHUNK_RELOAD_KEY) ?? 0)
  if (Date.now() - last < 10_000) return
  sessionStorage.setItem(CHUNK_RELOAD_KEY, String(Date.now()))
  event.preventDefault()
  window.location.reload()
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
