import { create } from 'zustand'
import { supabase } from '@/shared/lib/supabase'
import { captureException } from '@/config/sentry.config'
import { rollDice } from '../lib/dice-utils'
import type { 
  SessionState, 
  SessionActions, 
  GameSession,
  CreateSessionData,
  SendMessageData,
  DiceRollData,
  InitiativeEntry,
  ChatMessage,
  DiceRoll
} from '../types'

interface SessionsStore extends SessionState, SessionActions {}

export const useSessionsStore = create<SessionsStore>((set, get) => ({
  currentSession: null,
  sessions: [],
  loading: false,
  connecting: false,
  connected: false,
  participants: [],
  chatMessages: [],
  diceRolls: [],
  initiativeOrder: [],

  createSession: async (data: CreateSessionData) => {
    set({ loading: true })
    
    try {
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

      // Add creator as GM participant
      await supabase
        .from('session_participants')
        .insert({
          session_id: newSession.id,
          user_id: user.id,
          role: 'gm',
          status: 'offline',
          joined_at: new Date().toISOString(),
        })

      const session = transformSessionFromDB(newSession)
      
      set(state => ({ 
        sessions: [session, ...state.sessions],
        loading: false 
      }))

      return session
    } catch (error) {
      set({ loading: false })
      captureException(error as Error, { context: 'create_session' })
      throw error
    }
  },

  joinSession: async (sessionId: string, characterId?: string) => {
    set({ connecting: true })
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Check if already a participant
      const { data: existingParticipant } = await supabase
        .from('session_participants')
        .select('id')
        .eq('session_id', sessionId)
        .eq('user_id', user.id)
        .single()

      if (!existingParticipant) {
        // Add as new participant
        await supabase
          .from('session_participants')
          .insert({
            session_id: sessionId,
            user_id: user.id,
            character_id: characterId,
            role: 'player',
            status: 'online',
            joined_at: new Date().toISOString(),
          })
      } else {
        // Update status to online
        await supabase
          .from('session_participants')
          .update({ 
            status: 'online',
            character_id: characterId 
          })
          .eq('id', existingParticipant.id)
      }

      await get().connectToSession(sessionId)
      set({ connecting: false })
    } catch (error) {
      set({ connecting: false })
      captureException(error as Error, { context: 'join_session', sessionId })
      throw error
    }
  },

  leaveSession: async (sessionId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      await supabase
        .from('session_participants')
        .update({ status: 'offline' })
        .eq('session_id', sessionId)
        .eq('user_id', user.id)

      get().disconnectFromSession()
    } catch (error) {
      captureException(error as Error, { context: 'leave_session', sessionId })
      throw error
    }
  },

  startSession: async (sessionId: string) => {
    try {
      await supabase
        .from('game_sessions')
        .update({ 
          status: 'active',
          started_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)

      // Send system message
      await get().sendChatMessage(sessionId, {
        type: 'system',
        content: 'Game session has started!'
      })
    } catch (error) {
      captureException(error as Error, { context: 'start_session', sessionId })
      throw error
    }
  },

  endSession: async (sessionId: string) => {
    try {
      await supabase
        .from('game_sessions')
        .update({ 
          status: 'completed',
          ended_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)

      // Send system message
      await get().sendChatMessage(sessionId, {
        type: 'system',
        content: 'Game session has ended. Thanks for playing!'
      })
    } catch (error) {
      captureException(error as Error, { context: 'end_session', sessionId })
      throw error
    }
  },

  updateSession: async (sessionId: string, updates: Partial<GameSession>) => {
    try {
      const updateData = {
        name: updates.name,
        description: updates.description,
        current_scene: updates.currentScene,
        notes: updates.notes,
        updated_at: new Date().toISOString(),
      }

      await supabase
        .from('game_sessions')
        .update(updateData)
        .eq('id', sessionId)

      set(state => ({
        currentSession: state.currentSession?.id === sessionId 
          ? { ...state.currentSession, ...updates, updatedAt: updateData.updated_at }
          : state.currentSession,
        sessions: state.sessions.map(session => 
          session.id === sessionId 
            ? { ...session, ...updates, updatedAt: updateData.updated_at }
            : session
        )
      }))
    } catch (error) {
      captureException(error as Error, { context: 'update_session', sessionId })
      throw error
    }
  },

  sendChatMessage: async (sessionId: string, message: SendMessageData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const messageData = {
        session_id: sessionId,
        user_id: user.id,
        type: message.type,
        content: message.content,
        metadata: message.metadata,
        timestamp: new Date().toISOString(),
      }

      const { data: newMessage, error } = await supabase
        .from('chat_messages')
        .insert(messageData)
        .select(`
          *,
          user:user_profiles(id, first_name, last_name, avatar_url)
        `)
        .single()

      if (error) throw error

      const chatMessage = transformChatMessageFromDB(newMessage)
      
      set(state => ({
        chatMessages: [...state.chatMessages, chatMessage]
      }))
    } catch (error) {
      captureException(error as Error, { context: 'send_chat_message', sessionId })
      throw error
    }
  },

  rollDice: async (sessionId: string, rollData: DiceRollData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const result = rollDice(rollData)
      
      const diceRollData = {
        session_id: sessionId,
        user_id: user.id,
        expression: rollData.expression,
        result: result.total,
        breakdown: result.breakdown,
        modifier: result.modifier,
        advantage: rollData.advantage,
        purpose: rollData.purpose,
        timestamp: new Date().toISOString(),
      }

      const { data: newRoll, error } = await supabase
        .from('dice_rolls')
        .insert(diceRollData)
        .select(`
          *,
          user:user_profiles(id, first_name, last_name, avatar_url)
        `)
        .single()

      if (error) throw error

      const diceRoll = transformDiceRollFromDB(newRoll)
      
      set(state => ({
        diceRolls: [...state.diceRolls, diceRoll]
      }))

      // Also send as chat message
      await get().sendChatMessage(sessionId, {
        type: 'dice',
        content: `🎲 ${rollData.expression}: **${result.total}**`,
        metadata: { diceRoll: diceRoll }
      })
    } catch (error) {
      captureException(error as Error, { context: 'roll_dice', sessionId })
      throw error
    }
  },

  updateInitiative: async (sessionId: string, entries: InitiativeEntry[]) => {
    try {
      // Delete existing initiative entries
      await supabase
        .from('initiative_entries')
        .delete()
        .eq('session_id', sessionId)

      // Insert new entries
      if (entries.length > 0) {
        const initiativeData = entries.map(entry => ({
          session_id: sessionId,
          character_id: entry.characterId,
          name: entry.name,
          initiative: entry.initiative,
          is_active: entry.isActive,
          conditions: entry.conditions,
          hit_points: entry.hitPoints,
        }))

        await supabase
          .from('initiative_entries')
          .insert(initiativeData)
      }

      set({ initiativeOrder: entries })
    } catch (error) {
      captureException(error as Error, { context: 'update_initiative', sessionId })
      throw error
    }
  },

  connectToSession: async (sessionId: string) => {
    try {
      set({ connecting: true })

      // Fetch session data
      const { data: sessionData, error: sessionError } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('id', sessionId)
        .single()

      if (sessionError) throw sessionError

      // Fetch participants
      const { data: participantsData, error: participantsError } = await supabase
        .from('session_participants')
        .select(`
          *,
          user:user_profiles(id, first_name, last_name, avatar_url),
          character:characters(id, name, race, class, level)
        `)
        .eq('session_id', sessionId)

      if (participantsError) throw participantsError

      // Fetch recent chat messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('chat_messages')
        .select(`
          *,
          user:user_profiles(id, first_name, last_name, avatar_url)
        `)
        .eq('session_id', sessionId)
        .order('timestamp', { ascending: true })
        .limit(100)

      if (messagesError) throw messagesError

      // Fetch initiative order
      const { data: initiativeData, error: initiativeError } = await supabase
        .from('initiative_entries')
        .select('*')
        .eq('session_id', sessionId)
        .order('initiative', { ascending: false })

      if (initiativeError) throw initiativeError

      const session = transformSessionFromDB(sessionData)
      const participants = participantsData.map(transformParticipantFromDB)
      const chatMessages = messagesData.map(transformChatMessageFromDB)
      const initiativeOrder = initiativeData.map(transformInitiativeFromDB)

      set({
        currentSession: session,
        participants,
        chatMessages,
        initiativeOrder,
        connected: true,
        connecting: false
      })

      // Set up real-time subscriptions
      setupRealtimeSubscriptions(sessionId)
    } catch (error) {
      set({ connecting: false, connected: false })
      captureException(error as Error, { context: 'connect_to_session', sessionId })
      throw error
    }
  },

  disconnectFromSession: () => {
    // Clean up subscriptions
    supabase.removeAllChannels()
    
    set({
      currentSession: null,
      participants: [],
      chatMessages: [],
      diceRolls: [],
      initiativeOrder: [],
      connected: false,
      connecting: false
    })
  },

  setCurrentSession: (session: GameSession | null) => {
    set({ currentSession: session })
  },
}))

