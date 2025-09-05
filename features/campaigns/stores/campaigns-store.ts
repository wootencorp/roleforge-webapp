import { create } from 'zustand'
import { supabase } from '@/shared/lib/supabase'
import { captureException } from '@/config/sentry.config'
import type { Campaign } from '@/shared/types'
import type { 
  CampaignState, 
  CampaignActions, 
  CreateCampaignData,
  CampaignFilters 
} from '../types'

interface CampaignsStore extends CampaignState, CampaignActions {}

export const useCampaignsStore = create<CampaignsStore>((set, get) => ({
  campaigns: [],
  myCampaigns: [],
  selectedCampaign: null,
  loading: false,
  creating: false,
  updating: false,
  joining: false,

  fetchCampaigns: async (filters?: CampaignFilters) => {
    set({ loading: true })
    
    try {
      let query = supabase
        .from('campaigns')
        .select(`
          *,
          creator:user_profiles!campaigns_creator_id_fkey(
            id,
            first_name,
            last_name,
            avatar_url
          ),
          members:campaign_members(count)
        `)

      // Apply filters
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
      }
      
      if (filters?.ruleset) {
        query = query.eq('ruleset', filters.ruleset)
      }
      
      if (filters?.difficulty) {
        query = query.eq('difficulty', filters.difficulty)
      }
      
      if (filters?.isPublic !== undefined) {
        query = query.eq('is_public', filters.isPublic)
      }
      
      if (filters?.hasOpenSlots) {
        query = query.lt('current_players', supabase.raw('max_players'))
      }

      // Apply sorting
      const sortBy = filters?.sortBy || 'created_at'
      const sortOrder = filters?.sortOrder || 'desc'
      query = query.order(sortBy, { ascending: sortOrder === 'asc' })

      // Apply pagination
      if (filters?.page && filters?.limit) {
        const from = (filters.page - 1) * filters.limit
        const to = from + filters.limit - 1
        query = query.range(from, to)
      }

      const { data, error } = await query

      if (error) throw error

      const campaigns = data.map(transformCampaignFromDB)
      set({ campaigns, loading: false })
    } catch (error) {
      set({ loading: false })
      captureException(error as Error, { context: 'fetch_campaigns', filters })
      throw error
    }
  },

  fetchMyCampaigns: async () => {
    set({ loading: true })
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Fetch campaigns where user is creator or member
      const { data, error } = await supabase
        .from('campaigns')
        .select(`
          *,
          creator:user_profiles!campaigns_creator_id_fkey(
            id,
            first_name,
            last_name,
            avatar_url
          ),
          members:campaign_members(count),
          my_membership:campaign_members!inner(
            role,
            status,
            joined_at
          )
        `)
        .or(`creator_id.eq.${user.id},campaign_members.user_id.eq.${user.id}`)
        .order('created_at', { ascending: false })

      if (error) throw error

      const myCampaigns = data.map(transformCampaignFromDB)
      set({ myCampaigns, loading: false })
    } catch (error) {
      set({ loading: false })
      captureException(error as Error, { context: 'fetch_my_campaigns' })
      throw error
    }
  },

  createCampaign: async (data: CreateCampaignData) => {
    set({ creating: true })
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const campaignData = {
        creator_id: user.id,
        name: data.name,
        description: data.description,
        ruleset: data.ruleset,
        difficulty: data.difficulty,
        max_players: data.maxPlayers,
        current_players: 1, // Creator is automatically a member
        is_public: data.isPublic,
        is_active: true,
        tags: data.tags,
        image_url: data.imageUrl,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { data: newCampaign, error } = await supabase
        .from('campaigns')
        .insert(campaignData)
        .select(`
          *,
          creator:user_profiles!campaigns_creator_id_fkey(
            id,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .single()

      if (error) throw error

      // Add creator as GM member
      await supabase
        .from('campaign_members')
        .insert({
          campaign_id: newCampaign.id,
          user_id: user.id,
          role: 'gm',
          status: 'active',
          joined_at: new Date().toISOString(),
        })

      const campaign = transformCampaignFromDB(newCampaign)
      
      set(state => ({ 
        campaigns: [campaign, ...state.campaigns],
        myCampaigns: [campaign, ...state.myCampaigns],
        creating: false 
      }))

      return campaign
    } catch (error) {
      set({ creating: false })
      captureException(error as Error, { context: 'create_campaign' })
      throw error
    }
  },

  updateCampaign: async (id: string, updates: Partial<Campaign>) => {
    set({ updating: true })
    
    try {
      const updateData = {
        name: updates.name,
        description: updates.description,
        ruleset: updates.ruleset,
        difficulty: updates.difficulty,
        max_players: updates.maxPlayers,
        is_public: updates.isPublic,
        is_active: updates.isActive,
        tags: updates.tags,
        image_url: updates.imageUrl,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase
        .from('campaigns')
        .update(updateData)
        .eq('id', id)

      if (error) throw error

      const updatedCampaign = { ...updates, updatedAt: updateData.updated_at }

      set(state => ({
        campaigns: state.campaigns.map(campaign => 
          campaign.id === id ? { ...campaign, ...updatedCampaign } : campaign
        ),
        myCampaigns: state.myCampaigns.map(campaign => 
          campaign.id === id ? { ...campaign, ...updatedCampaign } : campaign
        ),
        selectedCampaign: state.selectedCampaign?.id === id 
          ? { ...state.selectedCampaign, ...updatedCampaign }
          : state.selectedCampaign,
        updating: false
      }))
    } catch (error) {
      set({ updating: false })
      captureException(error as Error, { context: 'update_campaign', campaignId: id })
      throw error
    }
  },

  deleteCampaign: async (id: string) => {
    try {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', id)

      if (error) throw error

      set(state => ({
        campaigns: state.campaigns.filter(campaign => campaign.id !== id),
        myCampaigns: state.myCampaigns.filter(campaign => campaign.id !== id),
        selectedCampaign: state.selectedCampaign?.id === id ? null : state.selectedCampaign
      }))
    } catch (error) {
      captureException(error as Error, { context: 'delete_campaign', campaignId: id })
      throw error
    }
  },

  joinCampaign: async (campaignId: string, characterId?: string) => {
    set({ joining: true })
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Check if campaign has open slots
      const { data: campaign, error: campaignError } = await supabase
        .from('campaigns')
        .select('current_players, max_players')
        .eq('id', campaignId)
        .single()

      if (campaignError) throw campaignError
      
      if (campaign.current_players >= campaign.max_players) {
        throw new Error('Campaign is full')
      }

      // Add user as member
      const { error: memberError } = await supabase
        .from('campaign_members')
        .insert({
          campaign_id: campaignId,
          user_id: user.id,
          character_id: characterId,
          role: 'player',
          status: 'active',
          joined_at: new Date().toISOString(),
        })

      if (memberError) throw memberError

      // Update campaign player count
      const { error: updateError } = await supabase
        .from('campaigns')
        .update({ 
          current_players: campaign.current_players + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', campaignId)

      if (updateError) throw updateError

      // Refresh campaigns
      await get().fetchCampaigns()
      await get().fetchMyCampaigns()

      set({ joining: false })
    } catch (error) {
      set({ joining: false })
      captureException(error as Error, { context: 'join_campaign', campaignId, characterId })
      throw error
    }
  },

  leaveCampaign: async (campaignId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Remove user from campaign
      const { error: memberError } = await supabase
        .from('campaign_members')
        .delete()
        .eq('campaign_id', campaignId)
        .eq('user_id', user.id)

      if (memberError) throw memberError

      // Update campaign player count
      const { error: updateError } = await supabase
        .rpc('decrement_campaign_players', { campaign_id: campaignId })

      if (updateError) throw updateError

      // Refresh campaigns
      await get().fetchCampaigns()
      await get().fetchMyCampaigns()
    } catch (error) {
      captureException(error as Error, { context: 'leave_campaign', campaignId })
      throw error
    }
  },

  selectCampaign: (campaign: Campaign | null) => {
    set({ selectedCampaign: campaign })
  },

  setLoading: (loading: boolean) => set({ loading }),
}))

// Helper function to transform database campaign to app campaign
function transformCampaignFromDB(dbCampaign: any): Campaign {
  return {
    id: dbCampaign.id,
    creatorId: dbCampaign.creator_id,
    name: dbCampaign.name,
    description: dbCampaign.description,
    ruleset: dbCampaign.ruleset,
    difficulty: dbCampaign.difficulty,
    maxPlayers: dbCampaign.max_players,
    currentPlayers: dbCampaign.current_players,
    isActive: dbCampaign.is_active,
    isPublic: dbCampaign.is_public,
    imageUrl: dbCampaign.image_url,
    tags: dbCampaign.tags || [],
    createdAt: dbCampaign.created_at,
    updatedAt: dbCampaign.updated_at,
  }
}

