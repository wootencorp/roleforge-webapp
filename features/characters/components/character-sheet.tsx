'use client'

import { useEffect } from 'react'
import { useCharacters } from '../hooks/use-characters'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { LoadingSpinner } from '@/shared/components/common/loading-spinner'
import { Edit, Trash2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface CharacterSheetProps {
  characterId: string
}

export function CharacterSheet({ characterId }: CharacterSheetProps) {
  const { characters, loading, error, fetchCharacters, deleteCharacter } = useCharacters()
  const router = useRouter()

  useEffect(() => {
    if (characters.length === 0) {
      fetchCharacters()
    }
  }, [characters.length, fetchCharacters])

  const character = characters.find(c => c.id === characterId)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">{error}</p>
        <Button variant="outline" onClick={() => fetchCharacters()} className="mt-4">
          Try Again
        </Button>
      </div>
    )
  }

  if (!character) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Character not found</p>
        <Link href="/app/characters">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Characters
          </Button>
        </Link>
      </div>
    )
  }

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this character? This action cannot be undone.')) {
      await deleteCharacter(character.id)
      router.push('/app/characters')
    }
  }

  const getModifier = (score: number) => {
    return Math.floor((score - 10) / 2)
  }

  const formatModifier = (modifier: number) => {
    return modifier >= 0 ? `+${modifier}` : `${modifier}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/app/characters">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{character.name}</h1>
            <p className="text-muted-foreground">
              Level {character.level} {character.race} {character.class}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Link href={`/app/characters/${character.id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Character Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Background</label>
              <p className="text-sm text-muted-foreground">{character.background}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Alignment</label>
              <p className="text-sm text-muted-foreground">{character.alignment}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Experience Points</label>
              <p className="text-sm text-muted-foreground">{character.experiencePoints}</p>
            </div>
          </CardContent>
        </Card>

        {/* Ability Scores */}
        <Card>
          <CardHeader>
            <CardTitle>Ability Scores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(character.abilityScores).map(([ability, score]) => (
                <div key={ability} className="text-center">
                  <div className="text-xs font-medium uppercase text-muted-foreground">
                    {ability}
                  </div>
                  <div className="text-2xl font-bold">{score}</div>
                  <div className="text-sm text-muted-foreground">
                    {formatModifier(getModifier(score))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Combat Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Combat Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Hit Points</span>
              <span className="text-sm">{character.hitPoints}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Armor Class</span>
              <span className="text-sm">{character.armorClass}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Initiative</span>
              <span className="text-sm">
                {formatModifier(getModifier(character.abilityScores.dexterity))}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Speed</span>
              <span className="text-sm">30 ft</span>
            </div>
          </CardContent>
        </Card>

        {/* Skills */}
        <Card>
          <CardHeader>
            <CardTitle>Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {character.skills.map((skill) => (
                <Badge key={skill} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Equipment */}
        <Card>
          <CardHeader>
            <CardTitle>Equipment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {character.equipment.map((item, index) => (
                <div key={index} className="text-sm">
                  {item}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {character.notes || 'No notes available.'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

