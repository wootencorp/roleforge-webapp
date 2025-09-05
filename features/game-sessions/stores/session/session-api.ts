import { supabase } from '@/shared/lib/supabase'
import { captureException } from '@/config/sentry.config'
import { rollDice } from '../../lib/dice-utils'
import type { 
  GameSession,
  CreateSessionData,
  SendMessageData,
  DiceRollData,
  InitiativeEntry,
  ChatMessage,
  DiceRoll,
  SessionParticipant,
  CampaignAsset,
  AssetUploadData
} from '../../types'

export class SessionAPI {
  // Session CRUD operations
  static async createSession(data: CreateSessionData): Promise<GameSession> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const sessionData = {
      campaign_id: data.campaignId,
      name: data.name,
      description: data.description,
      status: 'scheduled' as const,
      scheduled_at: data.scheduledAt,
      current_scene: '',
      notes: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data: newSession, error } = await supabase
      .from('game_sessions')
      .insert(sessionData)
      .select()
      .single()

    if (error) throw error
    return newSession
  }

  static async loadSessions(): Promise<GameSession[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('game_sessions')
      .select(`
        *,
        campaigns (
          id,
          name,
          ruleset
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  static async loadSession(sessionId: string): Promise<GameSession> {
    const { data, error } = await supabase
      .from('game_sessions')
      .select(`
        *,
        campaigns (
          id,
          name,
          ruleset
        )
      `)
      .eq('id', sessionId)
      .single()

    if (error) throw error
    return data
  }

  static async updateSession(sessionId: string, updates: Partial<GameSession>): Promise<void> {
    const { error } = await supabase
      .from('game_sessions')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)

    if (error) throw error
  }

  static async deleteSession(sessionId: string): Promise<void> {
    const { error } = await supabase
      .from('game_sessions')
      .delete()
      .eq('id', sessionId)

    if (error) throw error
  }

  // Session lifecycle
  static async startSession(sessionId: string): Promise<void> {
    await this.updateSession(sessionId, { 
      status: 'active',
      started_at: new Date().toISOString()
    })
  }

  static async pauseSession(sessionId: string): Promise<void> {
    await this.updateSession(sessionId, { status: 'paused' })
  }

  static async endSession(sessionId: string): Promise<void> {
    await this.updateSession(sessionId, { 
      status: 'completed',
      ended_at: new Date().toISOString()
    })
  }

  // Chat operations
  static async sendMessage(data: SendMessageData): Promise<ChatMessage> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const messageData = {
      session_id: data.sessionId,
      user_id: user.id,
      type: data.type,
      content: data.content,
      metadata: data.metadata,
      created_at: new Date().toISOString()
    }

    const { data: newMessage, error } = await supabase
      .from('chat_messages')
      .insert(messageData)
      .select(`
        *,
        users (
          id,
          username,
          avatar_url
        )
      `)
      .single()

    if (error) throw error
    return newMessage
  }

  static async loadChatHistory(sessionId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('chat_messages')
      .select(`
        *,
        users (
          id,
          username,
          avatar_url
        )
      `)
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data || []
  }

  // Dice rolling
  static async rollDice(data: DiceRollData): Promise<DiceRoll> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const rollResult = rollDice(data.expression, data.advantage, data.disadvantage)

    const diceRollData = {
      session_id: data.sessionId,
      user_id: user.id,
      expression: data.expression,
      result: rollResult.total,
      breakdown: rollResult.breakdown,
      advantage: data.advantage,
      disadvantage: data.disadvantage,
      modifier: data.modifier,
      purpose: data.purpose,
      created_at: new Date().toISOString()
    }

    const { data: newRoll, error } = await supabase
      .from('dice_rolls')
      .insert(diceRollData)
      .select(`
        *,
        users (
          id,
          username,
          avatar_url
        )
      `)
      .single()

    if (error) throw error
    return newRoll
  }

  static async loadDiceHistory(sessionId: string): Promise<DiceRoll[]> {
    const { data, error } = await supabase
      .from('dice_rolls')
      .select(`
        *,
        users (
          id,
          username,
          avatar_url
        )
      `)
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error
    return data || []
  }

  // Initiative tracking
  static async addToInitiative(sessionId: string, entry: Omit<InitiativeEntry, 'id'>): Promise<InitiativeEntry> {
    const entryData = {
      session_id: sessionId,
      ...entry,
      created_at: new Date().toISOString()
    }

    const { data: newEntry, error } = await supabase
      .from('initiative_entries')
      .insert(entryData)
      .select()
      .single()

    if (error) throw error
    return newEntry
  }

  static async updateInitiative(entryId: string, updates: Partial<InitiativeEntry>): Promise<void> {
    const { error } = await supabase
      .from('initiative_entries')
      .update(updates)
      .eq('id', entryId)

    if (error) throw error
  }

  static async removeFromInitiative(entryId: string): Promise<void> {
    const { error } = await supabase
      .from('initiative_entries')
      .delete()
      .eq('id', entryId)

    if (error) throw error
  }

  static async loadInitiativeOrder(sessionId: string): Promise<InitiativeEntry[]> {
    const { data, error } = await supabase
      .from('initiative_entries')
      .select('*')
      .eq('session_id', sessionId)
      .order('initiative', { ascending: false })

    if (error) throw error
    return data || []
  }

  // Participants
  static async loadParticipants(sessionId: string): Promise<SessionParticipant[]> {
    const { data, error } = await supabase
      .from('session_participants')
      .select(`
        *,
        users (
          id,
          username,
          avatar_url
        ),
        characters (
          id,
          name,
          race,
          class,
          level
        )
      `)
      .eq('session_id', sessionId)

    if (error) throw error
    return data || []
  }

  static async addParticipant(sessionId: string, userId: string, characterId?: string): Promise<void> {
    const participantData = {
      session_id: sessionId,
      user_id: userId,
      character_id: characterId,
      joined_at: new Date().toISOString()
    }

    const { error } = await supabase
      .from('session_participants')
      .insert(participantData)

    if (error) throw error
  }

  static async removeParticipant(sessionId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('session_participants')
      .delete()
      .eq('session_id', sessionId)
      .eq('user_id', userId)

    if (error) throw error
  }
}

