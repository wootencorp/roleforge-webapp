import { useEffect } from 'react'
import { useCharactersStore } from '../stores/characters-store'
import { useAuth } from '@/features/auth/hooks/use-auth'

export function useCharacters() {
  const store = useCharactersStore()
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated && user) {
      store.fetchCharacters()
    }
  }, [isAuthenticated, user, store])

  return {
    characters: store.characters,
    selectedCharacter: store.selectedCharacter,
    loading: store.loading,
    creating: store.creating,
    updating: store.updating,
    fetchCharacters: store.fetchCharacters,
    createCharacter: store.createCharacter,
    updateCharacter: store.updateCharacter,
    deleteCharacter: store.deleteCharacter,
    selectCharacter: store.selectCharacter,
    generateCharacterWithAI: store.generateCharacterWithAI,
  }
}

export function useCharacter(characterId?: string) {
  const { characters, selectedCharacter, selectCharacter } = useCharacters()

  useEffect(() => {
    if (characterId) {
      const character = characters.find(c => c.id === characterId)
      if (character) {
        selectCharacter(character)
      }
    }
  }, [characterId, characters, selectCharacter])

  return {
    character: characterId 
      ? characters.find(c => c.id === characterId) || null
      : selectedCharacter,
    selectCharacter,
  }
}

