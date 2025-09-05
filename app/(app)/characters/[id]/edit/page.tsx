import { CharacterForm } from '@/features/characters/components/character-form'

interface EditCharacterPageProps {
  params: {
    id: string
  }
}

export default function EditCharacterPage({ params }: EditCharacterPageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Character</h1>
        <p className="text-muted-foreground">
          Update your character's details and abilities.
        </p>
      </div>
      <CharacterForm 
        onSuccess={() => {
          // Handle success - redirect or show message
        }}
        onCancel={() => {
          // Handle cancel - go back
        }}
      />
    </div>
  )
}

