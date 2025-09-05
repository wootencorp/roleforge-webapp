'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  X, 
  Download, 
  Share2, 
  Maximize2, 
  Minimize2, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  SkipBack,
  SkipForward,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Eye,
  EyeOff
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Slider } from '@/shared/components/ui/slider'
import { 
  getAssetTypeInfo, 
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
  onShare?: () => void
  canShare?: boolean
}

export function AssetViewer({ asset, onClose, onShare, canShare = false }: AssetViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [zoom, setZoom] = useState(1)
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const typeInfo = getAssetTypeInfo(asset.type)

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false)
        } else {
          onClose()
        }
      } else if (e.key === ' ' && (isAudioAsset(asset) || isVideoAsset(asset))) {
        e.preventDefault()
        togglePlayPause()
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [isFullscreen, asset, onClose])

  const togglePlayPause = () => {
    if (!mediaRef.current) return

    if (isPlaying) {
      mediaRef.current.pause()
    } else {
      mediaRef.current.play()
    }
  }

  const handleTimeUpdate = () => {
    if (mediaRef.current) {
      setCurrentTime(mediaRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (mediaRef.current) {
      setDuration(mediaRef.current.duration)
    }
  }

  const handleSeek = (value: number[]) => {
    if (mediaRef.current) {
      mediaRef.current.currentTime = value[0]
      setCurrentTime(value[0])
    }
  }

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)
    if (mediaRef.current) {
      mediaRef.current.volume = newVolume
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handleImageMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return
    
    setIsDragging(true)
    setDragStart({
      x: e.clientX - imagePosition.x,
      y: e.clientY - imagePosition.y
    })
  }

  const handleImageMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoom <= 1) return

    setImagePosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    })
  }

  const handleImageMouseUp = () => {
    setIsDragging(false)
  }

  const resetImageView = () => {
    setZoom(1)
    setImagePosition({ x: 0, y: 0 })
  }

  const zoomIn = () => {
    setZoom(prev => Math.min(prev * 1.5, 5))
  }

  const zoomOut = () => {
    setZoom(prev => Math.max(prev / 1.5, 0.5))
  }

  const downloadAsset = () => {
    const link = document.createElement('a')
    link.href = asset.fileUrl
    link.download = asset.name
    link.click()
  }

  const visibilityOption = VISIBILITY_OPTIONS.find(v => v.value === asset.metadata?.visibility)

  return (
    <div className={`fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 ${
      isFullscreen ? 'bg-black' : ''
    }`}>
      <div className={`bg-background rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col ${
        isFullscreen ? 'max-w-none max-h-none h-full rounded-none' : ''
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
              <span className="text-sm">{typeInfo.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold truncate">{asset.name}</h2>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Badge variant="outline">{typeInfo.label}</Badge>
                <span>{formatFileSize(asset.fileSize)}</span>
                {visibilityOption && (
                  <Badge variant="outline">{visibilityOption.label}</Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Media Controls */}
            {(isAudioAsset(asset) || isVideoAsset(asset)) && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={togglePlayPause}
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMuted(!isMuted)}
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
              </>
            )}

            {/* Image Controls */}
            {isImageAsset(asset) && (
              <>
                <Button variant="ghost" size="icon" onClick={zoomOut}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={zoomIn}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={resetImageView}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </>
            )}

            {/* Share Button */}
            {canShare && onShare && (
              <Button variant="outline" size="sm" onClick={onShare}>
                <Share2 className="mr-1 h-3 w-3" />
                Share
              </Button>
            )}

            {/* Download Button */}
            <Button variant="outline" size="sm" onClick={downloadAsset}>
              <Download className="mr-1 h-3 w-3" />
              Download
            </Button>

            {/* Fullscreen Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>

            {/* Close Button */}
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {isImageAsset(asset) && (
            <div 
              ref={containerRef}
              className="w-full h-full flex items-center justify-center bg-muted/20 overflow-hidden cursor-move"
              onMouseDown={handleImageMouseDown}
              onMouseMove={handleImageMouseMove}
              onMouseUp={handleImageMouseUp}
              onMouseLeave={handleImageMouseUp}
            >
              <img
                ref={imageRef}
                src={asset.fileUrl}
                alt={asset.name}
                className="max-w-full max-h-full object-contain transition-transform"
                style={{
                  transform: `scale(${zoom}) translate(${imagePosition.x / zoom}px, ${imagePosition.y / zoom}px)`,
                  cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
                }}
                draggable={false}
              />
            </div>
          )}

          {isVideoAsset(asset) && (
            <div className="w-full h-full flex items-center justify-center bg-black">
              <video
                ref={mediaRef as React.RefObject<HTMLVideoElement>}
                src={asset.fileUrl}
                className="max-w-full max-h-full"
                controls={false}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                muted={isMuted}
              />
            </div>
          )}

          {isAudioAsset(asset) && (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
              <div className="text-center space-y-4">
                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <Volume2 className="h-16 w-16 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{asset.name}</h3>
                  <p className="text-muted-foreground">Audio File</p>
                </div>
                <audio
                  ref={mediaRef as React.RefObject<HTMLAudioElement>}
                  src={asset.fileUrl}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  muted={isMuted}
                />
              </div>
            </div>
          )}

          {isDocumentAsset(asset) && (
            <div className="w-full h-full">
              {asset.mimeType === 'application/pdf' ? (
                <iframe
                  src={asset.fileUrl}
                  className="w-full h-full border-0"
                  title={asset.name}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="w-24 h-24 mx-auto bg-muted rounded-lg flex items-center justify-center">
                      <span className="text-3xl">{typeInfo.icon}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{asset.name}</h3>
                      <p className="text-muted-foreground">
                        {asset.mimeType === 'text/plain' ? 'Text Document' : 'Document'}
                      </p>
                    </div>
                    <Button onClick={downloadAsset}>
                      <Download className="mr-2 h-4 w-4" />
                      Download to View
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {asset.type === 'other' && (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-24 h-24 mx-auto bg-muted rounded-lg flex items-center justify-center">
                  <span className="text-3xl">{typeInfo.icon}</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{asset.name}</h3>
                  <p className="text-muted-foreground">
                    {asset.mimeType || 'Unknown file type'}
                  </p>
                </div>
                <Button onClick={downloadAsset}>
                  <Download className="mr-2 h-4 w-4" />
                  Download File
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Media Controls Footer */}
        {(isAudioAsset(asset) || isVideoAsset(asset)) && duration > 0 && (
          <div className="border-t p-4 space-y-3">
            {/* Progress Bar */}
            <div className="space-y-2">
              <Slider
                value={[currentTime]}
                max={duration}
                step={1}
                onValueChange={handleSeek}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" onClick={togglePlayPause}>
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (mediaRef.current) {
                      mediaRef.current.currentTime = Math.max(0, currentTime - 10)
                    }
                  }}
                >
                  <SkipBack className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (mediaRef.current) {
                      mediaRef.current.currentTime = Math.min(duration, currentTime + 10)
                    }
                  }}
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
              </div>

              {/* Volume Control */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMuted(!isMuted)}
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <div className="w-20">
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    max={1}
                    step={0.1}
                    onValueChange={handleVolumeChange}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Asset Info Footer */}
        <div className="border-t p-4 bg-muted/20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-sm text-muted-foreground">
                {asset.description || 'No description provided'}
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Details</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div>Uploaded: {formatRelativeTime(asset.createdAt)}</div>
                <div>Size: {formatFileSize(asset.fileSize)}</div>
                {asset.metadata?.dimensions && (
                  <div>
                    Dimensions: {asset.metadata.dimensions.width} × {asset.metadata.dimensions.height}
                  </div>
                )}
                {asset.metadata?.duration && (
                  <div>Duration: {formatTime(asset.metadata.duration)}</div>
                )}
              </div>
            </div>
          </div>

          {/* Tags */}
          {asset.tags.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Tags</h4>
              <div className="flex flex-wrap gap-1">
                {asset.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

