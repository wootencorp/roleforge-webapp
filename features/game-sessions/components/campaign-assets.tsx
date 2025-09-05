'use client'

import { useState, useMemo } from 'react'
import { Upload, Plus, FolderOpen } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { useCampaignAssets } from '../hooks/use-sessions'
import { AssetCard } from './assets/asset-card'
import { AssetFilters } from './assets/asset-filters'
import { AssetUploadForm } from './asset-upload-form'
import { AssetViewer } from './asset-viewer'
import type { CampaignAsset } from '../types'

interface CampaignAssetsProps {
  sessionId: string
  campaignId: string
}

export function CampaignAssets({ sessionId, campaignId }: CampaignAssetsProps) {
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<CampaignAsset | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedVisibility, setSelectedVisibility] = useState<string[]>([])
  const [sortBy, setSortBy] = useState('date')

  const { user } = useAuth()
  const {
    assets,
    uploadAsset,
    deleteAsset,
    shareAsset,
    downloadAsset,
    loading
  } = useCampaignAssets(campaignId)

  const isGM = user?.role === 'gm'

  // Get available tags from all assets
  const availableTags = useMemo(() => {
    const tags = new Set<string>()
    assets.forEach(asset => {
      asset.tags.forEach(tag => tags.add(tag))
    })
    return Array.from(tags).sort()
  }, [assets])

  // Filter and sort assets
  const filteredAssets = useMemo(() => {
    let filtered = assets.filter(asset => {
      // Search filter
      if (searchTerm && !asset.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }

      // Type filter
      if (selectedTypes.length > 0 && !selectedTypes.includes(asset.type)) {
        return false
      }

      // Visibility filter
      if (selectedVisibility.length > 0 && !selectedVisibility.includes(asset.visibility)) {
        return false
      }

      // Tags filter
      if (selectedTags.length > 0 && !selectedTags.some(tag => asset.tags.includes(tag))) {
        return false
      }

      // Visibility permissions
      if (!isGM && asset.visibility === 'gm_only') {
        return false
      }

      return true
    })

    // Sort assets
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'size':
          return b.size - a.size
        case 'type':
          return a.type.localeCompare(b.type)
        case 'date':
        default:
          return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      }
    })

    return filtered
  }, [assets, searchTerm, selectedTypes, selectedTags, selectedVisibility, sortBy, isGM])

  const handleUploadSuccess = (asset: CampaignAsset) => {
    setShowUploadForm(false)
  }

  const handleDeleteAsset = async (assetId: string) => {
    if (confirm('Are you sure you want to delete this asset?')) {
      await deleteAsset(assetId)
    }
  }

  const handleViewAsset = (asset: CampaignAsset) => {
    setSelectedAsset(asset)
  }

  const handleDownloadAsset = async (asset: CampaignAsset) => {
    await downloadAsset(asset.id)
  }

  const handleShareAsset = async (asset: CampaignAsset) => {
    await shareAsset(asset.id)
  }

  const toggleFilter = (filterArray: string[], setFilter: (arr: string[]) => void, value: string) => {
    if (filterArray.includes(value)) {
      setFilter(filterArray.filter(item => item !== value))
    } else {
      setFilter([...filterArray, value])
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Campaign Assets</CardTitle>
            {isGM && (
              <Button onClick={() => setShowUploadForm(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Asset
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <AssetFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedTypes={selectedTypes}
            onTypeToggle={(type) => toggleFilter(selectedTypes, setSelectedTypes, type)}
            selectedTags={selectedTags}
            onTagToggle={(tag) => toggleFilter(selectedTags, setSelectedTags, tag)}
            selectedVisibility={selectedVisibility}
            onVisibilityToggle={(visibility) => toggleFilter(selectedVisibility, setSelectedVisibility, visibility)}
            sortBy={sortBy}
            onSortChange={setSortBy}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            availableTags={availableTags}
            totalAssets={assets.length}
            filteredAssets={filteredAssets.length}
          />

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading assets...</p>
              </div>
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">
                {assets.length === 0 ? 'No assets uploaded' : 'No assets match your filters'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {assets.length === 0 
                  ? 'Upload maps, handouts, and other campaign materials to share with your players.'
                  : 'Try adjusting your search terms or filters to find what you\'re looking for.'
                }
              </p>
              {isGM && assets.length === 0 && (
                <Button onClick={() => setShowUploadForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Upload First Asset
                </Button>
              )}
            </div>
          ) : (
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
                : 'space-y-2'
            }>
              {filteredAssets.map((asset) => (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  viewMode={viewMode}
                  canEdit={isGM}
                  onView={handleViewAsset}
                  onDownload={handleDownloadAsset}
                  onDelete={handleDeleteAsset}
                  onShare={handleShareAsset}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Form Modal */}
      {showUploadForm && (
        <AssetUploadForm
          campaignId={campaignId}
          onSuccess={handleUploadSuccess}
          onCancel={() => setShowUploadForm(false)}
        />
      )}

      {/* Asset Viewer Modal */}
      {selectedAsset && (
        <AssetViewer
          asset={selectedAsset}
          onClose={() => setSelectedAsset(null)}
          onDownload={() => handleDownloadAsset(selectedAsset)}
        />
      )}
    </div>
  )
}

