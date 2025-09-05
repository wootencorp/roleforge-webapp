'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Sparkles, Dice6 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { useCharacters } from '../hooks/use-characters'
import { characterFormSchema, type CharacterForm } from '@/shared/lib/validations'
import { DND5E_RACES, DND5E_CLASSES, DND5E_BACKGROUNDS, ALIGNMENTS } from '../lib/dnd5e-data'
import { getErrorMessage, randomBetween } from '@/shared/lib/utils'
import type { AbilityScores } from '@/shared/types'

interface CharacterFormProps {
  onSuccess?: (characterId: string) => void
  onCancel?: () => void
}

export function CharacterForm({ onSuccess, onCancel }: CharacterFormProps) {
  const [error, setError] = useState<string>('')
  const [useAI, setUseAI] = useState(false)
  const { createCharacter, generateCharacterWithAI, creating } = useCharacters()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CharacterForm>({
    resolver: zodResolver(characterFormSchema),
  })

  const selectedRace = watch('race')
  const selectedClass = watch('class')

  const generateAbilityScores = (): AbilityScores => {
    const rollStat = () => {
      // Roll 4d6, drop lowest
      const rolls = Array.from({ length: 4 }, () => randomBetween(1, 6))
      rolls.sort((a, b) => b - a)
      return rolls.slice(0, 3).reduce((sum, roll) => sum + roll, 0)
    }

    return {
      strength: rollStat(),
      dexterity: rollStat(),
      constitution: rollStat(),
      intelligence: rollStat(),
      wisdom: rollStat(),
      charisma: rollStat(),
    }
  }

  const calculateHitPoints = (constitution: number, classHitDie: number): number => {
    const constitutionModifier = Math.floor((constitution - 10) / 2)
    return classHitDie + constitutionModifier
  }

  const calculateArmorClass = (dexterity: number): number => {
    const dexterityModifier = Math.floor((dexterity - 10) / 2)
    return 10 + dexterityModifier // Base AC without armor
  }

  const onSubmit = async (data: CharacterForm) => {
    try {
      setError('')
      
      if (useAI && data.prompt) {
        // Generate character with AI
        const character = await generateCharacterWithAI(data.prompt, data)
        if (onSuccess) onSuccess(character.id)
      } else {
        // Generate character manually
        const abilityScores = generateAbilityScores()
        const selectedClassData = DND5E_CLASSES.find(c => c.name === data.class)
        const hitPoints = calculateHitPoints(abilityScores.constitution, selectedClassData?.hitDie || 8)
        const armorClass = calculateArmorClass(abilityScores.dexterity)
        
        const character = await createCharacter({
          name: data.name,
          race: data.race,
          class: data.class,
          background: data.background,
          alignment: data.alignment,
          abilityScores,
          hitPoints,
          armorClass,
          speed: DND5E_RACES.find(r => r.name === data.race)?.speed || 30,
          skills: selectedClassData?.skills.slice(0, 2) || [],
          equipment: selectedClassData?.equipment || [],
          personalityTraits: [],
          ideals: '',
          bonds: '',
          flaws: '',
          backstory: '',
        })
        
        if (onSuccess) onSuccess(character.id)
      }
      
      reset()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const selectedRaceData = DND5E_RACES.find(r => r.name === selectedRace)
  const selectedClassData = DND5E_CLASSES.find(c => c.name === selectedClass)

  return (
    <div className="w-full max-w-2xl space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight">Create New Character</h2>
        <p className="text-muted-foreground">
          Build your next adventure companion
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="rounded-md bg-red-50 p-3 border border-red-200">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* AI Toggle */}
        <div className="flex items-center space-x-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <input
            type="checkbox"
            id="useAI"
            checked={useAI}
            onChange={(e) => setUseAI(e.target.checked)}
            className="rounded border-gray-300"
          />
          <Label htmlFor="useAI" className="flex items-center space-x-2 cursor-pointer">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span>Generate with AI</span>
          </Label>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Character Name</Label>
            <Input
              id="name"
              placeholder="Enter character name"
              error={errors.name?.message}
              {...register('name')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="race">Race</Label>
            <Select onValueChange={(value) => setValue('race', value)}>
              <SelectTrigger error={errors.race?.message}>
                <SelectValue placeholder="Select a race" />
              </SelectTrigger>
              <SelectContent>
                {DND5E_RACES.map((race) => (
                  <SelectItem key={race.name} value={race.name}>
                    {race.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedRaceData && (
              <p className="text-xs text-muted-foreground">
                {selectedRaceData.description}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="class">Class</Label>
            <Select onValueChange={(value) => setValue('class', value)}>
              <SelectTrigger error={errors.class?.message}>
                <SelectValue placeholder="Select a class" />
              </SelectTrigger>
              <SelectContent>
                {DND5E_CLASSES.map((characterClass) => (
                  <SelectItem key={characterClass.name} value={characterClass.name}>
                    {characterClass.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedClassData && (
              <p className="text-xs text-muted-foreground">
                Hit Die: d{selectedClassData.hitDie} | Primary: {selectedClassData.primaryAbility.join(', ')}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="background">Background</Label>
            <Select onValueChange={(value) => setValue('background', value)}>
              <SelectTrigger error={errors.background?.message}>
                <SelectValue placeholder="Select a background" />
              </SelectTrigger>
              <SelectContent>
                {DND5E_BACKGROUNDS.map((background) => (
                  <SelectItem key={background.name} value={background.name}>
                    {background.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="alignment">Alignment</Label>
            <Select onValueChange={(value) => setValue('alignment', value)}>
              <SelectTrigger error={errors.alignment?.message}>
                <SelectValue placeholder="Select alignment" />
              </SelectTrigger>
              <SelectContent>
                {ALIGNMENTS.map((alignment) => (
                  <SelectItem key={alignment} value={alignment}>
                    {alignment}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* AI Prompt */}
        {useAI && (
          <div className="space-y-2">
            <Label htmlFor="prompt">AI Generation Prompt</Label>
            <textarea
              id="prompt"
              placeholder="Describe your character's personality, backstory, or any specific traits you want the AI to consider..."
              className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              {...register('prompt')}
            />
            {errors.prompt && (
              <p className="text-sm text-red-600">{errors.prompt.message}</p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            type="submit"
            className="flex-1"
            loading={creating}
            disabled={creating}
          >
            {useAI ? (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate with AI
              </>
            ) : (
              <>
                <Dice6 className="mr-2 h-4 w-4" />
                Create Character
              </>
            )}
          </Button>
          
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={creating}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}