// Helper functions for real-time subscriptions
function setupRealtimeSubscriptions(sessionId: string) {
  // Chat messages subscription
  supabase
    .channel(`chat_messages:${sessionId}`)
    .on('postgres_changes', 
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'chat_messages',
        filter: `session_id=eq.${sessionId}`
      }, 
      (payload) => {
        const message = transformChatMessageFromDB(payload.new)
        useSessionsStore.setState(state => ({
          chatMessages: [...state.chatMessages, message]
        }))
      }
    )
    .subscribe()

  // Dice rolls subscription
  supabase
    .channel(`dice_rolls:${sessionId}`)
    .on('postgres_changes', 
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'dice_rolls',
        filter: `session_id=eq.${sessionId}`
      }, 
      (payload) => {
        const diceRoll = transformDiceRollFromDB(payload.new)
        useSessionsStore.setState(state => ({
          diceRolls: [...state.diceRolls, diceRoll]
        }))
      }
    )
    .subscribe()

  // Initiative updates subscription
  supabase
    .channel(`initiative:${sessionId}`)
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'initiative_entries',
        filter: `session_id=eq.${sessionId}`
      }, 
      () => {
        // Refetch initiative order
        supabase
          .from('initiative_entries')
          .select('*')
          .eq('session_id', sessionId)
          .order('initiative', { ascending: false })
          .then(({ data }) => {
            if (data) {
              const initiativeOrder = data.map(transformInitiativeFromDB)
              useSessionsStore.setState({ initiativeOrder })
            }
          })
      }
    )
    .subscribe()
}

