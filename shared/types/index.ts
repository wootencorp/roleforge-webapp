// Core domain types
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  subscriptionTier: 'free' | 'pro' | 'premium'
  createdAt: string
  lastLogin?: string
  avatarUrl?: string
}

export interface Character {
  id: string
  userId: string
  name: string
  race: string
  class: string
  level: number
  background: string
  alignment: string
  abilityScores: AbilityScores
  hitPoints: number
  armorClass: number
  speed: number
  skills: string[]
  equipment: string[]
  personalityTraits: string[]
  ideals: string
  bonds: string
  flaws: string
  backstory: string
  imageUrl?: string
  createdAt: string
  updatedAt: string
}

export interface AbilityScores {
  strength: number
  dexterity: number
  constitution: number
  intelligence: number
  wisdom: number
  charisma: number
}

export interface Campaign {
  id: string
  creatorId: string
  name: string
  description: string
  ruleset: string
  difficulty: 'easy' | 'medium' | 'hard'
  maxPlayers: number
  currentPlayers: number
  isActive: boolean
  isPublic: boolean
  imageUrl?: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface GameSession {
  id: string
  campaignId: string
  name: string
  description: string
  currentScene: string
  participants: SessionParticipant[]
  messages: SessionMessage[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface SessionParticipant {
  userId: string
  characterId?: string
  role: 'player' | 'gm'
  isActive: boolean
  joinedAt: string
}

export interface SessionMessage {
  id: string
  sessionId: string
  userId: string
  characterName?: string
  content: string
  type: 'player' | 'gm' | 'system' | 'dice'
  metadata?: Record<string, any>
  timestamp: string
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Form types
export interface LoginForm {
  email: string
  password: string
}

export interface SignupForm {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
}

export interface CharacterForm {
  name: string
  race: string
  class: string
  background: string
  alignment: string
  prompt?: string
}

export interface CampaignForm {
  name: string
  description: string
  ruleset: string
  difficulty: 'easy' | 'medium' | 'hard'
  maxPlayers: number
  isPublic: boolean
  tags: string[]
}

// UI component types
export interface SelectOption {
  value: string
  label: string
  description?: string
}

export interface NavItem {
  title: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  badge?: string
}

// Error types
export interface AppError extends Error {
  code?: string
  statusCode?: number
  context?: Record<string, any>
}

