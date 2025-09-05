'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Calendar, Clock, Users, Play } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { useSessions } from '../hooks/use-sessions'
import { sessionFormSchema, type SessionForm } from '@/shared/lib/validations'
import { getErrorMessage } from '@/shared/lib/utils'
import type { Campaign } from '@/shared/types'

interface SessionFormProps {
  campaign: Campaign
  onSuccess?: (sessionId: string) => void
  onCancel?: () => void
}

export function SessionForm({ campaign, onSuccess, onCancel }: SessionFormProps) {
  const [error, setError] = useState<string>('')
  const { createSession, loading } = useSessions()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<SessionForm>({
    resolver: zodResolver(sessionFormSchema),
    defaultValues: {
      name: `${campaign.name} - Session ${new Date().toLocaleDateString()}`,
      description: '',
      scheduledAt: '',
    },
  })

  const scheduledAt = watch('scheduledAt')

  const onSubmit = async (data: SessionForm) => {
    try {
      setError('')
      
      const session = await createSession({
        campaignId: campaign.id,
        name: data.name,
        description: data.description,
        scheduledAt: data.scheduledAt || undefined,
      })
      
      if (onSuccess) onSuccess(session.id)
      reset()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const setQuickSchedule = (minutes: number) => {
    const now = new Date()
    now.setMinutes(now.getMinutes() + minutes)
    const isoString = now.toISOString().slice(0, 16) // Format for datetime-local input
    setValue('scheduledAt', isoString)
  }

  return (
    <div className="w-full max-w-2xl space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight">Create Game Session</h2>
        <p className="text-muted-foreground">
          Set up a new session for {campaign.name}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="rounded-md bg-red-50 p-3 border border-red-200">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Campaign Info */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold">
              {campaign.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-blue-900">{campaign.name}</h3>
              <p className="text-sm text-blue-700">
                {campaign.ruleset} • {campaign.currentPlayers}/{campaign.maxPlayers} players
              </p>
            </div>
          </div>
        </div>

        {/* Session Details */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Session Name</Label>
            <Input
              id="name"
              placeholder="Enter session name"
              error={errors.name?.message}
              {...register('name')}
            />
            <p className="text-xs text-muted-foreground">
              Give your session a memorable name to help players identify it
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <textarea
              id="description"
              placeholder="Describe what will happen in this session, any preparation needed, or special notes..."
              className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>
        </div>

        {/* Scheduling */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="scheduledAt">Schedule Session (Optional)</Label>
            <Input
              id="scheduledAt"
              type="datetime-local"
              error={errors.scheduledAt?.message}
              {...register('scheduledAt')}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to start the session immediately
            </p>
          </div>

          {/* Quick Schedule Buttons */}
          <div className="space-y-2">
            <Label>Quick Schedule</Label>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setQuickSchedule(15)}
              >
                <Clock className="mr-1 h-3 w-3" />
                In 15 min
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setQuickSchedule(30)}
              >
                <Clock className="mr-1 h-3 w-3" />
                In 30 min
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setQuickSchedule(60)}
              >
                <Clock className="mr-1 h-3 w-3" />
                In 1 hour
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setQuickSchedule(120)}
              >
                <Clock className="mr-1 h-3 w-3" />
                In 2 hours
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setValue('scheduledAt', '')}
              >
                Clear
              </Button>
            </div>
          </div>

          {scheduledAt && (
            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-800">
                  Session scheduled for {new Date(scheduledAt).toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Session Info */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <h4 className="font-medium text-gray-900">Session Information</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">
                Up to {campaign.maxPlayers} players can join
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Play className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">
                {scheduledAt ? 'Will start at scheduled time' : 'Can start immediately'}
              </span>
            </div>
          </div>

          <div className="text-xs text-gray-500">
            <p>• Players will be notified when the session is created</p>
            <p>• You can start the session early or reschedule if needed</p>
            <p>• All session data is automatically saved</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            type="submit"
            className="flex-1"
            loading={loading}
            disabled={loading}
          >
            <Calendar className="mr-2 h-4 w-4" />
            {scheduledAt ? 'Schedule Session' : 'Create Session'}
          </Button>
          
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}

