import type { Campaign, User } from '@/shared/types'

export interface CampaignState {
  campaigns: Campaign[]
  myCampaigns: Campaign[]
  selectedCampaign: Campaign | null
  loading: boolean
  creating: boolean
  updating: boolean
  joining: boolean
}

export interface CampaignActions {
  fetchCampaigns: (filters?: CampaignFilters) => Promise<void>
  fetchMyCampaigns: () => Promise<void>
  createCampaign: (data: CreateCampaignData) => Promise<Campaign>
  updateCampaign: (id: string, data: Partial<Campaign>) => Promise<void>
  deleteCampaign: (id: string) => Promise<void>
  joinCampaign: (campaignId: string, characterId?: string) => Promise<void>
  leaveCampaign: (campaignId: string) => Promise<void>
  selectCampaign: (campaign: Campaign | null) => void
  setLoading: (loading: boolean) => void
}

export interface CreateCampaignData {
  name: string
  description: string
  ruleset: string
  difficulty: 'easy' | 'medium' | 'hard'
  maxPlayers: number
  isPublic: boolean
  tags: string[]
  imageUrl?: string
}

export interface CampaignFilters {
  search?: string
  ruleset?: string
  difficulty?: 'easy' | 'medium' | 'hard'
  tags?: string[]
  isPublic?: boolean
  hasOpenSlots?: boolean
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'currentPlayers'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface CampaignMember {
  id: string
  campaignId: string
  userId: string
  characterId?: string
  role: 'player' | 'gm'
  status: 'active' | 'inactive' | 'pending'
  joinedAt: string
  user: User
  characterName?: string
}

export interface CampaignInvite {
  id: string
  campaignId: string
  inviterId: string
  inviteeEmail: string
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  createdAt: string
  expiresAt: string
}

export interface CampaignSession {
  id: string
  campaignId: string
  name: string
  description: string
  scheduledAt?: string
  startedAt?: string
  endedAt?: string
  status: 'scheduled' | 'active' | 'completed' | 'cancelled'
  participants: string[]
  notes: string
  createdAt: string
  updatedAt: string
}

export interface CampaignStats {
  totalSessions: number
  totalPlayTime: number
  averageSessionLength: number
  activePlayers: number
  lastSessionDate?: string
  nextSessionDate?: string
}

export interface RulesetInfo {
  name: string
  description: string
  version: string
  publisher: string
  tags: string[]
  complexity: 'beginner' | 'intermediate' | 'advanced'
  playerCount: {
    min: number
    max: number
    recommended: number
  }
}

export interface CampaignTemplate {
  id: string
  name: string
  description: string
  ruleset: string
  difficulty: 'easy' | 'medium' | 'hard'
  estimatedSessions: number
  tags: string[]
  imageUrl?: string
  isOfficial: boolean
  createdBy?: string
  rating: number
  downloads: number
}

