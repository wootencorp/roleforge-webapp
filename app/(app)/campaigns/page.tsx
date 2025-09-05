import { CampaignBrowser } from '@/features/campaigns/components/campaign-browser'
import { MyCampaigns } from '@/features/campaigns/components/my-campaigns'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'

export default function CampaignsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
        <p className="text-muted-foreground">
          Discover new campaigns to join or manage your existing ones.
        </p>
      </div>
      
      <Tabs defaultValue="my-campaigns" className="space-y-4">
        <TabsList>
          <TabsTrigger value="my-campaigns">My Campaigns</TabsTrigger>
          <TabsTrigger value="browse">Browse Campaigns</TabsTrigger>
        </TabsList>
        
        <TabsContent value="my-campaigns" className="space-y-4">
          <MyCampaigns />
        </TabsContent>
        
        <TabsContent value="browse" className="space-y-4">
          <CampaignBrowser />
        </TabsContent>
      </Tabs>
    </div>
  )
}

