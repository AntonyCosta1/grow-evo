import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { Profile } from '../types'

export interface Friendship {
  id: string
  requester_id: string
  addressee_id: string
  status: 'pending' | 'accepted'
  created_at: string
  profile?: Profile
}

export interface ActivityLog {
  id: string
  user_id: string
  type: 'task_completed' | 'level_up' | 'rank_up'
  payload: Record<string, unknown>
  created_at: string
  profile?: Profile
}

interface SocialState {
  friends: Friendship[]
  pendingRequests: Friendship[]
  feed: ActivityLog[]
  loading: boolean
  searchResult: Profile | null
  searchError: string

  searchByCode: (code: string) => Promise<void>
  clearSearch: () => void
  sendRequest: (addresseeId: string, requesterId: string) => Promise<void>
  acceptRequest: (friendshipId: string) => Promise<void>
  rejectRequest: (friendshipId: string) => Promise<void>
  fetchFriends: (userId: string) => Promise<void>
  fetchPendingRequests: (userId: string) => Promise<void>
  fetchFeed: (userId: string) => Promise<void>
}

export const useSocialStore = create<SocialState>((set, get) => ({
  friends: [],
  pendingRequests: [],
  feed: [],
  loading: false,
  searchResult: null,
  searchError: '',

  searchByCode: async (code: string) => {
    set({ searchResult: null, searchError: '' })
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .ilike('invite_code', code.trim())
      .single()
    if (error || !data) {
      set({ searchError: 'Nenhum usuário encontrado com esse código.' })
      return
    }
    set({ searchResult: data })
  },

  clearSearch: () => set({ searchResult: null, searchError: '' }),

  sendRequest: async (addresseeId: string, requesterId: string) => {
    await supabase.from('friendships').insert({
      requester_id: requesterId,
      addressee_id: addresseeId,
      status: 'pending',
    })
  },

  acceptRequest: async (friendshipId: string) => {
    await supabase
      .from('friendships')
      .update({ status: 'accepted' })
      .eq('id', friendshipId)
    const pending = get().pendingRequests.filter(r => r.id !== friendshipId)
    set({ pendingRequests: pending })
  },

  rejectRequest: async (friendshipId: string) => {
    await supabase.from('friendships').delete().eq('id', friendshipId)
    const pending = get().pendingRequests.filter(r => r.id !== friendshipId)
    set({ pendingRequests: pending })
  },

  fetchFriends: async (userId: string) => {
    set({ loading: true })
    const { data } = await supabase
      .from('friendships')
      .select('*, requester:requester_id(*), addressee:addressee_id(*)')
      .eq('status', 'accepted')
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)

    const friends = (data ?? []).map((f: Record<string, unknown>) => {
      const isRequester = f.requester_id === userId
      return {
        ...(f as unknown as Friendship),
        profile: (isRequester ? f.addressee : f.requester) as Profile,
      }
    })
    set({ friends, loading: false })
  },

  fetchPendingRequests: async (userId: string) => {
    const { data } = await supabase
      .from('friendships')
      .select('*, profile:requester_id(*)')
      .eq('addressee_id', userId)
      .eq('status', 'pending')
    set({ pendingRequests: (data ?? []) as Friendship[] })
  },

  fetchFeed: async (userId: string) => {
    const { data } = await supabase
      .from('activity_logs')
      .select('*, profile:user_id(*)')
      .neq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(30)
    set({ feed: (data ?? []) as ActivityLog[] })
  },
}))
