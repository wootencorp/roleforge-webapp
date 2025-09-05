import { SessionForm } from '@/features/game-sessions/components/session-form'

export default function NewSessionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Session</h1>
        <p className="text-muted-foreground">
          Schedule a new game session for your campaign.
        </p>
      </div>
      <SessionForm />
    </div>
  )
}

