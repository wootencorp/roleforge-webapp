import { supabase } from '@/shared/lib/supabase'
import { captureException } from '@/config/sentry.config'
import type { RealtimeChannel } from '@supabase/supabase-js'
import type { ChatMessage, DiceRoll, InitiativeEntry } from '../../types'

export class RealtimeManager {
  private channel: RealtimeChannel | null = null
  private sessionId: string | null = null
  private callbacks: {
    onChatMessage?: (message: ChatMessage) => void
    onDiceRoll?: (roll: DiceRoll) => void
    onInitiativeUpdate?: (entries: InitiativeEntry[]) => void
    onParticipantUpdate?: () => void
    onConnectionChange?: (connected: boolean) => void
  } = {}

  constructor(callbacks: RealtimeManager['callbacks']) {
    this.callbacks = callbacks
  }

  async connect(sessionId: string): Promise<void> {
    try {
      // Disconnect from previous session if any
      this.disconnect()

      this.sessionId = sessionId
      this.channel = supabase.channel(`session:${sessionId}`)

      // Subscribe to chat messages
      this.channel.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          this.callbacks.onChatMessage?.(payload.new as ChatMessage)
        }
      )

      // Subscribe to dice rolls
      this.channel.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'dice_rolls',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          this.callbacks.onDiceRoll?.(payload.new as DiceRoll)
        }
      )

      // Subscribe to initiative updates
      this.channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'initiative_entries',
          filter: `session_id=eq.${sessionId}`
        },
        () => {
          // Reload initiative order when any change occurs
          this.callbacks.onInitiativeUpdate?.([])
        }
      )

      // Subscribe to participant changes
      this.channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'session_participants',
          filter: `session_id=eq.${sessionId}`
        },
        () => {
          this.callbacks.onParticipantUpdate?.()
        }
      )

      // Handle connection status
      this.channel.on('system', {}, (payload) => {
        if (payload.type === 'connected') {
          this.callbacks.onConnectionChange?.(true)
        } else if (payload.type === 'disconnected') {
          this.callbacks.onConnectionChange?.(false)
        }
      })

      // Subscribe to the channel
      const status = await this.channel.subscribe()
      
      if (status === 'SUBSCRIBED') {
        this.callbacks.onConnectionChange?.(true)
      } else {
        throw new Error('Failed to subscribe to realtime channel')
      }

    } catch (error) {
      captureException(error)
      this.callbacks.onConnectionChange?.(false)
      throw error
    }
  }

  disconnect(): void {
    if (this.channel) {
      this.channel.unsubscribe()
      this.channel = null
    }
    this.sessionId = null
    this.callbacks.onConnectionChange?.(false)
  }

  isConnected(): boolean {
    return this.channel !== null && this.sessionId !== null
  }

  getCurrentSessionId(): string | null {
    return this.sessionId
  }

  // Send presence updates
  async updatePresence(data: { status: 'online' | 'away' | 'offline' }): Promise<void> {
    if (!this.channel) return

    try {
      await this.channel.track(data)
    } catch (error) {
      captureException(error)
    }
  }

  // Listen for presence changes
  onPresenceSync(callback: (presences: any[]) => void): void {
    if (!this.channel) return

    this.channel.on('presence', { event: 'sync' }, () => {
      const presences = this.channel?.presenceState()
      callback(Object.values(presences || {}))
    })
  }

  onPresenceJoin(callback: (presence: any) => void): void {
    if (!this.channel) return

    this.channel.on('presence', { event: 'join' }, ({ newPresences }) => {
      newPresences.forEach(callback)
    })
  }

  onPresenceLeave(callback: (presence: any) => void): void {
    if (!this.channel) return

    this.channel.on('presence', { event: 'leave' }, ({ leftPresences }) => {
      leftPresences.forEach(callback)
    })
  }
}

