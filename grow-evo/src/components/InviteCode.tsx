import { useState } from 'react'
import { useProfileStore } from '../store/profileStore'
import { useSocialStore } from '../store/socialStore'
import { useAuthStore } from '../store/authStore'
import { Copy, Check, Search, UserPlus } from 'lucide-react'
import { getRankFromXp } from '../lib/gameUtils'

export default function InviteCode() {
  const { profile } = useProfileStore()
  const { user } = useAuthStore()
  const { searchByCode, sendRequest, clearSearch, searchResult, searchError } = useSocialStore()
  const [copied, setCopied] = useState(false)
  const [searchCode, setSearchCode] = useState('')
  const [sent, setSent] = useState(false)

  const handleCopy = () => {
    if (!profile?.invite_code) return
    navigator.clipboard.writeText(profile.invite_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setSent(false)
    clearSearch()
    await searchByCode(searchCode)
  }

  const handleSendRequest = async () => {
    if (!searchResult || !user) return
    await sendRequest(searchResult.id, user.id)
    setSent(true)
  }

  const rank = searchResult ? getRankFromXp(searchResult.total_xp) : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="card">
        <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Seu código de convite</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <code style={{ flex: 1, background: '#0f172a', padding: '0.625rem 1rem', borderRadius: '0.75rem', border: '1px solid #334155', fontWeight: '700', fontSize: '1.1rem', color: '#22c55e', letterSpacing: '0.1em' }}>
            {profile?.invite_code ?? '—'}
          </code>
          <button className="btn-secondary" onClick={handleCopy} style={{ flexShrink: 0 }}>
            {copied ? <Check size={16} color="#22c55e" /> : <Copy size={16} />}
            {copied ? 'Copiado!' : 'Copiar'}
          </button>
        </div>
        <p style={{ color: '#475569', fontSize: '0.75rem', marginTop: '0.5rem' }}>Compartilhe este código para que amigos possam te encontrar.</p>
      </div>

      <div className="card">
        <p style={{ fontWeight: '600', marginBottom: '0.75rem' }}>Adicionar amigo por código</p>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            className="input-field"
            placeholder="Ex: GROW-A1B2C3D4"
            value={searchCode}
            onChange={e => { setSearchCode(e.target.value); clearSearch(); setSent(false) }}
            style={{ textTransform: 'uppercase' }}
          />
          <button type="submit" className="btn-primary" style={{ flexShrink: 0 }}>
            <Search size={16} />
          </button>
        </form>

        {searchError && (
          <p style={{ color: '#f87171', fontSize: '0.875rem', marginTop: '0.75rem' }}>{searchError}</p>
        )}

        {searchResult && rank && (
          <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', background: '#0f172a', borderRadius: '0.75rem', border: '1px solid #334155' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #16a34a, #22c55e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', flexShrink: 0 }}>
              {searchResult.username?.[0]?.toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: '600' }}>{searchResult.username}</p>
              <span className={`rank-badge rank-${rank.name}`} style={{ fontSize: '0.65rem', padding: '0.1rem 0.5rem' }}>{rank.icon} {rank.label}</span>
            </div>
            {searchResult.id !== user?.id && (
              <button
                className={sent ? 'btn-secondary' : 'btn-primary'}
                onClick={handleSendRequest}
                disabled={sent}
                style={{ flexShrink: 0 }}
              >
                {sent ? <Check size={16} /> : <UserPlus size={16} />}
                {sent ? 'Enviado!' : 'Adicionar'}
              </button>
            )}
            {searchResult.id === user?.id && (
              <span style={{ color: '#64748b', fontSize: '0.8rem' }}>Você mesmo</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
