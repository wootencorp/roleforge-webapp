import type { RulesetInfo, CampaignTemplate } from '../types'

export const RULESETS: RulesetInfo[] = [
  {
    name: 'D&D 5th Edition',
    description: 'The most popular tabletop RPG system, featuring streamlined mechanics and rich fantasy storytelling.',
    version: '5th Edition',
    publisher: 'Wizards of the Coast',
    tags: ['fantasy', 'heroic', 'magic', 'dungeons'],
    complexity: 'intermediate',
    playerCount: {
      min: 3,
      max: 6,
      recommended: 4,
    },
  },
  {
    name: 'Pathfinder 2e',
    description: 'A tactical fantasy RPG with deep character customization and strategic combat.',
    version: '2nd Edition',
    publisher: 'Paizo',
    tags: ['fantasy', 'tactical', 'customization', 'complex'],
    complexity: 'advanced',
    playerCount: {
      min: 3,
      max: 6,
      recommended: 4,
    },
  },
  {
    name: 'Call of Cthulhu',
    description: 'Investigate cosmic horrors in this sanity-bending horror RPG based on H.P. Lovecraft\'s works.',
    version: '7th Edition',
    publisher: 'Chaosium',
    tags: ['horror', 'investigation', 'lovecraft', 'mystery'],
    complexity: 'intermediate',
    playerCount: {
      min: 2,
      max: 6,
      recommended: 4,
    },
  },
  {
    name: 'Cyberpunk RED',
    description: 'High-tech, low-life adventures in the dark future of 2045.',
    version: 'RED',
    publisher: 'R. Talsorian Games',
    tags: ['cyberpunk', 'sci-fi', 'dystopian', 'technology'],
    complexity: 'intermediate',
    playerCount: {
      min: 3,
      max: 6,
      recommended: 4,
    },
  },
  {
    name: 'Vampire: The Masquerade',
    description: 'Play as vampires navigating the modern world while hiding from humanity.',
    version: '5th Edition',
    publisher: 'Modiphius Entertainment',
    tags: ['vampire', 'gothic', 'political', 'modern'],
    complexity: 'intermediate',
    playerCount: {
      min: 3,
      max: 6,
      recommended: 4,
    },
  },
  {
    name: 'Savage Worlds',
    description: 'Fast, furious, and fun generic RPG system that works with any setting.',
    version: 'Adventure Edition',
    publisher: 'Pinnacle Entertainment',
    tags: ['generic', 'fast', 'pulp', 'versatile'],
    complexity: 'beginner',
    playerCount: {
      min: 2,
      max: 8,
      recommended: 4,
    },
  },
  {
    name: 'FATE Core',
    description: 'Narrative-focused RPG system emphasizing collaborative storytelling.',
    version: 'Core',
    publisher: 'Evil Hat Productions',
    tags: ['narrative', 'collaborative', 'flexible', 'story'],
    complexity: 'beginner',
    playerCount: {
      min: 3,
      max: 6,
      recommended: 4,
    },
  },
  {
    name: 'Starfinder',
    description: 'Science fantasy RPG combining magic and technology in space adventures.',
    version: '1st Edition',
    publisher: 'Paizo',
    tags: ['sci-fi', 'fantasy', 'space', 'technology'],
    complexity: 'intermediate',
    playerCount: {
      min: 3,
      max: 6,
      recommended: 4,
    },
  },
]

