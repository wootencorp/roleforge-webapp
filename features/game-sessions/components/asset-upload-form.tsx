'use client'

import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Upload, X, File, Image, Music, Video, FileText, Plus } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { Badge } from '@/shared/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { useGameSession } from '../hooks/use-sessions'
import { 
  ASSET_TYPES, 
  ASSET_TAGS, 
  VISIBILITY_OPTIONS,
  validateFile,
  getAssetTypeFromMimeType,
  formatFileSize,
  generateThumbnail,
  getImageDimensions,
  getAudioDuration,
  getVideoDuration
} from '../lib/asset-utils'
import { assetUploadSchema, type AssetUploadForm } from '@/shared/lib/validations'
import { getErrorMessage } from '@/shared/lib/utils'
import type { AssetUploadData } from '../types'

interface AssetUploadFormProps {
  sessionId: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function AssetUploadForm({ sessionId, onSuccess, onCancel }: AssetUploadFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { uploadAsset } = useGameSession(sessionId)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<AssetUploadForm>({
    resolver: zodResolver(assetUploadSchema),
    defaultValues: {
      isPublic: true,
      visibility: 'all',
    },
  })

  const selectedType = watch('type')
  const visibility = watch('visibility')

  const handleFileSelect = async (file: File) => {
    const validation = validateFile(file)
    if (!validation.isValid) {
      setError(validation.error || 'Invalid file')
      return
    }

    setSelectedFile(file)
    setError('')

    // Auto-detect type
    const detectedType = getAssetTypeFromMimeType(file.type)
    setValue('type', detectedType)

    // Auto-fill name if empty
    const currentName = watch('name')
    if (!currentName) {
      const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, '')
      setValue('name', nameWithoutExtension)
    }

    // Generate preview for images
    if (file.type.startsWith('image/')) {
      const previewUrl = URL.createObjectURL(file)
      setPreview(previewUrl)
    } else {
      setPreview(null)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const addTag = (tag: string) => {
    if (!selectedTags.includes(tag) && selectedTags.length < 10) {
      const newTags = [...selectedTags, tag]
      setSelectedTags(newTags)
      setValue('tags', newTags)
    }
  }

  const removeTag = (tag: string) => {
    const newTags = selectedTags.filter(t => t !== tag)
    setSelectedTags(newTags)
    setValue('tags', newTags)
  }

  const onSubmit = async (data: AssetUploadForm) => {
    if (!selectedFile) {
      setError('Please select a file to upload')
      return
    }

    try {
      setError('')
      setUploading(true)
      setUploadProgress(0)

      // Gather metadata
      const metadata: any = {
        visibility: data.visibility,
        notes: data.description,
      }

      // Add type-specific metadata
      if (selectedFile.type.startsWith('image/')) {
        const dimensions = await getImageDimensions(selectedFile)
        if (dimensions) {
          metadata.dimensions = dimensions
        }
      } else if (selectedFile.type.startsWith('audio/')) {
        const duration = await getAudioDuration(selectedFile)
        if (duration) {
          metadata.duration = duration
        }
      } else if (selectedFile.type.startsWith('video/')) {
        const duration = await getVideoDuration(selectedFile)
        if (duration) {
          metadata.duration = duration
        }
      }

      const uploadData: Partial<AssetUploadData> = {
        name: data.name,
        description: data.description,
        type: data.type,
        tags: selectedTags,
        isPublic: data.isPublic,
        metadata,
      }

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      await uploadAsset(sessionId, selectedFile, uploadData)

      clearInterval(progressInterval)
      setUploadProgress(100)

      // Reset form
      reset()
      setSelectedFile(null)
      setSelectedTags([])
      setPreview(null)
      
      if (onSuccess) onSuccess()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="h-8 w-8" />
    if (file.type.startsWith('audio/')) return <Music className="h-8 w-8" />
    if (file.type.startsWith('video/')) return <Video className="h-8 w-8" />
    if (file.type.includes('pdf') || file.type.startsWith('text/')) return <FileText className="h-8 w-8" />
    return <File className="h-8 w-8" />
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight">Upload Campaign Asset</h2>
        <p className="text-muted-foreground">
          Add maps, handouts, music, and other materials to your campaign
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="rounded-md bg-red-50 p-3 border border-red-200">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* File Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Select File</CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedFile ? (
              <div
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">Drop files here or click to browse</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Supports images, audio, video, and documents up to 50MB
                </p>
                <Button type="button" variant="outline">
                  Choose File
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileSelect(file)
                  }}
                  accept="image/*,audio/*,video/*,.pdf,.txt,.md"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-muted rounded-lg">
                  {preview ? (
                    <img src={preview} alt="Preview" className="w-16 h-16 object-cover rounded" />
                  ) : (
                    <div className="w-16 h-16 bg-background rounded flex items-center justify-center">
                      {getFileIcon(selectedFile)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(selectedFile.size)} • {selectedFile.type}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedFile(null)
                      setPreview(null)
                      if (fileInputRef.current) fileInputRef.current.value = ''
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {uploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Asset Details */}
        {selectedFile && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Asset Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Asset Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter asset name"
                    error={errors.name?.message}
                    {...register('name')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Asset Type</Label>
                  <Select onValueChange={(value) => setValue('type', value as any)}>
                    <SelectTrigger error={errors.type?.message}>
                      <SelectValue placeholder="Select asset type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ASSET_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center space-x-2">
                            <span>{type.icon}</span>
                            <span>{type.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedType && (
                    <p className="text-xs text-muted-foreground">
                      {ASSET_TYPES.find(t => t.value === selectedType)?.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  placeholder="Describe this asset and how it should be used..."
                  className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  {...register('description')}
                />
                {errors.description && (
                  <p className="text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="visibility">Visibility</Label>
                  <Select onValueChange={(value) => setValue('visibility', value as any)}>
                    <SelectTrigger error={errors.visibility?.message}>
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      {VISIBILITY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {visibility && (
                    <p className="text-xs text-muted-foreground">
                      {VISIBILITY_OPTIONS.find(v => v.value === visibility)?.description}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Public Asset</Label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isPublic"
                      {...register('isPublic')}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="isPublic" className="text-sm">
                      Make available to other campaigns
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Public assets can be discovered and used by other GMs
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tags */}
        {selectedFile && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tags (Optional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Select onValueChange={addTag}>
                  <SelectTrigger>
                    <SelectValue placeholder="Add tags to help organize and find this asset" />
                  </SelectTrigger>
                  <SelectContent>
                    {ASSET_TAGS
                      .filter(tag => !selectedTags.includes(tag))
                      .map((tag) => (
                        <SelectItem key={tag} value={tag}>
                          {tag}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                
                {selectedTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="cursor-pointer hover:bg-secondary/80"
                        onClick={() => removeTag(tag)}
                      >
                        {tag}
                        <X className="ml-1 h-3 w-3" />
                      </Badge>
                    ))}
                  </div>
                )}
                
                <p className="text-xs text-muted-foreground">
                  Click tags to remove them. Max 10 tags.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            type="submit"
            className="flex-1"
            loading={uploading}
            disabled={!selectedFile || uploading}
          >
            <Upload className="mr-2 h-4 w-4" />
            {uploading ? 'Uploading...' : 'Upload Asset'}
          </Button>
          
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={uploading}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}

