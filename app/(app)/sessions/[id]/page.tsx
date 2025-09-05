import { GameSessionInterface } from '@/features/game-sessions/components/game-session-interface'

interface SessionPageProps {
  params: {
    id: string
  }
}

export default function SessionPage({ params }: SessionPageProps) {
  return (
    <div className="h-full">
      <GameSessionInterface sessionId={params.id} />
    </div>
  )
}

