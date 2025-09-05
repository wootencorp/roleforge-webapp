'use client'

import { useState } from 'react'
import { Plus, Play, SkipForward, RotateCcw } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { useInitiativeTracker } from '../hooks/use-sessions'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { InitiativeEntryComponent } from './initiative/initiative-entry'
import { AddInitiativeForm } from './initiative/add-initiative-form'

interface InitiativeTrackerProps {
  sessionId: string
}

export function InitiativeTracker({ sessionId }: InitiativeTrackerProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const { user } = useAuth()
  
  const {
    initiativeOrder,
    addToInitiative,
    removeFromInitiative,
    setActiveEntry,
    nextTurn,
    updateHitPoints,
    resetInitiative,
    currentTurn,
    round
  } = useInitiativeTracker(sessionId)

  const handleAddEntry = async (entryData: {
    name: string
    initiative: number
    hitPoints: { current: number; max: number; temp: number }
    type: 'player' | 'npc'
    armorClass?: number
  }) => {
    await addToInitiative({
      ...entryData,
      id: `${Date.now()}-${Math.random()}`,
      conditions: []
    })
    setShowAddForm(false)
  }

  const handleRemoveEntry = async (id: string) => {
    await removeFromInitiative(id)
  }

  const handleUpdateHitPoints = async (id: string, hitPoints: { current: number; max: number; temp: number }) => {
    await updateHitPoints(id, hitPoints)
  }

  const handleSetActive = async (id: string) => {
    await setActiveEntry(id)
  }

  const handleNextTurn = async () => {
    await nextTurn()
  }

  const handleResetInitiative = async () => {
    if (confirm('Are you sure you want to reset the initiative tracker? This will clear all entries.')) {
      await resetInitiative()
    }
  }

  const isGM = user?.role === 'gm' // Assuming user has a role property

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <span>Initiative Tracker</span>
              {round > 0 && (
                <Badge variant="outline">Round {round}</Badge>
              )}
            </CardTitle>
            
            <div className="flex items-center space-x-2">
              {initiativeOrder.length > 0 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextTurn}
                    disabled={!isGM}
                  >
                    <SkipForward className="h-4 w-4 mr-1" />
                    Next Turn
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetInitiative}
                    disabled={!isGM}
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Reset
                  </Button>
                </>
              )}
              
              <Button
                variant="default"
                size="sm"
                onClick={() => setShowAddForm(!showAddForm)}
                disabled={!isGM}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Entry
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {showAddForm && (
            <AddInitiativeForm
              onAdd={handleAddEntry}
              onCancel={() => setShowAddForm(false)}
            />
          )}

          {initiativeOrder.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Play className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No initiative entries</p>
              <p className="text-sm">Add characters and NPCs to start tracking initiative</p>
            </div>
          ) : (
            <div className="space-y-3">
              {initiativeOrder.map((entry) => (
                <InitiativeEntryComponent
                  key={entry.id}
                  entry={entry}
                  isActive={entry.id === currentTurn?.id}
                  isCurrentTurn={entry.id === currentTurn?.id}
                  canEdit={isGM}
                  onRemove={handleRemoveEntry}
                  onUpdateHitPoints={handleUpdateHitPoints}
                  onSetActive={handleSetActive}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

