import { useNavigate, useLocation } from 'react-router-dom'
import { useProfileStore } from '../store/profileStore'
import { getLevelProgress, getRankFromXp } from '../lib/gameUtils'
import { LayoutDashboard, CheckSquare, User, Sprout, Users } from 'lucide-react'

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { profile } = useProfileStore()

  const rank = profile ? getRankFromXp(profile.total_xp) : null
  const progress = profile ? getLevelProgress(profile.total_xp) : null

  const navItems = [
    { path: '/dashboard', icon: <LayoutDashboard size={22} />, label: 'Dashboard' },
    { path: '/tasks',     icon: <CheckSquare size={22} />,     label: 'Tarefas' },
    { path: '/social',    icon: <Users size={22} />,            label: 'Social' },
    { path: '/profile',   icon: <User size={22} />,            label: 'Perfil' },
  ]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ position: 'sticky', top: 0, zIndex: 40, background: 'rgba(15,23,42,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #1e293b', padding: '0 1.5rem', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '0.5rem', background: 'linear-gradient(135deg, #16a34a, #22c55e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sprout size={18} color="white" />
          </div>
          <span style={{ fontWeight: '800', background: 'linear-gradient(135deg, #22c55e, #86efac)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Grow Evo</span>
        </div>
        {profile && rank && progress && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Nível {progress.level}</span>
                <span className={`rank-badge rank-${rank.name}`} style={{ fontSize: '0.65rem', padding: '0.1rem 0.5rem' }}>{rank.icon} {rank.label}</span>
              </div>
              <div style={{ width: '120px', height: '4px', borderRadius: '9999px', background: '#1e293b', overflow: 'hidden' }}>
                <div style={{ width: `${progress.percent}%`, height: '100%', borderRadius: '9999px', background: 'linear-gradient(90deg, #22c55e, #86efac)', transition: 'width 0.6s ease' }} />
              </div>
            </div>
            <span style={{ color: '#ffd700', fontWeight: '700', fontSize: '0.875rem' }}>⭐ {profile.total_xp.toLocaleString()}</span>
          </div>
        )}
      </header>

      <main style={{ flex: 1, maxWidth: '800px', width: '100%', margin: '0 auto', padding: '1.5rem 1rem', paddingBottom: '5rem' }}>
        {children}
      </main>

      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(12px)', borderTop: '1px solid #1e293b', display: 'flex', justifyContent: 'center', padding: '0.5rem 0', zIndex: 40 }}>
        <div style={{ display: 'flex', gap: '0', width: '100%', maxWidth: '400px' }}>
          {navItems.map(item => {
            const active = location.pathname === item.path
            return (
              <button key={item.path} onClick={() => navigate(item.path)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: active ? '#22c55e' : '#475569', transition: 'color 0.2s' }}>
                {item.icon}
                <span style={{ fontSize: '0.7rem', fontWeight: active ? '700' : '400' }}>{item.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
