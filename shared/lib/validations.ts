import { z } from 'zod'

// Auth validation schemas
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
})

export const signupSchema = z
  .object({
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    firstName: z
      .string()
      .min(1, 'First name is required')
      .max(50, 'First name must be less than 50 characters'),
    lastName: z
      .string()
      .min(1, 'Last name is required')
      .max(50, 'Last name must be less than 50 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

// Character validation schemas
export const abilityScoresSchema = z.object({
  strength: z.number().min(3).max(18),
  dexterity: z.number().min(3).max(18),
  constitution: z.number().min(3).max(18),
  intelligence: z.number().min(3).max(18),
  wisdom: z.number().min(3).max(18),
  charisma: z.number().min(3).max(18),
})

export const characterSchema = z.object({
  name: z
    .string()
    .min(1, 'Character name is required')
    .max(50, 'Character name must be less than 50 characters'),
  race: z.string().min(1, 'Race is required'),
  class: z.string().min(1, 'Class is required'),
  background: z.string().min(1, 'Background is required'),
  alignment: z.string().min(1, 'Alignment is required'),
  level: z.number().min(1).max(20).default(1),
  abilityScores: abilityScoresSchema,
  hitPoints: z.number().min(1),
  armorClass: z.number().min(10),
  speed: z.number().min(0).default(30),
  skills: z.array(z.string()).default([]),
  equipment: z.array(z.string()).default([]),
  personalityTraits: z.array(z.string()).max(2).default([]),
  ideals: z.string().max(200).default(''),
  bonds: z.string().max(200).default(''),
  flaws: z.string().max(200).default(''),
  backstory: z.string().max(1000).default(''),
  prompt: z.string().max(500).optional(),
})

export const characterFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Character name is required')
    .max(50, 'Character name must be less than 50 characters'),
  race: z.string().min(1, 'Race is required'),
  class: z.string().min(1, 'Class is required'),
  background: z.string().min(1, 'Background is required'),
  alignment: z.string().min(1, 'Alignment is required'),
  prompt: z
    .string()
    .max(500, 'Prompt must be less than 500 characters')
    .optional(),
})

// Campaign validation schemas
export const campaignSchema = z.object({
  name: z
    .string()
    .min(1, 'Campaign name is required')
    .max(100, 'Campaign name must be less than 100 characters'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(1000, 'Description must be less than 1000 characters'),
  ruleset: z.string().min(1, 'Ruleset is required'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  maxPlayers: z.number().min(1).max(8),
  isPublic: z.boolean().default(false),
  tags: z.array(z.string()).max(5).default([]),
})

// Game session validation schemas
export const sessionMessageSchema = z.object({
  content: z
    .string()
    .min(1, 'Message content is required')
    .max(1000, 'Message must be less than 1000 characters'),
  type: z.enum(['player', 'gm', 'system', 'dice']),
  characterName: z.string().optional(),
  metadata: z.record(z.any()).optional(),
})

// API validation schemas
export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
})

export const searchSchema = z.object({
  query: z.string().min(1).max(100),
  filters: z.record(z.any()).optional(),
})

// Type exports
export type LoginForm = z.infer<typeof loginSchema>
export type SignupForm = z.infer<typeof signupSchema>
export type CharacterForm = z.infer<typeof characterFormSchema>
export type Character = z.infer<typeof characterSchema>
export type Campaign = z.infer<typeof campaignSchema>
export type SessionMessage = z.infer<typeof sessionMessageSchema>
export type Pagination = z.infer<typeof paginationSchema>
export type Search = z.infer<typeof searchSchema>

