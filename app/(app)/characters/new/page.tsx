import { CharacterForm } from '@/features/characters/components/character-form'

export default function NewCharacterPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Character</h1>
        <p className="text-muted-foreground">
          Create a new character for your adventures. You can use AI assistance or create manually.
        </p>
      </div>
      <CharacterForm />
    </div>
  )
}

