import { useEffect } from 'react'
import { useCampaignsStore } from '../stores/campaigns-store'
import { useAuth } from '@/features/auth/hooks/use-auth'
import type { CampaignFilters } from '../types'

export function useCampaigns(filters?: CampaignFilters) {
  const store = useCampaignsStore()
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated && user) {
      store.fetchCampaigns(filters)
    }
  }, [isAuthenticated, user, store, filters])

  return {
    campaigns: store.campaigns,
    loading: store.loading,
    creating: store.creating,
    updating: store.updating,
    joining: store.joining,
    fetchCampaigns: store.fetchCampaigns,
    createCampaign: store.createCampaign,
    updateCampaign: store.updateCampaign,
    deleteCampaign: store.deleteCampaign,
    joinCampaign: store.joinCampaign,
    leaveCampaign: store.leaveCampaign,
    selectCampaign: store.selectCampaign,
  }
}

export function useMyCampaigns() {
  const store = useCampaignsStore()
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated && user) {
      store.fetchMyCampaigns()
    }
  }, [isAuthenticated, user, store])

  return {
    myCampaigns: store.myCampaigns,
    loading: store.loading,
    creating: store.creating,
    updating: store.updating,
    fetchMyCampaigns: store.fetchMyCampaigns,
    createCampaign: store.createCampaign,
    updateCampaign: store.updateCampaign,
    deleteCampaign: store.deleteCampaign,
    leaveCampaign: store.leaveCampaign,
    selectCampaign: store.selectCampaign,
  }
}

export function useCampaign(campaignId?: string) {
  const { campaigns, selectCampaign } = useCampaigns()
  const store = useCampaignsStore()

  useEffect(() => {
    if (campaignId) {
      const campaign = campaigns.find(c => c.id === campaignId)
      if (campaign) {
        selectCampaign(campaign)
      }
    }
  }, [campaignId, campaigns, selectCampaign])

  return {
    campaign: campaignId 
      ? campaigns.find(c => c.id === campaignId) || null
      : store.selectedCampaign,
    selectCampaign,
  }
}

