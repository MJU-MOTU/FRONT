import { NavLink } from 'react-router'
import { useAuth } from '../auth/AuthContext.ts'

export function NavBar() {
  const { status, logout } = useAuth()
  if (status !== 'authenticated') return null

  return (
    <nav className="nav">
      <NavLink to="/" className="brand">MOTU</NavLink>
      <NavLink to="/stocks">종목</NavLink>
      <button type="button" className="link" onClick={() => void logout()}>로그아웃</button>
    </nav>
  )
}
