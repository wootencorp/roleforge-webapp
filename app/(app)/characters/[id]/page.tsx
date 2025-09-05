import { CharacterSheet } from '@/features/characters/components/character-sheet'

interface CharacterPageProps {
  params: {
    id: string
  }
}

export default function CharacterPage({ params }: CharacterPageProps) {
  return (
    <div className="space-y-6">
      <CharacterSheet characterId={params.id} />
    </div>
  )
}

