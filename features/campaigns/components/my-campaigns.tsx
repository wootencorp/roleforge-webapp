'use client'

import { useState } from 'react'
import { Plus, Search, Users, Calendar, Settings, Play } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { Badge } from '@/shared/components/ui/badge'
import { CampaignCard } from './campaign-card'
import { CampaignForm } from './campaign-form'
import { useMyCampaigns } from '../hooks/use-campaigns'
import { LoadingSpinner } from '@/shared/components/common/loading-spinner'
import { formatRelativeTime } from '@/shared/lib/utils'
import type { Campaign } from '@/shared/types'

interface MyCampaignsProps {
  onCampaignSelect?: (campaign: Campaign) => void
  onCampaignEdit?: (campaign: Campaign) => void
  onStartSession?: (campaign: Campaign) => void
  selectedCampaignId?: string
}

export function MyCampaigns({ 
  onCampaignSelect, 
  onCampaignEdit,
  onStartSession,
  selectedCampaignId 
}: MyCampaignsProps) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterBy, setFilterBy] = useState<'all' | 'gm' | 'player'>('all')
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'players'>('recent')

  const { myCampaigns, loading, deleteCampaign, leaveCampaign } = useMyCampaigns()

  const filteredCampaigns = myCampaigns
    .filter(campaign => {
      const matchesSearch = !searchTerm || 
        campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.description.toLowerCase().includes(searchTerm.toLowerCase())
      
      // Note: We'd need to add role information to the campaign object
      // For now, assuming creator is GM and others are players
      const matchesRole = filterBy === 'all' || 
        (filterBy === 'gm' && campaign.creatorId === campaign.creatorId) ||
        (filterBy === 'player' && campaign.creatorId !== campaign.creatorId)
      
      return matchesSearch && matchesRole
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'players':
          return b.currentPlayers - a.currentPlayers
        case 'recent':
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      }
    })

  const handleCreateSuccess = (campaignId: string) => {
    setShowCreateForm(false)
    const newCampaign = myCampaigns.find(c => c.id === campaignId)
    if (newCampaign && onCampaignSelect) {
      onCampaignSelect(newCampaign)
    }
  }

  const handleDeleteCampaign = async (campaign: Campaign) => {
    if (window.confirm(`Are you sure you want to delete "${campaign.name}"? This action cannot be undone.`)) {
      try {
        await deleteCampaign(campaign.id)
      } catch (error) {
        console.error('Failed to delete campaign:', error)
      }
    }
  }

  const handleLeaveCampaign = async (campaign: Campaign) => {
    if (window.confirm(`Are you sure you want to leave "${campaign.name}"?`)) {
      try {
        await leaveCampaign(campaign.id)
      } catch (error) {
        console.error('Failed to leave campaign:', error)
      }
    }
  }

  if (showCreateForm) {
    return (
      <div className="p-6">
        <CampaignForm
          onSuccess={handleCreateSuccess}
          onCancel={() => setShowCreateForm(false)}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Campaigns</h1>
          <p className="text-muted-foreground">
            Manage your campaigns and game sessions
          </p>
        </div>
        
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Campaign
        </Button>
      </div>

      {/* Quick Stats */}
      {!loading && myCampaigns.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-blue-900">
                {myCampaigns.filter(c => c.creatorId === c.creatorId).length}
              </span>
            </div>
            <p className="text-sm text-blue-700 mt-1">Campaigns as GM</p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Play className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-green-900">
                {myCampaigns.filter(c => c.isActive).length}
              </span>
            </div>
            <p className="text-sm text-green-700 mt-1">Active Campaigns</p>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              <span className="font-semibold text-purple-900">
                {myCampaigns.reduce((total, c) => total + c.currentPlayers, 0)}
              </span>
            </div>
            <p className="text-sm text-purple-700 mt-1">Total Players</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search your campaigns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={filterBy} onValueChange={(value: any) => setFilterBy(value)}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Campaigns</SelectItem>
            <SelectItem value="gm">As Game Master</SelectItem>
            <SelectItem value="player">As Player</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Recently Updated</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="players">Player Count</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Campaign Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            {myCampaigns.length === 0 ? 'No campaigns yet' : 'No campaigns found'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {myCampaigns.length === 0 
              ? 'Create your first campaign to start your adventure!'
              : 'Try adjusting your search or filters.'
            }
          </p>
          {myCampaigns.length === 0 && (
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Campaign
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCampaigns.map((campaign) => (
            <div key={campaign.id} className="relative">
              <CampaignCard
                campaign={campaign}
                isSelected={campaign.id === selectedCampaignId}
                onSelect={() => onCampaignSelect?.(campaign)}
                onEdit={() => onCampaignEdit?.(campaign)}
                onDelete={() => handleDeleteCampaign(campaign)}
                viewMode="grid"
              />
              
              {/* Quick Actions Overlay */}
              <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {campaign.creatorId === campaign.creatorId && onStartSession && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation()
                      onStartSession(campaign)
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <Play className="h-3 w-3" />
                  </Button>
                )}
                
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation()
                    onCampaignEdit?.(campaign)
                  }}
                  className="h-8 w-8 p-0"
                >
                  <Settings className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results Count */}
      {!loading && filteredCampaigns.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          Showing {filteredCampaigns.length} of {myCampaigns.length} campaigns
        </div>
      )}
    </div>
  )
}

