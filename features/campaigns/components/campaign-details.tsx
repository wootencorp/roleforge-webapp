'use client'

import { useState } from 'react'
import { 
  Users, 
  Calendar, 
  Globe, 
  Lock, 
  Edit, 
  UserPlus, 
  UserMinus, 
  Play, 
  Settings,
  MapPin,
  Clock,
  Star
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { formatRelativeTime } from '@/shared/lib/utils'
import { DIFFICULTY_INFO, getRulesetInfo } from '../lib/rulesets'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { useCampaigns } from '../hooks/use-campaigns'
import type { Campaign } from '@/shared/types'

interface CampaignDetailsProps {
  campaign: Campaign
  onEdit?: () => void
  onJoin?: () => void
  onLeave?: () => void
  onStartSession?: () => void
}

export function CampaignDetails({
  campaign,
  onEdit,
  onJoin,
  onLeave,
  onStartSession
}: CampaignDetailsProps) {
  const [imageError, setImageError] = useState(false)
  const { user } = useAuth()
  const { joining } = useCampaigns()

  const difficultyInfo = DIFFICULTY_INFO[campaign.difficulty]
  const rulesetInfo = getRulesetInfo(campaign.ruleset)
  const isCreator = user?.id === campaign.creatorId
  const isFull = campaign.currentPlayers >= campaign.maxPlayers
  const canJoin = !isCreator && !isFull && campaign.isActive

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative">
        {campaign.imageUrl && !imageError ? (
          <div className="relative h-64 rounded-lg overflow-hidden">
            <img
              src={campaign.imageUrl}
              alt={campaign.name}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 text-white">
              <h1 className="text-3xl font-bold">{campaign.name}</h1>
              <p className="text-lg opacity-90">{campaign.ruleset}</p>
            </div>
          </div>
        ) : (
          <div className="h-64 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center relative">
            <div className="text-center text-white">
              <h1 className="text-4xl font-bold mb-2">{campaign.name}</h1>
              <p className="text-xl opacity-90">{campaign.ruleset}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex space-x-2">
          {campaign.isPublic ? (
            <Badge variant="success" className="bg-green-100 text-green-800">
              <Globe className="mr-1 h-3 w-3" />
              Public
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-gray-100 text-gray-800">
              <Lock className="mr-1 h-3 w-3" />
              Private
            </Badge>
          )}
          
          <Badge 
            variant="secondary" 
            className={`${difficultyInfo.color} ${difficultyInfo.bgColor}`}
          >
            {difficultyInfo.label}
          </Badge>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        {canJoin && onJoin && (
          <Button onClick={onJoin} loading={joining} disabled={joining}>
            <UserPlus className="mr-2 h-4 w-4" />
            Join Campaign
          </Button>
        )}
        
        {isCreator && onStartSession && (
          <Button onClick={onStartSession}>
            <Play className="mr-2 h-4 w-4" />
            Start Session
          </Button>
        )}
        
        {isCreator && onEdit && (
          <Button variant="outline" onClick={onEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Campaign
          </Button>
        )}
        
        {!isCreator && onLeave && (
          <Button variant="outline" onClick={onLeave}>
            <UserMinus className="mr-2 h-4 w-4" />
            Leave Campaign
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>About This Campaign</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {campaign.description}
              </p>
            </CardContent>
          </Card>

          {/* Tags */}
          {campaign.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {campaign.tags.map(tag => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-muted-foreground">
                    Campaign updated {formatRelativeTime(campaign.updatedAt)}
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span className="text-muted-foreground">
                    Campaign created {formatRelativeTime(campaign.createdAt)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Campaign Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Campaign Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Players</span>
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">
                    {campaign.currentPlayers}/{campaign.maxPlayers}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Difficulty</span>
                <Badge 
                  variant="secondary" 
                  className={`${difficultyInfo.color} ${difficultyInfo.bgColor}`}
                >
                  {difficultyInfo.label}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant={campaign.isActive ? 'success' : 'secondary'}>
                  {campaign.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Created</span>
                <span className="text-sm font-medium">
                  {formatRelativeTime(campaign.createdAt)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Ruleset Info */}
          {rulesetInfo && (
            <Card>
              <CardHeader>
                <CardTitle>Ruleset Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-medium">{rulesetInfo.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {rulesetInfo.version} by {rulesetInfo.publisher}
                  </p>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  {rulesetInfo.description}
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Complexity</span>
                    <Badge variant="outline">
                      {rulesetInfo.complexity}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Recommended Players</span>
                    <span className="font-medium">
                      {rulesetInfo.playerCount.recommended}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {rulesetInfo.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Player Progress Bar */}
          <Card>
            <CardHeader>
              <CardTitle>Player Slots</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Filled</span>
                  <span>{campaign.currentPlayers}/{campaign.maxPlayers}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${
                      isFull ? 'bg-red-500' : 'bg-blue-500'
                    }`}
                    style={{ 
                      width: `${(campaign.currentPlayers / campaign.maxPlayers) * 100}%` 
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {isFull 
                    ? 'Campaign is full' 
                    : `${campaign.maxPlayers - campaign.currentPlayers} slots available`
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

