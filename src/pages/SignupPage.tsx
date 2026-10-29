import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import { ApiError } from '../api/ApiError.ts'
import { useAuth } from '../auth/AuthContext.ts'

type FieldErrors = Partial<Record<'email' | 'password' | 'nickname', string>>

export function SignupPage() {
  const { status, signup } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [submitting, setSubmitting] = useState(false)

  if (status === 'authenticated') {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    setFieldErrors({})
    try {
      await signup(email, password, nickname)
      navigate('/', { replace: true })
    } catch (e) {
      if (e instanceof ApiError) {
        setError(e.message)
        setFieldErrors(Object.fromEntries(e.errors.map((f) => [f.field, f.message])))
      } else {
        setError('가입하지 못했습니다. 잠시 후 다시 시도해 주세요')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h1>회원가입</h1>
      <label>
        이메일
        <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        {fieldErrors.email && <span className="error">{fieldErrors.email}</span>}
      </label>
      <label>
        비밀번호
        <input type="password" autoComplete="new-password" required minLength={8} maxLength={64} value={password} onChange={(e) => setPassword(e.target.value)} />
        <span className="muted">공백 없는 영문·숫자·기호 8~64자</span>
        {fieldErrors.password && <span className="error">{fieldErrors.password}</span>}
      </label>
      <label>
        닉네임
        <input autoComplete="nickname" required minLength={2} maxLength={20} value={nickname} onChange={(e) => setNickname(e.target.value)} />
        {fieldErrors.nickname && <span className="error">{fieldErrors.nickname}</span>}
      </label>
      {error && <p className="error" role="alert">{error}</p>}
      <button type="submit" disabled={submitting}>{submitting ? '가입 중…' : '가입하기'}</button>
      <p className="muted">
        이미 계정이 있나요? <Link to="/login">로그인</Link>
      </p>
    </form>
  )
}
