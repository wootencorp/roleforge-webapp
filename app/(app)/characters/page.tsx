import { CharacterList } from '@/features/characters/components/character-list'

export default function CharactersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Characters</h1>
          <p className="text-muted-foreground">
            Manage your characters and create new ones for your adventures.
          </p>
        </div>
      </div>
      <CharacterList />
    </div>
  )
}

