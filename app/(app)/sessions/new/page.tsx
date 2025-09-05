import { SessionForm } from '@/features/game-sessions/components/session-form'

export default function NewSessionPage() {
  // Mock campaign data - in real app, get from URL params or selection
  const mockCampaign = {
    id: '1',
    name: 'The Lost Mines of Phandelver',
    description: 'A classic D&D adventure',
    ruleset: 'dnd5e',
    difficulty: 'medium' as const,
    maxPlayers: 5,
    currentPlayers: 3,
    isPublic: true,
    isActive: true,
    tags: ['beginner-friendly'],
    gmId: 'gm-1',
    gmName: 'Game Master',
    creatorId: 'gm-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Session</h1>
        <p className="text-muted-foreground">
          Schedule a new game session for your campaign.
        </p>
      </div>
      <SessionForm 
        campaign={mockCampaign}
        onSuccess={() => {
          // Handle success
        }}
        onCancel={() => {
          // Handle cancel
        }}
      />
    </div>
  )
}

