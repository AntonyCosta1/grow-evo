import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { Profile } from '../types'
import { getRankFromXp, getLevelFromXp } from '../lib/gameUtils'

interface ProfileState {
  profile: Profile | null
  loading: boolean
  fetchProfile: (userId: string) => Promise<void>
  addXp: (userId: string, amount: number) => Promise<void>
  incrementTasksCompleted: (userId: string) => Promise<void>
  updateStreak: (userId: string) => Promise<void>
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  loading: false,

  fetchProfile: async (userId: string) => {
    set({ loading: true })
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    set({ profile: data, loading: false })
  },

  addXp: async (userId: string, amount: number) => {
    const profile = get().profile
    if (!profile) return
    const prevLevel = profile.level
    const prevRank = profile.rank
    const newXp = profile.total_xp + amount
    const rank = getRankFromXp(newXp).name
    const level = getLevelFromXp(newXp)
    const { data } = await supabase
      .from('profiles')
      .update({ total_xp: newXp, rank, level })
      .eq('id', userId)
      .select()
      .single()
    if (data) set({ profile: data })

    if (level > prevLevel) {
      await supabase.from('activity_logs').insert({
        user_id: userId,
        type: 'level_up',
        payload: { level },
      })
    }
    if (rank !== prevRank) {
      await supabase.from('activity_logs').insert({
        user_id: userId,
        type: 'rank_up',
        payload: { rank },
      })
    }
  },

  incrementTasksCompleted: async (userId: string) => {
    const profile = get().profile
    if (!profile) return
    const { data } = await supabase
      .from('profiles')
      .update({ tasks_completed: profile.tasks_completed + 1 })
      .eq('id', userId)
      .select()
      .single()
    if (data) set({ profile: data })
  },

  updateStreak: async (userId: string) => {
    const profile = get().profile
    if (!profile) return
    const { data } = await supabase
      .from('profiles')
      .update({ streak: profile.streak + 1 })
      .eq('id', userId)
      .select()
      .single()
    if (data) set({ profile: data })
  },

  
}))
