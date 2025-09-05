import type { Character, AbilityScores } from '@/shared/types'

export interface CharacterState {
  characters: Character[]
  selectedCharacter: Character | null
  loading: boolean
  creating: boolean
  updating: boolean
}

export interface CharacterActions {
  fetchCharacters: () => Promise<void>
  createCharacter: (data: CreateCharacterData) => Promise<Character>
  updateCharacter: (id: string, data: Partial<Character>) => Promise<void>
  deleteCharacter: (id: string) => Promise<void>
  selectCharacter: (character: Character | null) => void
  generateCharacterWithAI: (prompt: string, baseData: CharacterFormData) => Promise<Character>
  setLoading: (loading: boolean) => void
}

export interface CreateCharacterData {
  name: string
  race: string
  class: string
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
}

export interface CharacterFormData {
  name: string
  race: string
  class: string
  background: string
  alignment: string
  prompt?: string
}

export interface AICharacterResponse {
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
}

export interface CharacterFilters {
  search?: string
  race?: string
  class?: string
  level?: number
  sortBy?: 'name' | 'level' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
}

export interface DnD5eRace {
  name: string
  description: string
  abilityScoreIncrease: Partial<AbilityScores>
  size: string
  speed: number
  traits: string[]
  languages: string[]
  proficiencies?: string[]
}

export interface DnD5eClass {
  name: string
  description: string
  hitDie: number
  primaryAbility: string[]
  savingThrows: string[]
  skills: string[]
  equipment: string[]
  features: string[]
}

export interface DnD5eBackground {
  name: string
  description: string
  skillProficiencies: string[]
  languages: number
  equipment: string[]
  feature: string
  personalityTraits: string[]
  ideals: string[]
  bonds: string[]
  flaws: string[]
}

