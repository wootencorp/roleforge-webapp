'use client'

import { useState } from 'react'
import { MoreHorizontal, Users, Calendar, Globe, Lock, Star, Download, UserPlus, Eye, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { formatRelativeTime, capitalize } from '@/shared/lib/utils'
import { DIFFICULTY_INFO } from '../lib/rulesets'
import { useAuth } from '@/features/auth/hooks/use-auth'
import type { Campaign } from '@/shared/types'

interface CampaignCardProps {
  campaign: Campaign
  isSelected?: boolean
  onSelect?: () => void
  onJoin?: () => void
  onEdit?: () => void
  onDelete?: () => void
  viewMode?: 'grid' | 'list'
  joining?: boolean
  showActions?: boolean
}

export function CampaignCard({
  campaign,
  isSelected = false,
  onSelect,
  onJoin,
  onEdit,
  onDelete,
  viewMode = 'grid',
  joining = false,
  showActions = true
}: CampaignCardProps) {
  const [imageError, setImageError] = useState(false)
  const { user } = useAuth()

  const difficultyInfo = DIFFICULTY_INFO[campaign.difficulty]
  const isCreator = user?.id === campaign.creatorId
  const isFull = campaign.currentPlayers >= campaign.maxPlayers
  const canJoin = !isCreator && !isFull && campaign.isActive

  if (viewMode === 'list') {
    return (
      <Card className={`transition-all hover:shadow-md ${isSelected ? 'ring-2 ring-primary' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1 min-w-0">
              <div className="relative flex-shrink-0">
                {campaign.imageUrl && !imageError ? (
                  <img
                    src={campaign.imageUrl}
                    alt={campaign.name}
                    className="w-16 h-16 rounded-lg object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                    {campaign.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="absolute -top-1 -right-1">
                  {campaign.isPublic ? (
                    <Globe className="h-4 w-4 text-green-600 bg-white rounded-full p-0.5" />
                  ) : (
                    <Lock className="h-4 w-4 text-gray-600 bg-white rounded-full p-0.5" />
                  )}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">{campaign.name}</h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {campaign.ruleset} • {difficultyInfo.label}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {campaign.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4 text-blue-500" />
                      <span>{campaign.currentPlayers}/{campaign.maxPlayers}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>{formatRelativeTime(campaign.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant="secondary" 
                      className={`${difficultyInfo.color} ${difficultyInfo.bgColor}`}
                    >
                      {difficultyInfo.label}
                    </Badge>
                    
                    {campaign.tags.slice(0, 2).map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    
                    {campaign.tags.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{campaign.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 flex-shrink-0">
              {canJoin && onJoin && (
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onJoin()
                  }}
                  loading={joining}
                  disabled={joining}
                >
                  <UserPlus className="mr-1 h-3 w-3" />
                  Join
                </Button>
              )}

              {showActions && (
                <CampaignActions
                  campaign={campaign}
                  isCreator={isCreator}
                  onSelect={onSelect}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card 
      className={`transition-all hover:shadow-lg cursor-pointer ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={onSelect}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">{campaign.name}</h3>
            <p className="text-sm text-muted-foreground">
              {campaign.ruleset}
            </p>
          </div>
          
          <div className="flex items-center space-x-1">
            {campaign.isPublic ? (
              <Globe className="h-4 w-4 text-green-600" />
            ) : (
              <Lock className="h-4 w-4 text-gray-600" />
            )}
            
            {showActions && (
              <CampaignActions
                campaign={campaign}
                isCreator={isCreator}
                onSelect={onSelect}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Campaign Image */}
        <div className="relative">
          {campaign.imageUrl && !imageError ? (
            <img
              src={campaign.imageUrl}
              alt={campaign.name}
              className="w-full h-32 rounded-md object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-32 rounded-md bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
              {campaign.name.charAt(0).toUpperCase()}
            </div>
          )}
          
          {/* Status Badges */}
          <div className="absolute top-2 left-2 flex space-x-1">
            <Badge 
              variant="secondary" 
              className={`${difficultyInfo.color} ${difficultyInfo.bgColor}`}
            >
              {difficultyInfo.label}
            </Badge>
            
            {isFull && (
              <Badge variant="destructive">
                Full
              </Badge>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-3">
          {campaign.description}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="space-y-1">
            <div className="flex items-center justify-center space-x-1">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">
                {campaign.currentPlayers}/{campaign.maxPlayers}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Players</p>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-center space-x-1">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">
                {formatRelativeTime(campaign.createdAt)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Created</p>
          </div>
        </div>

        {/* Tags */}
        {campaign.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {campaign.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {campaign.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{campaign.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Action Button */}
        {canJoin && onJoin && (
          <Button
            className="w-full"
            onClick={(e) => {
              e.stopPropagation()
              onJoin()
            }}
            loading={joining}
            disabled={joining}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Join Campaign
          </Button>
        )}

        {isFull && !isCreator && (
          <Button className="w-full" variant="outline" disabled>
            Campaign Full
          </Button>
        )}

        {isCreator && (
          <div className="text-center">
            <Badge variant="success" className="text-xs">
              You are the GM
            </Badge>
          </div>
        )}

        {/* Last Updated */}
        <p className="text-xs text-muted-foreground text-center">
          Updated {formatRelativeTime(campaign.updatedAt)}
        </p>
      </CardContent>
    </Card>
  )
}

function CampaignActions({ 
  campaign,
  isCreator,
  onSelect, 
  onEdit, 
  onDelete 
}: {
  campaign: Campaign
  isCreator: boolean
  onSelect?: () => void
  onEdit?: () => void
  onDelete?: () => void
}) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenu.Trigger>
      
      <DropdownMenu.Portal>
        <DropdownMenu.Content 
          className="min-w-[160px] bg-white rounded-md border shadow-md p-1 z-50"
          align="end"
        >
          {onSelect && (
            <DropdownMenu.Item 
              className="flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded-sm"
              onClick={(e) => {
                e.stopPropagation()
                onSelect()
              }}
            >
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenu.Item>
          )}
          
          {isCreator && onEdit && (
            <DropdownMenu.Item 
              className="flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded-sm"
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Campaign
            </DropdownMenu.Item>
          )}
          
          {isCreator && onDelete && (
            <>
              <DropdownMenu.Separator className="h-px bg-gray-200 my-1" />
              <DropdownMenu.Item 
                className="flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-red-50 text-red-600 rounded-sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete()
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Campaign
              </DropdownMenu.Item>
            </>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

