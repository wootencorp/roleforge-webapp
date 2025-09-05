'use client'

import { useRef, useState } from 'react'
import { Upload, File, Image, Music, Video, FileText, X } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import { validateFile, formatFileSize, getAssetTypeFromMimeType } from '../../lib/asset-utils'

interface FileDropzoneProps {
  onFileSelect: (file: File) => void
  selectedFile: File | null
  onFileRemove: () => void
  error?: string
}

export function FileDropzone({ onFileSelect, selectedFile, onFileRemove, error }: FileDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelection(files[0])
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      handleFileSelection(files[0])
    }
  }

  const handleFileSelection = (file: File) => {
    const validation = validateFile(file)
    if (validation.valid) {
      onFileSelect(file)
    } else {
      // Handle validation error
      console.error('File validation failed:', validation.error)
    }
  }

  const getFileIcon = (file: File) => {
    const type = getAssetTypeFromMimeType(file.type)
    switch (type) {
      case 'image':
        return <Image className="h-8 w-8" />
      case 'audio':
        return <Music className="h-8 w-8" />
      case 'video':
        return <Video className="h-8 w-8" />
      case 'document':
        return <FileText className="h-8 w-8" />
      default:
        return <File className="h-8 w-8" />
    }
  }

  if (selectedFile) {
    return (
      <Card className="border-2 border-dashed">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0 text-primary">
              {getFileIcon(selectedFile)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground">
                {formatFileSize(selectedFile.size)} • {getAssetTypeFromMimeType(selectedFile.type)}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onFileRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-2">
      <Card 
        className={`border-2 border-dashed transition-colors cursor-pointer ${
          isDragOver 
            ? 'border-primary bg-primary/5' 
            : error 
              ? 'border-destructive' 
              : 'border-muted-foreground/25 hover:border-primary/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <CardContent className="p-8">
          <div className="text-center">
            <Upload className={`h-12 w-12 mx-auto mb-4 ${
              error ? 'text-destructive' : 'text-muted-foreground'
            }`} />
            <h3 className="text-lg font-medium mb-2">
              {isDragOver ? 'Drop file here' : 'Upload campaign asset'}
            </h3>
            <p className="text-muted-foreground mb-4">
              Drag and drop a file here, or click to browse
            </p>
            <div className="text-sm text-muted-foreground">
              <p>Supported formats: Images, Audio, Video, Documents</p>
              <p>Maximum file size: 100MB</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileInputChange}
        accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.txt,.md"
      />
    </div>
  )
}

