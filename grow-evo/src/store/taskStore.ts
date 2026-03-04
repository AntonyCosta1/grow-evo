import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { Task } from '../types'
import { isToday } from '../lib/gameUtils'

interface TaskState {
  tasks: Task[]
  loading: boolean
  fetchTasks: (userId: string) => Promise<void>
  createTask: (task: Omit<Task, 'id' | 'created_at' | 'streak' | 'completed_at' | 'last_completed_date'>) => Promise<void>
  completeTask: (taskId: string, userId: string) => Promise<{ xpEarned: number } | null>
  deleteTask: (taskId: string) => Promise<void>
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  loading: false,

  fetchTasks: async (userId: string) => {
    set({ loading: true })
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    set({ tasks: data ?? [], loading: false })
  },

  createTask: async (task) => {
    const { data } = await supabase
      .from('tasks')
      .insert({ ...task, streak: 0, is_active: true })
      .select()
      .single()
    if (data) set({ tasks: [data, ...get().tasks] })
  },

  completeTask: async (taskId: string, userId: string) => {
    const task = get().tasks.find(t => t.id === taskId)
    if (!task) return null
    if (task.last_completed_date && isToday(task.last_completed_date)) return null

    const now = new Date().toISOString()
    const newStreak = task.streak + 1

    const { data: updatedTask } = await supabase
      .from('tasks')
      .update({
        last_completed_date: now,
        streak: newStreak,
        completed_at: task.frequency === 'once' ? now : null,
        is_active: task.frequency !== 'once',
      })
      .eq('id', taskId)
      .select()
      .single()

    await supabase.from('completion_logs').insert({
      user_id: userId,
      task_id: taskId,
      completed_at: now,
      xp_earned: task.xp_reward,
    })

    await supabase.from('activity_logs').insert({
      user_id: userId,
      type: 'task_completed',
      payload: {
        task_id: taskId,
        title: task.title,
        category: task.category,
        xp: task.xp_reward,
      },
    })

    if (updatedTask) {
      set({ tasks: get().tasks.map(t => t.id === taskId ? updatedTask : t) })
    }

    return { xpEarned: task.xp_reward }
  },

  deleteTask: async (taskId: string) => {
    await supabase.from('tasks').update({ is_active: false }).eq('id', taskId)
    set({ tasks: get().tasks.filter(t => t.id !== taskId) })
  },

  updateTask: async (taskId: string, updates: Partial<Task>) => {
    const { data } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single()
    if (data) set({ tasks: get().tasks.map(t => t.id === taskId ? data : t) })
  },
}))
