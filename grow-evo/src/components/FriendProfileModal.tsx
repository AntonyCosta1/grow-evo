import type { Profile } from '../types'
import { getLevelProgress, getRankFromXp, getUnlockedBadges } from '../lib/gameUtils'
import { X, CheckCircle, Flame, Trophy } from 'lucide-react'

interface Props {
  profile: Profile
  onClose: () => void
}

export default function FriendProfileModal({ profile, onClose }: Props) {
  const { level, current, required, percent } = getLevelProgress(profile.total_xp)
  const rank = getRankFromXp(profile.total_xp)
  const badges = getUnlockedBadges(profile.tasks_completed, profile.streak, profile.total_xp)

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 50 }} onClick={onClose}>
      <div className="card" style={{ width: '100%', maxWidth: '420px', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #16a34a, #22c55e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: '700', flexShrink: 0 }}>
              {profile.username?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div>
              <p style={{ fontWeight: '700', fontSize: '1.1rem' }}>{profile.username}</p>
              <span className={`rank-badge rank-${rank.name}`} style={{ marginTop: '0.25rem', display: 'inline-flex' }}>{rank.icon} {rank.label}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.875rem', color: '#94a3b8', fontWeight: '600' }}>Nível {level}</span>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{current}/{required} XP</span>
          </div>
          <div className="xp-bar-track">
            <div className="xp-bar-fill" style={{ width: `${percent}%` }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
          {[
            { icon: <CheckCircle size={18} color="#4ade80" />, label: 'Completas', value: profile.tasks_completed },
            { icon: <Flame size={18} color="#fb923c" />,       label: 'Streak',    value: `${profile.streak}d` },
            { icon: <Trophy size={18} color="#ffd700" />,       label: 'Badges',    value: badges.length },
          ].map(s => (
            <div key={s.label} style={{ background: '#0f172a', borderRadius: '0.75rem', padding: '0.75rem', textAlign: 'center', border: '1px solid #1e293b' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.25rem' }}>{s.icon}</div>
              <p style={{ fontWeight: '700' }}>{s.value}</p>
              <p style={{ color: '#64748b', fontSize: '0.7rem' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {badges.length > 0 && (
          <div>
            <p style={{ fontWeight: '600', marginBottom: '0.75rem', color: '#94a3b8', fontSize: '0.875rem' }}>Conquistas</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {badges.map(b => (
                <div key={b.id} title={b.description} style={{ background: '#0f172a', borderRadius: '0.5rem', padding: '0.5rem 0.75rem', border: '1px solid #1e293b', fontSize: '1.25rem', cursor: 'default' }}>
                  {b.icon}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
