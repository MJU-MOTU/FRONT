import { useAuth } from '../auth/AuthContext.ts'

export function HomePage() {
  const { user, logout } = useAuth()

  return (
    <section>
      <h1>{user?.nickname}님, 반가워요</h1>
      <p className="muted">모의투자로 연습하고, 배우면서 투자하는 곳 MOTU입니다. 종목과 주문 화면은 곧 붙습니다.</p>
      <button type="button" onClick={() => void logout()}>로그아웃</button>
    </section>
  )
}
