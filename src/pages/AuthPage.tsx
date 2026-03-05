import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Sprout, Mail, Lock, User, Eye, EyeOff } from 'lucide-react'

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (mode === 'register') {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } },
      })
      if (signUpError) { setError(signUpError.message); setLoading(false); return }
      setSuccess('Conta criada! Verifique seu e-mail para confirmar.')
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) { setError('E-mail ou senha incorretos.'); setLoading(false); return }
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'linear-gradient(135deg, #0f172a 0%, #1a1a2e 50%, #0f172a 100%)' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '1rem', background: 'linear-gradient(135deg, #16a34a, #22c55e)', marginBottom: '1rem' }}>
            <Sprout size={32} color="white" />
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', background: 'linear-gradient(135deg, #22c55e, #86efac)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Grow Evo</h1>
          <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Evolua. Um hábito por vez.</p>
        </div>

        <div className="card">
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: '#0f172a', borderRadius: '0.75rem', padding: '0.25rem' }}>
            {(['login', 'register'] as const).map(m => (
              <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: '0.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem', background: mode === m ? '#22c55e' : 'transparent', color: mode === m ? 'white' : '#64748b', transition: 'all 0.2s' }}>
                {m === 'login' ? 'Entrar' : 'Criar Conta'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {mode === 'register' && (
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                <input className="input-field" style={{ paddingLeft: '2.5rem' }} placeholder="Nome de usuário" value={username} onChange={e => setUsername(e.target.value)} required />
              </div>
            )}
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
              <input className="input-field" style={{ paddingLeft: '2.5rem' }} type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
              <input className="input-field" style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }} type={showPass ? 'text' : 'password'} placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} required />
              <button type="button" onClick={() => setShowPass(v => !v)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#475569' }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {error && <p style={{ color: '#f87171', fontSize: '0.875rem', textAlign: 'center' }}>{error}</p>}
            {success && <p style={{ color: '#4ade80', fontSize: '0.875rem', textAlign: 'center' }}>{success}</p>}

            <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>
              {loading ? 'Carregando...' : mode === 'login' ? 'Entrar' : 'Criar Conta'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
