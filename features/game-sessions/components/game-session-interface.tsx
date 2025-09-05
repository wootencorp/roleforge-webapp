'use client'

import { useState, useEffect } from 'react'
import { 
  Users, 
  MessageSquare, 
  Dice6, 
  Sword, 
  Settings, 
  Play, 
  Pause, 
  Square,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { SessionChat } from './session-chat'
import { DiceRoller } from './dice-roller'
import { InitiativeTracker } from './initiative-tracker'
import { SessionParticipants } from './session-participants'
import { SessionNotes } from './session-notes'
import { useGameSession } from '../hooks/use-sessions'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { LoadingSpinner } from '@/shared/components/common/loading-spinner'
import { formatRelativeTime } from '@/shared/lib/utils'
import type { GameSession } from '../types'

interface GameSessionInterfaceProps {
  sessionId: string
  onLeaveSession?: () => void
}

export function GameSessionInterface({ sessionId, onLeaveSession }: GameSessionInterfaceProps) {
  const [activePanel, setActivePanel] = useState<'chat' | 'dice' | 'initiative' | 'participants' | 'notes'>('chat')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const { user } = useAuth()

  const {
    session,
    participants,
    connected,
    connecting,
    joinSession,
    leaveSession,
    startSession,
    endSession,
  } = useGameSession(sessionId)

  useEffect(() => {
    if (session && user && !participants.find(p => p.userId === user.id)) {
      // Auto-join session if not already a participant
      joinSession(sessionId)
    }
  }, [session, user, participants, sessionId, joinSession])

  const isGM = participants.find(p => p.userId === user?.id)?.role === 'gm'
  const canStartSession = isGM && session?.status === 'scheduled'
  const canEndSession = isGM && session?.status === 'active'

  const handleStartSession = async () => {
    if (session) {
      await startSession(session.id)
    }
  }

  const handleEndSession = async () => {
    if (session && window.confirm('Are you sure you want to end this session?')) {
      await endSession(session.id)
    }
  }

  const handleLeaveSession = async () => {
    if (window.confirm('Are you sure you want to leave this session?')) {
      await leaveSession(sessionId)
      onLeaveSession?.()
    }
  }

  if (connecting) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-muted-foreground">Connecting to session...</p>
        </div>
      </div>
    )
  }

  if (!session || !connected) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-lg font-semibold mb-2">Unable to connect to session</p>
          <p className="text-muted-foreground mb-4">
            The session may have ended or you may not have permission to join.
          </p>
          <Button onClick={onLeaveSession}>
            Return to Campaign
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={`h-screen flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : ''}`}>
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-xl font-bold">{session.name}</h1>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Badge variant={getStatusVariant(session.status)}>
                  {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                </Badge>
                <span>•</span>
                <span>{participants.length} participants</span>
                {session.startedAt && (
                  <>
                    <span>•</span>
                    <span>Started {formatRelativeTime(session.startedAt)}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Session Controls */}
            {canStartSession && (
              <Button onClick={handleStartSession} size="sm">
                <Play className="mr-2 h-4 w-4" />
                Start Session
              </Button>
            )}

            {canEndSession && (
              <Button onClick={handleEndSession} variant="outline" size="sm">
                <Square className="mr-2 h-4 w-4" />
                End Session
              </Button>
            )}

            {/* Settings */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>

            <Button variant="outline" size="sm" onClick={handleLeaveSession}>
              Leave Session
            </Button>
          </div>
        </div>

        {/* Panel Navigation */}
        <div className="flex border-t">
          <PanelTab
            icon={MessageSquare}
            label="Chat"
            isActive={activePanel === 'chat'}
            onClick={() => setActivePanel('chat')}
          />
          <PanelTab
            icon={Dice6}
            label="Dice"
            isActive={activePanel === 'dice'}
            onClick={() => setActivePanel('dice')}
          />
          <PanelTab
            icon={Sword}
            label="Initiative"
            isActive={activePanel === 'initiative'}
            onClick={() => setActivePanel('initiative')}
          />
          <PanelTab
            icon={Users}
            label="Participants"
            isActive={activePanel === 'participants'}
            onClick={() => setActivePanel('participants')}
          />
          {isGM && (
            <PanelTab
              icon={Settings}
              label="Notes"
              isActive={activePanel === 'notes'}
              onClick={() => setActivePanel('notes')}
            />
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Always Chat */}
        <div className="w-1/2 border-r flex flex-col">
          <SessionChat sessionId={sessionId} />
        </div>

        {/* Right Panel - Dynamic Content */}
        <div className="w-1/2 flex flex-col">
          {activePanel === 'chat' && (
            <div className="flex-1 p-4">
              <Card>
                <CardHeader>
                  <CardTitle>Session Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Current Scene</h4>
                    <p className="text-sm text-muted-foreground">
                      {session.currentScene || 'No scene description yet'}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Session Notes</h4>
                    <p className="text-sm text-muted-foreground">
                      {session.notes || 'No notes yet'}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Quick Actions</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" onClick={() => setActivePanel('dice')}>
                        <Dice6 className="mr-2 h-4 w-4" />
                        Roll Dice
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setActivePanel('initiative')}>
                        <Sword className="mr-2 h-4 w-4" />
                        Initiative
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activePanel === 'dice' && (
            <DiceRoller sessionId={sessionId} />
          )}

          {activePanel === 'initiative' && (
            <InitiativeTracker sessionId={sessionId} />
          )}

          {activePanel === 'participants' && (
            <SessionParticipants sessionId={sessionId} />
          )}

          {activePanel === 'notes' && isGM && (
            <SessionNotes sessionId={sessionId} />
          )}
        </div>
      </div>

      {/* Connection Status */}
      {!connected && (
        <div className="absolute bottom-4 right-4">
          <Badge variant="destructive">
            Disconnected
          </Badge>
        </div>
      )}
    </div>
  )
}

function PanelTab({ 
  icon: Icon, 
  label, 
  isActive, 
  onClick 
}: { 
  icon: any
  label: string
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
        isActive
          ? 'border-primary text-primary bg-primary/5'
          : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
      }`}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  )
}

function getStatusVariant(status: GameSession['status']) {
  switch (status) {
    case 'active':
      return 'success'
    case 'scheduled':
      return 'info'
    case 'paused':
      return 'warning'
    case 'completed':
      return 'secondary'
    case 'cancelled':
      return 'destructive'
    default:
      return 'secondary'
  }
}

