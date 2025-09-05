import type { CampaignAsset, AssetMetadata } from '../types'

export const ASSET_TYPES = [
  { value: 'map', label: 'Map', icon: '🗺️', description: 'Battle maps, world maps, dungeon layouts' },
  { value: 'handout', label: 'Handout', icon: '📄', description: 'Player handouts, letters, documents' },
  { value: 'image', label: 'Image', icon: '🖼️', description: 'Artwork, illustrations, reference images' },
  { value: 'audio', label: 'Audio', icon: '🎵', description: 'Music, sound effects, ambient audio' },
  { value: 'video', label: 'Video', icon: '🎬', description: 'Cutscenes, animations, video clips' },
  { value: 'document', label: 'Document', icon: '📋', description: 'PDFs, text files, reference materials' },
  { value: 'token', label: 'Token', icon: '⚪', description: 'Character tokens, creature tokens' },
  { value: 'other', label: 'Other', icon: '📎', description: 'Other file types' },
] as const

export const ASSET_TAGS = [
  'Combat', 'Exploration', 'Social', 'Puzzle', 'Trap', 'NPC', 'Monster',
  'Location', 'Item', 'Spell', 'Lore', 'Background', 'Reference', 'Player',
  'GM Only', 'Important', 'Temporary', 'Archive'
]

export const VISIBILITY_OPTIONS = [
  { value: 'gm_only', label: 'GM Only', description: 'Only visible to the Game Master' },
  { value: 'players', label: 'Players', description: 'Visible to all players' },
  { value: 'all', label: 'Everyone', description: 'Visible to everyone in the session' },
] as const

export const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
export const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4']
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg']
export const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'text/plain', 'text/markdown']

export function getAssetTypeInfo(type: CampaignAsset['type']) {
  return ASSET_TYPES.find(t => t.value === type) || ASSET_TYPES[ASSET_TYPES.length - 1]
}

export function validateFile(file: File): { isValid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size must be less than ${formatFileSize(MAX_FILE_SIZE)}`
    }
  }

  // Check file type
  const allowedTypes = [
    ...ALLOWED_IMAGE_TYPES,
    ...ALLOWED_AUDIO_TYPES,
    ...ALLOWED_VIDEO_TYPES,
    ...ALLOWED_DOCUMENT_TYPES
  ]

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'File type not supported'
    }
  }

  return { isValid: true }
}

export function getAssetTypeFromMimeType(mimeType: string): CampaignAsset['type'] {
  if (ALLOWED_IMAGE_TYPES.includes(mimeType)) return 'image'
  if (ALLOWED_AUDIO_TYPES.includes(mimeType)) return 'audio'
  if (ALLOWED_VIDEO_TYPES.includes(mimeType)) return 'video'
  if (ALLOWED_DOCUMENT_TYPES.includes(mimeType)) return 'document'
  return 'other'
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function getFileExtension(filename: string): string {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2)
}

export function generateThumbnail(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      resolve(null)
      return
    }

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      const maxSize = 200
      let { width, height } = img

      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width
          width = maxSize
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height
          height = maxSize
        }
      }

      canvas.width = width
      canvas.height = height

      ctx?.drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL('image/jpeg', 0.8))
    }

    img.onerror = () => resolve(null)
    img.src = URL.createObjectURL(file)
  })
}

export function getImageDimensions(file: File): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      resolve(null)
      return
    }

    const img = new Image()
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
    }
    img.onerror = () => resolve(null)
    img.src = URL.createObjectURL(file)
  })
}

export function getAudioDuration(file: File): Promise<number | null> {
  return new Promise((resolve) => {
    if (!file.type.startsWith('audio/')) {
      resolve(null)
      return
    }

    const audio = new Audio()
    audio.onloadedmetadata = () => {
      resolve(audio.duration)
    }
    audio.onerror = () => resolve(null)
    audio.src = URL.createObjectURL(file)
  })
}

export function getVideoDuration(file: File): Promise<number | null> {
  return new Promise((resolve) => {
    if (!file.type.startsWith('video/')) {
      resolve(null)
      return
    }

    const video = document.createElement('video')
    video.onloadedmetadata = () => {
      resolve(video.duration)
    }
    video.onerror = () => resolve(null)
    video.src = URL.createObjectURL(file)
  })
}

export function filterAssets(
  assets: CampaignAsset[],
  filters: {
    search?: string
    type?: CampaignAsset['type']
    tags?: string[]
    isPublic?: boolean
    visibility?: AssetMetadata['visibility']
  }
): CampaignAsset[] {
  return assets.filter(asset => {
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      const matchesName = asset.name.toLowerCase().includes(searchTerm)
      const matchesDescription = asset.description.toLowerCase().includes(searchTerm)
      const matchesTags = asset.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      
      if (!matchesName && !matchesDescription && !matchesTags) {
        return false
      }
    }

    // Type filter
    if (filters.type && asset.type !== filters.type) {
      return false
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      const hasMatchingTag = filters.tags.some(tag => asset.tags.includes(tag))
      if (!hasMatchingTag) {
        return false
      }
    }

    // Public filter
    if (filters.isPublic !== undefined && asset.isPublic !== filters.isPublic) {
      return false
    }

    // Visibility filter
    if (filters.visibility && asset.metadata?.visibility !== filters.visibility) {
      return false
    }

    return true
  })
}

export function sortAssets(
  assets: CampaignAsset[],
  sortBy: 'name' | 'createdAt' | 'fileSize' | 'type' = 'createdAt',
  sortOrder: 'asc' | 'desc' = 'desc'
): CampaignAsset[] {
  return [...assets].sort((a, b) => {
    let comparison = 0

    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name)
        break
      case 'createdAt':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        break
      case 'fileSize':
        comparison = a.fileSize - b.fileSize
        break
      case 'type':
        comparison = a.type.localeCompare(b.type)
        break
    }

    return sortOrder === 'asc' ? comparison : -comparison
  })
}

export function canUserAccessAsset(
  asset: CampaignAsset,
  userRole: 'gm' | 'player',
  userId: string
): boolean {
  // Asset owner can always access
  if (asset.uploadedBy === userId) {
    return true
  }

  // GM can access everything
  if (userRole === 'gm') {
    return true
  }

  // Check visibility for players
  if (userRole === 'player') {
    const visibility = asset.metadata?.visibility || 'all'
    return visibility === 'players' || visibility === 'all'
  }

  return false
}

export function getAssetPreviewUrl(asset: CampaignAsset): string {
  if (asset.thumbnailUrl) {
    return asset.thumbnailUrl
  }

  // Return appropriate preview based on type
  switch (asset.type) {
    case 'map':
      return '/icons/map-preview.svg'
    case 'handout':
      return '/icons/document-preview.svg'
    case 'audio':
      return '/icons/audio-preview.svg'
    case 'video':
      return '/icons/video-preview.svg'
    case 'document':
      return '/icons/pdf-preview.svg'
    case 'token':
      return '/icons/token-preview.svg'
    default:
      return '/icons/file-preview.svg'
  }
}

export function isImageAsset(asset: CampaignAsset): boolean {
  return asset.type === 'image' || asset.type === 'map' || asset.type === 'token'
}

export function isAudioAsset(asset: CampaignAsset): boolean {
  return asset.type === 'audio'
}

export function isVideoAsset(asset: CampaignAsset): boolean {
  return asset.type === 'video'
}

export function isDocumentAsset(asset: CampaignAsset): boolean {
  return asset.type === 'document' || asset.type === 'handout'
}

