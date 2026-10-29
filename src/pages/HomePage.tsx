import { Link } from 'react-router'
import { useAuth } from '../auth/AuthContext.ts'

export function HomePage() {
  const { user } = useAuth()

  return (
    <section>
      <h1>{user?.nickname}님, 반가워요</h1>
      <p className="muted">모의투자로 연습하고, 배우면서 투자하는 곳 MOTU입니다.</p>
      <p><Link to="/stocks">종목 둘러보기 →</Link></p>
      <p><Link to="/portfolio">내 포트폴리오 →</Link></p>
    </section>
  )
}
