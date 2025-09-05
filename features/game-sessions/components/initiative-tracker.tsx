'use client'

import { useState } from 'react'
import { 
  Plus, 
  Trash2, 
  Play, 
  SkipForward, 
  Heart, 
  Shield, 
  Zap,
  Crown,
  User,
  Dice6
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { useInitiativeTracker } from '../hooks/use-sessions'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { rollDice } from '../lib/dice-utils'
import type { InitiativeEntry } from '../types'

interface InitiativeTrackerProps {
  sessionId: string
}

export function InitiativeTracker({ sessionId }: InitiativeTrackerProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [newEntry, setNewEntry] = useState({
    name: '',
    initiative: '',
    hitPoints: { current: '', max: '', temp: '0' }
  })

  const { user } = useAuth()
  const {
    initiativeOrder,
    addToInitiative,
    removeFromInitiative,
    setActiveEntry,
    nextTurn,
    updateHitPoints,
    currentTurn
  } = useInitiativeTracker(sessionId)

  const handleAddEntry = async () => {
    if (!newEntry.name.trim() || !newEntry.initiative) return

    try {
      await addToInitiative({
        name: newEntry.name.trim(),
        initiative: parseInt(newEntry.initiative),
        hitPoints: newEntry.hitPoints.max ? {
          current: parseInt(newEntry.hitPoints.current) || parseInt(newEntry.hitPoints.max),
          max: parseInt(newEntry.hitPoints.max),
          temp: parseInt(newEntry.hitPoints.temp) || 0
        } : undefined
      })

      setNewEntry({
        name: '',
        initiative: '',
        hitPoints: { current: '', max: '', temp: '0' }
      })
      setShowAddForm(false)
    } catch (error) {
      console.error('Failed to add initiative entry:', error)
    }
  }

  const handleRollInitiative = () => {
    const result = rollDice({ expression: '1d20' })
    setNewEntry(prev => ({ ...prev, initiative: result.total.toString() }))
  }

  const handleRemoveEntry = async (entryId: string) => {
    if (window.confirm('Remove this entry from initiative?')) {
      await removeFromInitiative(entryId)
    }
  }

  const handleUpdateHitPoints = async (entryId: string, field: 'current' | 'max' | 'temp', value: string) => {
    const entry = initiativeOrder.find(e => e.id === entryId)
    if (!entry?.hitPoints) return

    const numValue = parseInt(value) || 0
    const updatedHitPoints = {
      ...entry.hitPoints,
      [field]: numValue
    }

    await updateHitPoints(entryId, updatedHitPoints)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b p-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Initiative Tracker</h3>
            <p className="text-xs text-muted-foreground">
              {initiativeOrder.length} entries
            </p>
          </div>
          <div className="flex space-x-2">
            {initiativeOrder.length > 0 && (
              <Button size="sm" onClick={nextTurn}>
                <SkipForward className="mr-1 h-3 w-3" />
                Next Turn
              </Button>
            )}
            <Button size="sm" onClick={() => setShowAddForm(true)}>
              <Plus className="mr-1 h-3 w-3" />
              Add
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Add Entry Form */}
        {showAddForm && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Add to Initiative</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newEntry.name}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Character or creature name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="initiative">Initiative</Label>
                <div className="flex space-x-2">
                  <Input
                    id="initiative"
                    type="number"
                    value={newEntry.initiative}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, initiative: e.target.value }))}
                    placeholder="Initiative score"
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleRollInitiative}
                  >
                    <Dice6 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Hit Points (Optional)</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    type="number"
                    value={newEntry.hitPoints.max}
                    onChange={(e) => setNewEntry(prev => ({
                      ...prev,
                      hitPoints: { ...prev.hitPoints, max: e.target.value, current: e.target.value }
                    }))}
                    placeholder="Max HP"
                  />
                  <Input
                    type="number"
                    value={newEntry.hitPoints.current}
                    onChange={(e) => setNewEntry(prev => ({
                      ...prev,
                      hitPoints: { ...prev.hitPoints, current: e.target.value }
                    }))}
                    placeholder="Current"
                  />
                  <Input
                    type="number"
                    value={newEntry.hitPoints.temp}
                    onChange={(e) => setNewEntry(prev => ({
                      ...prev,
                      hitPoints: { ...prev.hitPoints, temp: e.target.value }
                    }))}
                    placeholder="Temp"
                  />
                </div>
              </div>

              <div className="flex space-x-2">
                <Button onClick={handleAddEntry} size="sm" className="flex-1">
                  Add Entry
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Initiative Order */}
        {initiativeOrder.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <Zap className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-4">
              No initiative entries yet. Add characters and creatures to start tracking combat.
            </p>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add First Entry
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {initiativeOrder.map((entry, index) => (
              <InitiativeEntryCard
                key={entry.id}
                entry={entry}
                index={index}
                isActive={entry.isActive}
                onSetActive={() => setActiveEntry(entry.id)}
                onRemove={() => handleRemoveEntry(entry.id)}
                onUpdateHitPoints={(field, value) => handleUpdateHitPoints(entry.id, field, value)}
              />
            ))}
          </div>
        )}

        {/* Current Turn Info */}
        {currentTurn && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-3">
              <div className="flex items-center space-x-2">
                <Play className="h-4 w-4 text-primary" />
                <span className="font-medium">Current Turn:</span>
                <span className="font-bold text-primary">{currentTurn.name}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function InitiativeEntryCard({
  entry,
  index,
  isActive,
  onSetActive,
  onRemove,
  onUpdateHitPoints
}: {
  entry: InitiativeEntry
  index: number
  isActive: boolean
  onSetActive: () => void
  onRemove: () => void
  onUpdateHitPoints: (field: 'current' | 'max' | 'temp', value: string) => void
}) {
  const [editingHP, setEditingHP] = useState(false)

  const getHealthStatus = () => {
    if (!entry.hitPoints) return null
    
    const { current, max } = entry.hitPoints
    const percentage = (current / max) * 100
    
    if (percentage <= 0) return { color: 'text-red-600', status: 'Unconscious' }
    if (percentage <= 25) return { color: 'text-red-500', status: 'Critical' }
    if (percentage <= 50) return { color: 'text-yellow-500', status: 'Bloodied' }
    return { color: 'text-green-500', status: 'Healthy' }
  }

  const healthStatus = getHealthStatus()

  return (
    <Card className={`transition-all ${isActive ? 'ring-2 ring-primary bg-primary/5' : ''}`}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Initiative Order */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              isActive ? 'bg-primary text-primary-foreground' : 'bg-muted'
            }`}>
              {index + 1}
            </div>

            {/* Character Info */}
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium">{entry.name}</span>
                {entry.characterId && (
                  <User className="h-3 w-3 text-blue-500" />
                )}
                {isActive && (
                  <Crown className="h-3 w-3 text-yellow-500" />
                )}
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>Initiative: {entry.initiative}</span>
                {healthStatus && (
                  <Badge variant="outline" className={healthStatus.color}>
                    {healthStatus.status}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {!isActive && (
              <Button variant="ghost" size="icon" onClick={onSetActive}>
                <Play className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onRemove}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Hit Points */}
        {entry.hitPoints && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Heart className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium">Hit Points</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingHP(!editingHP)}
              >
                Edit
              </Button>
            </div>

            {editingHP ? (
              <div className="grid grid-cols-3 gap-2 mt-2">
                <div>
                  <Label className="text-xs">Current</Label>
                  <Input
                    type="number"
                    value={entry.hitPoints.current}
                    onChange={(e) => onUpdateHitPoints('current', e.target.value)}
                    size="sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Max</Label>
                  <Input
                    type="number"
                    value={entry.hitPoints.max}
                    onChange={(e) => onUpdateHitPoints('max', e.target.value)}
                    size="sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Temp</Label>
                  <Input
                    type="number"
                    value={entry.hitPoints.temp}
                    onChange={(e) => onUpdateHitPoints('temp', e.target.value)}
                    size="sm"
                  />
                </div>
              </div>
            ) : (
              <div className="mt-2">
                <div className="flex items-center justify-between text-sm">
                  <span>
                    {entry.hitPoints.current + entry.hitPoints.temp} / {entry.hitPoints.max}
                    {entry.hitPoints.temp > 0 && (
                      <span className="text-blue-500"> (+{entry.hitPoints.temp})</span>
                    )}
                  </span>
                  <span className={healthStatus?.color}>
                    {Math.round((entry.hitPoints.current / entry.hitPoints.max) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      entry.hitPoints.current <= 0 ? 'bg-red-500' :
                      entry.hitPoints.current <= entry.hitPoints.max * 0.25 ? 'bg-red-400' :
                      entry.hitPoints.current <= entry.hitPoints.max * 0.5 ? 'bg-yellow-400' :
                      'bg-green-400'
                    }`}
                    style={{
                      width: `${Math.max(0, Math.min(100, (entry.hitPoints.current / entry.hitPoints.max) * 100))}%`
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Conditions */}
        {entry.conditions.length > 0 && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Conditions</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {entry.conditions.map((condition, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {condition}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

