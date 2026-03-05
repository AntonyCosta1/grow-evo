import { useProfileStore } from '../store/profileStore'
import { useAuthStore } from '../store/authStore'
import { getLevelProgress, getRankFromXp, getUnlockedBadges, RANKS } from '../lib/gameUtils'
import { LogOut, Star, Flame, CheckCircle, Trophy } from 'lucide-react'

export default function ProfilePage() {
  const { profile } = useProfileStore()
  const { signOut, user } = useAuthStore()

  if (!profile) return null

  const { level, current, required, percent } = getLevelProgress(profile.total_xp)
  const currentRank = getRankFromXp(profile.total_xp)
  const badges = getUnlockedBadges(profile.tasks_completed, profile.streak, profile.total_xp)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #16a34a, #22c55e)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '2rem' }}>
          {profile.username?.[0]?.toUpperCase() ?? '?'}
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>{profile.username}</h2>
        <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>{user?.email}</p>
        <div style={{ marginTop: '1rem' }}>
          <span className={`rank-badge rank-${currentRank.name}`}>{currentRank.icon} {currentRank.label}</span>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Star size={16} color="#ffd700" />
            <span style={{ fontWeight: '600' }}>Nível {level}</span>
          </div>
          <span style={{ color: '#64748b', fontSize: '0.875rem' }}>{profile.total_xp.toLocaleString()} XP total</span>
        </div>
        <div className="xp-bar-track">
          <div className="xp-bar-fill" style={{ width: `${percent}%` }} />
        </div>
        <p style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.5rem' }}>{current} / {required} XP — {Math.round(required - current)} restantes</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        {[
          { icon: <CheckCircle size={20} color="#4ade80" />, label: 'Completas', value: profile.tasks_completed },
          { icon: <Flame size={20} color="#fb923c" />,      label: 'Streak',    value: `${profile.streak}d` },
          { icon: <Trophy size={20} color="#ffd700" />,      label: 'Badges',    value: badges.length },
        ].map(s => (
          <div key={s.label} className="card" style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>{s.icon}</div>
            <p style={{ fontSize: '1.25rem', fontWeight: '700' }}>{s.value}</p>
            <p style={{ color: '#64748b', fontSize: '0.75rem' }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 style={{ fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Trophy size={18} color="#ffd700" /> Progressão de Rank
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {RANKS.map(rank => {
            const unlocked = profile.total_xp >= rank.minXp
            const isCurrent = rank.name === currentRank.name
            return (
              <div key={rank.name} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', borderRadius: '0.75rem', background: isCurrent ? `${rank.color}11` : 'transparent', border: isCurrent ? `1px solid ${rank.color}44` : '1px solid transparent', opacity: unlocked ? 1 : 0.4 }}>
                <span style={{ fontSize: '1.5rem' }}>{rank.icon}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: '600', color: unlocked ? rank.color : '#475569' }}>{rank.label}</p>
                  <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{rank.minXp.toLocaleString()} XP{rank.maxXp !== Infinity ? ` — ${rank.maxXp.toLocaleString()} XP` : '+'}</p>
                </div>
                {isCurrent && <span style={{ fontSize: '0.75rem', color: rank.color, fontWeight: '700' }}>ATUAL</span>}
                {unlocked && !isCurrent && <span style={{ fontSize: '0.75rem', color: '#4ade80' }}>✓</span>}
              </div>
            )
          })}
        </div>
      </div>

      {badges.length > 0 && (
        <div className="card">
          <h2 style={{ fontWeight: '700', marginBottom: '1rem' }}>Conquistas ({badges.length})</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem' }}>
            {badges.map(badge => (
              <div key={badge.id} style={{ background: '#0f172a', borderRadius: '0.75rem', padding: '1rem', border: '1px solid #334155', textAlign: 'center' }}>
                <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>{badge.icon}</span>
                <p style={{ fontWeight: '600', fontSize: '0.875rem' }}>{badge.name}</p>
                <p style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.25rem' }}>{badge.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <button className="btn-secondary" onClick={signOut} style={{ width: '100%', justifyContent: 'center', color: '#f87171', borderColor: '#f8717133' }}>
        <LogOut size={18} /> Sair da conta
      </button>
    </div>
  )
}
