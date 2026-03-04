import { useState } from 'react'
import { useTaskStore } from '../store/taskStore'
import { useProfileStore } from '../store/profileStore'
import { useAuthStore } from '../store/authStore'
import { CATEGORY_META, DIFFICULTY_META, XP_BY_DIFFICULTY, isToday } from '../lib/gameUtils'
import type { Task, Category, Difficulty, Frequency } from '../types'
import { Plus, CheckCircle2, Circle, Trash2, Flame, X } from 'lucide-react'

export default function TasksPage() {
  const { tasks, createTask, completeTask, deleteTask } = useTaskStore()
  const { addXp, incrementTasksCompleted, profile } = useProfileStore()
  const { user } = useAuthStore()
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState<'all' | Category>('all')
  const [xpPopup, setXpPopup] = useState<{ value: number } | null>(null)
  const [form, setForm] = useState({ title: '', description: '', category: 'health' as Category, frequency: 'daily' as Frequency, difficulty: 'medium' as Difficulty })

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    await createTask({
      ...form,
      user_id: user.id,
      xp_reward: XP_BY_DIFFICULTY[form.difficulty],
    })
    setForm({ title: '', description: '', category: 'health', frequency: 'daily', difficulty: 'medium' })
    setShowForm(false)
  }

  const handleComplete = async (task: Task) => {
    if (!user) return
    const result = await completeTask(task.id, user.id)
    if (!result) return
    await addXp(user.id, result.xpEarned)
    await incrementTasksCompleted(user.id)
    setXpPopup({ value: result.xpEarned })
    setTimeout(() => setXpPopup(null), 2000)
  }

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.category === filter)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {xpPopup && (
        <div style={{ position: 'fixed', top: '5rem', right: '1.5rem', background: 'linear-gradient(135deg, #16a34a, #22c55e)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '1rem', fontWeight: '700', fontSize: '1.25rem', zIndex: 100, animation: 'fadeUp 2s ease forwards', boxShadow: '0 8px 32px rgba(34,197,94,0.4)' }}>
          +{xpPopup.value} XP ✨
        </div>
      )}

      <style>{`@keyframes fadeUp { 0%{opacity:1;transform:translateY(0)} 100%{opacity:0;transform:translateY(-40px)} }`}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Tarefas</h1>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={18} /> Nova Tarefa
        </button>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {(['all', ...Object.keys(CATEGORY_META)] as const).map(cat => (
          <button key={cat} onClick={() => setFilter(cat as 'all' | Category)} style={{ padding: '0.375rem 1rem', borderRadius: '9999px', border: '1px solid', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '600', transition: 'all 0.2s', background: filter === cat ? '#22c55e' : 'transparent', borderColor: filter === cat ? '#22c55e' : '#334155', color: filter === cat ? 'white' : '#64748b' }}>
            {cat === 'all' ? 'Todas' : `${CATEGORY_META[cat]?.icon} ${CATEGORY_META[cat]?.label}`}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ fontSize: '3rem' }}>🌱</p>
          <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Nenhuma tarefa ainda. Crie a sua primeira!</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {filtered.map(task => {
          const cat = CATEGORY_META[task.category]
          const diff = DIFFICULTY_META[task.difficulty]
          const done = !!task.last_completed_date && isToday(task.last_completed_date)

          return (
            <div key={task.id} className="card card-hover" style={{ display: 'flex', alignItems: 'center', gap: '1rem', opacity: done ? 0.6 : 1 }}>
              <button onClick={() => !done && handleComplete(task)} style={{ background: 'none', border: 'none', cursor: done ? 'default' : 'pointer', color: done ? '#22c55e' : '#475569', flexShrink: 0, transition: 'color 0.2s' }}>
                {done ? <CheckCircle2 size={28} /> : <Circle size={28} />}
              </button>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '1.1rem' }}>{cat.icon}</span>
                  <p style={{ fontWeight: '600', textDecoration: done ? 'line-through' : 'none' }}>{task.title}</p>
                  {task.streak > 0 && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#fb923c', fontSize: '0.75rem', fontWeight: '700' }}>
                      <Flame size={12} />{task.streak}
                    </span>
                  )}
                </div>
                {task.description && <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>{task.description}</p>}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '9999px', background: `${diff.color}22`, color: diff.color, fontWeight: '700' }}>{diff.label}</span>
                  <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '9999px', background: 'rgba(255,215,0,0.1)', color: '#ffd700', fontWeight: '700' }}>+{task.xp_reward} XP</span>
                  <span style={{ fontSize: '0.7rem', color: '#475569' }}>{task.frequency === 'daily' ? 'Diário' : task.frequency === 'weekly' ? 'Semanal' : 'Único'}</span>
                </div>
              </div>
              <button onClick={() => deleteTask(task.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', flexShrink: 0, transition: 'color 0.2s' }} onMouseEnter={e => (e.currentTarget.style.color = '#f87171')} onMouseLeave={e => (e.currentTarget.style.color = '#475569')}>
                <Trash2 size={18} />
              </button>
            </div>
          )
        })}
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 50 }}>
          <div className="card" style={{ width: '100%', maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontWeight: '700', fontSize: '1.25rem' }}>Nova Tarefa</h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.875rem', color: '#94a3b8', display: 'block', marginBottom: '0.375rem' }}>Título *</label>
                <input className="input-field" placeholder="Ex: Meditar 10 minutos" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
              </div>
              <div>
                <label style={{ fontSize: '0.875rem', color: '#94a3b8', display: 'block', marginBottom: '0.375rem' }}>Descrição</label>
                <input className="input-field" placeholder="Opcional" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.875rem', color: '#94a3b8', display: 'block', marginBottom: '0.375rem' }}>Categoria</label>
                  <select className="input-field" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as Category }))}>
                    {Object.entries(CATEGORY_META).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.875rem', color: '#94a3b8', display: 'block', marginBottom: '0.375rem' }}>Frequência</label>
                  <select className="input-field" value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value as Frequency }))}>
                    <option value="daily">Diário</option>
                    <option value="weekly">Semanal</option>
                    <option value="once">Único</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.875rem', color: '#94a3b8', display: 'block', marginBottom: '0.375rem' }}>Dificuldade</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                  {(Object.entries(DIFFICULTY_META) as [Difficulty, { label: string; color: string }][]).map(([k, v]) => (
                    <button type="button" key={k} onClick={() => setForm(f => ({ ...f, difficulty: k }))} style={{ padding: '0.5rem', borderRadius: '0.5rem', border: `1px solid ${form.difficulty === k ? v.color : '#334155'}`, background: form.difficulty === k ? `${v.color}22` : 'transparent', color: form.difficulty === k ? v.color : '#64748b', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600', transition: 'all 0.2s' }}>
                      {v.label}<br /><span style={{ fontSize: '0.7rem' }}>+{XP_BY_DIFFICULTY[k]} XP</span>
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)} style={{ flex: 1, justifyContent: 'center' }}>Cancelar</button>
                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Criar Tarefa</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
