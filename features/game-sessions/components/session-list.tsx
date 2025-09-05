'use client'

import { useEffect, useState } from 'react'
import { useSessions } from '../hooks/use-sessions'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { LoadingSpinner } from '@/shared/components/common/loading-spinner'
import { Plus, Calendar, Users, Clock, Play } from 'lucide-react'
import Link from 'next/link'
import { formatRelativeTime } from '@/shared/lib/utils'
import type { GameSession } from '../types'

export function SessionList() {
  const { sessions, loading, error, fetchSessions } = useSessions()
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'active' | 'completed'>('all')

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">{error}</p>
        <Button variant="outline" onClick={() => fetchSessions()} className="mt-4">
          Try Again
        </Button>
      </div>
    )
  }

  const filteredSessions = sessions.filter(session => {
    if (filter === 'all') return true
    return session.status === filter
  })

  const getStatusColor = (status: GameSession['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-500'
      case 'upcoming':
        return 'bg-blue-500'
      case 'completed':
        return 'bg-gray-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusLabel = (status: GameSession['status']) => {
    switch (status) {
      case 'active':
        return 'Active'
      case 'upcoming':
        return 'Upcoming'
      case 'completed':
        return 'Completed'
      default:
        return 'Unknown'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All Sessions
          </Button>
          <Button
            variant={filter === 'upcoming' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('upcoming')}
          >
            Upcoming
          </Button>
          <Button
            variant={filter === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('active')}
          >
            Active
          </Button>
          <Button
            variant={filter === 'completed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('completed')}
          >
            Completed
          </Button>
        </div>
        <Link href="/app/sessions/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Session
          </Button>
        </Link>
      </div>

      {/* Sessions Grid */}
      {filteredSessions.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No sessions found</h3>
          <p className="text-muted-foreground">
            {filter === 'all' 
              ? "You don't have any game sessions yet."
              : `No ${filter} sessions found.`
            }
          </p>
          <Link href="/app/sessions/new">
            <Button className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Session
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredSessions.map((session) => (
            <Card key={session.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{session.name}</CardTitle>
                  <Badge 
                    variant="outline" 
                    className={`${getStatusColor(session.status)} text-white border-0`}
                  >
                    {getStatusLabel(session.status)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {session.description}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4" />
                  {session.scheduledAt ? (
                    formatRelativeTime(session.scheduledAt)
                  ) : (
                    'No date scheduled'
                  )}
                </div>
                
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="mr-2 h-4 w-4" />
                  {session.participants.length} participant{session.participants.length !== 1 ? 's' : ''}
                </div>

                {session.status === 'active' && (
                  <div className="flex items-center text-sm text-green-600">
                    <Clock className="mr-2 h-4 w-4" />
                    Session in progress
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <Link href={`/app/sessions/${session.id}`}>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </Link>
                  
                  {session.status === 'active' && (
                    <Link href={`/app/sessions/${session.id}`}>
                      <Button size="sm">
                        <Play className="mr-2 h-4 w-4" />
                        Join Session
                      </Button>
                    </Link>
                  )}
                  
                  {session.status === 'upcoming' && (
                    <Link href={`/app/sessions/${session.id}`}>
                      <Button size="sm">
                        <Play className="mr-2 h-4 w-4" />
                        Start Session
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

