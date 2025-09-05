import type { 
  GameSession,
  CreateSessionData,
  SendMessageData,
  DiceRollData,
  InitiativeEntry,
  ChatMessage,
  DiceRoll,
  CampaignAsset,
  AssetUploadData
} from '../../types'

export interface SessionActions {
  // Session management
  createSession: (data: CreateSessionData) => Promise<GameSession>
  loadSessions: () => Promise<void>
  loadSession: (sessionId: string) => Promise<void>
  updateSession: (sessionId: string, updates: Partial<GameSession>) => Promise<void>
  deleteSession: (sessionId: string) => Promise<void>
  
  // Session lifecycle
  startSession: (sessionId: string) => Promise<void>
  pauseSession: (sessionId: string) => Promise<void>
  endSession: (sessionId: string) => Promise<void>
  
  // Real-time connection
  connectToSession: (sessionId: string) => Promise<void>
  disconnectFromSession: () => void
  
  // Chat and communication
  sendMessage: (data: SendMessageData) => Promise<void>
  loadChatHistory: (sessionId: string) => Promise<void>
  
  // Dice rolling
  rollDice: (data: DiceRollData) => Promise<DiceRoll>
  loadDiceHistory: (sessionId: string) => Promise<void>
  
  // Initiative tracking
  addToInitiative: (entry: Omit<InitiativeEntry, 'id'>) => Promise<void>
  updateInitiative: (entryId: string, updates: Partial<InitiativeEntry>) => Promise<void>
  removeFromInitiative: (entryId: string) => Promise<void>
  nextTurn: () => Promise<void>
  resetInitiative: () => Promise<void>
  
  // Participants
  loadParticipants: (sessionId: string) => Promise<void>
  addParticipant: (sessionId: string, userId: string, characterId?: string) => Promise<void>
  removeParticipant: (sessionId: string, userId: string) => Promise<void>
  
  // Campaign assets
  loadAssets: (campaignId: string) => Promise<void>
  uploadAsset: (data: AssetUploadData) => Promise<CampaignAsset>
  deleteAsset: (assetId: string) => Promise<void>
  shareAsset: (assetId: string) => Promise<void>
  downloadAsset: (assetId: string) => Promise<void>
  
  // UI actions
  setActiveTab: (tab: SessionState['activeTab']) => void
  toggleSidebar: () => void
  
  // Cleanup
  clearSession: () => void
  reset: () => void
}

