'use client'

import { useState, useEffect } from 'react'
import { X, Download, Share2, Calendar, User, Tag } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Dialog, DialogContent } from '@/shared/components/ui/dialog'
import { ImageViewer } from './viewer/image-viewer'
import { MediaPlayer } from './viewer/media-player'
import { DocumentViewer } from './viewer/document-viewer'
import { 
  formatFileSize, 
  isImageAsset, 
  isAudioAsset, 
  isVideoAsset, 
  isDocumentAsset,
  VISIBILITY_OPTIONS
} from '../lib/asset-utils'
import { formatRelativeTime } from '@/shared/lib/utils'
import type { CampaignAsset } from '../types'

interface AssetViewerProps {
  asset: CampaignAsset
  onClose: () => void
  onDownload?: () => void
  onShare?: () => void
  canShare?: boolean
}

export function AssetViewer({ 
  asset, 
  onClose, 
  onDownload, 
  onShare, 
  canShare = false 
}: AssetViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          if (isFullscreen) {
            setIsFullscreen(false)
          } else {
            onClose()
          }
          break
        case 'f':
        case 'F':
          if (isImageAsset(asset) || isVideoAsset(asset)) {
            setIsFullscreen(!isFullscreen)
          }
          break
        case 'd':
        case 'D':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            onDownload?.()
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [asset, isFullscreen, onClose, onDownload])

  const getVisibilityLabel = () => {
    const option = VISIBILITY_OPTIONS.find(opt => opt.value === asset.visibility)
    return option?.label || asset.visibility
  }

  const renderAssetContent = () => {
    if (isImageAsset(asset)) {
      return (
        <ImageViewer
          src={asset.url}
          alt={asset.name}
          onFullscreenToggle={() => setIsFullscreen(!isFullscreen)}
          isFullscreen={isFullscreen}
        />
      )
    }

    if (isAudioAsset(asset) || isVideoAsset(asset)) {
      return (
        <MediaPlayer
          src={asset.url}
          type={isVideoAsset(asset) ? 'video' : 'audio'}
          onFullscreenToggle={isVideoAsset(asset) ? () => setIsFullscreen(!isFullscreen) : undefined}
          isFullscreen={isFullscreen}
        />
      )
    }

    if (isDocumentAsset(asset)) {
      return (
        <DocumentViewer
          src={asset.url}
          fileName={asset.name}
          fileType={asset.type}
          onDownload={onDownload}
        />
      )
    }

    // Fallback for unknown asset types
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted/20">
        <div className="text-center">
          <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📄</span>
          </div>
          <h3 className="text-lg font-medium mb-2">Preview Not Available</h3>
          <p className="text-muted-foreground mb-4">
            This file type cannot be previewed in the browser.
          </p>
          <Button onClick={onDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download File
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent 
        className={`${
          isFullscreen 
            ? 'max-w-full max-h-full w-screen h-screen p-0' 
            : 'max-w-6xl max-h-[90vh] w-[90vw]'
        } overflow-hidden`}
      >
        {/* Header */}
        {!isFullscreen && (
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold truncate">{asset.name}</h2>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span>{formatFileSize(asset.size)}</span>
                  <span className="capitalize">{asset.type}</span>
                  <Badge variant="outline">{getVisibilityLabel()}</Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {onDownload && (
                <Button variant="outline" size="sm" onClick={onDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              )}

              {canShare && onShare && (
                <Button variant="outline" size="sm" onClick={onShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              )}

              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className={`${isFullscreen ? 'h-full' : 'h-[60vh]'} relative`}>
          {renderAssetContent()}

          {/* Fullscreen close button */}
          {isFullscreen && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="absolute top-4 right-4 bg-black/50 text-white hover:bg-black/70"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Asset Details */}
        {!isFullscreen && (
          <div className="p-4 border-t bg-muted/20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Description */}
              {asset.description && (
                <div>
                  <h4 className="font-medium mb-1">Description</h4>
                  <p className="text-sm text-muted-foreground">{asset.description}</p>
                </div>
              )}

              {/* Tags */}
              {asset.tags.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center">
                    <Tag className="h-4 w-4 mr-1" />
                    Tags
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {asset.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Info */}
              <div>
                <h4 className="font-medium mb-2 flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Upload Info
                </h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Uploaded {formatRelativeTime(asset.uploadedAt)}</p>
                  {asset.uploadedBy && (
                    <p className="flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      by {asset.uploadedBy}
                    </p>
                  )}
                </div>
              </div>

              {/* Metadata */}
              {asset.metadata && Object.keys(asset.metadata).length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Details</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    {asset.metadata.dimensions && (
                      <p>Dimensions: {asset.metadata.dimensions.width} × {asset.metadata.dimensions.height}</p>
                    )}
                    {asset.metadata.duration && (
                      <p>Duration: {Math.round(asset.metadata.duration)}s</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Keyboard shortcuts hint */}
        {!isFullscreen && (
          <div className="px-4 pb-2">
            <p className="text-xs text-muted-foreground">
              Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Esc</kbd> to close
              {(isImageAsset(asset) || isVideoAsset(asset)) && (
                <>, <kbd className="px-1 py-0.5 bg-muted rounded text-xs">F</kbd> for fullscreen</>
              )}
              {onDownload && (
                <>, <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl+D</kbd> to download</>
              )}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

