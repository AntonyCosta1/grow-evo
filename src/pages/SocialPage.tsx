import { useEffect, useState } from 'react'
import { useSocialStore } from '../store/socialStore'
import { useAuthStore } from '../store/authStore'
import { getRankFromXp, CATEGORY_META } from '../lib/gameUtils'
import type { Profile } from '../types'
import FriendProfileModal from '../components/FriendProfileModal'
import InviteCode from '../components/InviteCode'
import { Users, Bell, Trophy, Rss, CheckCircle, X, Flame, Star } from 'lucide-react'

type Tab = 'friends' | 'requests' | 'leaderboard' | 'feed'

export default function SocialPage() {
  const { user } = useAuthStore()
  const { friends, pendingRequests, feed, loading, fetchFriends, fetchPendingRequests, fetchFeed, acceptRequest, rejectRequest } = useSocialStore()
  const [tab, setTab] = useState<Tab>('friends')
  const [selectedFriend, setSelectedFriend] = useState<Profile | null>(null)

  useEffect(() => {
    if (!user) return
    fetchFriends(user.id)
    fetchPendingRequests(user.id)
    fetchFeed(user.id)
  }, [user])

  const leaderboard = [...friends]
    .filter(f => f.profile)
    .sort((a, b) => (b.profile!.total_xp) - (a.profile!.total_xp))

  const tabs: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'friends',     label: 'Amigos',   icon: <Users size={18} />,   badge: friends.length },
    { id: 'requests',    label: 'Pedidos',  icon: <Bell size={18} />,    badge: pendingRequests.length },
    { id: 'leaderboard', label: 'Ranking',  icon: <Trophy size={18} /> },
    { id: 'feed',        label: 'Feed',     icon: <Rss size={18} /> },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {selectedFriend && <FriendProfileModal profile={selectedFriend} onClose={() => setSelectedFriend(null)} />}

      <h1 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Social</h1>

      <InviteCode />

      <div style={{ display: 'flex', gap: '0.25rem', background: '#1e293b', borderRadius: '0.75rem', padding: '0.25rem', border: '1px solid #334155' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.5rem 0.25rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem', background: tab === t.id ? '#22c55e' : 'transparent', color: tab === t.id ? 'white' : '#64748b', transition: 'all 0.2s', position: 'relative' }}>
            {t.icon}
            <span style={{ display: window.innerWidth < 400 ? 'none' : 'inline' }}>{t.label}</span>
            {t.badge !== undefined && t.badge > 0 && (
              <span style={{ position: 'absolute', top: '2px', right: '4px', background: tab === t.id ? 'white' : '#22c55e', color: tab === t.id ? '#22c55e' : 'white', borderRadius: '9999px', fontSize: '0.6rem', fontWeight: '800', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{t.badge}</span>
            )}
          </button>
        ))}
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Carregando...</div>
      )}

      {tab === 'friends' && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {friends.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ fontSize: '2.5rem' }}>👥</p>
              <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Nenhum amigo ainda. Compartilhe seu código!</p>
            </div>
          ) : friends.map(f => {
            if (!f.profile) return null
            const rank = getRankFromXp(f.profile.total_xp)
            return (
              <div key={f.id} className="card card-hover" style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }} onClick={() => setSelectedFriend(f.profile!)}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #16a34a, #22c55e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', flexShrink: 0 }}>
                  {f.profile.username?.[0]?.toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: '600' }}>{f.profile.username}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                    <span className={`rank-badge rank-${rank.name}`} style={{ fontSize: '0.65rem', padding: '0.1rem 0.5rem' }}>{rank.icon} {rank.label}</span>
                    <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '2px' }}><Flame size={12} color="#fb923c" />{f.profile.streak}d</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ color: '#ffd700', fontWeight: '700', fontSize: '0.875rem' }}>⭐ {f.profile.total_xp.toLocaleString()}</p>
                  <p style={{ color: '#64748b', fontSize: '0.75rem' }}>Nível {f.profile.level}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {tab === 'requests' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {pendingRequests.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ fontSize: '2.5rem' }}>🔔</p>
              <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Nenhum pedido pendente.</p>
            </div>
          ) : pendingRequests.map(req => {
            const p = req.profile
            if (!p) return null
            const rank = getRankFromXp(p.total_xp)
            return (
              <div key={req.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', flexShrink: 0 }}>
                  {p.username?.[0]?.toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: '600' }}>{p.username}</p>
                  <span className={`rank-badge rank-${rank.name}`} style={{ fontSize: '0.65rem', padding: '0.1rem 0.5rem', marginTop: '0.25rem', display: 'inline-flex' }}>{rank.icon} {rank.label}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => acceptRequest(req.id)} style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid #22c55e44', borderRadius: '0.5rem', padding: '0.5rem', cursor: 'pointer', color: '#22c55e', transition: 'all 0.2s' }} title="Aceitar">
                    <CheckCircle size={18} />
                  </button>
                  <button onClick={() => rejectRequest(req.id)} style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid #f8717133', borderRadius: '0.5rem', padding: '0.5rem', cursor: 'pointer', color: '#f87171', transition: 'all 0.2s' }} title="Recusar">
                    <X size={18} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {tab === 'leaderboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {leaderboard.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ fontSize: '2.5rem' }}>🏆</p>
              <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Adicione amigos para ver o ranking!</p>
            </div>
          ) : leaderboard.map((f, index) => {
            if (!f.profile) return null
            const rank = getRankFromXp(f.profile.total_xp)
            const podium = ['🥇', '🥈', '🥉']
            return (
              <div key={f.id} className="card card-hover" style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', background: index === 0 ? 'rgba(255,215,0,0.05)' : '#1e293b', borderColor: index === 0 ? 'rgba(255,215,0,0.3)' : '#334155' }} onClick={() => setSelectedFriend(f.profile!)}>
                <span style={{ fontSize: '1.5rem', width: '32px', textAlign: 'center', flexShrink: 0 }}>
                  {index < 3 ? podium[index] : `#${index + 1}`}
                </span>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #16a34a, #22c55e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', flexShrink: 0 }}>
                  {f.profile.username?.[0]?.toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: '600' }}>{f.profile.username}</p>
                  <span className={`rank-badge rank-${rank.name}`} style={{ fontSize: '0.65rem', padding: '0.1rem 0.5rem' }}>{rank.icon} {rank.label}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ color: '#ffd700', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}><Star size={14} />{f.profile.total_xp.toLocaleString()}</p>
                  <p style={{ color: '#64748b', fontSize: '0.75rem' }}>Nível {f.profile.level}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {tab === 'feed' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {feed.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ fontSize: '2.5rem' }}>📰</p>
              <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Nenhuma atividade recente dos seus amigos.</p>
            </div>
          ) : feed.map(item => {
            const p = item.profile
            const payload = item.payload as Record<string, string | number>
            const cat = payload.category ? CATEGORY_META[payload.category as string] : null
            const timeAgo = (() => {
              const diff = Date.now() - new Date(item.created_at).getTime()
              const mins = Math.floor(diff / 60000)
              if (mins < 60) return `${mins}min atrás`
              const hrs = Math.floor(mins / 60)
              if (hrs < 24) return `${hrs}h atrás`
              return `${Math.floor(hrs / 24)}d atrás`
            })()

            return (
              <div key={item.id} className="card" style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #16a34a, #22c55e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.875rem', flexShrink: 0 }}>
                  {p?.username?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.875rem' }}>
                    <span style={{ fontWeight: '700', color: '#22c55e' }}>{p?.username ?? 'Alguém'}</span>
                    {item.type === 'task_completed' && <> completou <span style={{ fontWeight: '600' }}>{cat?.icon} {payload.title as string}</span></>}
                    {item.type === 'level_up' && <> alcançou o <span style={{ fontWeight: '600', color: '#a78bfa' }}>Nível {payload.level as number}</span> 🎉</>}
                    {item.type === 'rank_up' && <> subiu para o rank <span style={{ fontWeight: '600', color: '#ffd700' }}>{payload.rank as string}</span> 🏆</>}
                  </p>
                  {item.type === 'task_completed' && (
                    <p style={{ color: '#ffd700', fontSize: '0.75rem', marginTop: '0.25rem', fontWeight: '700' }}>+{payload.xp as number} XP</p>
                  )}
                  <p style={{ color: '#475569', fontSize: '0.7rem', marginTop: '0.25rem' }}>{timeAgo}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
