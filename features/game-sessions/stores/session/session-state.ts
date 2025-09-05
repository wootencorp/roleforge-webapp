import type { 
  GameSession,
  ChatMessage,
  DiceRoll,
  InitiativeEntry,
  SessionParticipant,
  CampaignAsset
} from '../../types'

export interface SessionState {
  // Current session
  currentSession: GameSession | null
  
  // Session list
  sessions: GameSession[]
  
  // Connection state
  loading: boolean
  connecting: boolean
  connected: boolean
  
  // Session participants
  participants: SessionParticipant[]
  
  // Chat and communication
  chatMessages: ChatMessage[]
  
  // Dice rolls
  diceRolls: DiceRoll[]
  
  // Initiative tracking
  initiativeOrder: InitiativeEntry[]
  
  // Campaign assets
  assets: CampaignAsset[]
  
  // UI state
  activeTab: 'chat' | 'dice' | 'initiative' | 'participants' | 'notes' | 'assets'
  sidebarCollapsed: boolean
}

export const initialSessionState: SessionState = {
  currentSession: null,
  sessions: [],
  loading: false,
  connecting: false,
  connected: false,
  participants: [],
  chatMessages: [],
  diceRolls: [],
  initiativeOrder: [],
  assets: [],
  activeTab: 'chat',
  sidebarCollapsed: false
}