export const CAMPAIGN_TEMPLATES: CampaignTemplate[] = [
  {
    id: 'lost-mine-phandelver',
    name: 'Lost Mine of Phandelver',
    description: 'A classic D&D 5e adventure perfect for new players and DMs. Explore goblin ambushes, mysterious ruins, and a lost mine.',
    ruleset: 'D&D 5th Edition',
    difficulty: 'easy',
    estimatedSessions: 8,
    tags: ['beginner-friendly', 'classic', 'dungeon-crawl', 'mystery'],
    isOfficial: true,
    rating: 4.8,
    downloads: 15420,
  },
  {
    id: 'curse-strahd',
    name: 'Curse of Strahd',
    description: 'Gothic horror adventure in the mist-shrouded realm of Barovia. Face the vampire lord Strahd in his own domain.',
    ruleset: 'D&D 5th Edition',
    difficulty: 'hard',
    estimatedSessions: 20,
    tags: ['horror', 'gothic', 'vampire', 'sandbox'],
    isOfficial: true,
    rating: 4.9,
    downloads: 12890,
  },
  {
    id: 'cyberpunk-night-city',
    name: 'Night City Chronicles',
    description: 'Navigate the neon-lit streets of Night City in this cyberpunk adventure filled with corporate intrigue.',
    ruleset: 'Cyberpunk RED',
    difficulty: 'medium',
    estimatedSessions: 12,
    tags: ['cyberpunk', 'corporate', 'investigation', 'action'],
    isOfficial: false,
    rating: 4.6,
    downloads: 8750,
  },
  {
    id: 'call-cthulhu-shadows',
    name: 'Shadows Over Innsmouth',
    description: 'Investigate strange disappearances in the coastal town of Innsmouth. Sanity not guaranteed.',
    ruleset: 'Call of Cthulhu',
    difficulty: 'medium',
    estimatedSessions: 6,
    tags: ['horror', 'investigation', 'lovecraft', 'coastal'],
    isOfficial: true,
    rating: 4.7,
    downloads: 9340,
  },
  {
    id: 'pathfinder-kingmaker',
    name: 'Kingmaker Campaign',
    description: 'Build your own kingdom in the Stolen Lands. A massive sandbox campaign with politics and exploration.',
    ruleset: 'Pathfinder 2e',
    difficulty: 'hard',
    estimatedSessions: 30,
    tags: ['kingdom-building', 'sandbox', 'politics', 'exploration'],
    isOfficial: true,
    rating: 4.5,
    downloads: 7620,
  },
  {
    id: 'vampire-berlin-nights',
    name: 'Berlin by Night',
    description: 'Navigate vampire politics in modern Berlin. Intrigue, betrayal, and the struggle for power await.',
    ruleset: 'Vampire: The Masquerade',
    difficulty: 'medium',
    estimatedSessions: 15,
    tags: ['political', 'intrigue', 'modern', 'vampire'],
    isOfficial: false,
    rating: 4.4,
    downloads: 5890,
  },
  {
    id: 'savage-worlds-deadlands',
    name: 'Deadlands: The Weird West',
    description: 'Supernatural western adventure in an alternate history American frontier filled with monsters and magic.',
    ruleset: 'Savage Worlds',
    difficulty: 'medium',
    estimatedSessions: 10,
    tags: ['western', 'supernatural', 'alternate-history', 'action'],
    isOfficial: true,
    rating: 4.6,
    downloads: 6750,
  },
  {
    id: 'starfinder-dead-suns',
    name: 'Dead Suns Adventure Path',
    description: 'Explore the galaxy and uncover ancient mysteries in this space-faring adventure.',
    ruleset: 'Starfinder',
    difficulty: 'medium',
    estimatedSessions: 18,
    tags: ['space', 'exploration', 'mystery', 'sci-fi'],
    isOfficial: true,
    rating: 4.3,
    downloads: 4920,
  },
]

export const CAMPAIGN_TAGS = [
  'beginner-friendly',
  'advanced',
  'roleplay-heavy',
  'combat-heavy',
  'exploration',
  'mystery',
  'horror',
  'comedy',
  'political',
  'intrigue',
  'dungeon-crawl',
  'sandbox',
  'linear',
  'episodic',
  'long-term',
  'short-term',
  'one-shot',
  'homebrew',
  'official',
  'published',
  'custom',
]

export const DIFFICULTY_INFO = {
  easy: {
    label: 'Easy',
    description: 'Perfect for new players and casual gaming. Forgiving mechanics and straightforward challenges.',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  medium: {
    label: 'Medium',
    description: 'Balanced challenge for experienced players. Mix of roleplay, combat, and problem-solving.',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
  },
  hard: {
    label: 'Hard',
    description: 'Challenging campaign for veteran players. Complex mechanics and difficult encounters.',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
  },
}

export function getRulesetInfo(rulesetName: string): RulesetInfo | undefined {
  return RULESETS.find(ruleset => ruleset.name === rulesetName)
}

export function getCampaignTemplate(templateId: string): CampaignTemplate | undefined {
  return CAMPAIGN_TEMPLATES.find(template => template.id === templateId)
}

export function getFilteredRulesets(complexity?: string, tags?: string[]): RulesetInfo[] {
  return RULESETS.filter(ruleset => {
    const matchesComplexity = !complexity || ruleset.complexity === complexity
    const matchesTags = !tags || tags.length === 0 || 
      tags.some(tag => ruleset.tags.includes(tag))
    
    return matchesComplexity && matchesTags
  })
}

export function getFilteredTemplates(filters: {
  ruleset?: string
  difficulty?: string
  tags?: string[]
  isOfficial?: boolean
}): CampaignTemplate[] {
  return CAMPAIGN_TEMPLATES.filter(template => {
    const matchesRuleset = !filters.ruleset || template.ruleset === filters.ruleset
    const matchesDifficulty = !filters.difficulty || template.difficulty === filters.difficulty
    const matchesTags = !filters.tags || filters.tags.length === 0 ||
      filters.tags.some(tag => template.tags.includes(tag))
    const matchesOfficial = filters.isOfficial === undefined || template.isOfficial === filters.isOfficial
    
    return matchesRuleset && matchesDifficulty && matchesTags && matchesOfficial
  })
}

