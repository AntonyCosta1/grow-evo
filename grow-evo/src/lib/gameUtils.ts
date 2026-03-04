import type { Rank, RankInfo, Difficulty } from '../types'

export const RANKS: RankInfo[] = [
  { name: 'novice',  label: 'Novice',  minXp: 0,     maxXp: 499,   color: '#94a3b8', icon: '🌱' },
  { name: 'bronze',  label: 'Bronze',  minXp: 500,   maxXp: 1499,  color: '#cd7f32', icon: '🥉' },
  { name: 'silver',  label: 'Silver',  minXp: 1500,  maxXp: 3499,  color: '#c0c0c0', icon: '🥈' },
  { name: 'gold',    label: 'Gold',    minXp: 3500,  maxXp: 7499,  color: '#ffd700', icon: '🥇' },
  { name: 'diamond', label: 'Diamond', minXp: 7500,  maxXp: 14999, color: '#67e8f9', icon: '💎' },
  { name: 'master',  label: 'Master',  minXp: 15000, maxXp: Infinity, color: '#ff6b6b', icon: '👑' },
]

export const XP_BY_DIFFICULTY: Record<Difficulty, number> = {
  easy:   25,
  medium: 50,
  hard:   100,
  epic:   200,
}

export function getRankFromXp(xp: number): RankInfo {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (xp >= RANKS[i].minXp) return RANKS[i]
  }
  return RANKS[0]
}

export function getLevelFromXp(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1
}

export function getXpForNextLevel(level: number): number {
  return Math.pow(level, 2) * 100
}

export function getXpForCurrentLevel(level: number): number {
  return Math.pow(level - 1, 2) * 100
}

export function getLevelProgress(xp: number): { level: number; current: number; required: number; percent: number } {
  const level = getLevelFromXp(xp)
  const current = xp - getXpForCurrentLevel(level)
  const required = getXpForNextLevel(level) - getXpForCurrentLevel(level)
  const percent = Math.min((current / required) * 100, 100)
  return { level, current, required, percent }
}

export const CATEGORY_META: Record<string, { label: string; color: string; icon: string }> = {
  health:       { label: 'Saúde',        color: '#4ade80', icon: '❤️' },
  mind:         { label: 'Mente',         color: '#a78bfa', icon: '🧠' },
  productivity: { label: 'Produtividade', color: '#fbbf24', icon: '⚡' },
  social:       { label: 'Social',        color: '#60a5fa', icon: '🤝' },
  finance:      { label: 'Finanças',      color: '#34d399', icon: '💰' },
  fitness:      { label: 'Fitness',       color: '#f87171', icon: '💪' },
  academics: { label: 'Acadêmico',      color: '#67e8f9', icon: '📚' },
}

export const DIFFICULTY_META: Record<Difficulty, { label: string; color: string }> = {
  easy:   { label: 'Fácil',  color: '#4ade80' },
  medium: { label: 'Médio',  color: '#fbbf24' },
  hard:   { label: 'Difícil', color: '#f87171' },
  epic:   { label: 'Épico',  color: '#a78bfa' },
}

export const BADGES = [
  { id: 'first_task',   name: 'Primeiro Passo',  description: 'Complete sua primeira tarefa',      icon: '🎯', condition: (completed: number) => completed >= 1 },
  { id: 'streak_3',     name: 'Consistente',     description: '3 dias seguidos',                  icon: '🔥', condition: (_: number, streak: number) => streak >= 3 },
  { id: 'streak_7',     name: 'Dedicado',        description: '7 dias seguidos',                  icon: '⚡', condition: (_: number, streak: number) => streak >= 7 },
  { id: 'streak_30',    name: 'Invicto',         description: '30 dias seguidos',                 icon: '🏆', condition: (_: number, streak: number) => streak >= 30 },
  { id: 'tasks_10',     name: 'Produtivo',       description: '10 tarefas completas',             icon: '💪', condition: (completed: number) => completed >= 10 },
  { id: 'tasks_50',     name: 'Incansável',      description: '50 tarefas completas',             icon: '🚀', condition: (completed: number) => completed >= 50 },
  { id: 'tasks_100',    name: 'Lendário',        description: '100 tarefas completas',            icon: '👑', condition: (completed: number) => completed >= 100 },
  { id: 'rank_bronze',  name: 'Bronze',          description: 'Alcançou o rank Bronze',           icon: '🥉', condition: (_: number, __: number, xp: number) => xp >= 500 },
  { id: 'rank_gold',    name: 'Ouro',            description: 'Alcançou o rank Gold',             icon: '🥇', condition: (_: number, __: number, xp: number) => xp >= 3500 },
  { id: 'rank_master',  name: 'Master',          description: 'Alcançou o rank Master',          icon: '💎', condition: (_: number, __: number, xp: number) => xp >= 15000 },
]

export function getUnlockedBadges(tasksCompleted: number, streak: number, totalXp: number) {
  return BADGES.filter(b => b.condition(tasksCompleted, streak, totalXp))
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

export function isToday(dateStr: string): boolean {
  const today = new Date().toISOString().split('T')[0]
  return dateStr?.split('T')[0] === today
}

export function isYesterday(dateStr: string): boolean {
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  return dateStr?.split('T')[0] === yesterday
}

export function getRankClass(rank: Rank): string {
  return `rank-${rank}`
}
