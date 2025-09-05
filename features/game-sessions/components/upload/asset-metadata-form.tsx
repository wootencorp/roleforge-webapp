'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, X } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { Badge } from '@/shared/components/ui/badge'
import { ASSET_TAGS, VISIBILITY_OPTIONS } from '../../lib/asset-utils'
import { assetUploadSchema, type AssetUploadForm } from '@/shared/lib/validations'

interface AssetMetadataFormProps {
  onSubmit: (data: AssetUploadForm) => void
  loading?: boolean
  defaultValues?: Partial<AssetUploadForm>
}

export function AssetMetadataForm({ onSubmit, loading, defaultValues }: AssetMetadataFormProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>(defaultValues?.tags || [])
  const [customTag, setCustomTag] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<AssetUploadForm>({
    resolver: zodResolver(assetUploadSchema),
    defaultValues: {
      name: '',
      description: '',
      type: 'image',
      visibility: 'players',
      tags: [],
      ...defaultValues
    }
  })

  const watchedType = watch('type')

  const handleFormSubmit = (data: AssetUploadForm) => {
    onSubmit({
      ...data,
      tags: selectedTags
    })
  }

  const addTag = (tag: string) => {
    if (tag && !selectedTags.includes(tag)) {
      const newTags = [...selectedTags, tag]
      setSelectedTags(newTags)
      setValue('tags', newTags)
    }
  }

  const removeTag = (tagToRemove: string) => {
    const newTags = selectedTags.filter(tag => tag !== tagToRemove)
    setSelectedTags(newTags)
    setValue('tags', newTags)
  }

  const addCustomTag = () => {
    if (customTag.trim()) {
      addTag(customTag.trim())
      setCustomTag('')
    }
  }

  const handleCustomTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addCustomTag()
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Asset Name *</Label>
          <Input
            id="name"
            {...register('name')}
            placeholder="Enter asset name"
            error={errors.name?.message}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder="Describe this asset (optional)"
            rows={3}
          />
          {errors.description && (
            <p className="text-sm text-destructive">{errors.description.message}</p>
          )}
        </div>
      </div>

      {/* Asset Type and Visibility */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Asset Type *</Label>
          <Select
            value={watchedType}
            onValueChange={(value) => setValue('type', value as any)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="image">Image</SelectItem>
              <SelectItem value="map">Map</SelectItem>
              <SelectItem value="handout">Handout</SelectItem>
              <SelectItem value="token">Token</SelectItem>
              <SelectItem value="audio">Audio</SelectItem>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="document">Document</SelectItem>
            </SelectContent>
          </Select>
          {errors.type && (
            <p className="text-sm text-destructive">{errors.type.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="visibility">Visibility *</Label>
          <Select
            defaultValue="players"
            onValueChange={(value) => setValue('visibility', value as any)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {VISIBILITY_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.visibility && (
            <p className="text-sm text-destructive">{errors.visibility.message}</p>
          )}
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-4">
        <Label>Tags</Label>
        
        {/* Selected Tags */}
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => removeTag(tag)}
              >
                {tag}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            ))}
          </div>
        )}

        {/* Preset Tags */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Quick tags:</p>
          <div className="flex flex-wrap gap-2">
            {ASSET_TAGS.filter(tag => !selectedTags.includes(tag)).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="cursor-pointer hover:bg-accent"
                onClick={() => addTag(tag)}
              >
                <Plus className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Custom Tag Input */}
        <div className="flex space-x-2">
          <Input
            placeholder="Add custom tag"
            value={customTag}
            onChange={(e) => setCustomTag(e.target.value)}
            onKeyPress={handleCustomTagKeyPress}
          />
          <Button
            type="button"
            variant="outline"
            onClick={addCustomTag}
            disabled={!customTag.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex space-x-2 pt-4">
        <Button
          type="submit"
          disabled={loading}
          className="flex-1"
        >
          {loading ? 'Uploading...' : 'Upload Asset'}
        </Button>
      </div>
    </form>
  )
}

