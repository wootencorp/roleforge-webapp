import { CampaignForm } from '@/features/campaigns/components/campaign-form'

export default function NewCampaignPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Campaign</h1>
        <p className="text-muted-foreground">
          Set up a new campaign and invite players to join your adventure.
        </p>
      </div>
      <CampaignForm />
    </div>
  )
}

