import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { captureException } from '@/config/sentry.config'
import { SessionAPI } from './session/session-api'
import { RealtimeManager } from './session/realtime-manager'
import { initialSessionState, type SessionState } from './session/session-state'
import { type SessionActions } from './session/session-actions'
import type { 
  CreateSessionData,
  SendMessageData,
  DiceRollData,
  InitiativeEntry,
  AssetUploadData
} from '../types'

interface SessionsStore extends SessionState, SessionActions {}

export const useSessionsStore = create<SessionsStore>()(
  devtools(
    (set, get) => {
      // Initialize realtime manager
      const realtimeManager = new RealtimeManager({
        onChatMessage: (message) => {
          set((state) => ({
            chatMessages: [...state.chatMessages, message]
          }))
        },
        onDiceRoll: (roll) => {
          set((state) => ({
            diceRolls: [roll, ...state.diceRolls]
          }))
        },
        onInitiativeUpdate: async () => {
          const sessionId = get().currentSession?.id
          if (sessionId) {
            try {
              const entries = await SessionAPI.loadInitiativeOrder(sessionId)
              set({ initiativeOrder: entries })
            } catch (error) {
              captureException(error)
            }
          }
        },
        onParticipantUpdate: async () => {
          const sessionId = get().currentSession?.id
          if (sessionId) {
            try {
              const participants = await SessionAPI.loadParticipants(sessionId)
              set({ participants })
            } catch (error) {
              captureException(error)
            }
          }
        },
        onConnectionChange: (connected) => {
          set({ connected, connecting: false })
        }
      })

      return {
        ...initialSessionState,

        // Session management
        createSession: async (data: CreateSessionData) => {
          set({ loading: true })
          try {
            const session = await SessionAPI.createSession(data)
            set((state) => ({
              sessions: [session, ...state.sessions],
              loading: false
            }))
            return session
          } catch (error) {
            set({ loading: false })
            captureException(error)
            throw error
          }
        },

        loadSessions: async () => {
          set({ loading: true })
          try {
            const sessions = await SessionAPI.loadSessions()
            set({ sessions, loading: false })
          } catch (error) {
            set({ loading: false })
            captureException(error)
            throw error
          }
        },

        loadSession: async (sessionId: string) => {
          set({ loading: true })
          try {
            const session = await SessionAPI.loadSession(sessionId)
            set({ currentSession: session, loading: false })
          } catch (error) {
            set({ loading: false })
            captureException(error)
            throw error
          }
        },

        updateSession: async (sessionId: string, updates) => {
          try {
            await SessionAPI.updateSession(sessionId, updates)
            set((state) => ({
              currentSession: state.currentSession?.id === sessionId 
                ? { ...state.currentSession, ...updates }
                : state.currentSession,
              sessions: state.sessions.map(session =>
                session.id === sessionId ? { ...session, ...updates } : session
              )
            }))
          } catch (error) {
            captureException(error)
            throw error
          }
        },

        deleteSession: async (sessionId: string) => {
          try {
            await SessionAPI.deleteSession(sessionId)
            set((state) => ({
              sessions: state.sessions.filter(session => session.id !== sessionId),
              currentSession: state.currentSession?.id === sessionId ? null : state.currentSession
            }))
          } catch (error) {
            captureException(error)
            throw error
          }
        },

        // Session lifecycle
        startSession: async (sessionId: string) => {
          try {
            await SessionAPI.startSession(sessionId)
            await get().updateSession(sessionId, { status: 'active' })
          } catch (error) {
            captureException(error)
            throw error
          }
        },

        pauseSession: async (sessionId: string) => {
          try {
            await SessionAPI.pauseSession(sessionId)
            await get().updateSession(sessionId, { status: 'paused' })
          } catch (error) {
            captureException(error)
            throw error
          }
        },

        endSession: async (sessionId: string) => {
          try {
            await SessionAPI.endSession(sessionId)
            await get().updateSession(sessionId, { status: 'completed' })
          } catch (error) {
            captureException(error)
            throw error
          }
        },

        // Real-time connection
        connectToSession: async (sessionId: string) => {
          set({ connecting: true })
          try {
            await realtimeManager.connect(sessionId)
            // Load initial data
            await Promise.all([
              get().loadChatHistory(sessionId),
              get().loadDiceHistory(sessionId),
              get().loadParticipants(sessionId)
            ])
          } catch (error) {
            set({ connecting: false, connected: false })
            captureException(error)
            throw error
          }
        },

        disconnectFromSession: () => {
          realtimeManager.disconnect()
          set({ connected: false, connecting: false })
        },

        // Chat and communication
        sendMessage: async (data: SendMessageData) => {
          try {
            await SessionAPI.sendMessage(data)
            // Message will be added via realtime subscription
          } catch (error) {
            captureException(error)
            throw error
          }
        },

        loadChatHistory: async (sessionId: string) => {
          try {
            const messages = await SessionAPI.loadChatHistory(sessionId)
            set({ chatMessages: messages })
          } catch (error) {
            captureException(error)
            throw error
          }
        },

        // Dice rolling
        rollDice: async (data: DiceRollData) => {
          try {
            const roll = await SessionAPI.rollDice(data)
            // Roll will be added via realtime subscription
            return roll
          } catch (error) {
            captureException(error)
            throw error
          }
        },

        loadDiceHistory: async (sessionId: string) => {
          try {
            const rolls = await SessionAPI.loadDiceHistory(sessionId)
            set({ diceRolls: rolls })
          } catch (error) {
            captureException(error)
            throw error
          }
        },

        // Initiative tracking
        addToInitiative: async (entry) => {
          const sessionId = get().currentSession?.id
          if (!sessionId) throw new Error('No active session')

          try {
            await SessionAPI.addToInitiative(sessionId, entry)
            // Initiative will be updated via realtime subscription
          } catch (error) {
            captureException(error)
            throw error
          }
        },

        updateInitiative: async (entryId: string, updates) => {
          try {
            await SessionAPI.updateInitiative(entryId, updates)
            // Initiative will be updated via realtime subscription
          } catch (error) {
            captureException(error)
            throw error
          }
        },

        removeFromInitiative: async (entryId: string) => {
          try {
            await SessionAPI.removeFromInitiative(entryId)
            // Initiative will be updated via realtime subscription
          } catch (error) {
            captureException(error)
            throw error
          }
        },

        nextTurn: async () => {
          const { initiativeOrder } = get()
          if (initiativeOrder.length === 0) return

          const currentIndex = initiativeOrder.findIndex(entry => entry.isActive)
          const nextIndex = (currentIndex + 1) % initiativeOrder.length

          // Update current active entry
          if (currentIndex >= 0) {
            await get().updateInitiative(initiativeOrder[currentIndex].id, { isActive: false })
          }

          // Set next entry as active
          await get().updateInitiative(initiativeOrder[nextIndex].id, { isActive: true })
        },

        resetInitiative: async () => {
          const { initiativeOrder } = get()
          
          // Clear all active states
          await Promise.all(
            initiativeOrder.map(entry => 
              get().updateInitiative(entry.id, { isActive: false })
            )
          )

          // Set first entry as active if any exist
          if (initiativeOrder.length > 0) {
            await get().updateInitiative(initiativeOrder[0].id, { isActive: true })
          }
        },

        // Participants
        loadParticipants: async (sessionId: string) => {
          try {
            const participants = await SessionAPI.loadParticipants(sessionId)
            set({ participants })
          } catch (error) {
            captureException(error)
            throw error
          }
        },

        addParticipant: async (sessionId: string, userId: string, characterId?: string) => {
          try {
            await SessionAPI.addParticipant(sessionId, userId, characterId)
            // Participants will be updated via realtime subscription
          } catch (error) {
            captureException(error)
            throw error
          }
        },

        removeParticipant: async (sessionId: string, userId: string) => {
          try {
            await SessionAPI.removeParticipant(sessionId, userId)
            // Participants will be updated via realtime subscription
          } catch (error) {
            captureException(error)
            throw error
          }
        },

        // Campaign assets (placeholder - implement based on requirements)
        loadAssets: async (campaignId: string) => {
          // TODO: Implement asset loading
          set({ assets: [] })
        },

        uploadAsset: async (data: AssetUploadData) => {
          // TODO: Implement asset upload
          throw new Error('Asset upload not implemented')
        },

        deleteAsset: async (assetId: string) => {
          // TODO: Implement asset deletion
        },

        shareAsset: async (assetId: string) => {
          // TODO: Implement asset sharing
        },

        downloadAsset: async (assetId: string) => {
          // TODO: Implement asset download
        },

        // UI actions
        setActiveTab: (tab) => {
          set({ activeTab: tab })
        },

        toggleSidebar: () => {
          set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }))
        },

        // Cleanup
        clearSession: () => {
          realtimeManager.disconnect()
          set({
            currentSession: null,
            participants: [],
            chatMessages: [],
            diceRolls: [],
            initiativeOrder: [],
            assets: [],
            connected: false,
            connecting: false
          })
        },

        reset: () => {
          realtimeManager.disconnect()
          set(initialSessionState)
        }
      }
    },
    { name: 'sessions-store' }
  )
)

