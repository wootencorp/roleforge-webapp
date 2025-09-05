export interface DnD5eRace {
  name: string
  description: string
  abilityScoreIncrease: Partial<Record<string, number>>
  size: 'Small' | 'Medium' | 'Large'
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
  savingThrowProficiencies: string[]
  skillChoices: number
  skillOptions: string[]
  features: string[]
}

export interface DnD5eBackground {
  name: string
  description: string
  skillProficiencies: string[]
  toolProficiencies?: string[]
  languages?: number
  equipment: string[]
  feature: string
}

