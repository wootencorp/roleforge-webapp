'use client'

import { useState } from 'react'
import { 
  Eye, 
  Download, 
  Trash2, 
  Share2, 
  MoreHorizontal,
  Image,
  FileText,
  Music,
  Video,
  File
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Card, CardContent } from '@/shared/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { formatFileSize, getFileTypeIcon } from '../../lib/asset-utils'
import type { CampaignAsset } from '../../types'

interface AssetCardProps {
  asset: CampaignAsset
  viewMode: 'grid' | 'list'
  canEdit: boolean
  onView: (asset: CampaignAsset) => void
  onDownload: (asset: CampaignAsset) => void
  onDelete: (assetId: string) => void
  onShare: (asset: CampaignAsset) => void
}

export function AssetCard({
  asset,
  viewMode,
  canEdit,
  onView,
  onDownload,
  onDelete,
  onShare
}: AssetCardProps) {
  const [imageError, setImageError] = useState(false)

  const getTypeIcon = () => {
    switch (asset.type) {
      case 'image':
        return <Image className="h-4 w-4" />
      case 'audio':
        return <Music className="h-4 w-4" />
      case 'video':
        return <Video className="h-4 w-4" />
      case 'document':
        return <FileText className="h-4 w-4" />
      default:
        return <File className="h-4 w-4" />
    }
  }

  const getVisibilityBadge = () => {
    switch (asset.visibility) {
      case 'gm_only':
        return <Badge variant="secondary" className="text-xs">GM Only</Badge>
      case 'players':
        return <Badge variant="outline" className="text-xs">Players</Badge>
      case 'everyone':
        return <Badge variant="default" className="text-xs">Everyone</Badge>
      default:
        return null
    }
  }

  if (viewMode === 'list') {
    return (
      <div className="flex items-center space-x-4 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
        <div className="flex-shrink-0">
          {asset.type === 'image' && asset.thumbnailUrl && !imageError ? (
            <img
              src={asset.thumbnailUrl}
              alt={asset.name}
              className="w-12 h-12 object-cover rounded"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
              {getTypeIcon()}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h4 className="font-medium truncate">{asset.name}</h4>
            {getVisibilityBadge()}
          </div>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span>{formatFileSize(asset.size)}</span>
            <span>{asset.type}</span>
            {asset.tags.length > 0 && (
              <div className="flex space-x-1">
                {asset.tags.slice(0, 2).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {asset.tags.length > 2 && (
                  <span className="text-xs">+{asset.tags.length - 2}</span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(asset)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onDownload(asset)}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onShare(asset)}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </DropdownMenuItem>
              {canEdit && (
                <DropdownMenuItem 
                  onClick={() => onDelete(asset.id)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    )
  }

  return (
    <Card className="group hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-4">
        <div className="aspect-square mb-3 relative overflow-hidden rounded-lg bg-muted">
          {asset.type === 'image' && asset.thumbnailUrl && !imageError ? (
            <img
              src={asset.thumbnailUrl}
              alt={asset.name}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {getTypeIcon()}
            </div>
          )}
          
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onView(asset)}
            >
              <Eye className="h-4 w-4 mr-2" />
              View
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h4 className="font-medium text-sm truncate pr-2">{asset.name}</h4>
            {getVisibilityBadge()}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{formatFileSize(asset.size)}</span>
            <span className="capitalize">{asset.type}</span>
          </div>

          {asset.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {asset.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
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

          <div className="flex items-center space-x-1 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDownload(asset)}
              className="flex-1"
            >
              <Download className="h-3 w-3 mr-1" />
              Download
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onShare(asset)}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </DropdownMenuItem>
                {canEdit && (
                  <DropdownMenuItem 
                    onClick={() => onDelete(asset.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

