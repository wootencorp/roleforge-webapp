'use client'

import { useState, useRef } from 'react'
import { 
  Upload, 
  Search, 
  Filter, 
  Grid, 
  List, 
  Eye, 
  EyeOff, 
  Share2, 
  Download, 
  Trash2,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  MoreHorizontal
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { Badge } from '@/shared/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { AssetUploadForm } from './asset-upload-form'
import { AssetViewer } from './asset-viewer'
import { useGameSession } from '../hooks/use-sessions'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { 
  ASSET_TYPES, 
  ASSET_TAGS, 
  VISIBILITY_OPTIONS,
  getAssetTypeInfo,
  formatFileSize,
  filterAssets,
  sortAssets,
  canUserAccessAsset,
  getAssetPreviewUrl,
  isImageAsset,
  isAudioAsset,
  isVideoAsset
} from '../lib/asset-utils'
import { LoadingSpinner } from '@/shared/components/common/loading-spinner'
import type { CampaignAsset, AssetFilters } from '../types'

interface CampaignAssetsProps {
  sessionId: string
}

export function CampaignAssets({ sessionId }: CampaignAssetsProps) {
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedAsset, setSelectedAsset] = useState<CampaignAsset | null>(null)
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)
  const [filters, setFilters] = useState<AssetFilters>({
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  })

  const { user } = useAuth()
  const { session, assets, activeAsset, setActiveAsset } = useGameSession(sessionId)

  const userRole = session?.participants.find(p => p.userId === user?.id)?.role || 'player'

  const filteredAssets = filterAssets(
    assets.filter(asset => canUserAccessAsset(asset, userRole, user?.id || '')),
    filters
  )

  const sortedAssets = sortAssets(
    filteredAssets,
    filters.sortBy,
    filters.sortOrder
  )

  const updateFilter = (key: keyof AssetFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    })
  }

  const handleAssetSelect = (asset: CampaignAsset) => {
    setSelectedAsset(asset)
  }

  const handleShareAsset = async (asset: CampaignAsset) => {
    try {
      await setActiveAsset(asset.id)
      // Send chat message about shared asset
      // await sendChatMessage(sessionId, {
      //   type: 'system',
      //   content: `${user?.first_name} shared: ${asset.name}`,
      //   metadata: { assetId: asset.id }
      // })
    } catch (error) {
      console.error('Failed to share asset:', error)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b p-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold">Campaign Assets</h3>
            <p className="text-xs text-muted-foreground">
              {sortedAssets.length} assets available
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
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
            
            {userRole === 'gm' && (
              <Button size="sm" onClick={() => setShowUploadForm(true)}>
                <Upload className="mr-1 h-3 w-3" />
                Upload
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search assets..."
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              value={filters.type || ''}
              onValueChange={(value) => updateFilter('type', value === 'all' ? undefined : value)}
            >
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {ASSET_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.icon} {type.label}
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
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt-desc">Newest First</SelectItem>
                <SelectItem value="createdAt-asc">Oldest First</SelectItem>
                <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                <SelectItem value="fileSize-desc">Largest First</SelectItem>
                <SelectItem value="fileSize-asc">Smallest First</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters */}
          {(filters.search || filters.type || filters.tags?.length) && (
            <div className="flex flex-wrap gap-2">
              {filters.search && (
                <Badge variant="secondary" className="cursor-pointer" onClick={() => updateFilter('search', '')}>
                  Search: "{filters.search}" ×
                </Badge>
              )}
              {filters.type && (
                <Badge variant="secondary" className="cursor-pointer" onClick={() => updateFilter('type', undefined)}>
                  {getAssetTypeInfo(filters.type).label} ×
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
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear All
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {showUploadForm ? (
          <AssetUploadForm
            sessionId={sessionId}
            onSuccess={() => setShowUploadForm(false)}
            onCancel={() => setShowUploadForm(false)}
          />
        ) : selectedAsset ? (
          <AssetViewer
            asset={selectedAsset}
            onClose={() => setSelectedAsset(null)}
            onShare={() => handleShareAsset(selectedAsset)}
            canShare={userRole === 'gm'}
          />
        ) : sortedAssets.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <Upload className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No assets found</h3>
            <p className="text-muted-foreground mb-4">
              {filters.search || filters.type
                ? 'Try adjusting your filters or search terms.'
                : 'Upload maps, handouts, and other campaign materials to get started.'}
            </p>
            {userRole === 'gm' && !filters.search && !filters.type && (
              <Button onClick={() => setShowUploadForm(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Upload First Asset
              </Button>
            )}
          </div>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
              : 'space-y-3'
          }>
            {sortedAssets.map((asset) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                viewMode={viewMode}
                isActive={activeAsset?.id === asset.id}
                isPlaying={playingAudio === asset.id}
                userRole={userRole}
                onSelect={() => handleAssetSelect(asset)}
                onShare={() => handleShareAsset(asset)}
                onPlayAudio={(playing) => setPlayingAudio(playing ? asset.id : null)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Active Asset Display */}
      {activeAsset && (
        <div className="border-t bg-blue-50 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center">
                <span className="text-sm">{getAssetTypeInfo(activeAsset.type).icon}</span>
              </div>
              <div>
                <p className="font-medium text-blue-900">{activeAsset.name}</p>
                <p className="text-xs text-blue-700">Currently shared with players</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveAsset(null)}
            >
              <EyeOff className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function AssetCard({
  asset,
  viewMode,
  isActive,
  isPlaying,
  userRole,
  onSelect,
  onShare,
  onPlayAudio
}: {
  asset: CampaignAsset
  viewMode: 'grid' | 'list'
  isActive: boolean
  isPlaying: boolean
  userRole: 'gm' | 'player'
  onSelect: () => void
  onShare: () => void
  onPlayAudio: (playing: boolean) => void
}) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const typeInfo = getAssetTypeInfo(asset.type)

  const handleAudioToggle = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
      onPlayAudio(false)
    } else {
      audioRef.current.play()
      onPlayAudio(true)
    }
  }

  if (viewMode === 'list') {
    return (
      <Card className={`transition-all hover:shadow-md cursor-pointer ${isActive ? 'ring-2 ring-primary' : ''}`}>
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0" onClick={onSelect}>
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                {isImageAsset(asset) ? (
                  <img
                    src={getAssetPreviewUrl(asset)}
                    alt={asset.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <span className="text-lg">{typeInfo.icon}</span>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate">{asset.name}</h4>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Badge variant="outline" className="text-xs">
                    {typeInfo.label}
                  </Badge>
                  <span>{formatFileSize(asset.fileSize)}</span>
                  {asset.metadata?.visibility && (
                    <Badge variant="outline" className="text-xs">
                      {VISIBILITY_OPTIONS.find(v => v.value === asset.metadata?.visibility)?.label}
                    </Badge>
                  )}
                </div>
                {asset.description && (
                  <p className="text-xs text-muted-foreground truncate mt-1">
                    {asset.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2 flex-shrink-0">
              {isAudioAsset(asset) && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleAudioToggle}
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <audio
                    ref={audioRef}
                    src={asset.fileUrl}
                    onEnded={() => onPlayAudio(false)}
                  />
                </>
              )}

              <AssetActions
                asset={asset}
                userRole={userRole}
                onSelect={onSelect}
                onShare={onShare}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card 
      className={`transition-all hover:shadow-lg cursor-pointer ${isActive ? 'ring-2 ring-primary' : ''}`}
      onClick={onSelect}
    >
      <CardContent className="p-3">
        {/* Asset Preview */}
        <div className="relative mb-3">
          {isImageAsset(asset) ? (
            <img
              src={getAssetPreviewUrl(asset)}
              alt={asset.name}
              className="w-full h-32 object-cover rounded-md"
            />
          ) : (
            <div className="w-full h-32 bg-muted rounded-md flex items-center justify-center">
              <span className="text-3xl">{typeInfo.icon}</span>
            </div>
          )}
          
          {/* Type Badge */}
          <Badge variant="secondary" className="absolute top-2 left-2 text-xs">
            {typeInfo.label}
          </Badge>

          {/* Actions */}
          <div className="absolute top-2 right-2">
            <AssetActions
              asset={asset}
              userRole={userRole}
              onSelect={onSelect}
              onShare={onShare}
            />
          </div>

          {/* Audio Controls */}
          {isAudioAsset(asset) && (
            <div className="absolute bottom-2 right-2">
              <Button
                variant="secondary"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation()
                  handleAudioToggle()
                }}
              >
                {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              </Button>
              <audio
                ref={audioRef}
                src={asset.fileUrl}
                onEnded={() => onPlayAudio(false)}
              />
            </div>
          )}
        </div>

        {/* Asset Info */}
        <div className="space-y-2">
          <h4 className="font-medium truncate">{asset.name}</h4>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{formatFileSize(asset.fileSize)}</span>
            {asset.metadata?.visibility && (
              <Badge variant="outline" className="text-xs">
                {VISIBILITY_OPTIONS.find(v => v.value === asset.metadata?.visibility)?.label}
              </Badge>
            )}
          </div>

          {asset.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {asset.description}
            </p>
          )}

          {/* Tags */}
          {asset.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {asset.tags.slice(0, 3).map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {asset.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{asset.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function AssetActions({
  asset,
  userRole,
  onSelect,
  onShare
}: {
  asset: CampaignAsset
  userRole: 'gm' | 'player'
  onSelect: () => void
  onShare: () => void
}) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenu.Trigger>
      
      <DropdownMenu.Portal>
        <DropdownMenu.Content 
          className="min-w-[160px] bg-white rounded-md border shadow-md p-1 z-50"
          align="end"
        >
          <DropdownMenu.Item 
            className="flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded-sm"
            onClick={(e) => {
              e.stopPropagation()
              onSelect()
            }}
          >
            <Eye className="mr-2 h-4 w-4" />
            View
          </DropdownMenu.Item>
          
          {userRole === 'gm' && (
            <DropdownMenu.Item 
              className="flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded-sm"
              onClick={(e) => {
                e.stopPropagation()
                onShare()
              }}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share with Players
            </DropdownMenu.Item>
          )}
          
          <DropdownMenu.Item 
            className="flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded-sm"
            onClick={(e) => {
              e.stopPropagation()
              window.open(asset.fileUrl, '_blank')
            }}
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

