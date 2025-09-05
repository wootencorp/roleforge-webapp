import { CampaignDetails } from '@/features/campaigns/components/campaign-details'

interface CampaignPageProps {
  params: {
    id: string
  }
}

export default function CampaignPage({ params }: CampaignPageProps) {
  // Mock campaign data - in real app, fetch from API
  const mockCampaign = {
    id: params.id,
    name: 'The Lost Mines of Phandelver',
    description: 'A classic D&D adventure for new players',
    ruleset: 'dnd5e',
    difficulty: 'medium' as const,
    maxPlayers: 5,
    currentPlayers: 3,
    isPublic: true,
    isActive: true,
    tags: ['beginner-friendly', 'classic'],
    gmId: 'gm-1',
    gmName: 'Game Master',
    creatorId: 'gm-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  return (
    <div className="space-y-6">
      <CampaignDetails campaign={mockCampaign} />
    </div>
  )
}

