import { CampaignDetails } from '@/features/campaigns/components/campaign-details'

interface CampaignPageProps {
  params: {
    id: string
  }
}

export default function CampaignPage({ params }: CampaignPageProps) {
  return (
    <div className="space-y-6">
      <CampaignDetails campaignId={params.id} />
    </div>
  )
}