// Transform functions
function transformSessionFromDB(dbSession: any): GameSession {
  return {
    id: dbSession.id,
    campaignId: dbSession.campaign_id,
    name: dbSession.name,
    description: dbSession.description,
    status: dbSession.status,
    scheduledAt: dbSession.scheduled_at,
    startedAt: dbSession.started_at,
    endedAt: dbSession.ended_at,
    participants: [],
    currentScene: dbSession.current_scene || '',
    notes: dbSession.notes || '',
    chatMessages: [],
    diceRolls: [],
    initiativeOrder: [],
    createdAt: dbSession.created_at,
    updatedAt: dbSession.updated_at,
  }
}

function transformParticipantFromDB(dbParticipant: any): any {
  return {
    id: dbParticipant.id,
    sessionId: dbParticipant.session_id,
    userId: dbParticipant.user_id,
    characterId: dbParticipant.character_id,
    role: dbParticipant.role,
    status: dbParticipant.status,
    joinedAt: dbParticipant.joined_at,
    user: dbParticipant.user,
    character: dbParticipant.character,
  }
}

function transformChatMessageFromDB(dbMessage: any): ChatMessage {
  return {
    id: dbMessage.id,
    sessionId: dbMessage.session_id,
    userId: dbMessage.user_id,
    type: dbMessage.type,
    content: dbMessage.content,
    metadata: dbMessage.metadata,
    timestamp: dbMessage.timestamp,
    user: dbMessage.user,
  }
}

function transformDiceRollFromDB(dbRoll: any): DiceRoll {
  return {
    id: dbRoll.id,
    sessionId: dbRoll.session_id,
    userId: dbRoll.user_id,
    expression: dbRoll.expression,
    result: dbRoll.result,
    breakdown: dbRoll.breakdown,
    modifier: dbRoll.modifier,
    advantage: dbRoll.advantage,
    purpose: dbRoll.purpose,
    timestamp: dbRoll.timestamp,
    user: dbRoll.user,
  }
}

function transformInitiativeFromDB(dbInitiative: any): InitiativeEntry {
  return {
    id: dbInitiative.id,
    sessionId: dbInitiative.session_id,
    characterId: dbInitiative.character_id,
    name: dbInitiative.name,
    initiative: dbInitiative.initiative,
    isActive: dbInitiative.is_active,
    conditions: dbInitiative.conditions || [],
    hitPoints: dbInitiative.hit_points,
  }
}

