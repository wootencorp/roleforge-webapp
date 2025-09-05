import type { Character, User } from '@/shared/types'

export interface GameSession {
  id: string
  campaignId: string
  name: string
  description: string
  status: 'scheduled' | 'active' | 'paused' | 'completed' | 'cancelled'
  scheduledAt?: string
  startedAt?: string
  endedAt?: string
  participants: SessionParticipant[]
  currentScene: string
  notes: string
  chatMessages: ChatMessage[]
  diceRolls: DiceRoll[]
  initiativeOrder: InitiativeEntry[]
  assets: CampaignAsset[]
  createdAt: string
  updatedAt: string
}

export interface SessionParticipant {
  id: string
  sessionId: string
  userId: string
  characterId?: string
  role: 'gm' | 'player'
  status: 'online' | 'offline' | 'away'
  joinedAt: string
  user: User
  character?: Character
}

export interface ChatMessage {
  id: string
  sessionId: string
  userId: string
  type: 'message' | 'action' | 'system' | 'dice' | 'ai'
  content: string
  metadata?: Record<string, any>
  timestamp: string
  user: User
}

export interface DiceRoll {
  id: string
  sessionId: string
  userId: string
  expression: string
  result: number
  breakdown: DiceBreakdown[]
  modifier?: number
  advantage?: 'advantage' | 'disadvantage' | 'normal'
  purpose?: string
  timestamp: string
  user: User
}

export interface DiceBreakdown {
  die: number
  rolls: number[]
  total: number
}

export interface InitiativeEntry {
  id: string
  sessionId: string
  characterId?: string
  name: string
  initiative: number
  isActive: boolean
  conditions: string[]
  hitPoints?: {
    current: number
    max: number
    temp: number
  }
}

export interface CampaignAsset {
  id: string
  campaignId: string
  sessionId?: string
  name: string
  description: string
  type: 'map' | 'handout' | 'image' | 'audio' | 'video' | 'document' | 'token' | 'other'
  fileUrl: string
  thumbnailUrl?: string
  fileSize: number
  mimeType: string
  tags: string[]
  isPublic: boolean
  isActive: boolean
  uploadedBy: string
  createdAt: string
  updatedAt: string
  metadata?: AssetMetadata
}

export interface AssetMetadata {
  dimensions?: { width: number; height: number }
  duration?: number
  gridSize?: { width: number; height: number }
  scale?: number
  notes?: string
  visibility?: 'gm_only' | 'players' | 'all'
}

export interface SessionState {
  currentSession: GameSession | null
  sessions: GameSession[]
  loading: boolean
  connecting: boolean
  connected: boolean
  participants: SessionParticipant[]
  chatMessages: ChatMessage[]
  diceRolls: DiceRoll[]
  initiativeOrder: InitiativeEntry[]
  assets: CampaignAsset[]
  activeAsset: CampaignAsset | null
}

export interface SessionActions {
  createSession: (data: CreateSessionData) => Promise<GameSession>
  joinSession: (sessionId: string, characterId?: string) => Promise<void>
  leaveSession: (sessionId: string) => Promise<void>
  startSession: (sessionId: string) => Promise<void>
  endSession: (sessionId: string) => Promise<void>
  updateSession: (sessionId: string, updates: Partial<GameSession>) => Promise<void>
  sendChatMessage: (sessionId: string, message: SendMessageData) => Promise<void>
  rollDice: (sessionId: string, roll: DiceRollData) => Promise<void>
  updateInitiative: (sessionId: string, entries: InitiativeEntry[]) => Promise<void>
  uploadAsset: (sessionId: string, file: File, metadata: Partial<CampaignAsset>) => Promise<CampaignAsset>
  shareAsset: (sessionId: string, assetId: string) => Promise<void>
  setActiveAsset: (assetId: string | null) => void
  updateAssetVisibility: (assetId: string, visibility: AssetMetadata['visibility']) => Promise<void>
  deleteAsset: (assetId: string) => Promise<void>
  setCurrentSession: (session: GameSession | null) => void
  connectToSession: (sessionId: string) => Promise<void>
  disconnectFromSession: () => void
}

export interface CreateSessionData {
  campaignId: string
  name: string
  description: string
  scheduledAt?: string
}

export interface SendMessageData {
  type: 'message' | 'action' | 'system'
  content: string
  metadata?: Record<string, any>
}

export interface DiceRollData {
  expression: string
  modifier?: number
  advantage?: 'advantage' | 'disadvantage' | 'normal'
  purpose?: string
}

export interface AIGameMasterRequest {
  sessionId: string
  context: {
    currentScene: string
    recentMessages: ChatMessage[]
    participants: SessionParticipant[]
    campaignInfo: {
      name: string
      description: string
      ruleset: string
    }
  }
  prompt: string
  type: 'scene_description' | 'npc_response' | 'action_result' | 'suggestion'
}

export interface AIGameMasterResponse {
  content: string
  suggestions?: string[]
  sceneUpdate?: string
  metadata?: Record<string, any>
}

export interface SessionSettings {
  allowPlayerDiceRolls: boolean
  showDiceRollsToAll: boolean
  enableInitiativeTracking: boolean
  enableAIAssistant: boolean
  autoSaveInterval: number
  maxChatHistory: number
}

export interface SessionFilters {
  campaignId?: string
  status?: GameSession['status']
  dateRange?: {
    start: string
    end: string
  }
  participantId?: string
  sortBy?: 'scheduledAt' | 'startedAt' | 'createdAt' | 'name'
  sortOrder?: 'asc' | 'desc'
}

export interface SessionStats {
  totalSessions: number
  totalPlayTime: number
  averageSessionLength: number
  sessionsThisMonth: number
  longestSession: number
  favoriteRuleset: string
}

export interface AssetFilters {
  type?: CampaignAsset['type']
  tags?: string[]
  isPublic?: boolean
  uploadedBy?: string
  search?: string
  sortBy?: 'name' | 'createdAt' | 'fileSize' | 'type'
  sortOrder?: 'asc' | 'desc'
}

export interface AssetUploadData {
  name: string
  description: string
  type: CampaignAsset['type']
  tags: string[]
  isPublic: boolean
  metadata?: Partial<AssetMetadata>
}

