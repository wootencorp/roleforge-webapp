'use client'

import { useState } from 'react'
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { CharacterCard } from './character-card'
import { CharacterForm } from './character-form'
import { useCharacters } from '../hooks/use-characters'
import { DND5E_RACES, DND5E_CLASSES } from '../lib/dnd5e-data'
import { LoadingSpinner } from '@/shared/components/common/loading-spinner'
import type { Character } from '@/shared/types'
import type { CharacterFilters } from '../types'

interface CharacterListProps {
  onCharacterSelect?: (character: Character) => void
  onCharacterEdit?: (character: Character) => void
  selectedCharacterId?: string
}

export function CharacterList({ 
  onCharacterSelect, 
  onCharacterEdit,
  selectedCharacterId 
}: CharacterListProps) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [filters, setFilters] = useState<CharacterFilters>({
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  })
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const { characters, loading, deleteCharacter } = useCharacters()

  const filteredCharacters = characters.filter(character => {
    const matchesSearch = !filters.search || 
      character.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      character.race.toLowerCase().includes(filters.search.toLowerCase()) ||
      character.class.toLowerCase().includes(filters.search.toLowerCase())
    
    const matchesRace = !filters.race || character.race === filters.race
    const matchesClass = !filters.class || character.class === filters.class
    const matchesLevel = !filters.level || character.level === filters.level

    return matchesSearch && matchesRace && matchesClass && matchesLevel
  }).sort((a, b) => {
    const { sortBy, sortOrder } = filters
    let aValue: any, bValue: any

    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase()
        bValue = b.name.toLowerCase()
        break
      case 'level':
        aValue = a.level
        bValue = b.level
        break
      case 'createdAt':
        aValue = new Date(a.createdAt)
        bValue = new Date(b.createdAt)
        break
      case 'updatedAt':
        aValue = new Date(a.updatedAt)
        bValue = new Date(b.updatedAt)
        break
      default:
        return 0
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
    return 0
  })

  const handleCreateSuccess = (characterId: string) => {
    setShowCreateForm(false)
    const newCharacter = characters.find(c => c.id === characterId)
    if (newCharacter && onCharacterSelect) {
      onCharacterSelect(newCharacter)
    }
  }

  const handleDeleteCharacter = async (character: Character) => {
    if (window.confirm(`Are you sure you want to delete ${character.name}?`)) {
      try {
        await deleteCharacter(character.id)
      } catch (error) {
        console.error('Failed to delete character:', error)
      }
    }
  }

  if (showCreateForm) {
    return (
      <div className="p-6">
        <CharacterForm
          onSuccess={handleCreateSuccess}
          onCancel={() => setShowCreateForm(false)}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Characters</h1>
          <p className="text-muted-foreground">
            Manage your character collection
          </p>
        </div>
        
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Character
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search characters..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="pl-10"
          />
        </div>

        <Select
          value={filters.race || ''}
          onValueChange={(value) => setFilters(prev => ({ 
            ...prev, 
            race: value === 'all' ? undefined : value 
          }))}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by race" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Races</SelectItem>
            {DND5E_RACES.map((race) => (
              <SelectItem key={race.name} value={race.name}>
                {race.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.class || ''}
          onValueChange={(value) => setFilters(prev => ({ 
            ...prev, 
            class: value === 'all' ? undefined : value 
          }))}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by class" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {DND5E_CLASSES.map((characterClass) => (
              <SelectItem key={characterClass.name} value={characterClass.name}>
                {characterClass.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={`${filters.sortBy}-${filters.sortOrder}`}
          onValueChange={(value) => {
            const [sortBy, sortOrder] = value.split('-') as [any, 'asc' | 'desc']
            setFilters(prev => ({ ...prev, sortBy, sortOrder }))
          }}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name-asc">Name (A-Z)</SelectItem>
            <SelectItem value="name-desc">Name (Z-A)</SelectItem>
            <SelectItem value="level-desc">Level (High-Low)</SelectItem>
            <SelectItem value="level-asc">Level (Low-High)</SelectItem>
            <SelectItem value="createdAt-desc">Newest First</SelectItem>
            <SelectItem value="createdAt-asc">Oldest First</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Character Grid/List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredCharacters.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <Plus className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No characters found</h3>
          <p className="text-muted-foreground mb-4">
            {filters.search || filters.race || filters.class
              ? 'Try adjusting your filters or search terms.'
              : 'Create your first character to get started.'}
          </p>
          {!filters.search && !filters.race && !filters.class && (
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Character
            </Button>
          )}
        </div>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
        }>
          {filteredCharacters.map((character) => (
            <CharacterCard
              key={character.id}
              character={character}
              isSelected={character.id === selectedCharacterId}
              onSelect={() => onCharacterSelect?.(character)}
              onEdit={() => onCharacterEdit?.(character)}
              onDelete={() => handleDeleteCharacter(character)}
              viewMode={viewMode}
            />
          ))}
        </div>
      )}

      {/* Results Count */}
      {!loading && filteredCharacters.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          Showing {filteredCharacters.length} of {characters.length} characters
        </div>
      )}
    </div>
  )
}

