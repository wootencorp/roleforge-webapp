'use client'

import { CheckCircle, XCircle, Upload } from 'lucide-react'
import { Progress } from '@/shared/components/ui/progress'
import { Card, CardContent } from '@/shared/components/ui/card'

interface UploadProgressProps {
  progress: number
  status: 'uploading' | 'processing' | 'success' | 'error'
  fileName?: string
  error?: string
}

export function UploadProgress({ progress, status, fileName, error }: UploadProgressProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-600" />
      case 'error':
        return <XCircle className="h-6 w-6 text-red-600" />
      default:
        return <Upload className="h-6 w-6 text-primary" />
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'uploading':
        return 'Uploading file...'
      case 'processing':
        return 'Processing asset...'
      case 'success':
        return 'Upload complete!'
      case 'error':
        return 'Upload failed'
      default:
        return 'Preparing upload...'
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-600'
      case 'error':
        return 'text-red-600'
      default:
        return 'text-primary'
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            {getStatusIcon()}
            <div className="flex-1">
              <p className={`font-medium ${getStatusColor()}`}>
                {getStatusText()}
              </p>
              {fileName && (
                <p className="text-sm text-muted-foreground truncate">
                  {fileName}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm font-mono">
                {Math.round(progress)}%
              </p>
            </div>
          </div>

          <Progress value={progress} className="w-full" />

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {status === 'success' && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">
                Asset uploaded successfully and is now available to your campaign.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

