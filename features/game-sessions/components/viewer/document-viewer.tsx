'use client'

import { useState } from 'react'
import { Download, ExternalLink, FileText, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'

interface DocumentViewerProps {
  src: string
  fileName: string
  fileType: string
  onDownload?: () => void
}

export function DocumentViewer({ src, fileName, fileType, onDownload }: DocumentViewerProps) {
  const [showPreview, setShowPreview] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  const isPDF = fileType.toLowerCase().includes('pdf')
  const isTextFile = fileType.toLowerCase().includes('text') || 
                    fileType.toLowerCase().includes('markdown')

  const handleIframeLoad = () => {
    setIsLoading(false)
  }

  const handleIframeError = () => {
    setIsLoading(false)
    setShowPreview(false)
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-3">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <div>
            <h3 className="font-medium truncate">{fileName}</h3>
            <p className="text-sm text-muted-foreground">{fileType}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {(isPDF || isTextFile) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Hide Preview
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Show Preview
                </>
              )}
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={onDownload}
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(src, '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 relative">
        {showPreview && (isPDF || isTextFile) ? (
          <div className="w-full h-full relative">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Loading document...</p>
                </div>
              </div>
            )}

            <iframe
              src={src}
              className="w-full h-full border-0"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              title={fileName}
            />
          </div>
        ) : (
          <Card className="m-4">
            <CardContent className="p-8 text-center">
              <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Document Preview</h3>
              <p className="text-muted-foreground mb-6">
                {showPreview 
                  ? 'Preview not available for this file type.'
                  : 'Preview is hidden. Use the controls above to view or download the document.'
                }
              </p>
              
              <div className="flex justify-center space-x-2">
                <Button onClick={onDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download File
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => window.open(src, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in New Tab
                </Button>
              </div>

              <div className="mt-6 text-sm text-muted-foreground">
                <p><strong>File:</strong> {fileName}</p>
                <p><strong>Type:</strong> {fileType}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

