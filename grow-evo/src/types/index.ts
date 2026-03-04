export type Category = 'health' | 'mind' | 'productivity' | 'social' | 'finance' | 'fitness'
export type Frequency = 'daily' | 'weekly' | 'once'
export type Difficulty = 'easy' | 'medium' | 'hard' | 'epic'

export interface Task {
  id: string
  user_id: string
  title: string
  description?: string
  category: Category
  frequency: Frequency
  difficulty: Difficulty
  xp_reward: number
  completed_at?: string | null
  created_at: string
  is_active: boolean
  streak: number
  last_completed_date?: string | null
}

export interface Profile {
  id: string
  username: string
  avatar_url?: string
  total_xp: number
  level: number
  rank: Rank
  streak: number
  tasks_completed: number
  invite_code?: string
  created_at: string
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
  unlocked_at?: string
}

export interface CompletionLog {
  id: string
  user_id: string
  task_id: string
  completed_at: string
  xp_earned: number
}

export type Rank = 'novice' | 'bronze' | 'silver' | 'gold' | 'diamond' | 'master'

export interface RankInfo {
  name: Rank
  label: string
  minXp: number
  maxXp: number
  color: string
  icon: string
}
