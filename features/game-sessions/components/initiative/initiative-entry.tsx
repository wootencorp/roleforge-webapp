'use client'

import { useState } from 'react'
import { 
  Trash2, 
  Heart, 
  Shield, 
  Crown,
  User,
  Edit3,
  Check,
  X
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Badge } from '@/shared/components/ui/badge'
import type { InitiativeEntry } from '../../types'

interface InitiativeEntryProps {
  entry: InitiativeEntry
  isActive: boolean
  isCurrentTurn: boolean
  canEdit: boolean
  onRemove: (id: string) => void
  onUpdateHitPoints: (id: string, hitPoints: { current: number; max: number; temp: number }) => void
  onSetActive: (id: string) => void
}

export function InitiativeEntryComponent({
  entry,
  isActive,
  isCurrentTurn,
  canEdit,
  onRemove,
  onUpdateHitPoints,
  onSetActive
}: InitiativeEntryProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValues, setEditValues] = useState({
    current: entry.hitPoints.current.toString(),
    max: entry.hitPoints.max.toString(),
    temp: entry.hitPoints.temp.toString()
  })

  const handleSaveEdit = () => {
    onUpdateHitPoints(entry.id, {
      current: parseInt(editValues.current) || 0,
      max: parseInt(editValues.max) || 1,
      temp: parseInt(editValues.temp) || 0
    })
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setEditValues({
      current: entry.hitPoints.current.toString(),
      max: entry.hitPoints.max.toString(),
      temp: entry.hitPoints.temp.toString()
    })
    setIsEditing(false)
  }

  const getHealthPercentage = () => {
    return (entry.hitPoints.current / entry.hitPoints.max) * 100
  }

  const getHealthColor = () => {
    const percentage = getHealthPercentage()
    if (percentage > 75) return 'text-green-600'
    if (percentage > 50) return 'text-yellow-600'
    if (percentage > 25) return 'text-orange-600'
    return 'text-red-600'
  }

  const totalHP = entry.hitPoints.current + entry.hitPoints.temp

  return (
    <div 
      className={`p-4 border rounded-lg transition-all cursor-pointer ${
        isCurrentTurn 
          ? 'border-primary bg-primary/5 shadow-md' 
          : isActive 
            ? 'border-primary/50 bg-primary/2' 
            : 'border-border hover:border-primary/30'
      }`}
      onClick={() => onSetActive(entry.id)}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {entry.type === 'npc' ? (
            <Crown className="h-4 w-4 text-yellow-600" />
          ) : (
            <User className="h-4 w-4 text-blue-600" />
          )}
          <span className="font-medium">{entry.name}</span>
          {isCurrentTurn && (
            <Badge variant="default" className="text-xs">
              Current Turn
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-sm font-mono">
            {entry.initiative}
          </Badge>
          {canEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onRemove(entry.id)
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Heart className={`h-4 w-4 ${getHealthColor()}`} />
            {isEditing ? (
              <div className="flex items-center space-x-1">
                <Input
                  type="number"
                  value={editValues.current}
                  onChange={(e) => setEditValues(prev => ({ ...prev, current: e.target.value }))}
                  className="w-12 h-6 text-xs"
                  min="0"
                />
                <span className="text-xs">/</span>
                <Input
                  type="number"
                  value={editValues.max}
                  onChange={(e) => setEditValues(prev => ({ ...prev, max: e.target.value }))}
                  className="w-12 h-6 text-xs"
                  min="1"
                />
                {parseInt(editValues.temp) > 0 && (
                  <>
                    <span className="text-xs">+</span>
                    <Input
                      type="number"
                      value={editValues.temp}
                      onChange={(e) => setEditValues(prev => ({ ...prev, temp: e.target.value }))}
                      className="w-12 h-6 text-xs"
                      min="0"
                    />
                  </>
                )}
              </div>
            ) : (
              <span className={`text-sm font-mono ${getHealthColor()}`}>
                {totalHP}/{entry.hitPoints.max}
                {entry.hitPoints.temp > 0 && (
                  <span className="text-blue-600"> (+{entry.hitPoints.temp})</span>
                )}
              </span>
            )}
          </div>

          {entry.armorClass && (
            <div className="flex items-center space-x-1">
              <Shield className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-mono">{entry.armorClass}</span>
            </div>
          )}
        </div>

        {canEdit && (
          <div className="flex items-center space-x-1">
            {isEditing ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSaveEdit()
                  }}
                >
                  <Check className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleCancelEdit()
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  setIsEditing(true)
                }}
              >
                <Edit3 className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}
      </div>

      {entry.conditions && entry.conditions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {entry.conditions.map((condition, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {condition}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

