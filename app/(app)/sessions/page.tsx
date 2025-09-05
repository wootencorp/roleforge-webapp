import { SessionList } from '@/features/game-sessions/components/session-list'

export default function SessionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Game Sessions</h1>
        <p className="text-muted-foreground">
          View your upcoming sessions and join active games.
        </p>
      </div>
      <SessionList />
    </div>
  )
}

