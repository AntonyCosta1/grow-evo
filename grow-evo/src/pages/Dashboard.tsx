import { useProfileStore } from '../store/profileStore'
import { useTaskStore } from '../store/taskStore'
import { useAuthStore } from '../store/authStore'
import { getLevelProgress, getRankFromXp, getUnlockedBadges, CATEGORY_META } from '../lib/gameUtils'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Flame, CheckCircle, Star, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Dashboard() {
  const { profile } = useProfileStore()
  const { tasks } = useTaskStore()
  const { user } = useAuthStore()
  const [chartData, setChartData] = useState<{ date: string; xp: number }[]>([])

  useEffect(() => {
    if (!user) return
    const fetchLogs = async () => {
      const { data } = await supabase
        .from('completion_logs')
        .select('completed_at, xp_earned')
        .eq('user_id', user.id)
        .gte('completed_at', new Date(Date.now() - 7 * 86400000).toISOString())
        .order('completed_at', { ascending: true })
      if (!data) return
      const grouped: Record<string, number> = {}
      data.forEach(log => {
        const d = log.completed_at.split('T')[0]
        grouped[d] = (grouped[d] ?? 0) + log.xp_earned
      })
      const last7 = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(Date.now() - (6 - i) * 86400000).toISOString().split('T')[0]
        return { date: d.slice(5), xp: grouped[d] ?? 0 }
      })
      setChartData(last7)
    }
    fetchLogs()
  }, [user])

  if (!profile) return null

  const { level, current, required, percent } = getLevelProgress(profile.total_xp)
  const rank = getRankFromXp(profile.total_xp)
  const badges = getUnlockedBadges(profile.tasks_completed, profile.streak, profile.total_xp)
  const todayTasks = tasks.filter(t => {
    if (t.frequency === 'daily') return true
    if (t.frequency === 'weekly') return true
    return t.frequency === 'once' && t.is_active
  })

  const categoryStats = Object.entries(CATEGORY_META).map(([key, meta]) => ({
    ...meta,
    key,
    count: tasks.filter(t => t.category === key).length,
  })).filter(c => c.count > 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Olá, {profile.username}! 👋</h1>
          <p style={{ color: '#64748b', marginTop: '0.25rem' }}>Continue evoluindo. Cada tarefa conta.</p>
        </div>
        <span className={`rank-badge rank-${rank.name}`}>{rank.icon} {rank.label}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {[
          { icon: <Star size={20} color="#ffd700" />, label: 'Total XP', value: profile.total_xp.toLocaleString(), bg: 'rgba(255,215,0,0.1)', border: 'rgba(255,215,0,0.3)' },
          { icon: <Zap size={20} color="#a78bfa" />,  label: 'Nível',    value: `Nível ${level}`,                  bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.3)' },
          { icon: <Flame size={20} color="#fb923c" />, label: 'Streak',   value: `${profile.streak} dias`,          bg: 'rgba(251,146,60,0.1)', border: 'rgba(251,146,60,0.3)' },
          { icon: <CheckCircle size={20} color="#4ade80" />, label: 'Completas', value: profile.tasks_completed.toString(), bg: 'rgba(74,222,128,0.1)', border: 'rgba(74,222,128,0.3)' },
        ].map(stat => (
          <div key={stat.label} style={{ background: stat.bg, border: `1px solid ${stat.border}`, borderRadius: '1rem', padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>{stat.icon}<span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>{stat.label}</span></div>
            <p style={{ fontSize: '1.5rem', fontWeight: '700' }}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <span style={{ fontWeight: '600' }}>Nível {level}</span>
          <span style={{ color: '#64748b', fontSize: '0.875rem' }}>{current} / {required} XP</span>
        </div>
        <div className="xp-bar-track">
          <div className="xp-bar-fill" style={{ width: `${percent}%` }} />
        </div>
        <p style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.5rem' }}>{Math.round(required - current)} XP para o próximo nível</p>
      </div>

      <div className="card">
        <h2 style={{ fontWeight: '700', marginBottom: '1rem' }}>XP nos últimos 7 dias</h2>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="xpGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem' }} labelStyle={{ color: '#94a3b8' }} itemStyle={{ color: '#22c55e' }} />
            <Area type="monotone" dataKey="xp" stroke="#22c55e" strokeWidth={2} fill="url(#xpGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {todayTasks.length > 0 && (
        <div className="card">
          <h2 style={{ fontWeight: '700', marginBottom: '1rem' }}>Tarefas de hoje ({todayTasks.length})</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {todayTasks.slice(0, 5).map(task => {
              const cat = CATEGORY_META[task.category]
              return (
                <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: '#0f172a', borderRadius: '0.75rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>{cat.icon}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: '500', fontSize: '0.875rem' }}>{task.title}</p>
                    <p style={{ color: '#64748b', fontSize: '0.75rem' }}>{cat.label}</p>
                  </div>
                  <span style={{ color: '#ffd700', fontSize: '0.75rem', fontWeight: '700' }}>+{task.xp_reward} XP</span>
                </div>
              )
            })}
            {todayTasks.length > 5 && <p style={{ color: '#64748b', fontSize: '0.875rem', textAlign: 'center' }}>+{todayTasks.length - 5} mais tarefas</p>}
          </div>
        </div>
      )}

      {categoryStats.length > 0 && (
        <div className="card">
          <h2 style={{ fontWeight: '700', marginBottom: '1rem' }}>Categorias ativas</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {categoryStats.map(c => (
              <div key={c.key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#0f172a', borderRadius: '9999px', border: `1px solid ${c.color}33` }}>
                <span>{c.icon}</span>
                <span style={{ fontSize: '0.875rem', color: c.color }}>{c.label}</span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{c.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {badges.length > 0 && (
        <div className="card">
          <h2 style={{ fontWeight: '700', marginBottom: '1rem' }}>Conquistas desbloqueadas ({badges.length})</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {badges.map(badge => (
              <div key={badge.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', padding: '0.75rem', background: '#0f172a', borderRadius: '0.75rem', border: '1px solid #334155', minWidth: '80px' }}>
                <span style={{ fontSize: '1.75rem' }}>{badge.icon}</span>
                <span style={{ fontSize: '0.7rem', fontWeight: '600', color: '#94a3b8', textAlign: 'center' }}>{badge.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
