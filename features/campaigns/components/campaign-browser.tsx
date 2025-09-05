'use client'

import { useState, useMemo } from 'react'
import { Plus, Search, Filter, Grid, List, Users, Globe, Lock } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { Badge } from '@/shared/components/ui/badge'
import { CampaignCard } from './campaign-card'
import { CampaignForm } from './campaign-form'
import { useCampaigns } from '../hooks/use-campaigns'
import { RULESETS, CAMPAIGN_TAGS, DIFFICULTY_INFO } from '../lib/rulesets'
import { LoadingSpinner } from '@/shared/components/common/loading-spinner'
import type { Campaign } from '@/shared/types'
import type { CampaignFilters } from '../types'

interface CampaignBrowserProps {
  onCampaignSelect?: (campaign: Campaign) => void
  onCampaignJoin?: (campaign: Campaign) => void
  selectedCampaignId?: string
  showCreateButton?: boolean
}

export function CampaignBrowser({ 
  onCampaignSelect, 
  onCampaignJoin,
  selectedCampaignId,
  showCreateButton = true
}: CampaignBrowserProps) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filters, setFilters] = useState<CampaignFilters>({
    search: '',
    isPublic: true,
    hasOpenSlots: false,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  })

  const { campaigns, loading, joinCampaign, joining } = useCampaigns(filters)

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(campaign => {
      const matchesSearch = !filters.search || 
        campaign.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        campaign.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        campaign.ruleset.toLowerCase().includes(filters.search.toLowerCase())
      
      const matchesRuleset = !filters.ruleset || campaign.ruleset === filters.ruleset
      const matchesDifficulty = !filters.difficulty || campaign.difficulty === filters.difficulty
      const matchesTags = !filters.tags || filters.tags.length === 0 ||
        filters.tags.some(tag => campaign.tags.includes(tag))
      const matchesOpenSlots = !filters.hasOpenSlots || 
        campaign.currentPlayers < campaign.maxPlayers

      return matchesSearch && matchesRuleset && matchesDifficulty && matchesTags && matchesOpenSlots
    })
  }, [campaigns, filters])

  const handleCreateSuccess = (campaignId: string) => {
    setShowCreateForm(false)
    const newCampaign = campaigns.find(c => c.id === campaignId)
    if (newCampaign && onCampaignSelect) {
      onCampaignSelect(newCampaign)
    }
  }

  const handleJoinCampaign = async (campaign: Campaign) => {
    try {
      await joinCampaign(campaign.id)
      if (onCampaignJoin) {
        onCampaignJoin(campaign)
      }
    } catch (error) {
      console.error('Failed to join campaign:', error)
    }
  }

  const updateFilter = (key: keyof CampaignFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      isPublic: true,
      hasOpenSlots: false,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    })
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
          <h1 className="text-2xl font-bold tracking-tight">Browse Campaigns</h1>
          <p className="text-muted-foreground">
            Discover and join exciting tabletop adventures
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          
          {showCreateButton && (
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Campaign
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search campaigns..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="pl-10"
            />
          </div>

          <Select
            value={filters.ruleset || ''}
            onValueChange={(value) => updateFilter('ruleset', value === 'all' ? undefined : value)}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by ruleset" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Rulesets</SelectItem>
              {RULESETS.map((ruleset) => (
                <SelectItem key={ruleset.name} value={ruleset.name}>
                  {ruleset.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.difficulty || ''}
            onValueChange={(value) => updateFilter('difficulty', value === 'all' ? undefined : value)}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Difficulties</SelectItem>
              {Object.entries(DIFFICULTY_INFO).map(([key, info]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center space-x-2">
                    <span className={`w-2 h-2 rounded-full ${info.bgColor}`} />
                    <span>{info.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onValueChange={(value) => {
              const [sortBy, sortOrder] = value.split('-') as [any, 'asc' | 'desc']
              setFilters(prev => ({ ...prev, sortBy, sortOrder }))
            }}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Name (A-Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z-A)</SelectItem>
              <SelectItem value="createdAt-desc">Newest First</SelectItem>
              <SelectItem value="createdAt-asc">Oldest First</SelectItem>
              <SelectItem value="currentPlayers-desc">Most Players</SelectItem>
              <SelectItem value="currentPlayers-asc">Fewest Players</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filter Options */}
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.hasOpenSlots}
              onChange={(e) => updateFilter('hasOpenSlots', e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm">Has open slots</span>
          </label>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Visibility:</span>
            <Button
              variant={filters.isPublic === true ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateFilter('isPublic', true)}
            >
              <Globe className="mr-1 h-3 w-3" />
              Public
            </Button>
            <Button
              variant={filters.isPublic === false ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateFilter('isPublic', false)}
            >
              <Lock className="mr-1 h-3 w-3" />
              Private
            </Button>
          </div>

          {(filters.search || filters.ruleset || filters.difficulty || filters.hasOpenSlots) && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>

        {/* Active Filters */}
        {(filters.ruleset || filters.difficulty || filters.tags?.length) && (
          <div className="flex flex-wrap gap-2">
            {filters.ruleset && (
              <Badge variant="secondary" className="cursor-pointer" onClick={() => updateFilter('ruleset', undefined)}>
                {filters.ruleset} ×
              </Badge>
            )}
            {filters.difficulty && (
              <Badge variant="secondary" className="cursor-pointer" onClick={() => updateFilter('difficulty', undefined)}>
                {DIFFICULTY_INFO[filters.difficulty].label} ×
              </Badge>
            )}
            {filters.tags?.map(tag => (
              <Badge 
                key={tag} 
                variant="secondary" 
                className="cursor-pointer"
                onClick={() => updateFilter('tags', filters.tags?.filter(t => t !== tag))}
              >
                {tag} ×
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Campaign Grid/List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No campaigns found</h3>
          <p className="text-muted-foreground mb-4">
            {filters.search || filters.ruleset || filters.difficulty
              ? 'Try adjusting your filters or search terms.'
              : 'Be the first to create a campaign!'}
          </p>
          {showCreateButton && !filters.search && !filters.ruleset && !filters.difficulty && (
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Campaign
            </Button>
          )}
        </div>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
        }>
          {filteredCampaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              isSelected={campaign.id === selectedCampaignId}
              onSelect={() => onCampaignSelect?.(campaign)}
              onJoin={() => handleJoinCampaign(campaign)}
              viewMode={viewMode}
              joining={joining}
            />
          ))}
        </div>
      )}

      {/* Results Count */}
      {!loading && filteredCampaigns.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          Showing {filteredCampaigns.length} of {campaigns.length} campaigns
        </div>
      )}
    </div>
  )
}

