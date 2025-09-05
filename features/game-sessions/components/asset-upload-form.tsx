'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog'
import { useGameSession } from '../hooks/use-sessions'
import { FileDropzone } from './upload/file-dropzone'
import { AssetMetadataForm } from './upload/asset-metadata-form'
import { UploadProgress } from './upload/upload-progress'
import { 
  validateFile,
  getAssetTypeFromMimeType,
  generateThumbnail,
  getImageDimensions,
  getAudioDuration,
  getVideoDuration
} from '../lib/asset-utils'
import { getErrorMessage } from '@/shared/lib/utils'
import type { AssetUploadForm as AssetUploadFormData } from '@/shared/lib/validations'
import type { CampaignAsset } from '../types'

interface AssetUploadFormProps {
  campaignId: string
  onSuccess?: (asset: CampaignAsset) => void
  onCancel?: () => void
}

export function AssetUploadForm({ campaignId, onSuccess, onCancel }: AssetUploadFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<'uploading' | 'processing' | 'success' | 'error'>('uploading')
  const [error, setError] = useState('')

  const { uploadAsset } = useGameSession(campaignId)

  const handleFileSelect = (file: File) => {
    const validation = validateFile(file)
    if (!validation.valid) {
      setError(validation.error || 'Invalid file')
      return
    }

    setSelectedFile(file)
    setError('')
  }

  const handleFileRemove = () => {
    setSelectedFile(null)
    setError('')
  }

  const handleFormSubmit = async (formData: AssetUploadFormData) => {
    if (!selectedFile) {
      setError('Please select a file to upload')
      return
    }

    setUploading(true)
    setUploadProgress(0)
    setUploadStatus('uploading')
    setError('')

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      // Generate metadata based on file type
      let metadata: any = {}
      const assetType = getAssetTypeFromMimeType(selectedFile.type)

      if (assetType === 'image') {
        try {
          const dimensions = await getImageDimensions(selectedFile)
          const thumbnail = await generateThumbnail(selectedFile)
          metadata = { dimensions, thumbnailUrl: thumbnail }
        } catch (err) {
          console.warn('Failed to generate image metadata:', err)
        }
      } else if (assetType === 'audio') {
        try {
          const duration = await getAudioDuration(selectedFile)
          metadata = { duration }
        } catch (err) {
          console.warn('Failed to generate audio metadata:', err)
        }
      } else if (assetType === 'video') {
        try {
          const duration = await getVideoDuration(selectedFile)
          metadata = { duration }
        } catch (err) {
          console.warn('Failed to generate video metadata:', err)
        }
      }

      setUploadStatus('processing')
      setUploadProgress(95)

      // Upload the asset
      const uploadData = {
        file: selectedFile,
        name: formData.name,
        description: formData.description,
        type: formData.type,
        visibility: formData.visibility,
        tags: formData.tags,
        metadata
      }

      const result = await uploadAsset(uploadData)

      clearInterval(progressInterval)
      setUploadProgress(100)
      setUploadStatus('success')

      // Wait a moment to show success state
      setTimeout(() => {
        onSuccess?.(result)
      }, 1000)

    } catch (err) {
      setUploadStatus('error')
      setError(getErrorMessage(err))
    } finally {
      setUploading(false)
    }
  }

  const getDefaultFormValues = () => {
    if (!selectedFile) return {}

    const assetType = getAssetTypeFromMimeType(selectedFile.type)
    const nameWithoutExtension = selectedFile.name.replace(/\.[^/.]+$/, '')

    return {
      name: nameWithoutExtension,
      type: assetType,
      visibility: 'players' as const
    }
  }

  return (
    <Dialog open onOpenChange={() => onCancel?.()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Upload Campaign Asset</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {!uploading ? (
            <>
              {/* File Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Select File</h3>
                <FileDropzone
                  onFileSelect={handleFileSelect}
                  selectedFile={selectedFile}
                  onFileRemove={handleFileRemove}
                  error={error}
                />
              </div>

              {/* Metadata Form */}
              {selectedFile && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Asset Details</h3>
                  <AssetMetadataForm
                    onSubmit={handleFormSubmit}
                    loading={uploading}
                    defaultValues={getDefaultFormValues()}
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            /* Upload Progress */
            <UploadProgress
              progress={uploadProgress}
              status={uploadStatus}
              fileName={selectedFile?.name}
              error={error}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

