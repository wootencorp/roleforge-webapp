import { create } from 'zustand'
import { supabase } from '@/shared/lib/supabase'
import { captureException } from '@/config/sentry.config'
import type { Character } from '@/shared/types'
import type { 
  CharacterState, 
  CharacterActions, 
  CreateCharacterData, 
  CharacterFormData,
  AICharacterResponse 
} from '../types'

interface CharactersStore extends CharacterState, CharacterActions {}

export const useCharactersStore = create<CharactersStore>((set, get) => ({
  characters: [],
  selectedCharacter: null,
  loading: false,
  creating: false,
  updating: false,

  fetchCharacters: async () => {
    set({ loading: true })
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('characters')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      const characters = data.map(transformCharacterFromDB)
      set({ characters, loading: false })
    } catch (error) {
      set({ loading: false })
      captureException(error as Error, { context: 'fetch_characters' })
      throw error
    }
  },

  createCharacter: async (data: CreateCharacterData) => {
    set({ creating: true })
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const characterData = {
        user_id: user.id,
        name: data.name,
        race: data.race,
        class: data.class,
        level: 1,
        background: data.background,
        alignment: data.alignment,
        ability_scores: data.abilityScores,
        hit_points: data.hitPoints,
        armor_class: data.armorClass,
        speed: data.speed,
        skills: data.skills,
        equipment: data.equipment,
        personality_traits: data.personalityTraits,
        ideals: data.ideals,
        bonds: data.bonds,
        flaws: data.flaws,
        backstory: data.backstory,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { data: newCharacter, error } = await supabase
        .from('characters')
        .insert(characterData)
        .select()
        .single()

      if (error) throw error

      const character = transformCharacterFromDB(newCharacter)
      set(state => ({ 
        characters: [character, ...state.characters],
        creating: false 
      }))

      return character
    } catch (error) {
      set({ creating: false })
      captureException(error as Error, { context: 'create_character' })
      throw error
    }
  },

  updateCharacter: async (id: string, updates: Partial<Character>) => {
    set({ updating: true })
    
    try {
      const updateData = {
        name: updates.name,
        race: updates.race,
        class: updates.class,
        level: updates.level,
        background: updates.background,
        alignment: updates.alignment,
        ability_scores: updates.abilityScores,
        hit_points: updates.hitPoints,
        armor_class: updates.armorClass,
        speed: updates.speed,
        skills: updates.skills,
        equipment: updates.equipment,
        personality_traits: updates.personalityTraits,
        ideals: updates.ideals,
        bonds: updates.bonds,
        flaws: updates.flaws,
        backstory: updates.backstory,
        image_url: updates.imageUrl,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase
        .from('characters')
        .update(updateData)
        .eq('id', id)

      if (error) throw error

      set(state => ({
        characters: state.characters.map(char => 
          char.id === id ? { ...char, ...updates, updatedAt: updateData.updated_at } : char
        ),
        selectedCharacter: state.selectedCharacter?.id === id 
          ? { ...state.selectedCharacter, ...updates, updatedAt: updateData.updated_at }
          : state.selectedCharacter,
        updating: false
      }))
    } catch (error) {
      set({ updating: false })
      captureException(error as Error, { context: 'update_character', characterId: id })
      throw error
    }
  },

  deleteCharacter: async (id: string) => {
    try {
      const { error } = await supabase
        .from('characters')
        .delete()
        .eq('id', id)

      if (error) throw error

      set(state => ({
        characters: state.characters.filter(char => char.id !== id),
        selectedCharacter: state.selectedCharacter?.id === id ? null : state.selectedCharacter
      }))
    } catch (error) {
      captureException(error as Error, { context: 'delete_character', characterId: id })
      throw error
    }
  },

  generateCharacterWithAI: async (prompt: string, baseData: CharacterFormData) => {
    set({ creating: true })
    
    try {
      const response = await fetch('/api/characters/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, baseData }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate character')
      }

      const aiData: AICharacterResponse = await response.json()
      
      const characterData: CreateCharacterData = {
        name: baseData.name,
        race: baseData.race,
        class: baseData.class,
        background: baseData.background,
        alignment: baseData.alignment,
        ...aiData,
      }

      return await get().createCharacter(characterData)
    } catch (error) {
      set({ creating: false })
      captureException(error as Error, { context: 'generate_character_ai' })
      throw error
    }
  },

  selectCharacter: (character: Character | null) => {
    set({ selectedCharacter: character })
  },

  setLoading: (loading: boolean) => set({ loading }),
}))

// Helper function to transform database character to app character
function transformCharacterFromDB(dbCharacter: any): Character {
  return {
    id: dbCharacter.id,
    userId: dbCharacter.user_id,
    name: dbCharacter.name,
    race: dbCharacter.race,
    class: dbCharacter.class,
    level: dbCharacter.level,
    background: dbCharacter.background,
    alignment: dbCharacter.alignment,
    abilityScores: dbCharacter.ability_scores,
    hitPoints: dbCharacter.hit_points,
    armorClass: dbCharacter.armor_class,
    speed: dbCharacter.speed,
    skills: dbCharacter.skills || [],
    equipment: dbCharacter.equipment || [],
    personalityTraits: dbCharacter.personality_traits || [],
    ideals: dbCharacter.ideals || '',
    bonds: dbCharacter.bonds || '',
    flaws: dbCharacter.flaws || '',
    backstory: dbCharacter.backstory || '',
    imageUrl: dbCharacter.image_url,
    createdAt: dbCharacter.created_at,
    updatedAt: dbCharacter.updated_at,
  }
}

