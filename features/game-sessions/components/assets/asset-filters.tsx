'use client'

import { Search, Filter, Grid, List, SortAsc } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Badge } from '@/shared/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'

interface AssetFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  selectedTypes: string[]
  onTypeToggle: (type: string) => void
  selectedTags: string[]
  onTagToggle: (tag: string) => void
  selectedVisibility: string[]
  onVisibilityToggle: (visibility: string) => void
  sortBy: string
  onSortChange: (value: string) => void
  viewMode: 'grid' | 'list'
  onViewModeChange: (mode: 'grid' | 'list') => void
  availableTags: string[]
  totalAssets: number
  filteredAssets: number
}

const ASSET_TYPES = [
  { value: 'image', label: 'Images' },
  { value: 'audio', label: 'Audio' },
  { value: 'video', label: 'Video' },
  { value: 'document', label: 'Documents' },
  { value: 'map', label: 'Maps' },
  { value: 'handout', label: 'Handouts' },
  { value: 'token', label: 'Tokens' }
]

const VISIBILITY_OPTIONS = [
  { value: 'gm_only', label: 'GM Only' },
  { value: 'players', label: 'Players' },
  { value: 'everyone', label: 'Everyone' }
]

const SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'date', label: 'Date Added' },
  { value: 'size', label: 'File Size' },
  { value: 'type', label: 'Type' }
]

export function AssetFilters({
  searchTerm,
  onSearchChange,
  selectedTypes,
  onTypeToggle,
  selectedTags,
  onTagToggle,
  selectedVisibility,
  onVisibilityToggle,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  availableTags,
  totalAssets,
  filteredAssets
}: AssetFiltersProps) {
  const activeFiltersCount = selectedTypes.length + selectedTags.length + selectedVisibility.length

  const clearAllFilters = () => {
    selectedTypes.forEach(type => onTypeToggle(type))
    selectedTags.forEach(tag => onTagToggle(tag))
    selectedVisibility.forEach(visibility => onVisibilityToggle(visibility))
    onSearchChange('')
  }

  return (
    <div className="space-y-4">
      {/* Search and View Controls */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search assets..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-32">
              <SortAsc className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('grid')}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        {/* Type Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Type
              {selectedTypes.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {selectedTypes.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {ASSET_TYPES.map(type => (
              <DropdownMenuCheckboxItem
                key={type.value}
                checked={selectedTypes.includes(type.value)}
                onCheckedChange={() => onTypeToggle(type.value)}
              >
                {type.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Visibility Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Visibility
              {selectedVisibility.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {selectedVisibility.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {VISIBILITY_OPTIONS.map(option => (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={selectedVisibility.includes(option.value)}
                onCheckedChange={() => onVisibilityToggle(option.value)}
              >
                {option.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Tags Filter */}
        {availableTags.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Tags
                {selectedTags.length > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {selectedTags.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="max-h-64 overflow-y-auto">
              {availableTags.map(tag => (
                <DropdownMenuCheckboxItem
                  key={tag}
                  checked={selectedTags.includes(tag)}
                  onCheckedChange={() => onTagToggle(tag)}
                >
                  {tag}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Clear Filters */}
        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            Clear All ({activeFiltersCount})
          </Button>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {filteredAssets} of {totalAssets} assets
        </span>
        
        {/* Active Filter Tags */}
        {(selectedTypes.length > 0 || selectedTags.length > 0 || selectedVisibility.length > 0) && (
          <div className="flex items-center space-x-2">
            <span>Filters:</span>
            <div className="flex flex-wrap gap-1">
              {selectedTypes.map(type => (
                <Badge
                  key={type}
                  variant="secondary"
                  className="text-xs cursor-pointer"
                  onClick={() => onTypeToggle(type)}
                >
                  {ASSET_TYPES.find(t => t.value === type)?.label} ×
                </Badge>
              ))}
              {selectedVisibility.map(visibility => (
                <Badge
                  key={visibility}
                  variant="secondary"
                  className="text-xs cursor-pointer"
                  onClick={() => onVisibilityToggle(visibility)}
                >
                  {VISIBILITY_OPTIONS.find(v => v.value === visibility)?.label} ×
                </Badge>
              ))}
              {selectedTags.map(tag => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-xs cursor-pointer"
                  onClick={() => onTagToggle(tag)}
                >
                  {tag} ×
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

