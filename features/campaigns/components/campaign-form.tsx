'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, X, Users, Globe, Lock } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { Badge } from '@/shared/components/ui/badge'
import { useCampaigns } from '../hooks/use-campaigns'
import { campaignFormSchema, type CampaignForm } from '@/shared/lib/validations'
import { RULESETS, CAMPAIGN_TAGS, DIFFICULTY_INFO } from '../lib/rulesets'
import { getErrorMessage } from '@/shared/lib/utils'

interface CampaignFormProps {
  onSuccess?: (campaignId: string) => void
  onCancel?: () => void
}

export function CampaignForm({ onSuccess, onCancel }: CampaignFormProps) {
  const [error, setError] = useState<string>('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const { createCampaign, creating } = useCampaigns()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CampaignForm>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: {
      maxPlayers: 4,
      isPublic: true,
    },
  })

  const selectedRuleset = watch('ruleset')
  const selectedDifficulty = watch('difficulty')
  const isPublic = watch('isPublic')

  const selectedRulesetInfo = RULESETS.find(r => r.name === selectedRuleset)
  const difficultyInfo = selectedDifficulty ? DIFFICULTY_INFO[selectedDifficulty] : null

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

  const onSubmit = async (data: CampaignForm) => {
    try {
      setError('')
      
      const campaign = await createCampaign({
        name: data.name,
        description: data.description,
        ruleset: data.ruleset,
        difficulty: data.difficulty,
        maxPlayers: data.maxPlayers,
        isPublic: data.isPublic,
        tags: selectedTags,
        imageUrl: data.imageUrl,
      })
      
      if (onSuccess) onSuccess(campaign.id)
      reset()
      setSelectedTags([])
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <div className="w-full max-w-2xl space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight">Create New Campaign</h2>
        <p className="text-muted-foreground">
          Set up your next tabletop adventure
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="rounded-md bg-red-50 p-3 border border-red-200">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Basic Information */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Campaign Name</Label>
            <Input
              id="name"
              placeholder="Enter campaign name"
              error={errors.name?.message}
              {...register('name')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              placeholder="Describe your campaign setting, story, and what players can expect..."
              className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">Campaign Image URL (Optional)</Label>
            <Input
              id="imageUrl"
              type="url"
              placeholder="https://example.com/campaign-image.jpg"
              error={errors.imageUrl?.message}
              {...register('imageUrl')}
            />
          </div>
        </div>

        {/* Game Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ruleset">Ruleset</Label>
            <Select onValueChange={(value) => setValue('ruleset', value)}>
              <SelectTrigger error={errors.ruleset?.message}>
                <SelectValue placeholder="Select a ruleset" />
              </SelectTrigger>
              <SelectContent>
                {RULESETS.map((ruleset) => (
                  <SelectItem key={ruleset.name} value={ruleset.name}>
                    {ruleset.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedRulesetInfo && (
              <p className="text-xs text-muted-foreground">
                {selectedRulesetInfo.description}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty</Label>
            <Select onValueChange={(value) => setValue('difficulty', value as any)}>
              <SelectTrigger error={errors.difficulty?.message}>
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DIFFICULTY_INFO).map(([key, info]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${info.bgColor}`} />
                      <span>{info.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {difficultyInfo && (
              <p className="text-xs text-muted-foreground">
                {difficultyInfo.description}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxPlayers">Max Players</Label>
            <Input
              id="maxPlayers"
              type="number"
              min="2"
              max="12"
              error={errors.maxPlayers?.message}
              {...register('maxPlayers', { valueAsNumber: true })}
            />
            {selectedRulesetInfo && (
              <p className="text-xs text-muted-foreground">
                Recommended: {selectedRulesetInfo.playerCount.recommended} players
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Visibility</Label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  value="true"
                  checked={isPublic === true}
                  onChange={() => setValue('isPublic', true)}
                  className="text-primary"
                />
                <Globe className="h-4 w-4" />
                <span className="text-sm">Public</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  value="false"
                  checked={isPublic === false}
                  onChange={() => setValue('isPublic', false)}
                  className="text-primary"
                />
                <Lock className="h-4 w-4" />
                <span className="text-sm">Private</span>
              </label>
            </div>
            <p className="text-xs text-muted-foreground">
              {isPublic 
                ? 'Anyone can discover and join your campaign'
                : 'Only invited players can join your campaign'
              }
            </p>
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-3">
          <Label>Tags (Optional)</Label>
          <div className="space-y-2">
            <Select onValueChange={addTag}>
              <SelectTrigger>
                <SelectValue placeholder="Add tags to help players find your campaign" />
              </SelectTrigger>
              <SelectContent>
                {CAMPAIGN_TAGS
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
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            type="submit"
            className="flex-1"
            loading={creating}
            disabled={creating}
          >
            <Users className="mr-2 h-4 w-4" />
            Create Campaign
          </Button>
          
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={creating}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}

