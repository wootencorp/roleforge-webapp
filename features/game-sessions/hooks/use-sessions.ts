import { useEffect } from 'react'
import { useSessionsStore } from '../stores/sessions-store'
import { useAuth } from '@/features/auth/hooks/use-auth'
import type { SessionFilters } from '../types'

export function useSessions(filters?: SessionFilters) {
  const store = useSessionsStore()
  const { user, isAuthenticated } = useAuth()

  return {
    sessions: store.sessions,
    loading: store.loading,
    createSession: store.createSession,
    updateSession: store.updateSession,
    startSession: store.startSession,
    endSession: store.endSession,
  }
}

export function useGameSession(sessionId?: string) {
  const store = useSessionsStore()
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    if (sessionId && isAuthenticated && user) {
      store.connectToSession(sessionId)
    }

    return () => {
      if (store.connected) {
        store.disconnectFromSession()
      }
    }
  }, [sessionId, isAuthenticated, user, store])

  return {
    session: store.currentSession,
    participants: store.participants,
    chatMessages: store.chatMessages,
    diceRolls: store.diceRolls,
    initiativeOrder: store.initiativeOrder,
    connected: store.connected,
    connecting: store.connecting,
    joinSession: store.joinSession,
    leaveSession: store.leaveSession,
    sendChatMessage: store.sendChatMessage,
    rollDice: store.rollDice,
    updateInitiative: store.updateInitiative,
    updateSession: store.updateSession,
    startSession: store.startSession,
    endSession: store.endSession,
  }
}

export function useSessionChat(sessionId: string) {
  const { chatMessages, sendChatMessage } = useGameSession(sessionId)

  const sendMessage = async (content: string, type: 'message' | 'action' = 'message') => {
    await sendChatMessage(sessionId, { type, content })
  }

  const sendAction = async (content: string) => {
    await sendChatMessage(sessionId, { type: 'action', content })
  }

  return {
    messages: chatMessages,
    sendMessage,
    sendAction,
  }
}

export function useSessionDice(sessionId: string) {
  const { diceRolls, rollDice } = useGameSession(sessionId)

  const roll = async (
    expression: string, 
    options?: {
      modifier?: number
      advantage?: 'advantage' | 'disadvantage' | 'normal'
      purpose?: string
    }
  ) => {
    await rollDice(sessionId, {
      expression,
      modifier: options?.modifier,
      advantage: options?.advantage || 'normal',
      purpose: options?.purpose,
    })
  }

  return {
    rolls: diceRolls,
    roll,
  }
}

export function useInitiativeTracker(sessionId: string) {
  const { initiativeOrder, updateInitiative } = useGameSession(sessionId)

  const addToInitiative = async (entry: {
    characterId?: string
    name: string
    initiative: number
    hitPoints?: { current: number; max: number; temp: number }
  }) => {
    const newEntry = {
      id: `temp-${Date.now()}`,
      sessionId,
      characterId: entry.characterId,
      name: entry.name,
      initiative: entry.initiative,
      isActive: false,
      conditions: [],
      hitPoints: entry.hitPoints,
    }

    const newOrder = [...initiativeOrder, newEntry]
      .sort((a, b) => b.initiative - a.initiative)
    
    await updateInitiative(sessionId, newOrder)
  }

  const removeFromInitiative = async (entryId: string) => {
    const newOrder = initiativeOrder.filter(entry => entry.id !== entryId)
    await updateInitiative(sessionId, newOrder)
  }

  const setActiveEntry = async (entryId: string) => {
    const newOrder = initiativeOrder.map(entry => ({
      ...entry,
      isActive: entry.id === entryId
    }))
    await updateInitiative(sessionId, newOrder)
  }

  const nextTurn = async () => {
    const currentIndex = initiativeOrder.findIndex(entry => entry.isActive)
    const nextIndex = (currentIndex + 1) % initiativeOrder.length
    
    if (initiativeOrder[nextIndex]) {
      await setActiveEntry(initiativeOrder[nextIndex].id)
    }
  }

  const updateHitPoints = async (entryId: string, hitPoints: { current: number; max: number; temp: number }) => {
    const newOrder = initiativeOrder.map(entry => 
      entry.id === entryId ? { ...entry, hitPoints } : entry
    )
    await updateInitiative(sessionId, newOrder)
  }

  return {
    initiativeOrder,
    addToInitiative,
    removeFromInitiative,
    setActiveEntry,
    nextTurn,
    updateHitPoints,
    currentTurn: initiativeOrder.find(entry => entry.isActive),
  }
}

