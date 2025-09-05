// Re-export all D&D 5e data from separate files
export { DND5E_RACES } from './data/races'
export { DND5E_CLASSES } from './data/classes'
export { DND5E_BACKGROUNDS } from './data/backgrounds'
export { DND5E_SKILLS, DND5E_ALIGNMENTS, ABILITY_SCORES, DICE_TYPES } from './data/skills'
export type { DnD5eRace, DnD5eClass, DnD5eBackground } from './data/types'

// Legacy exports for compatibility
export { DND5E_RACES as RACES } from './data/races'
export { DND5E_CLASSES as CLASSES } from './data/classes'
export { DND5E_BACKGROUNDS as BACKGROUNDS } from './data/backgrounds'
export { DND5E_SKILLS as SKILLS, DND5E_ALIGNMENTS as ALIGNMENTS } from './data/skills'

// Utility functions for D&D 5e calculations
export function calculateAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2)
}

export function rollAbilityScore(): number {
  // Roll 4d6, drop lowest
  const rolls = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1)
  rolls.sort((a, b) => b - a)
  return rolls.slice(0, 3).reduce((sum, roll) => sum + roll, 0)
}

export function generateAbilityScores(): Record<string, number> {
  return {
    strength: rollAbilityScore(),
    dexterity: rollAbilityScore(),
    constitution: rollAbilityScore(),
    intelligence: rollAbilityScore(),
    wisdom: rollAbilityScore(),
    charisma: rollAbilityScore(),
  }
}

export function getClassHitPoints(className: string, level: number, constitutionModifier: number): number {
  const classData = DND5E_CLASSES.find(c => c.name === className)
  if (!classData) return 1
  
  // First level gets max hit die + con modifier
  // Additional levels get average of hit die + con modifier
  const firstLevelHP = classData.hitDie + constitutionModifier
  const additionalLevels = level - 1
  const averageHitDie = Math.floor(classData.hitDie / 2) + 1
  const additionalHP = additionalLevels * (averageHitDie + constitutionModifier)
  
  return Math.max(1, firstLevelHP + additionalHP)
}

export function getArmorClass(dexterityModifier: number, armorType: string = 'none'): number {
  switch (armorType) {
    case 'leather':
      return 11 + dexterityModifier
    case 'studded_leather':
      return 12 + dexterityModifier
    case 'chain_shirt':
      return 13 + Math.min(dexterityModifier, 2)
    case 'scale_mail':
      return 14 + Math.min(dexterityModifier, 2)
    case 'chain_mail':
      return 16
    case 'plate':
      return 18
    default:
      return 10 + dexterityModifier
  }
}

