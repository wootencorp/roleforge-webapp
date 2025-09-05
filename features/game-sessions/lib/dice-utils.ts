import type { DiceBreakdown, DiceRollData } from '../types'

export interface ParsedDiceExpression {
  dice: DiceGroup[]
  modifier: number
  isValid: boolean
  error?: string
}

export interface DiceGroup {
  count: number
  sides: number
  modifier?: number
}

export interface RollResult {
  total: number
  breakdown: DiceBreakdown[]
  expression: string
  modifier: number
  advantage?: 'advantage' | 'disadvantage' | 'normal'
}

// Common dice expressions
export const COMMON_DICE = [
  { label: 'd4', expression: '1d4' },
  { label: 'd6', expression: '1d6' },
  { label: 'd8', expression: '1d8' },
  { label: 'd10', expression: '1d10' },
  { label: 'd12', expression: '1d12' },
  { label: 'd20', expression: '1d20' },
  { label: 'd100', expression: '1d100' },
]

export const COMMON_ROLLS = [
  { label: 'Ability Check', expression: '1d20' },
  { label: 'Attack Roll', expression: '1d20' },
  { label: 'Saving Throw', expression: '1d20' },
  { label: 'Damage (Sword)', expression: '1d8' },
  { label: 'Damage (Dagger)', expression: '1d4' },
  { label: 'Damage (Fireball)', expression: '8d6' },
  { label: 'Hit Points (d8)', expression: '1d8' },
  { label: 'Initiative', expression: '1d20' },
]

export function parseDiceExpression(expression: string): ParsedDiceExpression {
  const cleanExpression = expression.toLowerCase().replace(/\s/g, '')
  
  // Basic validation
  if (!cleanExpression) {
    return { dice: [], modifier: 0, isValid: false, error: 'Empty expression' }
  }

  try {
    // Parse dice groups and modifiers
    const parts = cleanExpression.split(/([+-])/)
    const dice: DiceGroup[] = []
    let modifier = 0
    let currentSign = 1

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      
      if (part === '+') {
        currentSign = 1
        continue
      } else if (part === '-') {
        currentSign = -1
        continue
      }

      if (part.includes('d')) {
        // Parse dice group (e.g., "2d6", "d20")
        const diceMatch = part.match(/^(\d*)d(\d+)$/)
        if (!diceMatch) {
          return { dice: [], modifier: 0, isValid: false, error: `Invalid dice format: ${part}` }
        }

        const count = parseInt(diceMatch[1] || '1')
        const sides = parseInt(diceMatch[2])

        if (count < 1 || count > 100) {
          return { dice: [], modifier: 0, isValid: false, error: 'Dice count must be between 1 and 100' }
        }

        if (sides < 2 || sides > 1000) {
          return { dice: [], modifier: 0, isValid: false, error: 'Dice sides must be between 2 and 1000' }
        }

        dice.push({ count, sides })
      } else {
        // Parse modifier
        const modifierValue = parseInt(part)
        if (isNaN(modifierValue)) {
          return { dice: [], modifier: 0, isValid: false, error: `Invalid modifier: ${part}` }
        }
        modifier += currentSign * modifierValue
      }
    }

    if (dice.length === 0) {
      return { dice: [], modifier: 0, isValid: false, error: 'No dice found in expression' }
    }

    return { dice, modifier, isValid: true }
  } catch (error) {
    return { dice: [], modifier: 0, isValid: false, error: 'Failed to parse expression' }
  }
}

export function rollDice(data: DiceRollData): RollResult {
  const parsed = parseDiceExpression(data.expression)
  
  if (!parsed.isValid) {
    throw new Error(parsed.error || 'Invalid dice expression')
  }

  const breakdown: DiceBreakdown[] = []
  let total = 0

  // Roll each dice group
  for (const diceGroup of parsed.dice) {
    const rolls: number[] = []
    
    for (let i = 0; i < diceGroup.count; i++) {
      const roll = Math.floor(Math.random() * diceGroup.sides) + 1
      rolls.push(roll)
    }

    const groupTotal = rolls.reduce((sum, roll) => sum + roll, 0)
    breakdown.push({
      die: diceGroup.sides,
      rolls,
      total: groupTotal
    })
    
    total += groupTotal
  }

  // Handle advantage/disadvantage for d20 rolls
  if (data.advantage && data.advantage !== 'normal') {
    const d20Breakdown = breakdown.find(b => b.die === 20)
    if (d20Breakdown && d20Breakdown.rolls.length === 1) {
      // Roll a second d20
      const secondRoll = Math.floor(Math.random() * 20) + 1
      d20Breakdown.rolls.push(secondRoll)
      
      if (data.advantage === 'advantage') {
        // Take the higher roll
        const higherRoll = Math.max(...d20Breakdown.rolls)
        total = total - d20Breakdown.total + higherRoll
        d20Breakdown.total = higherRoll
      } else {
        // Take the lower roll
        const lowerRoll = Math.min(...d20Breakdown.rolls)
        total = total - d20Breakdown.total + lowerRoll
        d20Breakdown.total = lowerRoll
      }
    }
  }

  // Add modifiers
  const finalModifier = parsed.modifier + (data.modifier || 0)
  total += finalModifier

  return {
    total,
    breakdown,
    expression: data.expression,
    modifier: finalModifier,
    advantage: data.advantage
  }
}

export function formatDiceResult(result: RollResult): string {
  let formatted = `**${result.total}**`
  
  if (result.breakdown.length > 0) {
    const breakdownText = result.breakdown
      .map(b => {
        if (b.rolls.length === 1) {
          return `d${b.die}: ${b.rolls[0]}`
        } else {
          return `d${b.die}: [${b.rolls.join(', ')}] = ${b.total}`
        }
      })
      .join(', ')
    
    formatted += ` (${breakdownText}`
    
    if (result.modifier !== 0) {
      formatted += ` ${result.modifier >= 0 ? '+' : ''}${result.modifier}`
    }
    
    formatted += ')'
  }

  if (result.advantage === 'advantage') {
    formatted += ' [Advantage]'
  } else if (result.advantage === 'disadvantage') {
    formatted += ' [Disadvantage]'
  }

  return formatted
}

export function validateDiceExpression(expression: string): { isValid: boolean; error?: string } {
  const parsed = parseDiceExpression(expression)
  return { isValid: parsed.isValid, error: parsed.error }
}

export function generateQuickRolls(character?: any): Array<{ label: string; expression: string; modifier?: number }> {
  const quickRolls = [
    { label: 'Initiative', expression: '1d20' },
    { label: 'Ability Check', expression: '1d20' },
    { label: 'Saving Throw', expression: '1d20' },
    { label: 'Attack Roll', expression: '1d20' },
  ]

  if (character?.abilityScores) {
    const dexMod = Math.floor((character.abilityScores.dexterity - 10) / 2)
    quickRolls[0].modifier = dexMod // Initiative uses Dex modifier
  }

  return quickRolls
}

export function rollInitiative(participants: Array<{ name: string; dexterity?: number }>): Array<{ name: string; initiative: number; roll: number }> {
  return participants.map(participant => {
    const dexModifier = participant.dexterity ? Math.floor((participant.dexterity - 10) / 2) : 0
    const roll = Math.floor(Math.random() * 20) + 1
    const initiative = roll + dexModifier
    
    return {
      name: participant.name,
      initiative,
      roll
    }
  }).sort((a, b) => b.initiative - a.initiative)
}

