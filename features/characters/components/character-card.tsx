'use client'

import { useState } from 'react'
import { MoreHorizontal, Edit, Trash2, Eye, Shield, Heart, Zap } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { formatRelativeTime, capitalize } from '@/shared/lib/utils'
import type { Character } from '@/shared/types'

interface CharacterCardProps {
  character: Character
  isSelected?: boolean
  onSelect?: () => void
  onEdit?: () => void
  onDelete?: () => void
  viewMode?: 'grid' | 'list'
}

export function CharacterCard({
  character,
  isSelected = false,
  onSelect,
  onEdit,
  onDelete,
  viewMode = 'grid'
}: CharacterCardProps) {
  const [imageError, setImageError] = useState(false)

  const getAbilityModifier = (score: number) => {
    return Math.floor((score - 10) / 2)
  }

  const formatModifier = (modifier: number) => {
    return modifier >= 0 ? `+${modifier}` : `${modifier}`
  }

  const getInitiativeModifier = () => {
    return getAbilityModifier(character.abilityScores.dexterity)
  }

  if (viewMode === 'list') {
    return (
      <Card className={`transition-all hover:shadow-md ${isSelected ? 'ring-2 ring-primary' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                {character.imageUrl && !imageError ? (
                  <img
                    src={character.imageUrl}
                    alt={character.name}
                    className="w-12 h-12 rounded-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                    {character.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg truncate">{character.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Level {character.level} {character.race} {character.class}
                </p>
                <p className="text-xs text-muted-foreground">
                  {character.background} • {formatRelativeTime(character.updatedAt)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span>{character.hitPoints}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Shield className="h-4 w-4 text-blue-500" />
                  <span>{character.armorClass}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span>{formatModifier(getInitiativeModifier())}</span>
                </div>
              </div>

              <CharacterActions
                onSelect={onSelect}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card 
      className={`transition-all hover:shadow-lg cursor-pointer ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={onSelect}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">{character.name}</h3>
            <p className="text-sm text-muted-foreground">
              Level {character.level} {character.race} {character.class}
            </p>
          </div>
          
          <CharacterActions
            onSelect={onSelect}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Character Image */}
        <div className="relative">
          {character.imageUrl && !imageError ? (
            <img
              src={character.imageUrl}
              alt={character.name}
              className="w-full h-32 rounded-md object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-32 rounded-md bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
              {character.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Character Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="space-y-1">
            <div className="flex items-center justify-center space-x-1">
              <Heart className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium">{character.hitPoints}</span>
            </div>
            <p className="text-xs text-muted-foreground">HP</p>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-center space-x-1">
              <Shield className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">{character.armorClass}</span>
            </div>
            <p className="text-xs text-muted-foreground">AC</p>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-center space-x-1">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">
                {formatModifier(getInitiativeModifier())}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Init</p>
          </div>
        </div>

        {/* Background and Alignment */}
        <div className="space-y-1">
          <p className="text-sm">
            <span className="font-medium">Background:</span> {character.background}
          </p>
          <p className="text-sm">
            <span className="font-medium">Alignment:</span> {character.alignment}
          </p>
        </div>

        {/* Ability Scores */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center">
            <p className="font-medium">STR</p>
            <p className="text-muted-foreground">
              {character.abilityScores.strength} 
              ({formatModifier(getAbilityModifier(character.abilityScores.strength))})
            </p>
          </div>
          <div className="text-center">
            <p className="font-medium">DEX</p>
            <p className="text-muted-foreground">
              {character.abilityScores.dexterity} 
              ({formatModifier(getAbilityModifier(character.abilityScores.dexterity))})
            </p>
          </div>
          <div className="text-center">
            <p className="font-medium">CON</p>
            <p className="text-muted-foreground">
              {character.abilityScores.constitution} 
              ({formatModifier(getAbilityModifier(character.abilityScores.constitution))})
            </p>
          </div>
          <div className="text-center">
            <p className="font-medium">INT</p>
            <p className="text-muted-foreground">
              {character.abilityScores.intelligence} 
              ({formatModifier(getAbilityModifier(character.abilityScores.intelligence))})
            </p>
          </div>
          <div className="text-center">
            <p className="font-medium">WIS</p>
            <p className="text-muted-foreground">
              {character.abilityScores.wisdom} 
              ({formatModifier(getAbilityModifier(character.abilityScores.wisdom))})
            </p>
          </div>
          <div className="text-center">
            <p className="font-medium">CHA</p>
            <p className="text-muted-foreground">
              {character.abilityScores.charisma} 
              ({formatModifier(getAbilityModifier(character.abilityScores.charisma))})
            </p>
          </div>
        </div>

        {/* Last Updated */}
        <p className="text-xs text-muted-foreground text-center">
          Updated {formatRelativeTime(character.updatedAt)}
        </p>
      </CardContent>
    </Card>
  )
}

function CharacterActions({ 
  onSelect, 
  onEdit, 
  onDelete 
}: {
  onSelect?: () => void
  onEdit?: () => void
  onDelete?: () => void
}) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenu.Trigger>
      
      <DropdownMenu.Portal>
        <DropdownMenu.Content 
          className="min-w-[160px] bg-white rounded-md border shadow-md p-1 z-50"
          align="end"
        >
          {onSelect && (
            <DropdownMenu.Item 
              className="flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded-sm"
              onClick={(e) => {
                e.stopPropagation()
                onSelect()
              }}
            >
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenu.Item>
          )}
          
          {onEdit && (
            <DropdownMenu.Item 
              className="flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded-sm"
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Character
            </DropdownMenu.Item>
          )}
          
          {onDelete && (
            <>
              <DropdownMenu.Separator className="h-px bg-gray-200 my-1" />
              <DropdownMenu.Item 
                className="flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-red-50 text-red-600 rounded-sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete()
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Character
              </DropdownMenu.Item>
            </>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

